export const constants = {
  ROUTES: {
    MESSAGE: '/api/messages',
    LIVE_CHAT_WEBHOOK: '/api/receive/messages', // TODO: Change name to /api/freshchat/webhook
    CSV_RATING: '/api/ratings/csv',
  },
  defaultServerResponse: {
    status: 400,
    message: '',
    body: {},
  },
  METHOD: {
    GET: 'get',
    DELETE: 'delete',
    POST: 'post',
  },
  AXIOS_REQUEST_TIMEOUT: 30000,
};

export const DELIVERY_CHOICES = ['Pick up and submit from office', 'Pick up and submit from home'];

export const MAIN_MENU_CHOICES = [
  'Request New Hardware',
  'Replace Hardware',
  'Assign Hardware',
  'Submit Hardware',
  'Log Defective Hardware',
  'View My Request',
  'View All Request', // admin.
];

export const GO_TO_MAIN_MENU_OR_RESTART_CURRENT_FLOW = ['go to main menu', 'want to provide information again'];
export const HARDWARE_CHOICES = [
  'Moniter',
  'Headphone',
  'Keyboard',
  'Mouse',
  'Laptop',
  'Charger',
  'USB Hub/Dock',
  'Other',
];

export const PRIORITY_CHOICES = ['Low', 'Medium', 'High'];

export const CONFIRM_FINAL_SUMMARY_CHOICES = [
  "Yes, It's correct, please proceed with my request.",
  'No, let me change all the hardware details again.',
];

export const CONFIRM_REVIEW_CHOICES = ["Yes, It's correct.", 'No, let me change the details again.'];

export const FEEDBACK_CHOICES = ['★★★★★', '★★★★', ' ★★★ ', ' ★★ ', ' ★ '];

export const TEXT_PROMPT = 'textPrompt';
export const CHOICE_PROMPT = 'CHOICE_PROMPT';

export const ATTACHMENT_PROMPT = 'ATTACHMENT_PROMPT';
export const DATE_TIME_PROMPT = 'DATE_PROMPT';
export const QUANTITY_PROMPT = 'QUANTITY_PROMPT';
export const DELIVERY_PROMPT = 'DELIVERY_PROMPT';
export const QUANTITY_PROMPT_OPTION = ['1', '2', '3'];
export const CONFIRM_PROMPT_CHOICES = ['Yes', 'No'];
export const DELIVERY_OPTION = ['At Office', 'At Home'];
export const ADDRESS_PROMPT = 'ADDRESS_PROMPT';
export const SKIP = 'Skip';
export const YES = 'Yes';
export const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
export const NAME_PROMPT = 'NAME_PROMPT';
export const NUMBER_PROMPT = 'NUMBER_PROMPT';
export const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

export const CONVERSATION_MODEL_STATE_PROPERTY = 'CONVERSATION_MODEL';

export const TRANSCRIPT_LOGGER_STATE_PROPERTY = 'TRANSCRIPT_LOGGER';

export const BOT_START_INTENT_LIST = ['home'];
export const BOT_MAIN_MENU_TEXT_HOME = 'Home';
export const HELP_COMMAND = ['help', '/help'];
export const IMAGE_EXTENSIONS = [
  'png',
  'jpeg',
  'jpg',
  'gif',
  'psd',
  'tiff',
  'svg',
  'wmf',
  'bmp',
  'ai',
  'emf',
  'eps',
  'tif',
];
export const SUPPORTED_TENANTS = (process.env.TENANT_SUPPORTED ? process.env.TENANT_SUPPORTED.split(',') : []).map(
  (tenant) => tenant.trim(),
);

export const S3_CONSTANT = {
  SIGNED_TOKEN_EXPIRY_TIME: 31536000, // for now we are keeping 1 year. Since we need long time access to url send to users.
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
};

export const CRON_TIMEZONE = process.env.CRON_TIMEZONE || 'Asia/Calcutta';
export const CRON_EXPRESSION = process.env.CRON_EXPRESSION || '0 18 * * *';
export const OPEN_URL_TEXT = 'Open URL';
export const POPUP_ICON_URL = 'https://icon-library.com/images/open-icon-png/open-icon-png-15.jpg';
export const OPEN_URL_ACTION = 'Action.OpenUrl';
export const LOG_DESCRIBE_TEXT = 'Describe defect in your device?';
export const LOG_DESCRIBE_IMAGE_TEXT = "Please share your device's defect image";
export const LOG_DESCRIBE_PRIORITY = 'Please select request priority';
export const CONFIRM_DETAILS = 'Do you confirm this details ?';
export const THANK_YOU_MESSAGE = 'Thank you! We forwarded your request to management.';
