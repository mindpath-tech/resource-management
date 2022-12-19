import { identifyUrlsAndCreateActions, downloadPublicUrlAndUploadToS3, isJson } from '../utils/utils';
import { ActorTypeEnum } from '../enum/actorTypeEnum';
import { MessageTypeEnum } from '../enum/messageTypeEnum';
import { AxiosUtils } from '../helper/axios';
import { FreshChatMessagePayload } from '../types/liveChat';
import { MessagePayload } from '../types/message';
import IMessageParser from './messageParser';
import AdaptiveCards from '../service/adaptiveCards';

export default class LiveChatMessageParser implements IMessageParser {
  /**
   * Convert common message payload to freshchat specific payload.
   * @param messagePayloads Common message payload
   * @returns Freshchat specific payload.
   */
  async toMessage<T>(messagePayloads: Array<MessagePayload>): Promise<T> {
    const messageParts = [];
    for (let index = 0; index < messagePayloads.length; index++) {
      const messagePayload = messagePayloads[index];
      const { message, url, type, name, buttons } = messagePayload;
      if (type === MessageTypeEnum.FILE) {
        if (url) {
          messageParts.push({
            url_button: {
              url: url,
              label: name,
            },
          });
        }

        if (buttons) {
          buttons.forEach((button) => {
            messageParts.push({
              url_button: {
                url: button.value,
                label: button.title,
              },
            });
          });
        }
      }

      if (type === MessageTypeEnum.IMAGE) {
        messageParts.push({
          image: {
            url,
          },
        });
      }

      if (message) {
        messageParts.push({
          text: {
            content: message,
          },
        });
      }
    }

    let actorType = ActorTypeEnum.USER.toLowerCase();
    if (messagePayloads[0].actor === ActorTypeEnum.BOT) {
      actorType = ActorTypeEnum.AGENT.toLowerCase();
    }

    return {
      message_type: 'normal',
      message_parts: messageParts,
      actor_type: actorType,
    } as unknown as T;
  }

  /**
   * Convert freshchat specific message to common message payload.
   * @param messageData freshchat message payload FreshChatMessagePayload.
   * @returns MessagePayload: Common message payload.
   */
  async fromMessage<T>(messageData: T): Promise<Array<MessagePayload>> {
    let message = '';
    const messagePayloads = [];
    const payload = messageData as unknown as FreshChatMessagePayload;
    for (let index = 0; index < payload.message_parts.length; index++) {
      const messagePart = payload.message_parts[index];
      const file = messagePart.file;
      const image = messagePart.image;
      if (file && file.content_type !== 'text/plain') {
        const url = await downloadPublicUrlAndUploadToS3(file.url);
        messagePayloads.push({
          type: MessageTypeEnum.FILE,
          url,
          name: file.name,
          contentType: file.content_type,
        });
      } else if (image) {
        const url = await downloadPublicUrlAndUploadToS3(image.url);
        messagePayloads.push({
          type: MessageTypeEnum.IMAGE,
          contentType: 'image/jpeg',
          name: 'image',
          url: url,
        });
      } else {
        let content = messagePart.text?.content || '';
        if (file?.content_type === 'text/plain') {
          const response = await AxiosUtils.getRequest<string>(file.url);
          content = response.data;
        }
        if (content && isJson(content)) {
          messagePayloads.push({
            type: MessageTypeEnum.ADAPTIVE_CARD,
            json: JSON.parse(content),
          });
        } else if (content) {
          content = content.replace(/\n/g, '\n\n');
          if (content === '>') {
            message = `${message}\n\n&#62;`;
          } else if (content === '#') {
            message = `${message}\n\n&#35;`;
          } else if (message) {
            message = `${message}\n\n${content}`;
          } else {
            message = content;
          }
        }
      }
    }
    if (!isJson(message) && message) {
      const { actions, text } = identifyUrlsAndCreateActions(message);
      if (actions && actions.length) {
        // Message contain link send as adaptive card
        messagePayloads.push({
          type: MessageTypeEnum.ADAPTIVE_CARD,
          json: AdaptiveCards.getTextWithLinkCard(text, actions),
        });
      } else {
        messagePayloads.push({
          type: MessageTypeEnum.TEXT_MESSAGE,
          message,
        });
      }
    }
    return messagePayloads;
  }
}
