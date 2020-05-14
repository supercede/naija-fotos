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
  adminUserSchema,
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

describe('Comments test', () => {
  describe('create comment', () => {
    test('should not create comment if user is not logged in', async () => {
      const response = await request(app).post(
        `/api/v1/collections/${publicCollectionOne._id}/comments`,
      );

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    test('should throw an error if comment is not created with a content', async () => {
      const response = await request(app)
        .post(`/api/v1/collections/${publicCollectionOne._id}/comments`)
        .set('Authorization', 'Bearer ' + userTwoToken)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toBe('validation error');
    });

    test('should throw an error if content to be commented on does not exist', async () => {
      const response = await request(app)
        .post(`/api/v1/photos/${publicCollectionOne._id}/comments`)
        .set('Authorization', 'Bearer ' + userTwoToken)
        .send({ content: 'Amazing' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toBe('photo not found');
    });

    test('should create a collection if user is logged in and content is provided', async () => {
      const response = await request(app)
        .post(`/api/v1/collections/${publicCollectionOne._id}/comments`)
        .set('Authorization', 'Bearer ' + userTwoToken)
        .send({ content: 'Amazing' });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('comment');
    });
  });

  describe('get comments', () => {
    test('regular users cannot get all comments', async () => {
      const response = await request(app)
        .get(`/api/v1/comments`)
        .set('Authorization', 'Bearer ' + userTwoToken);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });

    test('Admins can get all comments', async () => {
      const response = await request(app)
        .get('/api/v1/comments')
        .set('Authorization', 'Bearer ' + adminToken);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('comments');
    });
  });

  describe('update comments', () => {
    test('should not update comment if not made by user', async () => {
      const response = await request(app)
        .patch(`/api/v1/comments/${commentOne._id}`)
        .set('Authorization', 'Bearer ' + userTwoToken)
        .send({ content: 'Very Amazing' });

      expect(response.status).toBe(403);
      expect(response.body.error.message).toBe(
        'You are not permitted to perform this operation',
      );
    });

    test('should not update comment if request body is empty', async () => {
      const response = await request(app)
        .patch(`/api/v1/comments/${commentOne._id}`)
        .set('Authorization', 'Bearer ' + userOneToken);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    test('should update comment', async () => {
      const response = await request(app)
        .patch(`/api/v1/comments/${commentOne._id}`)
        .set('Authorization', 'Bearer ' + userOneToken)
        .send({ content: 'Very Amazing' });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('comment');
      expect(response.body.data.comment.edited).toBe(true);
    });
  });

  describe('delete comment', () => {
    test('should throw Not Found Error if comment for delete does not exist', async () => {
      const response = await request(app)
        .delete('/api/v1/comments/5eb356ae240da53ff8dcfcbd')
        .set('Authorization', 'Bearer ' + userOneToken);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    test('should not delete a comment if user is not logged in', async () => {
      const response = await request(app).delete(
        '/api/v1/comments/5ead797a6466441ab099bcc6',
      );

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    test('should not delete comment not created by logged in user', async () => {
      const response = await request(app)
        .delete(`/api/v1/comments/${commentOne._id}`)
        .set('Authorization', 'Bearer ' + userTwoToken)
        .send({ content: 'Very Amazing' });

      expect(response.status).toBe(403);
      expect(response.body.error.message).toBe(
        'You are not permitted to perform this operation',
      );
    });

    test('should delete a comment', async () => {
      const response = await request(app)
        .delete(`/api/v1/comments/${commentOne._id}`)
        .set('Authorization', 'Bearer ' + userOneToken);

      expect(response.status).toBe(204);
    });
  });

  describe('comments for a photo and collection', () => {
    test('should get comments for a photo', async () => {
      const response = await request(app).get(
        `/api/v1/photos/${photoOne._id}/comments`,
      );

      const total = await Comment.countDocuments({ photoId: photoOne._id });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('comments');
      expect(response.body.total).toEqual(total);
    });

    test('should get comments for a collection', async () => {
      const response = await request(app).get(
        `/api/v1/collections/${publicCollectionOne._id}/comments`,
      );

      const total = await Comment.countDocuments({ collectionId: publicCollectionOne._id });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('comments');
      expect(response.body.total).toEqual(total);
    });

    test('should throw error if collection is not found', async () => {
      const response = await request(app).get(
        `/api/v1/collections/5ebb3a8a57db512a38486c63/comments`,
      );

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toBe('collection not found');
    });

    test('should throw error if photo is not found', async () => {
      const response = await request(app).get(
        `/api/v1/photos/5ebb3a8a57db512a38486c63/comments`,
      );

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toBe('photo not found');
    });
  });
});
