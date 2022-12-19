import { TurnContext, StatePropertyAccessor } from 'botbuilder';
import {
  ComponentDialog,
  DialogSet,
  DialogTurnStatus,
  WaterfallDialog,
  WaterfallStepContext,
  DialogTurnResult,
  TextPrompt,
  ChoicePrompt,
} from 'botbuilder-dialogs';
import { DialogUtils } from '../utils/DialogUtils';
import { MAIN_MENU_CHOICES, CHOICE_PROMPT, TEXT_PROMPT } from '../constants';
import { MessageContext } from '../types/message';
import { SELECT_ANY_ONE, WAIT_MESSAGE } from '../constants/dialogMessages';
import { DIALOGS } from '../constants/dialogs';

const MAIN_WATERFALL_DIALOG = DIALOGS.mainWaterfallDialog;
export class MainDialog extends ComponentDialog {
  constructor(dialogs: ComponentDialog[]) {
    super('MainDialog');
    for (const dialog of dialogs) {
      this.addDialog(dialog);
    }
    this.addDialog(new TextPrompt(TEXT_PROMPT))
      .addDialog(new ChoicePrompt(CHOICE_PROMPT))
      .addDialog(
        new WaterfallDialog(MAIN_WATERFALL_DIALOG, [this.choiceStep.bind(this), this.choiceActStep.bind(this)]),
      );

    this.initialDialogId = MAIN_WATERFALL_DIALOG;
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

  async choiceStep(stepContext: WaterfallStepContext<MessageContext>): Promise<DialogTurnResult> {
    const messageText = SELECT_ANY_ONE();
    return await DialogUtils.getPromptWithFreeText(stepContext, messageText, MAIN_MENU_CHOICES);
  }

  async choiceActStep(stepContext: WaterfallStepContext<MessageContext>): Promise<DialogTurnResult> {
    const contextActivity = stepContext.context.activity;
    const choice = contextActivity ? contextActivity.text : stepContext.result.value;
    switch (choice) {
      case MAIN_MENU_CHOICES[0]: {
        return await stepContext.beginDialog(DIALOGS.newHardwareDialog);
      }
      case MAIN_MENU_CHOICES[1]: {
        return await stepContext.beginDialog(DIALOGS.replaceHardwareDialog);
      }
      case MAIN_MENU_CHOICES[2]: {
        return await stepContext.beginDialog(DIALOGS.assignHardwareDialog);
      }
      case MAIN_MENU_CHOICES[4]: {
        return await stepContext.beginDialog(DIALOGS.logDefectiveHardwareDialog);
      }
      case MAIN_MENU_CHOICES[3]: {
        return await stepContext.beginDialog(DIALOGS.submitHardwareDialog);
      }
      default: {
        await stepContext.context.sendActivity(WAIT_MESSAGE());
        return await stepContext.beginDialog(DIALOGS.liveAgentDialog);
      }
    }
  }
}
