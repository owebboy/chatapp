const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Chat = new Schema({
  messages: [{type:Schema.ObjectId, ref: 'Message'}],
  members: [{type:Shema.ObjectId, ref: 'User'}]
});

module.exports = mongoose.model('Chat', Chat);
