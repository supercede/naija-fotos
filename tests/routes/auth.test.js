/* eslint-disable no-undef, no-underscore-dangle */
import crypto from 'crypto';
import request from 'supertest';
import { config } from 'dotenv';
import mongoose from 'mongoose';
import app from '../../src/app';
import User from '../../src/models/user.model';
import {
  userOne,
  userSchema,
  setupDB,
  tearDownDB,
  incompleteUser,
} from '../fixtures/data';

import '../../src/db/mongoose';

config();

const sendMailMock = jest.fn();

jest.mock('nodemailer');

const nodemailer = require('nodemailer');

nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

beforeAll(async () => {
  sendMailMock.mockClear();
  nodemailer.createTransport.mockClear();
  await setupDB();
});

afterAll(async () => {
  await tearDownDB();
  mongoose.connection.close();
});

describe('User authentication', () => {
  test('Should sign a user up', async () => {
    const response = await request(app)
      .post('/api/v1/auth/signup')
      .send(userSchema);

    const user = await User.findById(response.body.data.user._id);
    expect(user).not.toBeNull();
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(sendMailMock).toHaveBeenCalled();
  });

  test('Should not accept duplicate user', async () => {
    const response = await request(app)
      .post('/api/v1/auth/signup')
      .send(userSchema);

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty('error');
  });

  test('Should not sign a user up if passwords do not match', async () => {
    userSchema.passwordConfirm = 'password123';
    const response = await request(app)
      .post('/api/v1/auth/signup')
      .send(userSchema);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toHaveProperty('message', 'validation error');
  });

  test('Should not accept incomplete user', async () => {
    const response = await request(app)
      .post('/api/v1/auth/signup')
      .send(incompleteUser);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toHaveProperty('message', 'validation error');
  });

  test('Should log a user in with email', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: userSchema.email, password: userSchema.password });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.data).toHaveProperty('user');
  });

  test('Should log a user in with username', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: userSchema.userName, password: userSchema.password });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.data).toHaveProperty('user');
  });

  test('Should not log a user in with invalid credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: userSchema.userName, password: 'invalid' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toHaveProperty('message', 'validation error');
  });

  test('Should not log a user in with incorrect credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: userSchema.userName, password: 'somepasss1234' });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toHaveProperty(
      'message',
      'Incorrect email or password.',
    );
  });

  let validToken;
  test('should send mail for password reset', async () => {
    const response = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: userSchema.email });

    validToken = response.body.data.token;

    const user = await User.findOne({ 'local.email': userSchema.email });

    expect(response.status).toBe(200);
    expect(sendMailMock).toHaveBeenCalled();
    expect(response.body.data).toHaveProperty('message', 'Token sent to email');
    expect(user.passwordResetToken).toBeTruthy();
    expect(user.passwordResetTokenExpires).toBeTruthy();
  });

  test('should not send mail for password reset to non-existing mail', async () => {
    const response = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'invalid@mail.com' });

    expect(response.status).toBe(404);
    expect(response.body.error).toHaveProperty('message', 'Email not found');
  });

  test('should throw validation error for password reset if mail is not provided', async () => {
    const response = await request(app).post('/api/v1/auth/forgot-password');

    expect(response.status).toBe(400);
    expect(response.body.error).toHaveProperty('message', 'validation error');
  });

  test('should reset password if reset token is valid', async () => {
    const user = await User.checkExistingEmail(userSchema.email);

    const response = await request(app)
      .patch(`/api/v1/auth/reset-password/${validToken}`)
      .send({
        password: 'newpass123',
        passwordConfirm: 'newpass123',
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body).toHaveProperty('token');
  });

  test('should not reset password if reset token is invalid', async () => {
    const user = await User.checkExistingEmail(userSchema.email);

    const response = await request(app)
      .patch('/api/v1/auth/reset-password/invalid')
      .send({
        password: 'newpass123',
        passwordConfirm: 'newpass123',
      });

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('error');
    expect(response.body).toHaveProperty('error');
  });

  test('should not reset password if reset token is invalid', async () => {
    const user = await User.checkExistingEmail(userSchema.email);

    const response = await request(app)
      .patch('/api/v1/auth/reset-password/invalid')
      .send({
        password: 'newpass123',
        passwordConfirm: 'newpass123',
      });

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('error');
    expect(response.body).toHaveProperty('error');
  });

  test('should throw validation error if required fields are not provided', async () => {
    const user = await User.checkExistingEmail(userSchema.email);

    const response = await request(app)
      .patch('/api/v1/auth/reset-password/invalid')
      .send({
        password: 'newpass123',
      });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('error');
    expect(response.body.error.errors).toHaveProperty('passwordConfirm');
  });
});
