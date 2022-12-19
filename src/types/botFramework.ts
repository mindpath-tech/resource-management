import { TeamsChannelAccount } from 'botbuilder';
import { ConversationModel } from '../models/conversation';

export type ConversationCache = {
  model?: ConversationModel;
  teamMember?: TeamsChannelAccount;
};

export type TranscriptDetails = {
  text: string;
  textFormat: string;
  type: string;
  from: {
    id: string;
    name: string;
    role: string;
  };
  timestamp: string;
  attachmentLayout: string;
  inputHint: string;
  attachments: Array<Attachment>;
};

export type Attachment = {
  contentType: string;
  content: {
    text: string;
    buttons: Array<Button>;
  };
};

export type Button = {
  title: string;
  type: string;
  value: string;
};
