import mongoose from 'mongoose';

const photoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: 'true',
    },
    imageURL: {
      type: String,
      required: true,
    },
    caption: String,
    upvoteCount: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Favourite',
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Photo = mongoose.model('Photo', photoSchema);

export default Photo;
