import { ConversationModel } from './conversation';
import { ConversationReferenceModel } from './conversationReference';
import { EmailRecipientModel } from './emailRecipients';
import { HardwareRequestModel } from './hardwareRequest';
import { RatingModel } from './ratings';
import { UserModel } from './user';

export const MODELS = [
  UserModel,
  ConversationModel,
  ConversationReferenceModel,
  RatingModel,
  EmailRecipientModel,
  HardwareRequestModel,
];

export const VIEWS = [];
