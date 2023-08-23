const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const PORT = process.env.PORT || '3001';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

const TALKER_PATH = path.resolve(__dirname, './talker.json');
const ENCODING = 'utf-8';

const readFile = async () => {
  const content = await fs.readFile(TALKER_PATH, ENCODING);
  console.log(content);
  return JSON.parse(content);
};
readFile();

app.get('/talker', async (_req, res) => {
  const talkers = await readFile();
  res.status(HTTP_OK_STATUS).json(talkers);
});

app.listen(PORT, () => {
  console.log('Online');
});
