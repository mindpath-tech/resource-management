import LiveChatMessageParser from '../parsers/liveChatMessageParser';
import TeamsMessageParser from '../parsers/teamsMessageParser';
import { ConversationRefService } from '../service/conversationRefService';
import { ConversationService } from '../service/conversationService';
import { LiveAgentService } from '../service/liveAgentService';
import { MessageProcessor } from '../service/messageProcessor';
import ConversationRefRepository from '../repository/conversationRefRepository';
import ConversationRepository from '../repository/conversationRepository';
import { BotMessageMiddleware } from '../middleware/botMessageMiddleware';
import { CustomTranscriptLoggerMiddleware } from '../middleware/transcriptLoggerMiddleware';
import LiveChatRepository from '../repository/liveChatRepository';
import LiveChatConnector from '../connectors/liveChatConnector';
import TeamsConnector from '../connectors/teamsConnector';
import BotLogging from './botLogging';
import { RatingService } from '../service/ratingService';
import RatingRepository from '../repository/ratingRepository';
import { UserService } from '../service/userService';
import UserRepository from '../repository/userRepository';
import { EmailRepository } from '../repository/emailRepository';
import { EmailService } from '../service/emailService';
import { EmailRecipientsService } from '../service/emailRecipientsService';
import EmailRecipientRepository from '../repository/emailRecipientRepository';
import { BotFrameworkService } from '../service/botFrameworkService';
import { LiveChatService } from '../service/livechatService';

const freshChatUrl = process.env.FRESH_CHAT_BASE_URL || '';
const freshChatToken = process.env.FRESH_CHAT_ACCESS_TOKEN || '';
const freshChatAppId = process.env.FRESH_CHAT_APP_ID || '';
const sendGridApiKey = process.env.SENDGRID_API_KEY!;
const sendGridSenderEmail = process.env.SENDGRID_SENDER_EMAIL!;

/**
 * One place for all the objects.
 */
export class BotContext {
  public conversationRepository: ConversationRepository;
  public conversationRefRepository: ConversationRefRepository;
  public conversationService: ConversationService;
  public conversationRefService: ConversationRefService;
  public userService: UserService;
  public liveagentService: LiveAgentService;
  public messageProcessor: MessageProcessor;
  public teamsMessageParser: TeamsMessageParser;
  public freshChatMessageParser: LiveChatMessageParser;
  public botMessageMiddleware: BotMessageMiddleware;
  public customTranscriptLoggerMiddleware: CustomTranscriptLoggerMiddleware;
  public freshChatRepository: LiveChatRepository;
  public freshChatConnector: LiveChatConnector;
  public teamConnector: TeamsConnector;
  public botLogging: BotLogging;
  public ratingService: RatingService;
  public ratingRepository: RatingRepository;
  public emailService: EmailService;
  public emailRecipientsService: EmailRecipientsService;
  public botFrameworkService: BotFrameworkService;
  public freshChatService: LiveChatService;

  constructor() {
    this.botLogging = new BotLogging();
    this.botFrameworkService = new BotFrameworkService(this.botLogging);
    this.conversationRepository = new ConversationRepository();
    this.conversationRefRepository = new ConversationRefRepository();
    this.teamsMessageParser = new TeamsMessageParser();
    this.freshChatMessageParser = new LiveChatMessageParser();
    this.userService = new UserService(new UserRepository());
    this.emailService = new EmailService(new EmailRepository(sendGridApiKey, sendGridSenderEmail));
    this.emailRecipientsService = new EmailRecipientsService(new EmailRecipientRepository());

    this.conversationService = new ConversationService(
      this.botFrameworkService.conversationState,
      this.conversationRepository,
      this.userService,
    );
    this.conversationRefService = new ConversationRefService(this.conversationRefRepository);
    this.customTranscriptLoggerMiddleware = new CustomTranscriptLoggerMiddleware(
      this.botFrameworkService.conversationState,
      this.botLogging,
    );
    this.freshChatRepository = new LiveChatRepository(freshChatUrl, freshChatToken, freshChatAppId);
    this.freshChatConnector = new LiveChatConnector(
      this.freshChatRepository,
      this.freshChatMessageParser,
      this.botLogging,
    );
    this.teamConnector = new TeamsConnector(
      this.conversationRefService,
      this.teamsMessageParser,
      this.botFrameworkService,
      this.botLogging,
    );

    this.messageProcessor = new MessageProcessor(this);
    this.liveagentService = new LiveAgentService(this.messageProcessor, this.teamsMessageParser);
    this.ratingRepository = new RatingRepository();
    this.ratingService = new RatingService(this);
    this.botMessageMiddleware = new BotMessageMiddleware(this);
    this.freshChatService = new LiveChatService(this);
  }
}
