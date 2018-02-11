const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Message = new Schema({
  content: String,
  _author: { type: Schema.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now() }
});


module.exports = mongoose.model('Message', Message);
