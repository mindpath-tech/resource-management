import { Activity, TurnContext } from 'botbuilder';
import { ConversationReferenceModel } from '../models/conversationReference';
import ConversationRefRepository from '../repository/conversationRefRepository';

export class ConversationRefService {
  private _conversationRefRepository: ConversationRefRepository;
  constructor(conversationRefRepository: ConversationRefRepository) {
    this._conversationRefRepository = conversationRefRepository;
  }

  public async getConversationRefRepository(conversationId: string): Promise<ConversationReferenceModel | null> {
    return await this._conversationRefRepository.get(conversationId);
  }

  async addConversationReference(activity: Activity): Promise<void> {
    const conversationReference = TurnContext.getConversationReference(activity);
    const botConversation = conversationReference.conversation;
    if (botConversation) {
      const botConversationId = botConversation.id;
      const conversationReferenceModel = new ConversationReferenceModel();
      conversationReferenceModel.botConversationId = botConversationId;
      conversationReferenceModel.conversationReference = conversationReference;
      await new ConversationRefRepository().appOrUpdate([conversationReferenceModel]);
    }

    return;
  }
}
