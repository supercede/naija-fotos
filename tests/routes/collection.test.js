/* eslint-disable no-undef */
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app';
import {
  setupDB,
  tearDownDB,
  userOneToken,
  userTwoToken,
  userThreeToken,
  photoOne,
  userOneSchema,
  privateCollectionOne,
} from '../fixtures/data';

import '../../src/db/mongoose';

beforeAll(async () => {
  await setupDB();
});

afterAll(async () => {
  await tearDownDB();
  mongoose.connection.close();
});

describe('collections tests', () => {
  let collectionId;
  describe('Create Collections', () => {
    test('should not create collection if user is not logged in', async () => {
      const response = await request(app).post('/api/v1/collections');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    test('should throw an error if collection is not created with name', async () => {
      const response = await request(app)
        .post('/api/v1/collections')
        .set('Authorization', 'Bearer ' + userTwoToken)
        .send({ description: 'my desc' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toBe('validation error');
    });

    test('should create a collection if user is logged in and name is provided', async () => {
      const response = await request(app)
        .post('/api/v1/collections')
        .set('Authorization', 'Bearer ' + userTwoToken)
        .send({ name: 'my collection', description: 'my desc' });

      collectionId = response.body.data.collection._id;
      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('collection');
    });
  });

  describe('Get Collections', () => {
    test('should get all public collections', async () => {
      const response = await request(app).get('/api/v1/collections');

      const isPublic = response.body.data.collections.every(
        collection => collection.private === false,
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('collections');
      expect(isPublic).toBe(true);
    });

    test('should get one collection', async () => {
      const response = await request(app).get(
        '/api/v1/collections/5eb356ae240da53ff8dcfcbc',
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('collection');
      expect(response.body.data.collection._id).toEqual(
        '5eb356ae240da53ff8dcfcbc',
      );
    });

    test('should throw Not Found Error if ID does not exist', async () => {
      const response = await request(app).get(
        '/api/v1/collections/5ead797a6466441ab099bcd7',
      );

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    test('should throw Not Found Error for unauthenticated attempt to fetch private collection', async () => {
      const response = await request(app).get(
        `/api/v1/collections/${privateCollectionOne._id}`,
      );

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    test("should throw Not Found Error if a user tries to fetch another user's private collection", async () => {
      const response = await request(app)
        .get(`/api/v1/collections/${privateCollectionOne._id}`)
        .set('Authorization', 'Bearer ' + userTwoToken);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    test("should get a user's private collection", async () => {
      const response = await request(app)
        .get(`/api/v1/collections/${privateCollectionOne._id}`)
        .set('Authorization', 'Bearer ' + userThreeToken);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('collection');
      expect(response.body.data.collection._id).toEqual(
        privateCollectionOne._id.toString(),
      );
    });
  });

  describe('update collection', () => {
    test('should update a collection', async () => {
      const response = await request(app)
        .patch('/api/v1/collections/5eb356ae240da53ff8dcfcbc')
        .set('Authorization', 'Bearer ' + userThreeToken)
        .send({ description: 'something else' });

      expect(response.status).toBe(200);
      expect(response.body.data.collection.description).toBe('something else');
    });

    test('should not update a collection if user is not logged in', async () => {
      const response = await request(app)
        .patch('/api/v1/collections/5eb356ae240da53ff8dcfcbc')
        .send({
          description: 'something else',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    test('should not update a collection not owned by logged in user', async () => {
      const response = await request(app)
        .patch('/api/v1/collections/5eb356ae240da53ff8dcfcbc')
        .set('Authorization', 'Bearer ' + userOneToken)
        .send({ description: 'something else' });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('delete collection', () => {
    test('should throw Not Found Error if collection for delete is not in user library', async () => {
      const response = await request(app)
        .delete('/api/v1/collections/5eb356ae240da53ff8dcfcbd')
        .set('Authorization', 'Bearer ' + userOneToken);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    test('should not delete a collection if user is not logged in', async () => {
      const response = await request(app).delete(
        '/api/v1/collections/5ead797a6466441ab099bcc6',
      );

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    test('should not delete collection not owned by logged in user', async () => {
      const response = await request(app)
        .delete('/api/v1/collections/5eb356ae240da53ff8dcfcbc')
        .set('Authorization', 'Bearer ' + userOneToken);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });

    test('should delete a collection', async () => {
      const response = await request(app)
        .delete('/api/v1/collections/5eb356ae240da53ff8dcfcbc')
        .set('Authorization', 'Bearer ' + userThreeToken);

      expect(response.status).toBe(204);
    });
  });

  describe('should add photo to collection', () => {
    test('should not add photo to collection if user is not logged ', async () => {
      const response = await request(app).post(
        `/api/v1/collections/${collectionId}/${photoOne._id}`,
      );

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    test('should not add photo to collection if user does not own collection', async () => {
      const response = await request(app)
        .post(`/api/v1/collections/${collectionId}/${photoOne._id}`)
        .set('Authorization', 'Bearer ' + userThreeToken);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });

    test('should add photo to collection if user is logged in', async () => {
      const response = await request(app)
        .post(`/api/v1/collections/${collectionId}/${photoOne._id}`)
        .set('Authorization', 'Bearer ' + userTwoToken);

      const hasTags = photoOne.tags.every(tag =>
        response.body.data.collection.tags.includes(tag),
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('collection');
      expect(hasTags).toBe(true);
    });
  });

  describe('remove photo from collection', () => {
    test('should throw error if collection id does not exist', async () => {
      const response = await request(app)
        .delete(`/api/v1/collections/5ead797a6466441ab099bcd7/${photoOne._id}`)
        .set('Authorization', 'Bearer ' + userTwoToken);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    test('should throw error if photo id does not exist', async () => {
      const response = await request(app)
        .delete(`/api/v1/collections/${collectionId}/${userOneSchema._id}`)
        .set('Authorization', 'Bearer ' + userTwoToken);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    test('should add photo to collection if user is logged in', async () => {
      const response = await request(app)
        .delete(`/api/v1/collections/${collectionId}/${photoOne._id}`)
        .set('Authorization', 'Bearer ' + userTwoToken);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('collection');
    });
  });
});
