import mongoose from 'mongoose';

const favouriteSchema = new mongoose.Schema(
  {
    photo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Photo',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
);

const Favourite = mongoose.model('Favourite', favouriteSchema);

export default Favourite;
