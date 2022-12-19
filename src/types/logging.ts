export type LogDetails = {
  requestId: string;
  message: string;
  action: string;
  source: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  durationMs?: number;
  conversationId?: string;
  agentConversationId?: string | null;
  error?: Error;
  errorStack?: string;
};

export type LogLabels = {
  requestId: string;
  action: string;
  source: string;
  conversationId?: string;
};
