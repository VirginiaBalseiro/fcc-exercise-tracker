const {ObjectID} = require('mongodb')

//Model for user
const mongoose = require('mongoose');

const User = mongoose.model('User', {
  username: {
    type: String,
    unique: true,
    required: true,
    maxlength: [20, 'Username too long']
  }
});

module.exports = {User};