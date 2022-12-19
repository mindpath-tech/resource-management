import { ActivityHandler, BotState, ConversationState, StatePropertyAccessor, UserState } from 'botbuilder';
import { Dialog, DialogState } from 'botbuilder-dialogs';
import { MISSING_PARAMETER } from '../constants/errorMessages';
import { MainDialog } from '../dialogs/mainDialog';

/**
 * Handle dialog events.
 */
export class DialogBot extends ActivityHandler {
  private _conversationState: BotState;
  private _userState: BotState;
  private _dialog: Dialog;
  private _dialogState: StatePropertyAccessor<DialogState>;
  /**
   *
   * @param {ConversationState} conversationState
   * @param {UserState} userState
   * @param {Dialog} dialog
   */
  constructor(conversationState: BotState, userState: BotState, dialog: Dialog) {
    super();
    if (!conversationState) throw new Error(MISSING_PARAMETER('conversationState'));
    if (!userState) throw new Error(MISSING_PARAMETER('userState'));
    if (!dialog) throw new Error(MISSING_PARAMETER('dialog'));

    this._conversationState = conversationState as ConversationState;
    this._userState = userState as UserState;
    this._dialog = dialog;
    this._dialogState = this._conversationState.createProperty('DialogState');

    this.onMessage(async (context, next) => {
      // Run the Dialog with the new message Activity.
      await (this._dialog as MainDialog).run(context, this._dialogState);

      await next();
    });

    this.onDialog(async (context, next) => {
      // Save any state changes. The load happened during the execution of the Dialog.
      await this._conversationState.saveChanges(context, false);
      await this._userState.saveChanges(context, false);
      await next();
    });
  }
}
