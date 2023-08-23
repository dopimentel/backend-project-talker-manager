const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const validateLogin = require('./middlewares/validateLogin');
const { 
  validateToken, validateName, validateAge, validateWachedAt, validateRate, 
} = require('./middlewares/validateTalker');

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const NOT_FOUND_STATUS = 404;
const PORT = process.env.PORT || '3001';
const TALKER_PATH = path.resolve(__dirname, './talker.json');
const ENCODING = 'utf-8';

const generateToken = () => crypto.randomBytes(8).toString('hex');

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

const readFile = async () => {
  const content = await fs.readFile(TALKER_PATH, ENCODING);
  return JSON.parse(content);
};
readFile();

const writeFile = async (content) => {
  await fs.writeFile(TALKER_PATH, JSON.stringify(content));
};

app.get('/talker', async (_req, res) => {
  const talkers = await readFile();
  res.status(HTTP_OK_STATUS).json(talkers);
});

app.get('/talker/:id', async (req, res) => {
  const { id } = req.params;
  const talkers = await readFile();
  const talker = talkers.find((talk) => talk.id === parseInt(id, 10));
  console.log(talker);
  if (!talker) {
    return res.status(NOT_FOUND_STATUS).json({ message: 'Pessoa palestrante não encontrada' });
  }
  res.status(HTTP_OK_STATUS).json(talker);
});

app.post('/login', validateLogin, async (req, res) => {
  res.status(HTTP_OK_STATUS).json({ token: generateToken() });
});

app.post(
  '/talker',
  validateToken,
  validateName,
  validateAge,
  validateWachedAt,
  validateRate,
  async (req, res) => {
    const talkers = await readFile();
    const newTalker = { ...req.body, id: talkers.length + 1 };
    talkers.push(newTalker);
    await writeFile(talkers);
    res.status(201).json(newTalker);
  },
);

app.put(
  '/talker/:id',
  validateToken,
  validateName,
  validateAge,
  validateWachedAt,
  validateRate,
  async (req, res) => {
  const { id } = req.params;
  const talkers = await readFile();
  const talkerIndex = talkers.findIndex((talk) => talk.id === parseInt(id, 10));
  if (talkerIndex === -1) {
    return res.status(NOT_FOUND_STATUS).json({ message: 'Pessoa palestrante não encontrada' });
  }
  const newTalker = { ...req.body, id: parseInt(id, 10) };
  talkers[talkerIndex] = newTalker;
  await writeFile(talkers);
  res.status(HTTP_OK_STATUS).json(newTalker);
},
);

app.listen(PORT, () => {
  console.log('Online');
});
