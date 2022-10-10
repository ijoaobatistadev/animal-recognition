const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.json({ status: 200, message: 'API para reconheicmento de animais.' });
});

app.get('*', (req, res) => {
  res.status(404).json({ status: 404, message: 'Nada por aqui.' });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
