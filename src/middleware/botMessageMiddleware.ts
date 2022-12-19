import { ActivityTypes, ConversationState, Middleware, StatePropertyAccessor, TurnContext } from 'botbuilder-core';
import { ConversationStatusEnum } from '../enum/conversationStatus';
import { ConversationCache } from '../types/botFramework';
import { LiveAgentService } from '../service/liveAgentService';
import { ChannelTypeEnum } from '../enum/channelTypeEnum';
import { ConversationService } from '../service/conversationService';
import { ConversationRefService } from '../service/conversationRefService';
import {
  BOT_MAIN_MENU_TEXT_HOME,
  BOT_START_INTENT_LIST,
  MAIN_MENU_CHOICES,
  CONVERSATION_MODEL_STATE_PROPERTY,
  FEEDBACK_CHOICES,
  HELP_COMMAND,
  SUPPORTED_TENANTS,
} from '../constants';
import { User } from '../types/bot';
import { ActorTypeEnum } from '../enum/actorTypeEnum';
import { InputHints, TeamsInfo } from 'botbuilder';
import { parse, ParsedDomain } from 'psl';
import { CONTACT_ADMIN, INVALID_CHANNEL } from '../constants/errorMessages';
import botLogging from '../helper/botLogging';
import { BotContext } from '../helper/botContext';
import AdaptiveCards from '../service/adaptiveCards';
import { HOME_CHOICE_TEXT } from '../constants/messages';
import { RatingService } from '../service/ratingService';
import { LiveChatConversationStatusEnum } from '../enum/liveChatConversationStatusEnum';
import { DEFAULT_USER_NAME, DEFAULT_USER_EMAIL } from '../constants/livechat';
import { IChannelConnector } from '../connectors/channelConnectors';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * This class handle functionality perform on every message call.
 * Handling of home command
 * Handling of help command
 * Managing cache.
 * Checking valid user.
 * Checking valid channel.
 * Sending message directly to live agent if it is connect to liveagent.
 */
export class BotMessageMiddleware implements Middleware {
  private _conversationDataAccessor: StatePropertyAccessor<ConversationCache>;
  public _conversationService: ConversationService;
  private _conversationState: ConversationState;
  private _conversationRefService: ConversationRefService;
  private _liveAgentService: LiveAgentService;
  private _botLogging: botLogging;
  private _ratingService: RatingService;
  private _iChannelConnector: IChannelConnector;

  constructor(botContext: BotContext) {
    const {
      botFrameworkService,
      conversationService,
      conversationRefService,
      liveagentService,
      botLogging,
      ratingService,
      freshChatConnector,
    } = botContext;
    const conversationState = botFrameworkService.conversationState;
    this._conversationDataAccessor = conversationState.createProperty(CONVERSATION_MODEL_STATE_PROPERTY);
    this._conversationService = conversationService;
    this._conversationState = conversationState;
    this._conversationRefService = conversationRefService;
    this._liveAgentService = liveagentService;
    this._botLogging = botLogging;
    this._ratingService = ratingService;
    this._iChannelConnector = freshChatConnector;
  }

  /** Implement middleware signature
   * @param context {TurnContext} An incoming TurnContext object.
   * @param next {function} The next delegate function.
   */
  public async onTurn(turnContext: TurnContext, next: () => Promise<void>): Promise<void> {
    const contextActivity = turnContext.activity;
    if (turnContext.activity.type !== ActivityTypes.Message) {
      return await next();
    }
    const conversationCache = await this._conversationDataAccessor.get(turnContext, {} as ConversationCache);

    if (isProduction && contextActivity.channelId === ChannelTypeEnum.MS_TEAMS) {
      await this._checkAndUpdateTeamInfo(turnContext, conversationCache);
      const email = conversationCache.teamMember?.email || conversationCache.teamMember?.userPrincipalName;
      const _isUserRegistered = await this._isUserRegistered(turnContext, conversationCache, email);
      if (!_isUserRegistered) {
        return;
      }
    } else if (isProduction) {
      await this._reportInvalidChannel(turnContext);
      return;
    }

    await this._checkAndUpdateConversationModel(turnContext, conversationCache);

    const message = turnContext.activity.text;
    /** Help command */
    if (message && HELP_COMMAND.includes(message.toLowerCase().trim())) {
      await this._handleHelpCommand(turnContext);
      return;
    }

    /**
     * Home command
     */
    if (message && BOT_START_INTENT_LIST.includes(message.toLowerCase().trim())) {
      await this._handleSessionStartIntent(turnContext, conversationCache);
      return await next();
    }

    if (turnContext.activity.value && turnContext.activity.value.date && turnContext.activity.value.time) {
      turnContext.activity.text = turnContext.activity.value.date + ', ' + turnContext.activity.value.time;
    }

    if (MAIN_MENU_CHOICES.indexOf(contextActivity.text) > -1) {
      //For logging
      this._botLogging.logBegin({
        data: {
          step: contextActivity.text,
        },
        message: 'Session begin',
        conversationId: conversationCache?.model?.id,
        agentConversationId: conversationCache?.model?.agentChannelConversationId,
      });
    }

    const user: User = {
      userId: contextActivity.from.id,
      firstName: '',
      email: '',
    };

    /**
     * Send message directly to live agent if live agent flow connected.
     */
    if (conversationCache?.model?.status === ConversationStatusEnum.LIVE_AGENT) {
      const activity = turnContext.activity;
      activity.from.role = ActorTypeEnum.USER.toLowerCase();
      await this._liveAgentService.sendMessageToLiveAgent(user, turnContext.activity);
      await this._ratingService.processRatingMessage(conversationCache, message);
      return;
    } else {
      /** Send feedback to live agent even after flow is connected to bot */
      if (FEEDBACK_CHOICES.indexOf(message) > -1) {
        await this._liveAgentService.sendMessageToLiveAgent(user, turnContext.activity);
        await this._ratingService.processRatingMessage(conversationCache, message);
        return;
      }
      /**
       * Otherwise continue bot flow
       */
      await next();
    }
  }

  /**
   * Perform activity on home command.
   * @param turnContext
   * @param conversationCache
   */
  private async _handleSessionStartIntent(
    turnContext: TurnContext,
    conversationCache: ConversationCache,
  ): Promise<void> {
    const conversationModel = conversationCache.model!;
    try {
      /**
       * Get conversation from liveagent.
       */
      const conversation = await this._iChannelConnector.getConversation(conversationModel.agentChannelConversationId!);
      if (conversation === null) {
        // Conversation not found on freshchat, reset data, logic will createConversation when message sent agin.
        await this._conversationService.updateConversation(conversationModel.id, {
          agentChannelConversationId: null,
          agentId: null,
          agentChannelType: null,
        });
      }
      /**
       * Resolve conversation if not already resolve.
       */
      if (conversation && conversation.status !== LiveChatConversationStatusEnum.RESOLVED) {
        await this._conversationService.updateConversation(conversationModel.id, {
          skipResolveOperation: true,
        });
        await this._iChannelConnector.updateConversation(conversationModel.agentChannelConversationId!, {
          status: LiveChatConversationStatusEnum.RESOLVED,
        });
      }
    } catch (error) {
      this._botLogging.logError({
        error: error as Error,
        action: 'error',
        source: 'BotMessageMiddleware#_handleSessionStartIntent',
        data: conversationCache.model,
      });
    }

    /** Perform end conversation activity. */
    await this._conversationService.endConversation(conversationModel.id, turnContext);
    await this._conversationState.clear(turnContext);
    this._botLogging.logEnd({
      message: 'Session end',
      source: 'BotMessageMiddleware#onTurn#start_intent',
    });
  }

  /**
   * Perform activity on help command.
   * @param turnContext
   */
  private async _handleHelpCommand(turnContext: TurnContext) {
    const choiceHeroCard = AdaptiveCards.choiceHeroCard(HOME_CHOICE_TEXT(), [BOT_MAIN_MENU_TEXT_HOME]);
    await turnContext.sendActivity(
      {
        attachments: [choiceHeroCard],
        inputHint: InputHints.AcceptingInput,
      },
      undefined,
      InputHints.AcceptingInput,
    );
  }

  /**
   * Check whether use is registered or not.
   */
  private async _isUserRegistered(
    turnContext: TurnContext,
    conversationCache: ConversationCache,
    email?: string,
  ): Promise<boolean> {
    if (email) {
      const address = email.trim().split('@').pop()!;
      const parseResult = parse(address) as ParsedDomain;
      if (!SUPPORTED_TENANTS.includes('all') && !SUPPORTED_TENANTS.includes(parseResult.domain!)) {
        this._botLogging.logWarn({
          data: conversationCache.teamMember,
          message: CONTACT_ADMIN(),
          source: 'BotMessageMiddleware#onTurn',
          action: 'tenant_validation',
        });
        await turnContext.sendActivity(CONTACT_ADMIN());
        return false;
      }
    } else if (!SUPPORTED_TENANTS.includes('all')) {
      this._botLogging.logWarn({
        data: conversationCache.teamMember,
        message: 'Unable to retrieve email from getMember Api',
        source: 'BotMessageMiddleware#onTurn',
        action: 'tenant_validation',
      });
      await turnContext.sendActivity(CONTACT_ADMIN());
      return false;
    }
    return true;
  }

  /**
   * Report invalid channel error.
   */
  private async _reportInvalidChannel(turnContext: TurnContext): Promise<void> {
    this._botLogging.logWarn({
      data: {
        channelId: turnContext.activity.channelId,
      },
      message: INVALID_CHANNEL(),
      source: 'BotMessageMiddleware#onTurn',
      action: 'channel_validation',
    });
    await turnContext.sendActivity(INVALID_CHANNEL());
  }

  /**
   * Check and update teams info in conversation cache
   * @param turnContext
   * @param conversationCache
   */
  private async _checkAndUpdateTeamInfo(turnContext: TurnContext, conversationCache: ConversationCache): Promise<void> {
    if (!conversationCache.teamMember) {
      try {
        const member = await TeamsInfo.getMember(turnContext, turnContext.activity.from.id);
        conversationCache.teamMember = member;
        await this._conversationState.saveChanges(turnContext, false);
      } catch (error) {
        this._botLogging.logError({
          error: error as Error,
          action: 'error',
          source: 'BotMessageMiddleware#onTurn#getMember',
          data: turnContext.activity.from,
        });
      }
    }
  }

  /**
   * Check and update conversation model in conversation cache.
   * @param turnContext
   * @param conversationCache
   */
  private async _checkAndUpdateConversationModel(
    turnContext: TurnContext,
    conversationCache: ConversationCache,
  ): Promise<void> {
    const contextActivity = turnContext.activity;
    const conversationId = contextActivity.conversation.id;
    if (!conversationCache.model) {
      await this._conversationRefService.addConversationReference(contextActivity);
      const conversationModel = await this._conversationService.getByConversationId(conversationId);
      if (!conversationModel) {
        const user = {
          userId: '',
          firstName: conversationCache.teamMember?.name || DEFAULT_USER_NAME,
          email: conversationCache.teamMember?.email || DEFAULT_USER_EMAIL,
        };
        await this._conversationService.startConversation(turnContext, user, {
          userId: contextActivity.from.id,
          conversationId,
          channelType: contextActivity.channelId as ChannelTypeEnum,
        });
      } else {
        conversationCache.model = conversationModel;
        await this._conversationState.saveChanges(turnContext, false);
      }
    }
  }
}
