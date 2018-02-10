const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const User = new Schema({
  friends: [{type: Schema.ObjectId, ref: 'User'}]
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
