import { ActionTypes, Attachment, CardFactory } from 'botbuilder-core';
import { SubmitHardware } from 'src/states/submitHardware';
import { AssignHardwareDetails } from 'src/types/assignHardware';
import { ReplaceHardwareDetails } from 'src/types/replaceHardware';
import { AdaptiveCardAction } from '../types/bot';

/**
 * Some general functions used for adaptive card design.
 */
export default class AdaptiveCards {
  public static createHeroCard(name: string, url: string, images = []): Attachment {
    return CardFactory.heroCard(
      name,
      CardFactory.images(images),
      CardFactory.actions([
        {
          title: name,
          type: 'openUrl',
          value: url,
        },
      ]),
    );
  }

  public static choiceHeroCard(text: string, choices: Array<string>): Attachment {
    return CardFactory.heroCard(
      '',
      text,
      [],
      CardFactory.actions(
        choices.map((choice) => ({
          title: choice,
          type: ActionTypes.ImBack,
          value: choice,
        })),
      ),
    );
  }

  public static createAudioCard(name: string, urls: Array<string>): Attachment {
    return CardFactory.audioCard(name, urls);
  }

  public static createVideoCard(name: string, urls: Array<string>): Attachment {
    return CardFactory.videoCard(name, urls);
  }

  public static getInlineAttachment(name: string, contentUrl: string, contentType: string): Attachment {
    return {
      name,
      contentType,
      contentUrl,
    };
  }

  public static async getDatePromptCard(): Promise<AdaptiveCards> {
    return {
      type: 'AdaptiveCard',
      $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
      version: '1.0',
      body: [
        {
          id: 'date',
          type: 'Input.Date',
        },
        {
          id: 'time',
          type: 'Input.Time',
        },
        {
          id: 'id3',
          type: 'ActionSet',
          actions: [
            {
              type: 'Action.Submit',
              title: 'Submit',
            },
          ],
        },
      ],
    };
  }

  // any json.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static getAdaptiveCard(data: Record<string, any>): Attachment {
    return CardFactory.adaptiveCard(data);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static getTextWithLinkCard(text: string, actions: Array<AdaptiveCardAction>): any {
    return {
      $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
      type: 'AdaptiveCard',
      version: '1.0',
      body: [
        {
          type: 'TextBlock',
          text,
          wrap: true,
        },
      ],
      msteams: {
        width: 'Full',
      },
      actions,
    };
  }

  public static submitHardware(submitHardware: SubmitHardware): Attachment {
    const adaptiveCard = {
      type: 'AdaptiveCard',
      $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
      version: '1.2',
      body: [
        {
          type: 'TextBlock',
          text: 'Please confirm your details :-',
          wrap: true,
        },
        {
          type: 'TextBlock',
          text: `Device type : ${submitHardware.deviceType}`,
          wrap: true,
        },
        {
          type: 'TextBlock',
          text: `Brand name : ${submitHardware.brand}`,
          wrap: true,
        },
        {
          type: 'TextBlock',
          text: `Model name : ${submitHardware.model}`,
          wrap: true,
        },
        {
          type: 'TextBlock',
          text: `Serial number : ${submitHardware.serialNumber}`,
          wrap: true,
        },
        {
          type: 'Container',
          items: [
            {
              type: 'ColumnSet',
              columns: [
                {
                  type: 'Column',
                  width: '',
                  items: [
                    {
                      type: 'TextBlock',
                      text: "device's front image : ",
                      wrap: true,
                    },
                  ],
                },
                {
                  type: 'Column',
                  width: 'stretch',
                  items: [
                    {
                      type: 'Image',
                      url: submitHardware.frontImage[0].contentUrl,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
    return CardFactory.adaptiveCard(adaptiveCard);
  }

  public static getReplaceHardwareReview(title: string, hardwareDetails: ReplaceHardwareDetails): Attachment {
    return CardFactory.adaptiveCard({
      type: 'AdaptiveCard',
      $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
      version: '1.0',
      body: [
        {
          type: 'ColumnSet',
          columns: [
            {
              type: 'Column',
              width: 'stretch',
              items: [
                {
                  type: 'TextBlock',
                  text: title,
                  wrap: true,
                },
                {
                  type: 'TextBlock',
                  text: `Hardware: ${hardwareDetails.hardware}`,
                  wrap: true,
                },
                {
                  type: 'TextBlock',
                  text: `Brand Name: ${hardwareDetails.brandName}`,
                  wrap: true,
                },
                {
                  type: 'TextBlock',
                  text: `Model Name: ${hardwareDetails.modelName}`,
                  wrap: true,
                },
                {
                  type: 'TextBlock',
                  text: `Serial Number: ${hardwareDetails.serialNumber}`,
                  wrap: true,
                },
                {
                  type: 'TextBlock',
                  text: `Delivery Address : ${hardwareDetails.deliveryAddress}`,
                  wrap: true,
                },
                {
                  type: 'TextBlock',
                  text: 'Front & Back Images',
                  wrap: true,
                },
              ],
            },
          ],
        },
        {
          type: 'ColumnSet',
          columns: [
            {
              type: 'Column',
              width: 'stretch',
              items: [
                {
                  type: 'Image',
                  url: hardwareDetails.frontImageUrl,
                  horizontalAlignment: 'Center',
                  altText: 'Front Image',
                },
              ],
            },
            {
              type: 'Column',
              width: 'stretch',
              items: [
                {
                  type: 'Image',
                  url: hardwareDetails.backImageUrl,
                  altText: 'Back Image',
                  horizontalAlignment: 'Center',
                },
              ],
            },
          ],
        },
      ],
    });
  }

  public static getAssignHardwareReview(title: string, hardwareDetails: AssignHardwareDetails): Attachment {
    return CardFactory.adaptiveCard({
      type: 'AdaptiveCard',
      $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
      version: '1.0',
      body: [
        {
          type: 'ColumnSet',
          columns: [
            {
              type: 'Column',
              width: 'stretch',
              items: [
                {
                  type: 'TextBlock',
                  text: title,
                  wrap: true,
                },
                {
                  type: 'TextBlock',
                  text: `Brand Name: ${hardwareDetails.brandName}`,
                  wrap: true,
                },
                {
                  type: 'TextBlock',
                  text: `Model Name: ${hardwareDetails.modelName}`,
                  wrap: true,
                },
                {
                  type: 'TextBlock',
                  text: `Serial Number: ${hardwareDetails.serialNumber}`,
                  wrap: true,
                },
                {
                  type: 'TextBlock',
                  text: 'Front & Back Images',
                  wrap: true,
                },
              ],
            },
          ],
        },
        {
          type: 'ColumnSet',
          columns: [
            {
              type: 'Column',
              width: 'stretch',
              items: [
                {
                  type: 'Image',
                  url: hardwareDetails.frontImage.imageUrl,
                  horizontalAlignment: 'Center',
                  altText: 'Front Image',
                },
              ],
            },
            {
              type: 'Column',
              width: 'stretch',
              items: [
                {
                  type: 'Image',
                  url: hardwareDetails.backImage.imageUrl,
                  altText: 'Back Image',
                  horizontalAlignment: 'Center',
                },
              ],
            },
          ],
        },
      ],
    });
  }

  public static getLogDefectReview(
    devicename: string,
    devicedescription: string,
    devicepriority: string,
    deviceimage?: string,
  ): Attachment {
    return CardFactory.adaptiveCard({
      type: 'AdaptiveCard',
      $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
      version: '1.0',
      body: [
        {
          speak: 'Defective Device Details',
          type: 'ColumnSet',
          columns: [
            {
              type: 'Column',
              width: 2,
              items: [
                {
                  type: 'TextBlock',
                  text: 'Defective Device Details',
                  weight: 'bolder',
                  size: 'extraLarge',
                  spacing: 'none',
                  wrap: true,
                },
                {
                  type: 'TextBlock',
                  text: `Defective Device Name :  ${devicename}`,
                  wrap: true,
                },
                {
                  type: 'TextBlock',
                  text: `Defective Device Description :  ${devicedescription}`,
                  wrap: true,
                },
                {
                  type: 'TextBlock',
                  text: `Priority :  ${devicepriority}`,
                  wrap: true,
                },
              ],
            },
            {
              type: 'Column',
              width: 1,
              items: [
                {
                  type: 'Image',
                  url: `${deviceimage}`,
                  altText: `${deviceimage}`,
                  size: 'auto',
                },
              ],
            },
          ],
        },
      ],
    });
  }
}
