import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../../src/models/user.model';

export const userOne = {
  _id: mongoose.Types.ObjectId(),
  name: 'Clark Kent',
  local: {
    email: 'superman@kryptic.com',
    password: 'clarklois001',
  },
};

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

export const setupDB = async () => {
  await User.deleteMany();
  await new User(userOne).save();
};

export const tearDownDB = async () => {
  await User.deleteMany();
};
