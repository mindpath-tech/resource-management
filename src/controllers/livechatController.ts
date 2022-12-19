import { WebRequest, WebResponse } from 'botbuilder';
import { WebhookPayload } from '../types/liveChat';
import { BotContext } from '../helper/botContext';
import BotLogging from '../helper/botLogging';

/**
 * This controller handle message request from freshchat.
 */
export default class LivechatController {
  private _botLogging: BotLogging;

  constructor(botContext: BotContext) {
    this._botLogging = botContext.botLogging;
  }

  public async livechatWebhook(req: WebRequest, res: WebResponse): Promise<WebResponse> {
    const botLogging = this._botLogging;
    const body: WebhookPayload = req.body;
    try {
      // Process webhook code here.
      this._botLogging.logInfo({
        action: 'success',
        source: 'MessageController#receiveMessages',
        message: 'Freshchat request has been proceed successfully',
      });
      return res.status(200).send();
    } catch (error) {
      botLogging.logError({
        error: error as Error,
        action: 'error',
        source: 'MessageController#receiveMessages',
        data: {
          ...body,
        },
      });
      return res.status(500).send();
    }
  }
}
