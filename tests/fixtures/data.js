import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../../src/models/user.model';
import Photo from '../../src/models/photo.model';

const idOne = mongoose.Types.ObjectId();
const idTwo = mongoose.Types.ObjectId();
const idThree = mongoose.Types.ObjectId();

export const userOneSchema = {
  _id: idOne,
  name: 'Clark Kent',
  userName: 'clark11',
  local: {
    email: 'superman@kryptic.com',
    password: 'clarklois001',
  },
};

const userTwoSchema = {
  _id: idTwo,
  name: 'Barry Adewande',
  userName: 'clark11',
  local: {
    email: 'barryWande@kryptic.com',
    password: 'barrywande001',
  },
};

const userThreeSchema = {
  _id: idThree,
  name: 'Diana Yobe',
  userName: 'clark11',
  local: {
    email: 'dianaWande@kryptic.com',
    password: 'barrywande001',
  },
};

const userOne = new User(userOneSchema);
const userTwo = new User(userTwoSchema);
const userThree = new User(userThreeSchema);

export const userOneToken = userOne.generateVerificationToken();
export const userTwoToken = userTwo.generateVerificationToken();
export const userThreeToken = userThree.generateVerificationToken();

export const userSchema = {
  email: 'kolawole1@admin.com',
  userName: 'koleade2',
  password: 'emiololawaloda',
  passwordConfirm: 'emiololawaloda',
  name: 'Kola Wole',
};

export const incompleteUser = {
  email: 'incomplete@mail.com',
  userName: 'incomplete',
  password: 'emiololawaloda',
  passwordConfirm: 'emiololawaloda',
};

export const photoOne = {
  upvoteCount: 0,
  commentCount: 0,
  tags: ['person', 'outside'],
  upvotes: [],
  comments: [],
  _id: '5ead797a6466441ab099bcc6',
  description: 'A fine boy laidat',
  imageURL:
    'https://res.cloudinary.com/supercede/image/upload/v1588427128/naijafotos-imgs/h3i58cpob6rnbq6pmv2r.jpg',
  user: userOneSchema._id,
};

const photoTwo = {
  upvoteCount: 0,
  commentCount: 0,
  tags: ['person', 'outside'],
  upvotes: [],
  comments: [],
  _id: '5ead787600c8513f3cc1ccb6',
  description: 'A fine boy laidat',
  imageURL:
    'https://res.cloudinary.com/supercede/image/upload/v1588426868/naijafotos-imgs/bimftdq9w5oaqo4jsebz.jpg',
  user: userTwoSchema._id,
};

const photoThree = {
  upvoteCount: 0,
  commentCount: 0,
  tags: ['person', 'outside'],
  upvotes: [],
  comments: [],
  _id: '5eacbded5b98a00f5045536c',
  description: 'not good',
  imageURL:
    'https://res.cloudinary.com/supercede/image/upload/v1588379116/naijafotos-imgs/ctdoiku4lurn1a0hwt0t.jpg',
  user: userThreeSchema._id,
};

const photoFour = {
  upvoteCount: 0,
  commentCount: 0,
  tags: ['asd', 'bikes'],
  upvotes: [],
  comments: [],
  _id: '5eac7b6ef3117111c0218878',
  description: 'Solfa solfa ton',
  imageURL:
    'https://res.cloudinary.com/supercede/image/upload/v1588362094/naijafotos-imgs/xksmjm5l1nrhyympirdd.jpg',
  user: userOneSchema._id,
};

export const setupDB = async () => {
  await User.deleteMany();
  await new User(userOne).save();
  await new User(userTwo).save();
  await new User(userThree).save();
  await Photo.insertMany([photoOne, photoTwo, photoThree, photoFour]);
};

export const tearDownDB = async () => {
  await User.deleteMany();
  await Photo.deleteMany();
};
