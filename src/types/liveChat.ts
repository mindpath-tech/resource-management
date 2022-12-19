import { LiveChatWebhookEventEnum } from '../enum/liveagentWebhookEvent';

export type FreshChatFile = {
  name: string;
  url: string;
  file_size_in_bytes: number;
  content_type: string;
};

export type FreshChatImage = {
  url: string;
};

export type FreshChatMessagePart = {
  text: {
    content: string;
  };
  file: FreshChatFile;
  image: FreshChatImage;
};

export type FreshChatMessagePayload = {
  actor_type: string;
  actor_id: string;
  user_id: string;
  message_type: string;
  message_parts: Array<FreshChatMessagePart>;
  conversation_id: string;
  channel_id?: string;
};

export type FreshChatUser = {
  id: string;
  email: string;
  avatar?: {
    url: string;
  };
  phone?: string;
  properties?: Array<Record<string, string>>;
  first_name: string;
  last_name: string;
};

export type FreshChatConversationPayload = {
  conversation_id: string;
  app_id: string;
  channel_id: string;
  messages: [
    {
      app_id: string;
      actor_type: string;
      actor_id: string;
      channel_id: string;
      message_type: string;
      message_parts: Array<FreshChatMessagePart>;
    },
  ];
  status: string;
  users: Array<FreshChatUser>;
};

export type FreshChatChannel = {
  id: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  icon: Object;
  updated_time: string;
  enabled: boolean;
  public: boolean;
  name: string;
  tags: Array<string>;
  welcome_message: {
    message_parts: Array<FreshChatMessagePart>;
    message_type: string;
  };
};

export type FreshChatChannels = {
  channels: Array<FreshChatChannel>;
};

export type FreshChatAgents = {
  agents: Array<FreshChatUser>;
};

export type FreshChatActor = { actor_type: string; actor_id: string };

export type WebhookPayload = {
  actor: FreshChatActor;
  action: LiveChatWebhookEventEnum;
  action_time: string;
  data?: WebhookPayloadData;
  encoded_data?: string;
};

export type WebhookPayloadData = {
  assignment?: FreshChatConversationAssignmentEventPayload;
  message?: FreshChatMessageCreatePayload;
  resolve?: FreshChatConversationResolutionPayload;
};

export type FreshChatConversationAssignmentEventPayload = {
  assignor: string;
  assignor_id: string;
  to_agent_id: string;
  to_group_id: string;
  from_agent_id: string;
  from_group_id: string;
  conversation: {
    conversation_id: string;
    app_id: string;
    status: string;
    assigned_agent_id: string;
  };
};

export type FreshChatMessageCreatePayload = {
  msg_parts: [{ properties: { text: string }; part_type: string }];
  app_id: string;
  user_id: string;
  id: string;
  channel_id: string;
  conversation_id: string;
  message_type: string;
  actor_type: string;
  created_time: string;
};

export type FreshChatConversationResolutionPayload = {
  resolver: string;
  resolver_id: string;
  conversation: {
    conversation_id: string;
    app_id: string;
    status: string;
  };
};
