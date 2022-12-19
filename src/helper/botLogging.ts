import logger from '../utils/logger';
import { v4 as uuid } from 'uuid';
import { LogDetails, LogLabels } from '../types/logging';

/**
 * Handle logging throughout the system.
 * {
    requestId: unique id assign every flow;
    message: log message;
    action: action performed;
    source: generally consist className#MethodName;
    data; Any json
    durationMs: time taken to perform action;
    conversationId: conversationId associated;
    agentConversationId: agentSide conversationId;
    error: error thrown;
  };
 */
export default class BotLogging {
  private _requestId: string | undefined;
  private _conversationId: string | undefined;
  private _agentConversationId: string | undefined | null;

  public logBeginOrInfo(logInfo: Partial<LogDetails>): void {
    if (this._requestId && this._agentConversationId === logInfo.agentConversationId) {
      this.logInfo(logInfo);
    } else {
      this.logBegin({
        ...logInfo,
        action: 'begin',
        message: 'Session begin',
      });
    }
  }

  public logBegin(logInfo: Partial<LogDetails>): void {
    this._requestId = uuid();
    this._conversationId = logInfo.conversationId;
    this._agentConversationId = logInfo.agentConversationId;
    const logDetails = this._logDetails({
      ...logInfo,
      requestId: this._requestId,
      message: logInfo.message || 'New Request',
      action: logInfo.action || 'begin',
      source: logInfo.source || 'RmLogging#begin',
    });

    logger.info({
      message: logDetails,
      labels: this._logLabels(logDetails),
    });
  }

  public logEnd(logInfo: Partial<LogDetails>): void {
    const logDetails = this._logDetails({
      ...logInfo,
      requestId: this._requestId,
      message: logInfo.message || 'Request has been completed',
      action: logInfo.action || 'end',
      source: logInfo.source || 'RmLogging#logEnd',
    });

    logger.info({
      message: logDetails,
      labels: this._logLabels(logDetails),
    });
    this._requestId = undefined;
  }

  public logInfo(logInfo: Partial<LogDetails>): void {
    const logDetails = this._logDetails(logInfo);

    logger.info({
      message: logDetails,
      labels: this._logLabels(logDetails),
    });
  }

  public logError(logInfo: Partial<LogDetails>): void {
    if (logInfo.error) {
      logInfo.message = logInfo.error?.message;
      logInfo.errorStack = logInfo.error?.stack;
    }

    const logDetails = this._logDetails(logInfo);
    logger.error({
      message: logDetails,
      labels: this._logLabels(logDetails),
    });
  }

  public logWarn(logInfo: Partial<LogDetails>): void {
    const logDetails = this._logDetails(logInfo);
    logger.warn({
      message: logDetails,
      labels: this._logLabels(logDetails),
    });
  }

  public logDebug(logInfo: Partial<LogDetails>): void {
    const logDetails = this._logDetails(logInfo);
    logger.debug({
      message: logDetails,
      labels: this._logLabels(logDetails),
    });
  }

  private _logLabels(logInfo: LogDetails): LogLabels {
    return {
      requestId: this._requestId!,
      conversationId: this._conversationId,
      action: logInfo.action,
      source: logInfo.source,
    };
  }

  private _logDetails(logInfo: Partial<LogDetails>): LogDetails {
    // This function make sure order of fields so that it is easily readable.
    return {
      requestId: this._requestId,
      conversationId: this._conversationId,
      action: logInfo.action,
      source: logInfo.source,
      message: logInfo.message,
      durationMs: logInfo.durationMs,
      data: logInfo.data,
      errorStack: logInfo.errorStack,
    } as LogDetails;
  }
}
