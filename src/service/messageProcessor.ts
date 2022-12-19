import { IChannelConnector } from '../connectors/channelConnectors';
import { ChannelTypeEnum } from '../enum/channelTypeEnum';
import { MessagePayload } from '../types/message';
import { ConversationModel } from '../models/conversation';
import { ConversationStatusEnum } from '../enum/conversationStatus';
import { BotContext } from '../helper/botContext';
import { User } from '../types/bot';

/**
 * Class process message from bot to agent and agent to bot.
 */
export class MessageProcessor {
  private _abiContext: BotContext;

  constructor(botContext: BotContext) {
    this._abiContext = botContext;
  }

  public async processMessage(
    conversationId: string,
    user: User,
    messages: Array<MessagePayload>,
    senderChannelType?: ChannelTypeEnum | null,
    receiverChannelType?: ChannelTypeEnum | null,
  ): Promise<ConversationModel> {
    let clearState = false;
    if (!messages?.length) {
      // Unnecessary message for example html code.
      // Do nothing in this case
      return {} as ConversationModel;
    }
    // Check whether conversation exist
    let conversationModel = await this._abiContext.conversationService.getByConversationId(conversationId);
    if (!conversationModel && senderChannelType === ChannelTypeEnum.FRESH_CHAT) {
      // Fresh is sending first message.
      // Check whether conversation exist for userId
      conversationModel = await this._abiContext.conversationService.getByUserById(user.userId);
      if (conversationModel && !conversationModel.agentChannelConversationId) {
        conversationModel.agentChannelConversationId = conversationId;
      }
    }

    if (!conversationModel) {
      // Conversation not found, Case when we got webhook request for web abi bot.
      // Do nothing in this case
      return {} as ConversationModel;
    }

    if (conversationModel.agentChannelConversationId === conversationId) {
      senderChannelType = senderChannelType ? senderChannelType : conversationModel.agentChannelType;
      receiverChannelType = receiverChannelType ? receiverChannelType : conversationModel.botChannelType;
    }

    if (conversationModel.botConversationId === conversationId) {
      senderChannelType = senderChannelType ? senderChannelType : conversationModel.botChannelType;
      receiverChannelType = receiverChannelType ? receiverChannelType : conversationModel.agentChannelType;
    }

    let channelConnector!: IChannelConnector;
    switch (receiverChannelType) {
      case ChannelTypeEnum.FRESH_CHAT: {
        channelConnector = this._abiContext.freshChatConnector;
        break;
      }
      case ChannelTypeEnum.MS_TEAMS: {
        channelConnector = this._abiContext.teamConnector;
        break;
      }
      case ChannelTypeEnum.EMULATOR: {
        channelConnector = this._abiContext.teamConnector;
        break;
      }
    }

    /**
     * If agentChannelConversationId is conversation id is present then process with existing conversation. Otherwise create new conversation.
     */
    if (conversationModel.agentChannelConversationId) {
      if (conversationModel.status !== ConversationStatusEnum.LIVE_AGENT || conversationModel.skipResolveOperation) {
        conversationModel.status = ConversationStatusEnum.LIVE_AGENT;
        await this._abiContext.conversationService.updateConversation(conversationModel.id, {
          status: ConversationStatusEnum.LIVE_AGENT,
          skipResolveOperation: false,
          agentChannelConversationId: conversationModel.agentChannelConversationId,
        });
        clearState = true;
      }
      await channelConnector.sendMessage({
        conversationId: channelConnector.getConversationId(conversationModel)!, // change to target platform conversationId
        user: {
          ...user,
          userId: channelConnector.getUserId(conversationModel)!, // change to target platform userId
        },
        messages,
        clearState,
      });
      return conversationModel;
    } else {
      const conversation = await channelConnector.createConversationAndSendMessage(user, messages);
      conversationModel = {
        ...conversationModel,
        status: ConversationStatusEnum.LIVE_AGENT,
        agentChannelConversationId: conversation.conversationId!,
        agentChannelType: conversation.channelType,
      };
      conversationModel.user.agentChannelUserId = conversation.userId!;
      await this._abiContext.userService.updateUser(conversationModel.user.id, conversationModel.user);
      await this._abiContext.conversationService.updateConversation(conversationModel.id, conversationModel);
      return conversationModel;
    }
  }
}
