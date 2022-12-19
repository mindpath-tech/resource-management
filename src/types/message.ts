import { ChannelTypeEnum } from '../enum/channelTypeEnum';
import { MessageTypeEnum } from '../enum/messageTypeEnum';
import { User } from './bot';
import { Button } from './botFramework';

export type MessageContext = {
  scheduleDemoOption: string;
  confirmPromptResponse: string;
  liveAgentCustomizedStatement: boolean;
};

export type SendMessagePayload = {
  conversationId: string;
  user: User;
  messages: Array<MessagePayload>;
  clearState?: boolean;
};

export type MessagePayload = {
  type: MessageTypeEnum;
  message?: string;
  url?: string;
  actor?: string;
  name?: string;
  contentType?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  json?: any; // IT can be any json
  buttons?: Array<Button>;
};

export type UpdateConversationPayload = {
  status: string;
};

export type ConversationPayload = {
  conversationId?: string | null;
  userId?: string | null;
  status?: string | null;
  channelType: ChannelTypeEnum;
};
