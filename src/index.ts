import { config } from 'dotenv';
import express from 'express';
import 'reflect-metadata';
config();
import { router as botRouter } from './routes/bot';
import { router as freshchatRouter } from './routes/livechat';

import { createConnection } from 'typeorm';

const app = express();
const port = process.env.port || process.env.PORT || 3978;

app.use(express.static('assets'));

app.get('/', (req, res) => {
  return res.status(200).send({ message: 'Hello World!' });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(botRouter);
app.use(freshchatRouter);

(async function () {
  await createConnection();
})();

app.listen(port, async () => {
  console.log(`\nServer listening on http://localhost:${port}`);
});
