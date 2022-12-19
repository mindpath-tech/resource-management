import { BotFrameworkAdapter, InputHints } from 'botbuilder';
import { FEEDBACK_CHOICES, BOT_MAIN_MENU_TEXT_HOME } from '../constants';
import { FEEDBACK_TEXT } from '../constants/dialogMessages';
import { HOME_CHOICE_TEXT, IT_WAS_A_PLEASURE_ASSISTING_YOU } from '../constants/messages';
import { ChannelTypeEnum } from '../enum/channelTypeEnum';
import { BotContext } from '../helper/botContext';
import botLogging from '../helper/botLogging';
import LiveChatMessageParser from '../parsers/liveChatMessageParser';
import { FreshChatMessageCreatePayload } from '../types/liveChat';
import AdaptiveCards from './adaptiveCards';
import { ConversationRefService } from './conversationRefService';
import { ConversationService } from './conversationService';
import { MessageProcessor } from './messageProcessor';

/**
 * Perform all the business logic related to Freshchat webhook.
 */
export class LiveChatService {
  private _botLogging: botLogging;
  private _conversationService: ConversationService;
  private _conversationRefService: ConversationRefService;
  private _freshChatMessageParser: LiveChatMessageParser;
  private _messageProcessor: MessageProcessor;
  private _adapter: BotFrameworkAdapter;

  constructor(botContext: BotContext) {
    this._botLogging = botContext.botLogging;
    this._conversationService = botContext.conversationService;
    this._conversationRefService = botContext.conversationRefService;
    this._freshChatMessageParser = botContext.freshChatMessageParser;
    this._messageProcessor = botContext.messageProcessor;
    this._adapter = botContext.botFrameworkService.adapter;
  }

  /**
   * Send freshchat message to bot.
   * @param messageData FreshChatMessageCreatePayload
   */
  public async sendMessageToBot(messageData: FreshChatMessageCreatePayload): Promise<void> {
    const messages = await this._freshChatMessageParser.fromMessage(messageData);
    await this._messageProcessor.processMessage(
      messageData.conversation_id,
      {
        userId: messageData.user_id,
        firstName: '',
        email: '',
      },
      messages,
      ChannelTypeEnum.FRESH_CHAT,
    );
  }

  /**
   * Perform activity on end conversation.
   * @param conversationId
   * @returns
   */
  public async endConversation(conversationId: string): Promise<void> {
    const conversation = await this._conversationService.getByConversationId(conversationId);
    if (!conversation) {
      // This is the conversation of Web AbiBot. Do not do anything.
      this._botLogging.logDebug({
        message: 'Conversation not found',
        action: 'InvalidConversation',
        source: 'MessageController#endConversation',
      });
      return;
    }
    const conversationReferenceModel = await this._conversationRefService.getConversationRefRepository(
      conversation.botConversationId,
    );
    this._adapter.continueConversation(conversationReferenceModel!.conversationReference, async (turnContext) => {
      if (!conversation.skipResolveOperation) {
        await turnContext.sendActivity(IT_WAS_A_PLEASURE_ASSISTING_YOU());
        const choiceHeroFeedbackCard = AdaptiveCards.choiceHeroCard(FEEDBACK_TEXT(), FEEDBACK_CHOICES);
        const choiceHeroCard = AdaptiveCards.choiceHeroCard(HOME_CHOICE_TEXT(), [BOT_MAIN_MENU_TEXT_HOME]);
        await turnContext.sendActivity(
          {
            attachments: [choiceHeroFeedbackCard, choiceHeroCard],
            inputHint: InputHints.AcceptingInput,
          },
          undefined,
          InputHints.AcceptingInput,
        );
      } else {
        this._botLogging.logInfo({
          message: 'Conversation resolve on skipResolveOperation or on feedback message',
          action: 'skipResolveOperation',
          source: 'MessageController#endConversation',
        });
      }
    });
  }

  /**
   * Update conversation assignment in database.
   * @param agentChannelConversationId agent conversationId
   * @param agentId agentId
   */
  public async assignConversation(agentChannelConversationId: string, agentId: string) {
    const conversation = await this._conversationService.getByConversationId(agentChannelConversationId);
    if (conversation) {
      await this._conversationService.updateConversation(conversation.id, {
        agentId: agentId,
      });
    }
  }
}
