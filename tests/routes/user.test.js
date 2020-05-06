import request from 'supertest';
import { config } from 'dotenv';
import mongoose from 'mongoose';
import app from '../../src/app';
import User from '../../src/models/user.model';
import {
  userOneSchema,
  userSchema,
  setupDB,
  tearDownDB,
  incompleteUser,
  userOneToken,
} from '../fixtures/data';

import '../../src/db/mongoose';

beforeAll(async () => {
  await setupDB();
});

afterAll(async () => {
  await tearDownDB();
  mongoose.connection.close();
});

describe('users tests', () => {
  test('should throw an error if user tries to upload avatar without logging in', async () => {
    const response = await request(app).patch('/api/v1/users/avatar');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });

  test('should throw an error if avatar is uploaded without an image', async () => {
    const response = await request(app)
      .patch('/api/v1/users/avatar')
      .set('Authorization', 'Bearer ' + userOneToken);

    // expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error.message).toBe('Please upload an image');
  });

  test('should get all users', async () => {
    const response = await request(app).get('/api/v1/users');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('users');
    expect(response.body.data.users.length).toBe(3);
  });

  test('should get one user', async () => {
    const response = await request(app).get(
      `/api/v1/users/${userOneSchema._id}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data.user._id).toEqual(userOneSchema._id.toString());
  });

  test('should throw a not found error if user is not found', async () => {
    const response = await request(app).get('/api/v1/users/132474854');

    expect(response.status).toBe(404);
  });

  test('should get logged in user', async () => {
    const response = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', 'Bearer ' + userOneToken);

    expect(response.status).toBe(200);
    expect(response.body.data.user._id).toEqual(userOneSchema._id.toString());
  });

  test('should get user pictures', async () => {
    const response = await request(app).get(
      `/api/v1/users/${userOneSchema._id}/photos`,
    );

    const checkArr = response.body.data.photos.every(
      photo => photo.user._id === userOneSchema._id.toString(),
    );

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('photos');
    expect(checkArr).toBe(true);
  });

  test('should get logged user pictures', async () => {
    const response = await request(app)
      .get(`/api/v1/users/myPhotos`)
      .set('Authorization', 'Bearer ' + userOneToken);

    const checkArr = response.body.data.photos.every(
      photo => photo.user._id === userOneSchema._id.toString(),
    );

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('photos');
    expect(checkArr).toBe(true);
  });

  test('should not update user if not logged in', async () => {
    const response = await request(app)
      .patch('/api/v1/users/updateMe')
      .send({ name: 'Lex Luthor', email: 'ceo@luthorcorp.com' });

    expect(response.status).toBe(401);
  });

  test('should update user if logged in', async () => {
    const response = await request(app)
      .patch('/api/v1/users/updateMe')
      .send({ name: 'Lex Luthor', email: 'ceo@luthorcorp.com' })
      .set('Authorization', 'Bearer ' + userOneToken);

    expect(response.status).toBe(200);
    expect(response.body.data.user.name).toBe('Lex Luthor');
    expect(response.body.data.user.local.email).toBe('ceo@luthorcorp.com');
  });

  test('should not delete user if not logged in', async () => {
    const response = await request(app).delete('/api/v1/users/deleteMe');

    expect(response.status).toBe(401);
  });

  test('should delete user if logged in', async () => {
    const response = await request(app)
      .delete('/api/v1/users/deleteMe')
      .set('Authorization', 'Bearer ' + userOneToken);

    expect(response.status).toBe(204);
  });
});
