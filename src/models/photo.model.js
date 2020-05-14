/* eslint-disable func-names, no-use-before-define, no-undef, no-underscore-dangle */

import mongoose from 'mongoose';

const photoSchema = new mongoose.Schema(
  {
    imageURL: {
      type: String,
      required: true,
    },
    description: String,
    upvoteCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: [
      {
        type: String,
      },
    ],
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Favourite',
      },
    ],
  },
  {
    timestamps: true,
  },
);

photoSchema.pre(/^find$/, async function(next) {
  this.populate({
    path: 'user',
    select: 'name userName avatar',
  });
  next();
});

photoSchema.pre(/^findOne/, async function(next) {
  this.populate({
    path: 'user',
    select: 'name userName local avatar',
  });
  next();
});

const Photo = mongoose.model('Photo', photoSchema);

export default Photo;
