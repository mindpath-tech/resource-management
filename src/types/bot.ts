import { Attachment } from 'botbuilder';

export type BotMessagePayload = {
  messages: Array<string>;
  attachments: Array<Attachment>;
};

export type User = {
  userId: string;
  firstName: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  phone?: string;
  properties?: Array<Record<string, string>>;
};

export type AdaptiveCardAction = {
  type: string;
  title: string;
  url: string;
  iconUrl: string;
};
