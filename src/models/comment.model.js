import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    photoId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Photo',
    },
    collectionId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Collection',
    },
    content: {
      type: String,
      required: true,
    },
    upvoteCount: {
      type: Number,
      default: 0,
    },
    edited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

commentSchema.pre(/^find/, async function(next) {
  this.populate({
    path: 'user',
    select: 'name userName',
  });
  next();
});

commentSchema.pre('findOneAndUpdate', function(next) {
  this.setUpdate({ $set: { edited: true } });
  next();
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
