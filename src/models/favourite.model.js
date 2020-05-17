import mongoose from 'mongoose';

const favouriteSchema = new mongoose.Schema(
  {
    photoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Photo',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection',
    },
  },
  {
    timestamps: true,
  },
);

const Favourite = mongoose.model('Favourite', favouriteSchema);

export default Favourite;
