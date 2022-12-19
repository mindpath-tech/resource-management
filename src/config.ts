import { MODELS, VIEWS } from './models/index';

const env = process.env;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ENTITIES: any[] = MODELS.concat(VIEWS);

export const ormConfig = {
  type: 'mysql',
  host: env.DB_HOST || '',
  port: Number(env.DB_PORT) || 3306,
  username: env.DB_USER || 'root',
  password: env.DB_PASSWORD || '',
  database: env.DB_NAME || 'rm-bot-dev',
  synchronize: false,
  dropSchema: false,
  logging: false,
  logger: 'debug', // `DEBUG=typeorm:* yarn <COMMAND>`
  entities: ENTITIES,
  migrations: env.NODE_ENV === 'production' ? [] : ['migration/*.ts'],
  subscribers: env.NODE_ENV === 'production' ? ['dist/src/subscriber/**/*.js'] : ['src/subscriber/**/*.ts'],
  cli: {
    migrationsDir: 'migration',
  },
  extra: {
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  },
};
