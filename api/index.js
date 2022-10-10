const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded());
app.use('/models', express.static(path.join(__dirname, '..', 'models')));
app.use('/js', express.static(path.join(__dirname, 'app', 'js')));

async function appCore(callback) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--disable-web-security'],
  });
  const page = await browser.newPage();
  await page.goto(`http://localhost:${port}`);
  if (typeof callback === 'function') {
    callback(page);
  }
}

function getRoutes() {
  app.get('/', async (req, res) => {
    res.json({
      status: 200,
      message: 'API para reconheicmento de animais.',
    });
  });

  app.get('/recognition', async (req, res) => {
    res.sendFile(path.join(__dirname, 'app', 'recognition.html'));
  });

  app.get('*', (req, res) => {
    res.status(404).json({ status: 404, message: 'Nada por aqui.' });
  });
}

function postRoutes(page) {
  app.post('/recognition', async (req, res) => {
    const modelImage = req.body.image;
    await page.goto(`http://localhost:${port}/recognition?image=${modelImage}`);
    const predict = await page.evaluate(async () => {
      return recognition();
    });
    res.json({ predict });
  });

  app.post('*', async (req, res) => {
    res.status(404).json({ status: 404, message: 'Nada por aqui.' });
  });
}

getRoutes();

app.listen(port, () => {
  console.log(`[API] => inicializada na porta ${port}.`);
  appCore((page) => {
    postRoutes(page);
    console.log(`[API CORE] => inicializado.`);
  });
});
