import winston from 'winston';
import 'winston-daily-rotate-file';
const { combine, timestamp, json } = winston.format;

/**
 * Contain all the error logs.
 */
const errorTransport = new winston.transports.DailyRotateFile({
  filename: 'error-%DATE%.log',
  datePattern: 'DD-MM-YYYY',
  zippedArchive: false,
  maxSize: '100m',
  maxFiles: '30d',
  dirname: 'logs',
  level: 'error',
});

/**
 * Contain all the logs.
 */
const combinedTransport = new winston.transports.DailyRotateFile({
  filename: 'combined-%DATE%.log',
  datePattern: 'DD-MM-YYYY',
  zippedArchive: false,
  maxSize: '200m',
  dirname: 'logs',
  maxFiles: '30d',
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(timestamp(), json()),
  defaultMeta: { service: 'rm-bot-service' },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    errorTransport,
    combinedTransport,
  ],
});

//
// If we're not in production then log to the `console` with the format:
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: combine(timestamp(), json()),
    }),
  );
}

export default logger;
