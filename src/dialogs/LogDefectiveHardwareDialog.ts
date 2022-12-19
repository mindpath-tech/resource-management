import { TurnContext, StatePropertyAccessor } from 'botbuilder';
import {
  ComponentDialog,
  DialogSet,
  DialogTurnStatus,
  WaterfallDialog,
  WaterfallStepContext,
  TextPrompt,
  ChoicePrompt,
  ConfirmPrompt,
  NumberPrompt,
  AttachmentPrompt,
  ChoiceFactory,
  ListStyle,
} from 'botbuilder-dialogs';
import {
  HARDWARE_CHOICES,
  CHOICE_PROMPT,
  TEXT_PROMPT,
  ATTACHMENT_PROMPT,
  CONFIRM_PROMPT,
  NAME_PROMPT,
  NUMBER_PROMPT,
  WATERFALL_DIALOG,
  LOG_DESCRIBE_TEXT,
  LOG_DESCRIBE_IMAGE_TEXT,
  LOG_DESCRIBE_PRIORITY,
  CONFIRM_DETAILS,
  THANK_YOU_MESSAGE,
} from '../constants';
import { SELECT_ANY_ONE } from '../constants/dialogMessages';
import { LogDefectContext } from 'src/types/logDefect';
import { PriorityEnum } from 'src/enum/priorityEnum';
import { ConfirmEnum } from 'src/enum/confirmEnum';

import AdaptiveCards from 'src/service/adaptiveCards';
//import { HardwareModel } from '../models/harware';
//import { HardwareService } from './harwareService';
export class LogDefectiveHardwareDialog extends ComponentDialog {
  constructor(id: string) {
    super(id);
    //private _hardwareService: HardwareService;
    this.addDialog(new TextPrompt(NAME_PROMPT));
    this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
    this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
    this.addDialog(new NumberPrompt(NUMBER_PROMPT));
    this.addDialog(new AttachmentPrompt(ATTACHMENT_PROMPT));
    this.addDialog(new TextPrompt(TEXT_PROMPT))
      .addDialog(new ChoicePrompt(CHOICE_PROMPT))
      .addDialog(
        new WaterfallDialog(WATERFALL_DIALOG, [
          this._logChoiceStep.bind(this),
          this._logDescribeIssueStep.bind(this),
          this._logImageStep.bind(this),
          this._logPriorityStep.bind(this),
          this._logConfirmDetailsStep.bind(this),
          this._logReloadStep.bind(this),
        ]),
      );

    this.initialDialogId = WATERFALL_DIALOG;
  }

  /**
   * @param {*} turnContext
   * @param {*} accessor
   */
  async run(turnContext: TurnContext, accessor: StatePropertyAccessor): Promise<void> {
    const dialogSet = new DialogSet(accessor);
    dialogSet.add(this);

    const dialogContext = await dialogSet.createContext(turnContext);
    const results = await dialogContext.continueDialog();
    if (results.status === DialogTurnStatus.empty) {
      await dialogContext.beginDialog(this.id);
    }
  }

  private async _logChoiceStep(stepContext: WaterfallStepContext<LogDefectContext>) {
    const messageText = SELECT_ANY_ONE();
    const promptOptions = {
      prompt: ChoiceFactory.heroCard(HARDWARE_CHOICES, messageText),
      style: ListStyle.heroCard,
    };
    return await stepContext.prompt(TEXT_PROMPT, promptOptions);
  }
  private async _logDescribeIssueStep(stepContext: WaterfallStepContext<LogDefectContext>) {
    const choice = stepContext.context.activity ? stepContext.context.activity.text : stepContext.result.value;
    stepContext.options.chooseDevice = choice;
    return await stepContext.prompt(TEXT_PROMPT, LOG_DESCRIBE_TEXT);
  }
  private async _logImageStep(stepContext: WaterfallStepContext<LogDefectContext>) {
    stepContext.options.describeDefect = stepContext.result;
    return await stepContext.prompt(ATTACHMENT_PROMPT, LOG_DESCRIBE_IMAGE_TEXT);
  }
  private async _logPriorityStep(stepContext: WaterfallStepContext<LogDefectContext>) {
    const imageAttachment = stepContext.context.activity.attachments;
    stepContext.options.defectImage = imageAttachment!;
    const promptOptions = {
      prompt: ChoiceFactory.heroCard([PriorityEnum.HIGH, PriorityEnum.MEDIUM, PriorityEnum.LOW], LOG_DESCRIBE_PRIORITY),
      style: ListStyle.heroCard,
    };
    return await stepContext.prompt(TEXT_PROMPT, promptOptions);
  }
  private async _logConfirmDetailsStep(stepContext: WaterfallStepContext<LogDefectContext>) {
    const contextActivity = stepContext.context.activity;
    const choice = contextActivity ? contextActivity.text : stepContext.result.value;
    stepContext.options.defectPriority = choice;
    await stepContext.context.sendActivity({
      attachments: [
        AdaptiveCards.getLogDefectReview(
          stepContext.options.chooseDevice,
          stepContext.options.describeDefect,
          stepContext.options.defectPriority,
          stepContext.options.defectImage[0].contentUrl,
        ),
      ],
    });
    const promptOptions = {
      prompt: ChoiceFactory.heroCard([ConfirmEnum.Yes, ConfirmEnum.No], CONFIRM_DETAILS),
      style: ListStyle.heroCard,
    };
    return await stepContext.prompt(TEXT_PROMPT, promptOptions);
  }
  private async _logReloadStep(stepContext: WaterfallStepContext<LogDefectContext>) {
    const contextActivity = stepContext.context.activity;
    const choice = contextActivity ? contextActivity.text : stepContext.result.value;
    switch (choice) {
      case 'Yes': {
        await stepContext.context.sendActivity(THANK_YOU_MESSAGE);
        /**
         * Create HardwareModel
         */
        // const hardwareModel = new HardwareModel();
        // hardwareModel.chooseDevice = stepContext.options.chooseDevice;
        // hardwareModel.devicedefect = stepContext.options.devicedefect;
        //const hardwareInsert = await this._hardwareService.addNewUser(hardwareModel);
        return await stepContext.endDialog(this.id);
      }
      case 'No': {
        return await stepContext.next();
      }
      default: {
        return await stepContext.endDialog(this.id);
      }
    }
  }
}
