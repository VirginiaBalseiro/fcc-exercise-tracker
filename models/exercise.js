var mongoose = require('mongoose');

var Exercise = mongoose.model('Exercise', {
  userId: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  description: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  duration: {
    type: Number,
    required: true,
    default: null
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = {Exercise};