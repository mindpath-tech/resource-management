import { ComponentDialog } from 'botbuilder-dialogs';
import { BotContext } from '../helper/botContext';
import { DIALOGS } from '../constants/dialogs';
import { LiveAgentDialog } from '../dialogs/liveAgentDialog';
import { NewHardwareDialog } from '../dialogs/newHardwareDialog';
import { MainDialog } from '../dialogs/mainDialog';
import { SubmitHardwareDialog } from 'src/dialogs/submitHardwareDialog';
import { AssignHardwareDialog } from 'src/dialogs/assignHardwareDialog';
import { LogDefectiveHardwareDialog } from 'src/dialogs/LogDefectiveHardwareDialog';
import { ReplaceHardwareDialog } from 'src/dialogs/replaceHardwareDialog';

const {
  liveAgentDialog,
  newHardwareDialog,
  assignHardwareDialog,
  replaceHardwareDialog,
  logDefectiveHardwareDialog,
  submitHardwareDialog,
} = DIALOGS;

/**
 * Factory class to set dialogRegistry
 */
export class DialogFactory {
  public static dialogRegistry: Map<string, ComponentDialog>;
  public static getRegistry(botContext: BotContext): Map<string, ComponentDialog> {
    if (!DialogFactory.dialogRegistry) {
      DialogFactory.dialogRegistry = new Map<string, ComponentDialog>();
      /* 
      Next dialogs can be added here
      */
      DialogFactory.dialogRegistry.set(liveAgentDialog, new LiveAgentDialog(liveAgentDialog, botContext));
      DialogFactory.dialogRegistry.set(submitHardwareDialog, new SubmitHardwareDialog(submitHardwareDialog));
      DialogFactory.dialogRegistry.set(
        logDefectiveHardwareDialog,
        new LogDefectiveHardwareDialog(logDefectiveHardwareDialog),
      );
      DialogFactory.dialogRegistry.set(assignHardwareDialog, new AssignHardwareDialog(assignHardwareDialog));
      DialogFactory.dialogRegistry.set(newHardwareDialog, new NewHardwareDialog(newHardwareDialog));
      DialogFactory.dialogRegistry.set(replaceHardwareDialog, new ReplaceHardwareDialog(replaceHardwareDialog));
    }
    return DialogFactory.dialogRegistry;
  }

  /**
   * Return main dialogs.
   * @param botContext RmContext
   * @returns MainDialog
   */
  public static getMainDialog(botContext: BotContext): MainDialog {
    const dialogs = [];

    for (const [, dialog] of DialogFactory.getRegistry(botContext).entries()) {
      dialogs.push(dialog);
    }

    return new MainDialog(dialogs);
  }
}
