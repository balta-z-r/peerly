const express = require('express');
const cors = require('cors');
const path = require('path');
const p2p = require('./p2p');

const app = express();

// Init Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    if (req.headers['x-forwarded-proto'] !== 'https')
      return res.redirect('https://' + req.headers.host + req.url);
    else return next();
  } else return next();
});

const port = 5000;

// Set static folder
const publicPath = path.join(__dirname, '..', 'build');

app.use(express.static(publicPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

const server = app.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});

p2p(server);
