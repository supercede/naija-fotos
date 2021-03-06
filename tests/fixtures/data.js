import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../../src/models/user.model';
import Photo from '../../src/models/photo.model';
import Collection from '../../src/models/collection.model';
import Comment from '../../src/models/comment.model';

const idOne = mongoose.Types.ObjectId();
const idTwo = mongoose.Types.ObjectId();
const idThree = mongoose.Types.ObjectId();
const idAdmin = mongoose.Types.ObjectId();

export const userOneSchema = {
  _id: idOne,
  name: 'Clark Kent',
  userName: 'clark11',
  local: {
    email: 'superman@kryptic.com',
    password: 'clarklois001',
  },
};

export const userTwoSchema = {
  _id: idTwo,
  name: 'Barry Adewande',
  userName: 'clark11',
  local: {
    email: 'barryWande@kryptic.com',
    password: 'barrywande001',
  },
  interests: ['person', 'some tags']
};

export const adminUserSchema = {
  _id: idAdmin,
  name: 'Ging Freecss',
  userName: 'clark11',
  interests: ['strange', 'non-exisiting'],
  local: {
    email: 'admin@greedisland.com',
    password: 'barrywande001',
  },
  role: 'admin',
  following: [userOneSchema._id]
};

export const userThreeSchema = {
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
const adminUser = new User(adminUserSchema);

export const userOneToken = userOne.generateVerificationToken();
export const userTwoToken = userTwo.generateVerificationToken();
export const userThreeToken = userThree.generateVerificationToken();
export const adminToken = adminUser.generateVerificationToken();

export const userSchema = {
  email: 'kolawole1@admin.com',
  userName: 'koleade2',
  password: 'emiololawaloda',
  passwordConfirm: 'emiololawaloda',
  name: 'Kola Wole',
};

export const conflictUsername = {
  email: 'somemail1@admin.com',
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

export const publicCollectionOne = {
  upvoteCount: 0,
  tags: ['people'],
  private: false,
  photos: [photoOne._id, photoTwo._id],
  upvotes: [],
  comments: [],
  _id: '5eb356ae240da53ff8dcfcbc',
  name: 'public collection',
  description:
    'Eat, Drink, and be Merry! Winter is all about staying indoors and getting cosy. Filled with photos of friends gathered by the fire and families sharing festive treats spent together',
  user: userThreeSchema._id,
};

const publicCollectionTwo = {
  upvoteCount: 0,
  private: false,
  photos: [photoTwo._id, photoFour._id],
  upvotes: [],
  comments: [],
  _id: '5ead797a6466441ab099bcc6',
  name: 'public collection one',
  description:
    'Eat, Drink, and be Merry! Winter is all about staying indoors and getting cosy. Filled with photos of friends gathered by the fire and families sharing festive treats spent together',
  user: userOneSchema._id,
};

const publicCollectionThree = {
  upvoteCount: 0,
  private: false,
  photos: [photoTwo._id, photoFour._id],
  upvotes: [],
  comments: [],
  _id: mongoose.Types.ObjectId(),
  name: 'public collection two',
  description:
    'Eat, Drink, and be Merry! Winter is all about staying indoors and getting cosy. Filled with photos of friends gathered by the fire and families sharing festive treats spent together',
  user: userThreeSchema._id,
};

export const privateCollectionOne = {
  upvoteCount: 0,
  private: true,
  photos: [photoOne._id, photoThree._id],
  upvotes: [],
  comments: [],
  _id: mongoose.Types.ObjectId(),
  name: 'public collection three',
  description:
    'Eat, Drink, and be Merry! Winter is all about staying indoors and getting cosy. Filled with photos of friends gathered by the fire and families sharing festive treats spent together',
  user: userThreeSchema._id,
};

export const commentOne = {
  _id: '5ebc013f7ab7b10a08d51d91',
  content: 'looks good',
  user: userOneSchema._id,
  collectionId: publicCollectionOne._id,
};

const commentTwo = {
  _id: '5ebc50b1f57f241d4039936d',
  content: 'looks good',
  user: userOneSchema._id,
  photoId: photoOne._id,
};

export const setupDB = async () => {
  await User.deleteMany();
  await new User(userOne).save();
  await new User(userTwo).save();
  await new User(userThree).save();
  await new User(adminUser).save({ validateBeforeSave: false });
  await Photo.insertMany([photoOne, photoTwo, photoThree, photoFour]);
  await Collection.insertMany([
    publicCollectionOne,
    publicCollectionTwo,
    publicCollectionThree,
    privateCollectionOne,
  ]);
  await Comment.insertMany([commentOne, commentTwo]);
};

export const tearDownDB = async () => {
  await User.deleteMany();
  await Photo.deleteMany();
  await Collection.deleteMany();
  await Comment.deleteMany();
};
