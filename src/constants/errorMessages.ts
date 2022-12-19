export const MISSING_PARAMETER = (parameter: string): string =>
  `[DialogBot]: Missing parameter. ${parameter} is required`;

export const ADAPTIVE_CARD_NOT_SUPPORTED = (): string => 'Adaptive card not supported';

export const BOT_ERROR = (): string => 'The bot encountered an error, Please contact support.';

export const CONTACT_ADMIN = (): string =>
  'Your user/subscriber is not registered with us. Please [Contact Us](mailto:livesupport@beroe-inc.com)';

export const INVALID_CHANNEL = (): string =>
  'This channel is not supported. Please [Contact Us](mailto:livesupport@beroe-inc.com)';
