import { BotFrameworkAdapter, WebRequest, WebResponse } from 'botbuilder';
import { DialogAndWelcomeBot } from '../bot/dialogAndWelcomeBot';
import { DialogFactory } from '../bot/dialogFactory';
import { BotContext } from '../helper/botContext';

/**
 * This controller handle message request from bot.
 */
export default class BotController {
  private _dialogAndWelcomeBot: DialogAndWelcomeBot;
  private _adapter: BotFrameworkAdapter;

  constructor(botContext: BotContext) {
    const dialog = DialogFactory.getMainDialog(botContext);
    this._dialogAndWelcomeBot = new DialogAndWelcomeBot(botContext, dialog);
    this._adapter = botContext.botFrameworkService.adapter;
  }

  /**
   * Handle message receive from bot.
   * @param req WebRequest
   * @param res WebResponse
   */
  public async messages(req: WebRequest, res: WebResponse): Promise<void> {
    this._adapter.processActivity(req, res, async (context) => {
      await this._dialogAndWelcomeBot.run(context);
    });
  }
}
