import { ChoiceFactory, ListStyle, WaterfallStepContext } from 'botbuilder-dialogs';
import { TEXT_PROMPT } from '../constants';
import { MessageContext } from '../types/message';

export class DialogUtils {
  /**
   * General function for skip prompt.
   * @param stepContext
   * @param messageText MessageContext
   * @returns
   */
  public static async getHybridSkipPrompt(stepContext: WaterfallStepContext<MessageContext>, messageText: string) {
    const promptOptions = {
      prompt: ChoiceFactory.forChannel(stepContext.context, ['Skip'], messageText),
      // You can also include a retry prompt if you like,
      // but there's no need to include the choices property in a text prompt
    };

    return await stepContext.prompt(TEXT_PROMPT, promptOptions);
  }

  /**
   * Choice prompt with free text. User either select from choice options or any free flow text.
   * @param stepContext
   * @param messageText
   * @param choices
   * @returns
   */
  public static async getPromptWithFreeText(
    stepContext: WaterfallStepContext<MessageContext>,
    messageText: string,
    choices: string[],
  ) {
    const promptOptions = {
      prompt: ChoiceFactory.heroCard(choices, messageText),
      style: ListStyle.heroCard,
      // You can also include a retry prompt if you like,
      // but there's no need to include the choices property in a text prompt
    };

    return await stepContext.prompt(TEXT_PROMPT, promptOptions);
  }
}
