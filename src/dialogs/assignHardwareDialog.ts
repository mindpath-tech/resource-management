import { TurnContext, StatePropertyAccessor, MessageFactory } from 'botbuilder';
import { v4 as uuidv4 } from 'uuid';
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
  CONFIRM_FINAL_SUMMARY_CHOICES,
  CONFIRM_REVIEW_CHOICES,
  ATTACHMENT_PROMPT,
} from '../constants';
import { DIALOGS } from '../constants/dialogs';
import { AssignHardware, AssignHardwareDetails, ImageDetails } from 'src/types/assignHardware';
import AdaptiveCards from 'src/service/adaptiveCards';
import AzureBlobStorageService from 'src/service/azureBlobStorageService';
import { HardwareAssignTypeEnum } from 'src/enum/hardwareTypeEnum';
import {
  BACK_IMAGE_DIALOG,
  BRAND_NAME_DIALOG,
  CORRECT_CHOICE_DIALOG,
  FRONT_IMAGE_DIALOG,
  INFORM_USER_FINAL_DIALOG,
  MODEL_NAME_DIALOG,
  REVIEW_DIALOG,
  SERIAL_NUMBER_DIALOG,
} from 'src/constants/dialogMessages';

const ASSIGN_HARDWARE_DIALOG = DIALOGS.assignHardwareDialog;
export class AssignHardwareDialog extends ComponentDialog {
  private _azureBlobStorageService: AzureBlobStorageService;
  constructor(id: string) {
    super(id);
    this.addDialog(new TextPrompt(TEXT_PROMPT))
      .addDialog(new ChoicePrompt(CHOICE_PROMPT))
      .addDialog(new AttachmentPrompt(ATTACHMENT_PROMPT))
      .addDialog(
        new WaterfallDialog(ASSIGN_HARDWARE_DIALOG, [
          this._getRequestListStep.bind(this),
          this._askBrandNameStep.bind(this),
          this._askModelNameStep.bind(this),
          this._askSerialNumberStep.bind(this),
          this._askFrontImageStep.bind(this),
          this._askBackImageStep.bind(this),
          this._reviewItemStep.bind(this),
          this._checkReviewItemAnswerStep.bind(this),
          this._checkNextItemExistStep.bind(this),
          this._showSummaryStep.bind(this),
          this._checkSummaryAnswerStep.bind(this),
          this._storeAllDetailsStep.bind(this),
          this._informUserAndRedirctStep.bind(this),
        ]),
      );

    this.initialDialogId = ASSIGN_HARDWARE_DIALOG;
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

  private async _getRequestListStep(stepContext: WaterfallStepContext<AssignHardware>): Promise<DialogTurnResult> {
    // TODO: Fetch required details (requestId, hardwareId, totalQuantity) from database against userId
    stepContext.options.userId = stepContext.context.activity.from.id;
    stepContext.options.requestId = uuidv4();
    stepContext.options.hardwareId = HardwareAssignTypeEnum.MONITOR;
    stepContext.options.totalQuantity = 2;
    stepContext.options.currentItemIndex = 0;
    stepContext.options.hardwares = new Array<AssignHardwareDetails>();

    for (let index = 0; index < stepContext.options.totalQuantity; index++) {
      stepContext.options.hardwares[index] = {} as AssignHardwareDetails;
    }

    const currentItem = stepContext.options.currentItemIndex + 1;
    const totalItems = stepContext.options.totalQuantity;

    await stepContext.context.sendActivity(`Please provide details of hardware ${currentItem}/${totalItems}`);
    return stepContext.continueDialog();
  }

  private async _askBrandNameStep(stepContext: WaterfallStepContext<AssignHardware>): Promise<DialogTurnResult> {
    return await stepContext.prompt(TEXT_PROMPT, BRAND_NAME_DIALOG);
  }

  private async _askModelNameStep(stepContext: WaterfallStepContext<AssignHardware>): Promise<DialogTurnResult> {
    const brandName = stepContext.context.activity.text;
    stepContext.options.hardwares[stepContext.options.currentItemIndex].brandName = brandName;
    return await stepContext.prompt(TEXT_PROMPT, MODEL_NAME_DIALOG);
  }

  private async _askSerialNumberStep(stepContext: WaterfallStepContext<AssignHardware>): Promise<DialogTurnResult> {
    const modelName = stepContext.context.activity.text;
    stepContext.options.hardwares[stepContext.options.currentItemIndex].modelName = modelName;
    return await stepContext.prompt(TEXT_PROMPT, SERIAL_NUMBER_DIALOG);
  }

  private async _askFrontImageStep(stepContext: WaterfallStepContext<AssignHardware>): Promise<DialogTurnResult> {
    const serialNumber = stepContext.context.activity.text;
    stepContext.options.hardwares[stepContext.options.currentItemIndex].serialNumber = serialNumber;
    return await stepContext.prompt(ATTACHMENT_PROMPT, FRONT_IMAGE_DIALOG);
  }

  private async _askBackImageStep(stepContext: WaterfallStepContext<AssignHardware>): Promise<DialogTurnResult> {
    const attachments = stepContext.context.activity.attachments;
    const imageDetails = {
      imageName: (attachments && attachments[0].name) || '',
      imageUrl: (attachments && attachments[0].contentUrl) || '',
      imageContentType: (attachments && attachments[0].contentType) || '',
    } as ImageDetails;
    stepContext.options.hardwares[stepContext.options.currentItemIndex].frontImage = imageDetails;
    return await stepContext.prompt(ATTACHMENT_PROMPT, BACK_IMAGE_DIALOG);
  }

  private async _reviewItemStep(stepContext: WaterfallStepContext<AssignHardware>): Promise<DialogTurnResult> {
    const attachments = stepContext.context.activity.attachments;
    const imageDetails = {
      imageName: (attachments && attachments[0].name) || '',
      imageUrl: (attachments && attachments[0].contentUrl) || '',
      imageContentType: (attachments && attachments[0].contentType) || '',
    } as ImageDetails;
    stepContext.options.hardwares[stepContext.options.currentItemIndex].backImage = imageDetails;

    const currentItem = stepContext.options.currentItemIndex + 1;
    const totalItems = stepContext.options.totalQuantity;
    const currentHardwareDetails = stepContext.options.hardwares[stepContext.options.currentItemIndex];

    await stepContext.context.sendActivity(
      MessageFactory.attachment(
        AdaptiveCards.getAssignHardwareReview(
          `Please review the information that you have submitted (${currentItem}/${totalItems}).`,
          currentHardwareDetails,
        ),
      ),
    );

    return await stepContext.prompt(TEXT_PROMPT, {
      prompt: ChoiceFactory.heroCard(CONFIRM_REVIEW_CHOICES, CORRECT_CHOICE_DIALOG),
      style: ListStyle.heroCard,
    });
  }

  private async _checkReviewItemAnswerStep(
    stepContext: WaterfallStepContext<AssignHardware>,
  ): Promise<DialogTurnResult> {
    const contextActivity = stepContext.context.activity;
    const choice = contextActivity ? contextActivity.text : stepContext.result.value;
    const brandStepIndex = stepContext.activeDialog?.state['stepIndex'] - 7;

    switch (choice) {
      case CONFIRM_REVIEW_CHOICES[1]:
        if (stepContext.activeDialog) {
          stepContext.activeDialog.state['stepIndex'] = brandStepIndex;
        }
        return stepContext.continueDialog();
      default:
        stepContext.options.hardwares[stepContext.options.currentItemIndex].frontImage.imageUrl =
          await this._uploadImageToBlob(
            stepContext.options.userId,
            stepContext.options.hardwares[stepContext.options.currentItemIndex].frontImage,
          );
        stepContext.options.hardwares[stepContext.options.currentItemIndex].backImage.imageUrl =
          await this._uploadImageToBlob(
            stepContext.options.userId,
            stepContext.options.hardwares[stepContext.options.currentItemIndex].backImage,
          );
        return stepContext.continueDialog();
    }
  }

  private async _checkNextItemExistStep(stepContext: WaterfallStepContext<AssignHardware>): Promise<DialogTurnResult> {
    const brandStepIndex = stepContext.activeDialog?.state['stepIndex'] - 8;
    stepContext.options.currentItemIndex++;

    if (stepContext.options.currentItemIndex < stepContext.options.totalQuantity) {
      if (stepContext.activeDialog) {
        stepContext.activeDialog.state['stepIndex'] = brandStepIndex;
        await stepContext.context.sendActivity(
          `Please provide details of hardware ${stepContext.options.currentItemIndex + 1}/${
            stepContext.options.totalQuantity
          }`,
        );
      }
    }

    return stepContext.continueDialog();
  }

  private async _showSummaryStep(stepContext: WaterfallStepContext<AssignHardware>): Promise<DialogTurnResult> {
    for (let index = 0; index < stepContext.options.totalQuantity; index++) {
      await stepContext.context.sendActivity(
        MessageFactory.attachment(
          AdaptiveCards.getAssignHardwareReview(REVIEW_DIALOG, stepContext.options.hardwares[index]),
        ),
      );
    }

    return await stepContext.prompt(TEXT_PROMPT, {
      prompt: ChoiceFactory.heroCard(CONFIRM_FINAL_SUMMARY_CHOICES, CORRECT_CHOICE_DIALOG),
      style: ListStyle.heroCard,
    });
  }

  private async _checkSummaryAnswerStep(stepContext: WaterfallStepContext<AssignHardware>): Promise<DialogTurnResult> {
    const contextActivity = stepContext.context.activity;
    const choice = contextActivity ? contextActivity.text : stepContext.result.value;
    switch (choice) {
      case CONFIRM_FINAL_SUMMARY_CHOICES[1]:
        return await stepContext.beginDialog(DIALOGS.assignHardwareDialog);
      default:
        return stepContext.continueDialog();
    }
  }

  private async _storeAllDetailsStep(stepContext: WaterfallStepContext<AssignHardware>): Promise<DialogTurnResult> {
    // TODO: Store in database
    // await stepContext.context.sendActivity(`Stored!`);
    return stepContext.continueDialog();
  }

  private async _informUserAndRedirctStep(
    stepContext: WaterfallStepContext<AssignHardware>,
  ): Promise<DialogTurnResult> {
    await stepContext.context.sendActivity(INFORM_USER_FINAL_DIALOG);
    return await stepContext.beginDialog(DIALOGS.mainWaterfallDialog);
  }

  private async _uploadImageToBlob(userId: string, imageDetails: ImageDetails): Promise<string> {
    const imageBlobPath = `hardware_images/${new Date().getDate()}-${new Date().getMonth()}-${new Date().getFullYear()}/${userId}/${new Date().getTime()}_${
      imageDetails.imageName
    }`;
    return await this._azureBlobStorageService.getBlobUrlFromFileUrl(
      imageDetails.imageUrl,
      imageDetails.imageContentType,
      imageBlobPath,
    );
  }
}
