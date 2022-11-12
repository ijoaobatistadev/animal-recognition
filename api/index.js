const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const { readdirSync, rmSync } = require('fs');

const app = express();
const port = process.env.PORT || 3001;
const downloadDirectoryPath = path.join(__dirname, '..', 'models');

app.use(express.json());
app.use(express.urlencoded());
app.use('/models', express.static(path.join(__dirname, '..', 'models')));
app.use('/js', express.static(path.join(__dirname, 'app', 'js')));

async function appCore(callback) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-web-security',
      '--disable-features=site-per-process',
    ],
  });
  const page = await browser.newPage();
  const client = await page.target().createCDPSession();
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: downloadDirectoryPath,
  });
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

  app.get('/add-to-train', async (req, res) => {
    res.sendFile(path.join(__dirname, 'app', 'addToTrain.html'));
  });

  app.get('*', (req, res) => {
    res.status(404).json({ status: 404, message: 'Nada por aqui.' });
  });
}

function postRoutes(page) {
  // reconhecimento
  app.post('/recognition', async (req, res) => {
    const modelImage = req.body.image;
    await page.goto(`http://localhost:${port}/recognition?image=${modelImage}`);
    const predict = await page.evaluate(async () => {
      return recognition();
    });
    res.json({ predict });
  });

  // treinamento
  app.post('/add-to-train', async (req, res) => {
    const images = req.body.images;

    readdirSync(downloadDirectoryPath).forEach((f) =>
      rmSync(`${downloadDirectoryPath}/${f}`),
    );

    await page.goto(`http://localhost:${port}/add-to-train`);

    page
      .on('console', (message) => console.log('LOG =>', message.text()))
      .on('pageerror', ({ message }) => {
        res.json({ status: false, message: 'Ocorreu um erro inesperado.' });
      });

    const train = await page.evaluate(async (images) => {
      await addToTrain(images);
      return {
        status: true,
        message: 'Modelo treinado/atualizado com sucesso!',
      };
    }, images);

    res.json({ train });
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
    console.log(`[CORE] => inicializado.`);
  });
});
