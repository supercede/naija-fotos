import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: String,
    photos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Photo',
      },
    ],
    collection: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Collection',
      },
    ],
  },
  {
    timestamps: true,
  },
);
