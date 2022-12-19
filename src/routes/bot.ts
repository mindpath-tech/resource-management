import { WebRequest, WebResponse } from 'botbuilder';
import * as express from 'express';
import { BotContext } from '../helper/botContext';
import { constants } from '../constants';
import BotController from '../controllers/botController';

/**
 * Route used for bot services.
 */
const botContext = new BotContext();
const controller = new BotController(botContext);

export const router = express.Router();

router.post(constants.ROUTES.MESSAGE, (req: WebRequest, res: WebResponse) => controller.messages(req, res));
