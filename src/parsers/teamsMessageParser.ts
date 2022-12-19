import { Activity } from 'botframework-schema';
import { TEAMS_CONTENT_TYPE } from '../constants/teams';
import { IMAGE_EXTENSIONS, OPEN_URL_ACTION, OPEN_URL_TEXT, POPUP_ICON_URL } from '../constants';
import { ADAPTIVE_CARD_NOT_SUPPORTED } from '../constants/errorMessages';
import { ActorTypeEnum } from '../enum/actorTypeEnum';
import { MessageTypeEnum } from '../enum/messageTypeEnum';
import AdaptiveCards from '../service/adaptiveCards';
import { MessagePayload } from '../types/message';
import IMessageParser from './messageParser';
import { downloadFileAndUploadToS3, downloadPublicUrlAndUploadToS3 } from '../utils/utils';
import { AdaptiveCardAction, BotMessagePayload } from '../types/bot';

export default class TeamsMessageParser implements IMessageParser {
  /**
   * Convert common message payload to team specific payload.
   * @param messagePayloads Common message payload
   * @returns Team specific payload.
   */
  async toMessage<T>(botMessagePayloads: Array<MessagePayload>): Promise<T> {
    const teamMessagePayload: BotMessagePayload = {
      messages: [],
      attachments: [],
    };
    botMessagePayloads.forEach((botMessagePayload) => {
      switch (botMessagePayload.type) {
        case MessageTypeEnum.TEXT_MESSAGE: {
          teamMessagePayload.messages.push(botMessagePayload.message!);
          break;
        }
        case MessageTypeEnum.ADAPTIVE_CARD: {
          const json = botMessagePayload.json;
          if (json) {
            teamMessagePayload.attachments.push(AdaptiveCards.getAdaptiveCard(json));
          } else {
            teamMessagePayload.messages.push(ADAPTIVE_CARD_NOT_SUPPORTED());
          }
          break;
        }
        case MessageTypeEnum.FILE: {
          const { name, url } = botMessagePayload;
          const actions: Array<AdaptiveCardAction> = [
            {
              type: OPEN_URL_ACTION,
              title: OPEN_URL_TEXT,
              iconUrl: POPUP_ICON_URL,
              url: url!,
            },
          ];
          const json = AdaptiveCards.getTextWithLinkCard(name!, actions);
          teamMessagePayload.attachments.push(AdaptiveCards.getAdaptiveCard(json));
          break;
        }
        case MessageTypeEnum.IMAGE: {
          const { name, contentType, url } = botMessagePayload;
          teamMessagePayload.attachments.push(AdaptiveCards.getInlineAttachment(name!, url!, contentType!));
          break;
        }
        default:
          teamMessagePayload.messages.push(botMessagePayload.message!);
      }
    });
    return teamMessagePayload as unknown as T;
  }

  /**
   * Convert team specific message to common message payload.
   * @param messageData freshchat message payload FreshChatMessagePayload.
   * @returns MessagePayload: Common message payload.
   */
  async fromMessage<T>(activity: T): Promise<Array<MessagePayload>> {
    const contextActivity = activity as unknown as Activity;
    const message = contextActivity.text;
    const attachments = contextActivity.attachments;
    const messagePayloads = [];
    if (attachments) {
      for (const attachment of attachments) {
        if (attachment.content?.downloadUrl || attachment.contentUrl) {
          let s3Url;
          if (attachment.content?.downloadUrl) {
            s3Url = await downloadPublicUrlAndUploadToS3(attachment.content?.downloadUrl, attachment.content?.fileType);
          } else {
            s3Url = await downloadFileAndUploadToS3(attachment.contentUrl!);
          }
          attachment.content = {
            ...attachment.content,
            downloadUrl: s3Url,
          };
        }
        const contentType = attachment.contentType;
        if (contentType === TEAMS_CONTENT_TYPE.FILE || contentType === TEAMS_CONTENT_TYPE.HERO_CARD) {
          const fileType = attachment.content.fileType;
          if (fileType && IMAGE_EXTENSIONS.includes(fileType.toLowerCase())) {
            messagePayloads.push({
              type: MessageTypeEnum.IMAGE,
              url: attachment.content?.downloadUrl || attachment.contentUrl,
              message: attachment.content.text || '',
              actor:
                contextActivity.from.role === ActorTypeEnum.USER.toLowerCase() ? ActorTypeEnum.USER : ActorTypeEnum.BOT,
            });
          } else {
            messagePayloads.push({
              type: MessageTypeEnum.FILE,
              url: attachment.content?.downloadUrl || attachment.contentUrl,
              message: attachment.content.text,
              buttons: attachment.content.buttons,
              name: attachment.name,
              actor:
                contextActivity.from.role === ActorTypeEnum.USER.toLowerCase() ? ActorTypeEnum.USER : ActorTypeEnum.BOT,
            });
          }
        }
        if (contentType === 'image/*') {
          messagePayloads.push({
            type: MessageTypeEnum.IMAGE,
            url: attachment.content?.downloadUrl || attachment.contentUrl,
            actor:
              contextActivity.from.role === ActorTypeEnum.USER.toLowerCase() ? ActorTypeEnum.USER : ActorTypeEnum.BOT,
          });
        }
      }
    }
    if (message) {
      messagePayloads.push({
        type: MessageTypeEnum.TEXT_MESSAGE,
        message,
        actor: contextActivity.from.role === ActorTypeEnum.USER.toLowerCase() ? ActorTypeEnum.USER : ActorTypeEnum.BOT,
      });
    }
    return messagePayloads;
  }
}
