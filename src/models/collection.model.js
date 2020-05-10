/* eslint-disable func-names */
import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: 'true',
    },
    description: String,
    upvoteCount: {
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
    private: {
      type: Boolean,
      default: false,
    },
    photos: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Photo',
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

collectionSchema.pre(/^find/, async function(next) {
  this.populate({
    path: 'user',
    select: 'name userName',
  }).populate({ path: 'photos', select: 'imageURL user tags' });
  next();
});

collectionSchema.pre('save', async function(next) {
  if (!this.isModified('photos')) return next;

  let tags = this.photos.map(photo => photo.tags);
  tags = tags.flat();

  const setTags = new Set(tags);
  this.tags = [...setTags];
});

const Collection = mongoose.model('Collection', collectionSchema);

export default Collection;
