const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Message = new Schema({
  author: { type: Schema.ObjectId, ref: 'User' },
  message: String,
  date: Date
});

module.exports = mongoose.model('Message', Message);
