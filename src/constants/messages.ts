export const GREET_MESSAGE = (name: string): string => `Hello ${name}, How may I help you today?`;

export const IT_WAS_A_PLEASURE_ASSISTING_YOU = (): string => `Thank you and it was a pleasure assisting you`;

export const HOME_CHOICE_TEXT = (): string => 'Please click “Home” to start a new session';

export const FRESH_CHAT_BAD_REQUEST = (): string => `Missing payload in webhook request`;
export const FRESH_CHAT_BAD_REQUEST_CONVERSATION_ID = (): string => `ConversationId from freshchat is missing`;
export const PASSWORD_MISMATCHED = (): string => 'Password and confirm password is not same';
export const INVALID_PASSWORD = (): string => `Invalid password`;
export const PASSWORD_NOT_FOUND = (): string => `Password not found`;
export const UNAUTHORIZED_ERROR = (): string => `You are not authorized to perform this action`;

export const RATING_REPORT_EMAIl_SUBJECT = (date: string): string => `${date} - Team Abi CSAT score report`;

export const RATING_REPORT_EMAIl_BODY = (name: string, url: string): string => `
  <html>
    <head></head>
    <body>
      <p>Hello {{name}},<br /></p>
      <p>Your daily Team Abi CSAT score report has been generated. Please <a href="${url}">click here</a> to download report. <br /></p>
      <p>Thanks & Regards</p>
      <p>Abi Support</p>
    </body>
  </html>  
`;
