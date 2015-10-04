'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PlaceSchema = new Schema({
  userID: Schema.Types.ObjectId,
  placeID: String,
  expireAt: Date
});

PlaceSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Place', PlaceSchema);
