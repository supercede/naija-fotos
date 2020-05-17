import request from 'supertest';
import { config } from 'dotenv';
import mongoose from 'mongoose';
import app from '../../src/app';
import User from '../../src/models/user.model';
import {
  userSchema,
  setupDB,
  tearDownDB,
  incompleteUser,
  userOneToken,
  userTwoToken,
  commentOne,
  publicCollectionOne,
  photoOne,
  userOneSchema,
  userTwoSchema,
  adminToken,
} from '../fixtures/data';

import '../../src/db/mongoose';
import Comment from '../../src/models/comment.model';

beforeAll(async () => {
  await setupDB();
});

afterAll(async () => {
  await tearDownDB();
  mongoose.connection.close();
});

describe('upvotes test', () => {
  describe('should like/unlike a resource', () => {
    test('should not like a resource if user is not logged in', async () => {
      const response = await request(app).post(
        `/api/v1/collections/${publicCollectionOne._id}/vote`,
      );

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  test('should not like a resource if resource does not exist', async () => {
    const response = await request(app)
      .post('/api/v1/collections/5eaafc623d468947a0ec9a82/vote')
      .set('Authorization', 'Bearer ' + userTwoToken);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
  });

  test('should like a collection', async () => {
    const response = await request(app)
      .post(`/api/v1/collections/${publicCollectionOne._id}/vote`)
      .set('Authorization', 'Bearer ' + userTwoToken);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('collection');
    expect(response.body.data.message).toContain('You liked');
  });

  test('should like a photo', async () => {
    const response = await request(app)
      .post(`/api/v1/photos/${photoOne._id}/vote`)
      .set('Authorization', 'Bearer ' + userTwoToken);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('photo');
    expect(response.body.data.message).toContain('You liked');
  });

  test('should unlike a photo if previously liked', async () => {
    const response = await request(app)
      .post(`/api/v1/photos/${photoOne._id}/vote`)
      .set('Authorization', 'Bearer ' + userTwoToken);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('photo');
    expect(response.body.data.message).toContain('You unliked');
  });

  describe('should get resource likes', () => {
    test('should not get resource likes if request is not authenticated', async () => {
      const response = await request(app).get(
        `/api/v1/photos/${photoOne._id}/vote`,
      );

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    test('should get resource likes if authenticated', async () => {
      const response = await request(app)
        .get(`/api/v1/collections/${publicCollectionOne._id}/vote`)
        .set('Authorization', 'Bearer ' + userTwoToken);

      const checkLikes = response.body.data.favourites.every(
        item => item.collectionId == publicCollectionOne._id,
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('favourites');
      expect(checkLikes).toBe(true);
    });
  });

  describe('should get user favourite pictures', () => {
    test('should get logged in user favourite items if the user is logged in', async () => {
      const response = await request(app)
        .get('/api/v1/users/myLikes')
        .set('Authorization', 'Bearer ' + userTwoToken);

      const checkLikes = response.body.data.favourites.every(
        item => item.user == userTwoSchema._id,
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('favourites');
      expect(checkLikes).toBe(true);
    });

    test('should get a user favourite items if the user is logged in', async () => {
      const response = await request(app)
        .get(`/api/v1/users/${userTwoSchema._id}/votes`)
        .set('Authorization', 'Bearer ' + userOneToken);

      const checkLikes = response.body.data.favourites.every(
        item => item.user == userTwoSchema._id,
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('favourites');
      expect(checkLikes).toBe(true);
    });
  });
});
