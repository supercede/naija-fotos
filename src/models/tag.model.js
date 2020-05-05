import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema(
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

const Tag = mongoose.model('Tag', tagSchema);

export default Tag;
