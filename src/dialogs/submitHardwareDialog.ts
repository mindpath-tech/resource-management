import { Attachment, StatePropertyAccessor, TurnContext } from 'botbuilder';
import {
  AttachmentPrompt,
  ChoiceFactory,
  ChoicePrompt,
  ComponentDialog,
  ConfirmPrompt,
  DialogSet,
  DialogTurnStatus,
  ListStyle,
  NumberPrompt,
  TextPrompt,
  WaterfallDialog,
  WaterfallStepContext,
} from 'botbuilder-dialogs';
import {
  ATTACHMENT_PROMPT,
  CHOICE_PROMPT,
  CONFIRM_PROMPT,
  CONFIRM_PROMPT_CHOICES,
  DEVICE_CHOICE,
  GO_TO_MAIN_MENU_OR_RESTART_CURRENT_FLOW,
  NUMBER_PROMPT,
  TEXT_PROMPT,
} from 'src/constants';
import {
  ASK_FOR_BACK_IMAGE,
  ASK_FOR_BRAND_NAME,
  ASK_FOR_FRONT_IMAGE,
  ASK_FOR_MODEL_NAME,
  ASK_FOR_SERIAL_NUMBER,
  SELECT_DEVICE_TYPE,
  WAIT_MESSAGE,
} from 'src/constants/dialogMessages';
import { DIALOGS } from 'src/constants/dialogs';
import AdaptiveCards from 'src/service/adaptiveCards';
import { SubmitHardware } from '../states/submitHardware';

const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

export class SubmitHardwareDialog extends ComponentDialog {
  constructor(id: string) {
    super(id);
    this.addDialog(new TextPrompt(TEXT_PROMPT));
    this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
    this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
    this.addDialog(new NumberPrompt(NUMBER_PROMPT));
    this.addDialog(new AttachmentPrompt(ATTACHMENT_PROMPT));

    this.addDialog(
      new WaterfallDialog(WATERFALL_DIALOG, [
        this.deviceChoiceStep.bind(this),
        this.deviceChoiceActStep.bind(this),
        this.brandNameStep.bind(this),
        this.brandNameActStep.bind(this),
        this.modelNameStep.bind(this),
        this.modelNameActStep.bind(this),
        this.serialNumberStep.bind(this),
        this.serialNumberActStep.bind(this),
        this.askToFrontImageStep.bind(this),
        this.askToFrontImageActStep.bind(this),
        this.askToBackImageStep.bind(this),
        this.askToBackImageActStep.bind(this),
        this.confirmDetails.bind(this),
        this.confirmDetailsAction.bind(this),
        this.continueOrEnd.bind(this),
        this.continueOrEndAction.bind(this),
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
  public async run(turnContext: TurnContext, accessor: StatePropertyAccessor) {
    const dialogSet = new DialogSet(accessor);
    dialogSet.add(this);

    const dialogContext = await dialogSet.createContext(turnContext);
    const results = await dialogContext.continueDialog();
    if (results.status === DialogTurnStatus.empty) {
      await dialogContext.beginDialog(this.id);
    }
  }

  private async deviceChoiceStep(stepContext: WaterfallStepContext<SubmitHardware>) {
    const messageText = SELECT_DEVICE_TYPE();
    const promptOptions = {
      prompt: ChoiceFactory.heroCard(DEVICE_CHOICE, messageText),
      style: ListStyle.heroCard,
      // You can also include a retry prompt if you like,
      // but there's no need to include the choices property in a text prompt
    };
    return await stepContext.prompt(TEXT_PROMPT, promptOptions);
  }

  private async deviceChoiceActStep(stepContext: WaterfallStepContext<SubmitHardware>) {
    const contextActivity = stepContext.context.activity;
    const choice = contextActivity ? contextActivity.text : stepContext.result.value;
    stepContext.options.deviceType = choice;
    // const messageToSend=`you choose ${choice}.`;
    // await stepContext.context.sendActivity(messageToSend);
    return await stepContext.next();
  }

  private async brandNameStep(stepContext: WaterfallStepContext<SubmitHardware>) {
    const messageText = ASK_FOR_BRAND_NAME();
    return await stepContext.prompt(TEXT_PROMPT, messageText);
  }

  private async brandNameActStep(stepContext: WaterfallStepContext<SubmitHardware>) {
    stepContext.options.brand = stepContext.result;
    // const messageToSend=`your entered brand name is ${stepContext.options.brand}`;
    // await stepContext.context.sendActivity(messageToSend);
    return await stepContext.next();
  }

  private async modelNameStep(stepContext: WaterfallStepContext<SubmitHardware>) {
    const messageText = ASK_FOR_MODEL_NAME();
    return await stepContext.prompt(TEXT_PROMPT, messageText);
  }

  private async modelNameActStep(stepContext: WaterfallStepContext<SubmitHardware>) {
    stepContext.options.model = stepContext.result;
    // const messageToSend=`your entered model name is ${stepContext.options.model}`;
    // await stepContext.context.sendActivity(messageToSend);
    return await stepContext.next();
  }

  private async serialNumberStep(stepContext: WaterfallStepContext<SubmitHardware>) {
    const messageText = ASK_FOR_SERIAL_NUMBER();
    return await stepContext.prompt(TEXT_PROMPT, messageText);
  }

  private async serialNumberActStep(stepContext: WaterfallStepContext<SubmitHardware>) {
    stepContext.options.serialNumber = stepContext.result;
    // const messageToSend=`your entered serial number is ${stepContext.options.serialNumber}`;
    // await stepContext.context.sendActivity(messageToSend);
    return await stepContext.next();
  }

  private async askToFrontImageStep(stepContext: WaterfallStepContext<SubmitHardware>) {
    const messageText = ASK_FOR_FRONT_IMAGE();
    return await stepContext.prompt(ATTACHMENT_PROMPT, messageText);
  }

  private async askToFrontImageActStep(stepContext: WaterfallStepContext<SubmitHardware>) {
    const imageAttachment = stepContext.context.activity.attachments;
    stepContext.options.frontImage = imageAttachment!;
    // const messageToSend=`your shared image is`;
    // await stepContext.context.sendActivity({text:messageToSend,attachments:imageAttachment});
    return await stepContext.next();
  }

  private async askToBackImageStep(stepContext: WaterfallStepContext<SubmitHardware>) {
    const messageText = ASK_FOR_BACK_IMAGE();
    return await stepContext.prompt(ATTACHMENT_PROMPT, messageText);
  }

  private async askToBackImageActStep(stepContext: WaterfallStepContext<SubmitHardware>) {
    const imageAttachment = stepContext.context.activity.attachments;
    stepContext.options.backImage = imageAttachment!;
    // const messageToSend=`your shared image is`;
    // await stepContext.context.sendActivity({text:messageToSend,attachments:imageAttachment});
    return await stepContext.next();
  }

  private async confirmDetails(stepContext: WaterfallStepContext<SubmitHardware>) {
    const submitHardware = new SubmitHardware();
    submitHardware.deviceType = stepContext.options.deviceType;
    submitHardware.brand = stepContext.options.brand;
    submitHardware.model = stepContext.options.model;
    submitHardware.serialNumber = stepContext.options.serialNumber;
    submitHardware.frontImage = stepContext.options.frontImage;
    submitHardware.backImage = stepContext.options.backImage;

    const adaptiveCardAttachment: Attachment = AdaptiveCards.submitHardware(submitHardware);
    await stepContext.context.sendActivity({
      attachments: [adaptiveCardAttachment],
    });

    const promptOptions = {
      prompt: ChoiceFactory.heroCard(CONFIRM_PROMPT_CHOICES),
      style: ListStyle.heroCard,
    };
    return await stepContext.prompt(TEXT_PROMPT, promptOptions);
  }

  private async confirmDetailsAction(stepContext: WaterfallStepContext<SubmitHardware>) {
    const result = stepContext.result;
    if (result.toLowerCase() === 'yes') {
      await stepContext.context.sendActivity(`thank you`);
      return await stepContext.endDialog();
    } else {
      return await stepContext.next();
    }
  }

  private async continueOrEnd(stepContext: WaterfallStepContext<SubmitHardware>) {
    const messageText = 'please select what do you want?';
    const choices: string[] = GO_TO_MAIN_MENU_OR_RESTART_CURRENT_FLOW;
    const promptOptions = {
      prompt: ChoiceFactory.heroCard(choices, messageText),
      style: ListStyle.heroCard,
      // You can also include a retry prompt if you like,
      // but there's no need to include the choices property in a text prompt
    };
    return await stepContext.prompt(TEXT_PROMPT, promptOptions);
  }

  private async continueOrEndAction(stepContext: WaterfallStepContext<SubmitHardware>) {
    const contextActivity = stepContext.context.activity;
    const choice = contextActivity ? contextActivity.text : stepContext.result.value;

    switch (choice) {
      case GO_TO_MAIN_MENU_OR_RESTART_CURRENT_FLOW[0]: {
        return await stepContext.beginDialog(DIALOGS.mainWaterfallDialog);
      }
      case GO_TO_MAIN_MENU_OR_RESTART_CURRENT_FLOW[1]: {
        return await stepContext.beginDialog(DIALOGS.submitHardwareDialog);
      }
      default: {
        await stepContext.context.sendActivity(WAIT_MESSAGE());
        return await stepContext.beginDialog(DIALOGS.liveAgentDialog);
      }
    }
  }
}
