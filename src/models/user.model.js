/* eslint-disable func-names, no-use-before-define, no-undef, no-underscore-dangle */
import crypto from 'crypto';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { config } from 'dotenv';
import jwt from 'jsonwebtoken';

config();

const jwtPrivateSecret = process.env.JWT_PRIVATE_SECRET.replace(/\\n/g, '\n');
const jwtPublicSecret = process.env.JWT_PUBLIC_SECRET.replace(/\\n/g, '\n');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    avatar: {
      type: String,
    },
    portfolio: String,
    userName: {
      type: String,
      unique: true,
      lowercase: true,
    },
    local: {
      email: {
        type: String,
        unique: true,
        lowercase: true,
      },
      password: {
        type: String,
        minlength: 8,
      },
    },
    facebook: {
      id: String,
      email: String,
    },
    google: {
      id: String,
      email: String,
    },
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    role: {
      type: String,
      default: 'user',
      enum: {
        values: ['user', 'moderator', 'admin'],
      },
    },
    collections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Collection',
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  },
);

userSchema.virtual('photos', {
  ref: 'Photo',
  localField: '_id',
  foreignField: 'user',
});

userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre('save', async function(next) {
  if (!this.local.password || !this.isModified('local.password')) return next;

  this.local.password = await bcrypt.hash(
    this.local.password,
    parseInt(process.env.HASH, 10),
  );
  next();
});

userSchema.methods.toJSON = function() {
  const user = this;

  const userObj = this.toObject();
  if (userObj.local) delete userObj.local.password;
  return userObj;
};

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.local.password);
};

userSchema.methods.generateVerificationToken = function() {
  return jwt.sign({ id: this._id }, jwtPrivateSecret, {
    expiresIn: '10d',
    algorithm: 'RS256',
  });
};

userSchema.methods.resetPasswordToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // expires in 2 hours
  this.passwordResetTokenExpires = Date.now() + 60 * 60 * 1000;

  return resetToken;
};

userSchema.statics.findBySocialID = async function(id, field) {
  const user = await User.findOne({ [`${field}`]: id });

  return user;
};

userSchema.statics.decodeVerificationToken = async token => jwt.verify(token, jwtPublicSecret);

userSchema.statics.checkExistingEmail = async email => {
  const checkEmail = await User.findOne({
    $or: [
      { 'local.email': email },
      { 'facebook.email': email },
      { 'google.email': email },
    ],
  });

  return checkEmail;
};

userSchema.statics.checkExistingUserName = async userName => {
  const checkUsername = await User.findOne({ userName });

  return checkUsername;
};

const User = mongoose.model('User', userSchema);

export default User;
