import { TurnContext, StatePropertyAccessor, MessageFactory } from 'botbuilder';
import {
  ComponentDialog,
  DialogSet,
  DialogTurnStatus,
  WaterfallDialog,
  WaterfallStepContext,
  DialogTurnResult,
  TextPrompt,
  ChoicePrompt,
  ChoiceFactory,
  ListStyle,
  AttachmentPrompt,
} from 'botbuilder-dialogs';
import {
  CHOICE_PROMPT,
  TEXT_PROMPT,
  CONFIRM_REVIEW_CHOICES,
  ATTACHMENT_PROMPT,
  HARDWARE_CHOICES,
  DELIVERY_CHOICES,
} from '../constants';
import { DIALOGS } from '../constants/dialogs';
import { ReplaceHardwareDetails, ReplaceHardware } from 'src/types/replaceHardware';
import AdaptiveCards from 'src/service/adaptiveCards';
import AzureBlobStorageService from 'src/service/azureBlobStorageService';
import {
  UPLOAD_BACK_IMAGE,
  ENTER_BRAND_NAME,
  UPLOAD_FRONT_IMAGE,
  ENTER_MODEL_NAME,
  SELECT_ANY_ONE,
  ENTER_SERIAL_NUMBER,
  ENTER_ADDRESS,
  REVIEW_SUBMITTED_INFO,
  IS_CORRECT,
} from 'src/constants/dialogMessages';

const REPLACE_HARDWARE_DIALOG = DIALOGS.replaceHardwareDialog;
export class ReplaceHardwareDialog extends ComponentDialog {
  private _azureBlobStorageService: AzureBlobStorageService;
  constructor(id: string) {
    super(id);
    this.addDialog(new TextPrompt(TEXT_PROMPT))
      .addDialog(new ChoicePrompt(CHOICE_PROMPT))
      .addDialog(new AttachmentPrompt(ATTACHMENT_PROMPT))
      .addDialog(
        new WaterfallDialog(REPLACE_HARDWARE_DIALOG, [
          this._selectHadrwareStep.bind(this),
          this._askBrandNameStep.bind(this),
          this._askModelNameStep.bind(this),
          this._askSerialNumberStep.bind(this),
          this._askFrontImageStep.bind(this),
          this._askBackImageStep.bind(this),
          this._askDeliveryStep.bind(this),
          this._askAddressStep.bind(this),
          this._reviewItemStep.bind(this),
          this._checkReviewItemAnswerStep.bind(this),
          this._storeAllDetailsStep.bind(this),
          this._informUserAndRedirctStep.bind(this),
        ]),
      );

    this.initialDialogId = REPLACE_HARDWARE_DIALOG;
    this._azureBlobStorageService = new AzureBlobStorageService();
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

  private async _selectHadrwareStep(stepContext: WaterfallStepContext<ReplaceHardware>): Promise<DialogTurnResult> {
    stepContext.options.userId = stepContext.context.activity.recipient.id;
    stepContext.options.hardwares = {} as ReplaceHardwareDetails;

    return await stepContext.prompt(TEXT_PROMPT, {
      prompt: ChoiceFactory.heroCard(HARDWARE_CHOICES, SELECT_ANY_ONE()),
      style: ListStyle.heroCard,
    });
  }

  private async _askBrandNameStep(stepContext: WaterfallStepContext<ReplaceHardware>): Promise<DialogTurnResult> {
    const contextActivity = stepContext.context.activity;
    const choice = contextActivity ? contextActivity.text : stepContext.result.value;
    stepContext.options.hardwares.hardware = choice;
    return await stepContext.prompt(TEXT_PROMPT, ENTER_BRAND_NAME());
  }

  private async _askModelNameStep(stepContext: WaterfallStepContext<ReplaceHardware>): Promise<DialogTurnResult> {
    const brandName = stepContext.context.activity.text;
    stepContext.options.hardwares.brandName = brandName;
    return await stepContext.prompt(TEXT_PROMPT, ENTER_MODEL_NAME());
  }

  private async _askSerialNumberStep(stepContext: WaterfallStepContext<ReplaceHardware>): Promise<DialogTurnResult> {
    const modelName = stepContext.context.activity.text;
    stepContext.options.hardwares.modelName = modelName;
    return await stepContext.prompt(TEXT_PROMPT, ENTER_SERIAL_NUMBER());
  }

  async _askFrontImageStep(stepContext: WaterfallStepContext<ReplaceHardware>): Promise<DialogTurnResult> {
    const serialNumber = stepContext.context.activity.text;
    stepContext.options.hardwares.serialNumber = serialNumber;
    return await stepContext.prompt(ATTACHMENT_PROMPT, UPLOAD_FRONT_IMAGE());
  }

  private async _askBackImageStep(stepContext: WaterfallStepContext<ReplaceHardware>): Promise<DialogTurnResult> {
    const attachments = stepContext.context.activity.attachments;
    stepContext.options.hardwares.frontImageUrl = (attachments && attachments[0].contentUrl) || '';
    stepContext.options.hardwares.frontImageContentType = (attachments && attachments[0].contentType) || '';
    stepContext.options.hardwares.frontImageName = (attachments && attachments[0].name) || '';
    return await stepContext.prompt(ATTACHMENT_PROMPT, UPLOAD_BACK_IMAGE());
  }

  private async _askDeliveryStep(stepContext: WaterfallStepContext<ReplaceHardware>): Promise<DialogTurnResult> {
    const attachments = stepContext.context.activity.attachments;
    stepContext.options.hardwares.backImageUrl = (attachments && attachments[0].contentUrl) || '';
    stepContext.options.hardwares.backImageContentType = (attachments && attachments[0].contentType) || '';
    stepContext.options.hardwares.backImageName = (attachments && attachments[0].name) || '';
    return await stepContext.prompt(TEXT_PROMPT, {
      prompt: ChoiceFactory.heroCard(DELIVERY_CHOICES, SELECT_ANY_ONE()),
      style: ListStyle.heroCard,
    });
  }

  private async _askAddressStep(stepContext: WaterfallStepContext<ReplaceHardware>): Promise<DialogTurnResult> {
    const contextActivity = stepContext.context.activity;
    const choice = contextActivity ? contextActivity.text : stepContext.result.value;
    switch (choice) {
      case DELIVERY_CHOICES[1]:
        return await stepContext.prompt(TEXT_PROMPT, ENTER_ADDRESS());
      default:
        stepContext.options.hardwares.deliveryAddress = choice;
        return stepContext.continueDialog();
    }
  }

  private async _reviewItemStep(stepContext: WaterfallStepContext<ReplaceHardware>): Promise<DialogTurnResult> {
    if (stepContext.context.activity) {
      stepContext.options.hardwares.deliveryAddress = stepContext.context.activity.text;
    }
    await stepContext.context.sendActivity(
      MessageFactory.attachment(
        AdaptiveCards.getReplaceHardwareReview(REVIEW_SUBMITTED_INFO(), stepContext.options.hardwares),
      ),
    );

    return await stepContext.prompt(TEXT_PROMPT, {
      prompt: ChoiceFactory.heroCard(CONFIRM_REVIEW_CHOICES, IS_CORRECT()),
      style: ListStyle.heroCard,
    });
  }

  private async _checkReviewItemAnswerStep(
    stepContext: WaterfallStepContext<ReplaceHardware>,
  ): Promise<DialogTurnResult> {
    const contextActivity = stepContext.context.activity;
    const choice = contextActivity ? contextActivity.text : stepContext.result.value;
    switch (choice) {
      case CONFIRM_REVIEW_CHOICES[1]:
        if (stepContext.activeDialog) {
          // jump back to 10 steps
          stepContext.activeDialog.state['stepIndex'] = stepContext.activeDialog.state['stepIndex'] - 10;
        }
        return stepContext.continueDialog();
      default:
        stepContext.options.hardwares.frontImageUrl = await this._uploadImageToBlob(
          stepContext.options.userId,
          stepContext.options.hardwares.frontImageName,
          stepContext.options.hardwares.frontImageUrl,
          stepContext.options.hardwares.frontImageContentType,
        );
        stepContext.options.hardwares.backImageUrl = await this._uploadImageToBlob(
          stepContext.options.userId,
          stepContext.options.hardwares.backImageName,
          stepContext.options.hardwares.backImageUrl,
          stepContext.options.hardwares.backImageContentType,
        );
        return stepContext.continueDialog();
    }
  }

  private async _storeAllDetailsStep(stepContext: WaterfallStepContext<ReplaceHardware>): Promise<DialogTurnResult> {
    // TODO: Store in database
    // await stepContext.context.sendActivity(`Stored!`);
    return stepContext.continueDialog();
  }

  private async _informUserAndRedirctStep(
    stepContext: WaterfallStepContext<ReplaceHardware>,
  ): Promise<DialogTurnResult> {
    await stepContext.context.sendActivity(
      `We have recieved you request to replace hardware, your information will be updated shortly.`,
    );
    return await stepContext.beginDialog(DIALOGS.mainWaterfallDialog);
  }

  private async _uploadImageToBlob(
    userId: string,
    imageName: string,
    imageUrl: string,
    imageContentType: string,
  ): Promise<string> {
    const imageBlobPath = `hardware_images/${new Date().getDate()}-${new Date().getMonth()}-${new Date().getFullYear()}/${userId}/${new Date().getTime()}_${imageName}`;
    return await this._azureBlobStorageService.getBlobUrlFromFileUrl(imageUrl, imageContentType, imageBlobPath);
  }
}
