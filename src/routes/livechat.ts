import { WebRequest, WebResponse } from 'botbuilder';
import * as express from 'express';
import LivechatController from '../controllers/livechatController';
import { BotContext } from '../helper/botContext';
import { constants } from '../constants';

/**
 * Route for freshchat webhook.
 */
export const router = express.Router();
const botContext = new BotContext();
const controller = new LivechatController(botContext);

router.post(constants.ROUTES.LIVE_CHAT_WEBHOOK, (req: WebRequest, res: WebResponse) =>
  controller.livechatWebhook(req, res),
);
