'use-strict';

import {
  Activity,
  ConversationState,
  InputHints,
  MessageFactory,
  StatePropertyAccessor,
  TurnContext,
} from 'botbuilder';
import {
  ComponentDialog,
  DialogSet,
  DialogTurnStatus,
  WaterfallDialog,
  WaterfallStepContext,
  DialogTurnResult,
  TextPrompt,
} from 'botbuilder-dialogs';
import { MessageContext } from '../types/message';
import { ConversationCache } from '../types/botFramework';
import { LiveAgentService } from '../service/liveAgentService';
import { BotContext } from '../helper/botContext';
import { CONVERSATION_MODEL_STATE_PROPERTY, TEXT_PROMPT, TRANSCRIPT_LOGGER_STATE_PROPERTY } from '../constants';
import { User } from '../types/bot';
import { ChannelTypeEnum } from '../enum/channelTypeEnum';
import { DIALOGS } from '../constants/dialogs';
import { DEFAULT_USER_EMAIL, DEFAULT_USER_NAME } from '../constants/livechat';
import BotLogging from '../helper/botLogging';

const WATERFALL_DIALOG = DIALOGS.liveAgentDialog;
export class LiveAgentDialog extends ComponentDialog {
  private _conversationDataAccessor: StatePropertyAccessor<ConversationCache>;
  private _transcriptDataAccessor: StatePropertyAccessor<Array<Activity>>;
  private _liveAgentService: LiveAgentService;
  private _conversationState: ConversationState;
  private _botLogging: BotLogging;

  constructor(id: string, botContext: BotContext) {
    super(id);
    this._botLogging = botContext.botLogging;
    this._conversationState = botContext.botFrameworkService.conversationState;
    this._conversationDataAccessor = this._conversationState.createProperty(CONVERSATION_MODEL_STATE_PROPERTY);
    this._transcriptDataAccessor = this._conversationState.createProperty(TRANSCRIPT_LOGGER_STATE_PROPERTY);
    this._liveAgentService = botContext.liveagentService;

    this.addDialog(new TextPrompt(TEXT_PROMPT)).addDialog(
      new WaterfallDialog(WATERFALL_DIALOG, [this.actionStep.bind(this), this.finalStep.bind(this)]),
    );
    this.initialDialogId = WATERFALL_DIALOG;
  }

  /**
   * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
   * If no dialog is active, it will start the default dialog.
   * @param {*} turnContext
   * @param {*} accessor
   */
  public async run(turnContext: TurnContext, accessor: StatePropertyAccessor): Promise<void> {
    const dialogSet = new DialogSet(accessor);
    dialogSet.add(this);
    const dialogContext = await dialogSet.createContext(turnContext);
    const results = await dialogContext.continueDialog();
    if (results.status === DialogTurnStatus.empty) {
      await dialogContext.beginDialog(this.id);
    }
  }

  private async actionStep(stepContext: WaterfallStepContext<MessageContext>): Promise<DialogTurnResult> {
    const contextActivity = stepContext.context.activity;
    const handoffPayload: ConversationCache = await this._conversationDataAccessor.get(
      stepContext.context,
      {} as ConversationCache,
    );
    const transcripts: Array<Activity> = await this._transcriptDataAccessor.get(
      stepContext.context,
      [] as Array<Activity>,
    );
    transcripts.push(contextActivity);
    let conversationModel;
    for (let index = 0; index < transcripts.length; index++) {
      const transcript = transcripts[index];
      if (transcript.type === 'message') {
        const user: User = {
          userId: contextActivity.from.id,
          firstName: DEFAULT_USER_NAME,
          email: DEFAULT_USER_EMAIL,
        };
        if (handoffPayload.teamMember && contextActivity.channelId === ChannelTypeEnum.MS_TEAMS) {
          user.firstName = handoffPayload.teamMember.name;
          user.email = handoffPayload.teamMember.email;
        }
        conversationModel = await this._liveAgentService.sendMessageToLiveAgent(user, transcript);
      }
    }
    handoffPayload.model = conversationModel;
    const messageText = '';
    await this._conversationState.saveChanges(stepContext.context, false);
    this._botLogging.logInfo({
      message: 'Connected with live agent',
      action: 'liveagent',
      source: 'LiveAgentDialog#actionStep',
      data: {
        status: conversationModel?.status,
      },
    });
    const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
    return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
  }

  /**
   * Complete the interaction and end the dialog.
   */
  private async finalStep(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
    return await stepContext.next();
  }
}
