'use-strict';

import { MessageFactory, StatePropertyAccessor, TurnContext } from 'botbuilder';
import {
  ComponentDialog,
  DialogSet,
  DialogTurnStatus,
  WaterfallDialog,
  WaterfallStepContext,
  DialogTurnResult,
  ChoicePrompt,
  TextPrompt,
} from 'botbuilder-dialogs';
import { MessageContext } from '../types/message';
import {
  ADDRESS_PROMPT,
  CHOICE_PROMPT,
  DELIVERY_OPTION,
  DELIVERY_PROMPT,
  QUANTITY_PROMPT,
  QUANTITY_PROMPT_OPTION,
} from '../constants';
import { DIALOGS } from '../constants/dialogs';
import { DialogUtils } from 'src/utils/DialogUtils';
import AdaptiveCards from 'src/service/adaptiveCards';
import { hardwaresCard } from 'src/cards/hardwaresCard';
import {
  ASK_FOR_ADDRESS,
  ASK_FOR_DELIVERY_OPTION,
  ASK_FOR_MONITOR_QUANTITY,
  SAY_THANK_YOU,
} from 'src/constants/dialogMessages';
// import { DialogUtils } from 'src/utils/DialogUtils';

const WATERFALL_DIALOG = DIALOGS.newHardwareDialog;
export class NewHardwareDialog extends ComponentDialog {
  constructor(id: string) {
    super(id);

    this.addDialog(new ChoicePrompt(CHOICE_PROMPT, this.validateChoice))
      .addDialog(new TextPrompt(QUANTITY_PROMPT))
      .addDialog(new ChoicePrompt(DELIVERY_PROMPT))
      .addDialog(new TextPrompt(ADDRESS_PROMPT))
      .addDialog(
        new WaterfallDialog(WATERFALL_DIALOG, [
          this.newHardwareStep.bind(this),
          this.monitorQuantity.bind(this),
          this.deliveryPlace.bind(this),
          this.addressStep.bind(this),
          this.finalStep.bind(this),
        ]),
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

  private async newHardwareStep(stepContext: WaterfallStepContext<MessageContext>): Promise<DialogTurnResult> {
    const attachments = AdaptiveCards.getAdaptiveCard(hardwaresCard);
    return await stepContext.prompt(CHOICE_PROMPT, MessageFactory.attachment(attachments));
  }

  private async addressStep(stepContext: WaterfallStepContext<MessageContext>): Promise<DialogTurnResult> {
    const contextActivity = stepContext.context.activity;
    const choice = contextActivity ? contextActivity.text : stepContext.result.value;
    if (choice === DELIVERY_OPTION[1]) {
      const textMessage = ASK_FOR_ADDRESS();
      return await stepContext.prompt(ADDRESS_PROMPT, textMessage);
    }
    return stepContext.continueDialog();
  }

  private async validateChoice(): Promise<boolean> {
    return true;
  }

  private async monitorQuantity(stepContext: WaterfallStepContext<MessageContext>): Promise<DialogTurnResult> {
    const hardwares = stepContext.context.activity?.value?.Hardwares;
    if (hardwares && hardwares.includes('Monitor')) {
      const messageText = ASK_FOR_MONITOR_QUANTITY();
      return await DialogUtils.getPromptWithFreeText(stepContext, messageText, QUANTITY_PROMPT_OPTION);
    }
    return await stepContext.continueDialog();
  }

  private async deliveryPlace(stepContext: WaterfallStepContext<MessageContext>): Promise<DialogTurnResult> {
    const messageText = ASK_FOR_DELIVERY_OPTION();
    return await DialogUtils.getPromptWithFreeText(stepContext, messageText, DELIVERY_OPTION);
  }

  /**
   * Complete the interaction and end the dialog.
   */
  private async finalStep(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
    const textMessage = SAY_THANK_YOU();
    await stepContext.context.sendActivity(textMessage);
    return await stepContext.endDialog();
  }
}
