const mongoose = require('mongoose');

// Define schema
const Schema = mongoose.Schema;

const urlSchema = new Schema({
  _id: String,
  originalUrl: String,
  shortUrl: String,
});

// Export model from Schema
module.exports = mongoose.model('UrlModel', urlSchema);
