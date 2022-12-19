import { MessagePayload } from '../types/message';

export default interface IMessageParser {
  /**
   * Convert message from general pattern to channel specific message pattern.
   * @param messagePayload
   */
  toMessage<T>(messagePayload: Array<MessagePayload>): Promise<T>;

  /**
   * Convert channel message patten to general pattern.
   * @param messagePayload
   */
  fromMessage<T>(messagePayload: T): Promise<Array<MessagePayload>>;
}
