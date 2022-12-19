export const MISSING_PARAMETER = (parameter: string): string =>
  `[DialogBot]: Missing parameter. ${parameter} is required`;

export const ADAPTIVE_CARD_NOT_SUPPORTED = (): string => 'Adaptive card not supported';

export const BOT_ERROR = (): string => 'The bot encountered an error, Please contact support.';
