const express = require('express');
const mongoose = require('mongoose');
const isUrl = require('is-url');
const path = require('path');

const app = express();

const UrlModel = require('./urlModel');

app.use(express.static(path.join(__dirname, 'public')));

// get env variables
const user = process.env.MLAB_USERNAME;
const password = process.env.MLAB_PASSWORD;

// Set up monngoose connection
const mongoDB = `mongodb://${user}:${password}@ds131997.mlab.com:31997/url-shortener`;
mongoose.connect(mongoDB);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});

app.get('/new/*', (req, res) => {
  // get url passed in
  const originalUrl = req.params[0];
  const validUrl = isUrl(originalUrl);

  // Check for valid url
  if (validUrl) {
    // Generate random string to add to base url between 1000 & 9999
    const maxRandom = 9999;
    const minRandom = 1000;
    const randomStr = Math.floor(Math.random() * (maxRandom - minRandom)) + minRandom;

    const shortUrl = `${req.protocol}://${req.hostname}/${randomStr}`;

    const url = new UrlModel({
      _id: randomStr,
      originalUrl,
      shortUrl,
    });

    UrlModel.findOne({ originalUrl }).exec((err, foundDoc) => {
      if (err) {
        console.log(err);
      }

      if (foundDoc) {
        res.json(foundDoc);
      } else {
        url.save((error) => {
          if (error) {
            console.log(error);
          }
          res.json(url);
        });
      }
    });
  } else {
    res.send('Please enter a valid url');
  }
});

app.get('/:id', (req, res) => {
  const id = req.params.id;

  UrlModel.findOne({ _id: id }, (err, result) => {
    if (err) console.log(err);

    if (result) {
      res.redirect(result.originalUrl);
    } else {
      res.send('This shortened url does not exist.');
    }
  });
});
app.listen(process.env.PORT || 3000);
