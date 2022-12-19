import { FEEDBACK_CHOICES } from '../constants';
import { LiveChatConversationStatusEnum } from '../enum/liveChatConversationStatusEnum';
import { ConversationCache } from '../types/botFramework';
import { ConversationModel } from '../models/conversation';
import { RatingModel } from '../models/ratings';
import RatingRepository from '../repository/ratingRepository';
import { BotContext } from '../helper/botContext';
import { ConversationService } from './conversationService';
import botLogging from '../helper/botLogging';
import moment from 'moment-timezone';
import { IChannelConnector } from '../connectors/channelConnectors';
import { ActorTypeEnum } from '../enum/actorTypeEnum';
import { User } from '../types/bot';
import { uploadFileToS3 } from '../utils/s3';
import { EmailService } from './emailService';
import { EmailJSON } from '@sendgrid/helpers/classes/email-address';
import { RATING_REPORT_EMAIl_BODY, RATING_REPORT_EMAIl_SUBJECT } from '../constants/messages';
import { compact } from 'lodash';
import { EmailRecipientsService } from './emailRecipientsService';
import XLSX from 'xlsx';
import { ExcelReportPayload } from '../types/rating';

/**
 * All operation related to rating.
 * DB interaction.
 * Excel sheet report generation.
 */
export class RatingService {
  private _ratingRepository: RatingRepository;
  private _conversationService: ConversationService;
  private _channelConnector: IChannelConnector;

  private _botLogging: botLogging;
  private _emailService: EmailService;
  private _emailRecipientsService: EmailRecipientsService;

  constructor(botContext: BotContext) {
    this._ratingRepository = botContext.ratingRepository;
    this._conversationService = botContext.conversationService;
    this._channelConnector = botContext.freshChatConnector;
    this._botLogging = botContext.botLogging;
    this._emailService = botContext.emailService;
    this._emailRecipientsService = botContext.emailRecipientsService;
  }
  /**
   * Handle feedback message.
   * Mark skipResolveOperation on conversation model.
   * Resolve conversation on freshchat.
   * Add rating in database
   * @param conversationCache
   * @param message
   */
  public async processRatingMessage(conversationCache: ConversationCache, message: string): Promise<void> {
    try {
      const conversationModel = conversationCache.model;
      if (FEEDBACK_CHOICES.indexOf(message) > -1) {
        if (conversationModel) {
          await this._conversationService.updateConversation(conversationModel.id, {
            skipResolveOperation: true,
          });
          await this._channelConnector.updateConversation(conversationModel.agentChannelConversationId!, {
            status: LiveChatConversationStatusEnum.RESOLVED,
          });
          const conversation = await this._conversationService.getByConversationId(conversationModel.botConversationId);
          await this._addRating(message, conversation!);
        }
      }
    } catch (error) {
      this._botLogging.logError({
        error: error as Error,
        action: 'error',
        source: 'RatingService#processRatingMessage',
      });
    }
  }

  /**
   * Add rating in database.
   * @param rating actual rating given by user,
   * @param conversation conversation object from database.
   */
  private async _addRating(rating: string, conversation: ConversationModel): Promise<void> {
    const ratingModel = new RatingModel();
    ratingModel.agentId = conversation.agentId;
    ratingModel.conversation = conversation;
    ratingModel.rating = rating.trim().length;
    await this._ratingRepository.insert(ratingModel);
    return;
  }

  /**
   * Generate and send report to recipients configured in the database.
   * @returns
   */
  async generateReportAndSendEmail(): Promise<void> {
    const ratingRequest = {
      startDate: moment().subtract(1, 'days').add(1, 'minute').toString(),
      endDate: moment().toString(),
    };
    /**
     * Fetch rating from database
     */
    const ratings = await this._ratingRepository.fetchRatings(ratingRequest);
    /**
     * Fetch agents from freshchat.
     */
    const agents = await this._channelConnector.getActors(ActorTypeEnum.AGENT);
    /**
     * Fetch recipients configured in the database
     */
    const recipients = await this._emailRecipientsService.getEmailRecipients();
    if (!recipients || !recipients.length) {
      this._botLogging.logWarn({
        message: 'Email recipients not configured',
        action: 'error',
        source: 'RatingService#processRatingMessage',
      });
      return;
    }
    const uniqueTimezones = [...new Set(recipients.map((recipient) => recipient.timezone))];
    /**
     * Generate reports for different timezone configured in database for any particular recipients
     * For example recipients A need report in IST and recipients B need in EST.
     * Date in report will be derive from the timezone.
     */
    if (recipients?.length && ratings?.length) {
      for (let index = 0; index < uniqueTimezones.length; index++) {
        const timezone = uniqueTimezones[index];
        const csv = this._writeIntoExcelSheet(timezone, ratings, agents);
        const name = `reports/${timezone.toLowerCase()}/csat_score_${new Date().getTime()}.xlsx`;
        /**
         * Upload file to s3 and get signed token.
         */
        const url = await uploadFileToS3(name, csv);
        /**
         * Retrieve list of recipient with name and email.
         */
        const emailData = compact(
          recipients.map((recipient) => {
            if (recipient.timezone !== timezone) {
              return null;
            }
            return {
              name: recipient.name,
              email: recipient.email,
            };
          }),
        );
        await this._sendReportEmail(emailData, url);
      }
    }
  }

  /**
   * Send report on email.
   * @param emails
   * @param url
   */
  private async _sendReportEmail(emails: Array<EmailJSON>, url: string): Promise<void> {
    const personalizations = emails.map((email) => {
      return {
        to: email,
        substitutions: {
          name: email.name!,
        },
      };
    });

    const message = {
      from: '', // will be derive from env in repository layer.
      subject: RATING_REPORT_EMAIl_SUBJECT(moment().format('LL')),
      personalizations,
      html: RATING_REPORT_EMAIl_BODY('All', url),
    };
    await this._emailService.send(message);
  }

  /**
   * Function convert json to excel sheet.
   * @param data Array<ExcelReportPayload>
   * @returns Buffer
   */
  private _convertToExcelSheet(data: Array<ExcelReportPayload>): Buffer {
    const workSheet = XLSX.utils.json_to_sheet(data);
    const workBook = XLSX.utils.book_new();
    XLSX.utils.sheet_add_aoa(workSheet, [['Agent Name', 'Client - User Email', 'Date', 'Time', 'Score']], {
      origin: 'A1',
    });
    XLSX.utils.book_append_sheet(workBook, workSheet, 'Rating Report');
    workSheet['!cols'] = [{ wch: 30 }, { wch: 40 }, { wch: 20 }, { wch: 10 }, { wch: 10 }]; // set column A width to 10 characters

    // Generate buffer
    return XLSX.write(workBook, { bookType: 'xlsx', type: 'buffer' });
  }

  /**
   * Derive name from firstName and lastName.
   * @param user User
   * @returns string
   */
  private _deriveName(user: User): string {
    let name = '';
    if (user.firstName) {
      name = `${user.firstName}`;
    }
    if (user.lastName) {
      name = `${name} ${user.lastName}`;
    }
    return name;
  }

  /**
   * Derive data needed in report and convert to excel sheet.
   * @param timezone
   * @param ratings Array<RatingModel>
   * @param agents Array<User>
   * @returns Buffer
   */
  private _writeIntoExcelSheet(timezone: string, ratings: Array<RatingModel>, agents: Array<User>): Buffer {
    const agentMap = new Map();
    agents.forEach((agent) => {
      agentMap.set(agent.userId, this._deriveName(agent));
    });
    const data = ratings.map((rating) => {
      const ratingDate = moment(rating.createAt).tz(timezone);
      return {
        'Agent Name': agentMap.get(rating.agentId),
        'Client - User Email':
          rating.conversation?.user?.email ||
          rating.conversation?.user?.firstName ||
          rating.conversation?.user?.botUserId,
        Date: ratingDate.format('DD/MM/YYYY'),
        Time: ratingDate.format('HH:mm:ss'),
        Score: rating.rating,
      };
    });
    const csv = this._convertToExcelSheet(data);
    return csv;
  }
}
