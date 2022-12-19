import { Activity, ConversationState, StatePropertyAccessor, TurnContext } from 'botbuilder-core';
import { UpdateResult } from 'typeorm';
import { ConversationStatusEnum } from '../enum/conversationStatus';
import { ConversationModel } from '../models/conversation';
import { ConversationCache } from '../types/botFramework';
import ConversationRepository from '../repository/conversationRepository';
import { CONVERSATION_MODEL_STATE_PROPERTY, TRANSCRIPT_LOGGER_STATE_PROPERTY } from '../constants';
import { ConversationPayload } from '../types/message';
import { User } from '../types/bot';
import { UserModel } from '../models/user';
import { UserService } from './userService';

/**
 * Perform all the business logic related to conversation.
 */
export class ConversationService {
  private _conversationDataAccessor: StatePropertyAccessor<ConversationCache>;
  private _conversationState: ConversationState;
  private _conversationRepository: ConversationRepository;
  private _userService: UserService;
  private _transcriptLoggerAccessor: StatePropertyAccessor<Array<Activity>>;

  constructor(
    conversationState: ConversationState,
    conversationRepository: ConversationRepository,
    userService: UserService,
  ) {
    this._conversationDataAccessor = conversationState.createProperty(CONVERSATION_MODEL_STATE_PROPERTY);
    this._transcriptLoggerAccessor = conversationState.createProperty(TRANSCRIPT_LOGGER_STATE_PROPERTY);
    this._conversationState = conversationState;
    this._conversationRepository = conversationRepository;
    this._userService = userService;
  }

  /**
   * Perform operation on start of any new conversation.
   * @param turnContext Botframework context
   * @param user user object
   * @param botConversation bot side conversation details
   * @param agentChannelConversation  agent side conversation details.
   * @param skipResolveOperation This is specific field used to ignore operations on resolve conversation while user install app first time.
   * @returns Create conversation on database and return its object.
   */
  public async startConversation(
    turnContext: TurnContext,
    user: User,
    botConversation?: ConversationPayload,
    agentChannelConversation?: ConversationPayload,
    skipResolveOperation?: boolean,
  ): Promise<ConversationModel> {
    const conversationCache = await this._conversationDataAccessor.get(turnContext, {} as ConversationCache);
    const conversationModel = new ConversationModel();
    conversationModel.status = ConversationStatusEnum.BOT;
    conversationModel.skipResolveOperation = skipResolveOperation || false;

    /**
     * Create userModel
     */
    const userModel = new UserModel();
    userModel.firstName = user.firstName;
    userModel.email = user.email!;

    if (botConversation) {
      conversationModel.botConversationId = botConversation.conversationId!;
      conversationModel.botChannelType = botConversation.channelType;
      userModel.botUserId = botConversation.userId!;
    }

    if (agentChannelConversation) {
      conversationModel.agentChannelConversationId = agentChannelConversation.conversationId!;
      conversationModel.agentChannelType = agentChannelConversation.channelType;
      userModel.agentChannelUserId = agentChannelConversation.userId!;
    }
    conversationModel.user = userModel;

    const userInsert = await this._userService.addNewUser(userModel);
    conversationModel.userKey = userInsert.raw.insertId;
    await this._conversationRepository.insert(conversationModel);
    conversationCache.model = conversationModel;
    await this._conversationState.saveChanges(turnContext, false);
    return conversationModel;
  }

  public async getByConversationId(conversationId: string): Promise<ConversationModel | null> {
    const conversationModel = await this._conversationRepository.getByConversationId(conversationId);
    return conversationModel;
  }

  public async getByUserById(userId: string): Promise<ConversationModel | null> {
    const conversationModel = await this._conversationRepository.getByUserId(userId);
    return conversationModel;
  }

  public async updateConversation(id: string, conversationModel: Partial<ConversationModel>): Promise<UpdateResult> {
    return await this._conversationRepository.update(id, conversationModel);
  }

  /**
   * Perform action on endConversation.
   * Update conversation status to bot.
   * Clear cache.
   */
  public async endConversation(id: string, turnContext: TurnContext): Promise<void> {
    await this._conversationRepository.update(id, {
      status: ConversationStatusEnum.BOT,
    });
    const conversationCache = await this._conversationDataAccessor.get(turnContext, {} as ConversationCache);
    const transcripts = await this._transcriptLoggerAccessor.get(turnContext, [] as Array<Activity>);
    transcripts.splice(0, transcripts.length);
    conversationCache.model = undefined;
    await this._conversationState.saveChanges(turnContext, false);
  }
}
