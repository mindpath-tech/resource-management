import { User } from '../types/bot';
import { AxiosUtils } from '../helper/axios';
import {
  FreshChatConversationPayload,
  FreshChatChannel,
  FreshChatUser,
  FreshChatMessagePayload,
  FreshChatChannels,
  FreshChatAgents,
} from '../types/liveChat';
import { CUSTOM_PROPERTIES, DEFAULT_USER_NAME, FRESH_CHAT_ROUTES } from '../constants/livechat';
import { LiveChatConversationStatusEnum } from '../enum/liveChatConversationStatusEnum';
import axios from 'axios';

/**
 * Class used for freshchat integration and api calls.
 */
export default class LiveChatRepository {
  private _baseUrl: string;
  private _accessToken: string;
  private _freshChatAppId: string;
  constructor(baseUrl: string, accessToken: string, freshChatAppId: string) {
    this._baseUrl = baseUrl;
    this._accessToken = `Bearer ${accessToken}`;
    this._freshChatAppId = freshChatAppId;
  }

  /**
   * Create conversation on freshchat.
   */
  public async createConversation(
    userId: string,
    channelId: string,
    messagePayload: FreshChatMessagePayload,
    status = LiveChatConversationStatusEnum.NEW,
  ): Promise<FreshChatConversationPayload> {
    const payload = {
      app_id: this._freshChatAppId,
      channel_id: channelId,
      messages: [
        {
          ...messagePayload,
          app_id: this._freshChatAppId,
        },
      ],
      status,
      users: [{ id: userId }],
    };
    const url = `${this._baseUrl}${FRESH_CHAT_ROUTES.CONVERSATIONS}`;
    const response = await AxiosUtils.postRequest<FreshChatConversationPayload>(url, {
      data: payload,
      headers: {
        Authorization: this._accessToken,
      },
    });
    return response.data;
  }

  /**
   * Create user on freshchat.
   * @param user User
   * @returns FreshChatUser
   */
  public async createUser(user: User): Promise<FreshChatUser> {
    const url = `${this._baseUrl}${FRESH_CHAT_ROUTES.USERS}`;
    const response = await AxiosUtils.postRequest<FreshChatUser>(url, {
      data: {
        first_name: user.firstName || DEFAULT_USER_NAME,
        last_name: user.lastName || '',
        email: user.email,
        properties: [
          {
            name: CUSTOM_PROPERTIES.BOT_USER_ID,
            value: user.userId,
          },
        ],
      },
      headers: {
        Authorization: this._accessToken,
      },
    });
    return response.data;
  }

  /**
   * Get all the channels from freshchat.
   * @returns Functions used to get all the channels from freshchat.
   */
  public async getChannels(): Promise<Array<FreshChatChannel>> {
    // For now we are keeping default values.
    const params = 'sort_by=name&items_per_page=1&sort_order=desc&page=1';
    // Currently assuming only one channel.
    const url = `${this._baseUrl}${FRESH_CHAT_ROUTES.CHANNELS}?${params}`;
    const response = await AxiosUtils.getRequest<FreshChatChannels>(url, {
      headers: {
        Authorization: this._accessToken,
      },
    });
    return response.data.channels;
  }

  /**
   * Function used to get details of user from freshchat.
   * @param userId agentSideUserId
   * @returns FreshChatUser
   */
  public async getUserDetails(userId: string): Promise<FreshChatUser> {
    // Currently assuming only one channel.
    const url = `${this._baseUrl}${FRESH_CHAT_ROUTES.USERS}/${userId}`;
    try {
      const response = await AxiosUtils.getRequest<FreshChatUser>(url, {
        headers: {
          Authorization: this._accessToken,
        },
      });
      return response.data;
    } catch (error) {
      return {} as FreshChatUser;
    }
  }

  /**
   * Function used to retrieve all agents from freshchat.
   * @returns <Array<FreshChatUser>
   */
  public async getAgents(): Promise<Array<FreshChatUser>> {
    // Currently assuming only one channel.
    const url = `${this._baseUrl}${FRESH_CHAT_ROUTES.AGENTS}`;
    const response = await AxiosUtils.getRequest<FreshChatAgents>(url, {
      headers: {
        Authorization: this._accessToken,
      },
    });
    return response.data.agents;
  }

  /**
   * Function used to send message to conversation on freshchat.
   */
  public async sendMessageToConversation(conversationId: string, payload: FreshChatMessagePayload): Promise<void> {
    const url = `${this._baseUrl}${FRESH_CHAT_ROUTES.CONVERSATIONS}/${conversationId}/${FRESH_CHAT_ROUTES.MESSAGES}`;
    await AxiosUtils.postRequest(url, {
      data: payload,
      headers: {
        Authorization: this._accessToken,
      },
    });
  }

  /**
   * Function used to update status of conversation on freshchat.
   * @param conversationId freshchat conversationId
   * @param status status which needs to be update
   */
  public async updateConversation(conversationId: string, status: LiveChatConversationStatusEnum): Promise<void> {
    const url = `${this._baseUrl}${FRESH_CHAT_ROUTES.CONVERSATIONS}/${conversationId}`;
    await AxiosUtils.putRequest(url, {
      data: {
        status,
      },
      headers: {
        Authorization: this._accessToken,
      },
    });
  }

  /**
   * Function retrieve conversation details from freshchat.
   * @param conversationId freshchat conversationId
   * @returns FreshChatConversationPayload
   */
  public async getConversation(conversationId: string): Promise<FreshChatConversationPayload | null> {
    try {
      const url = `${this._baseUrl}${FRESH_CHAT_ROUTES.CONVERSATIONS}/${conversationId}`;
      const response = await AxiosUtils.getRequest<FreshChatConversationPayload>(url, {
        headers: {
          Authorization: this._accessToken,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        //Conversation not found we will create conversation again on freshchat.
        return null;
      }
      throw error;
    }
  }
}
