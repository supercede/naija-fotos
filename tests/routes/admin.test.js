import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app';
import {
  userOneSchema,
  userThreeSchema,
  setupDB,
  tearDownDB,
  userOneToken,
  userThreeToken,
  adminUserSchema,
  adminToken,
} from '../fixtures/data';

import '../../src/db/mongoose';

beforeAll(async () => {
  await setupDB();
});

afterAll(async () => {
  await tearDownDB();
  mongoose.connection.close();
});

describe('admin routes', () => {
  describe('update user', () => {
    test('user should not be able to update other users', async () => {
      const response = await request(app)
        .patch(`/api/v1/admin/users/${userThreeSchema._id}`)
        .set('Authorization', 'Bearer ' + userOneToken);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });
    test('admins should be able to update other users', async () => {
      const response = await request(app)
        .patch(`/api/v1/admin/users/${userThreeSchema._id}`)
        .set('Authorization', 'Bearer ' + adminToken)
        .send({ name: 'Lex Luthor', email: 'ceo@luthorcorp.com' });

      expect(response.status).toBe(200);
      expect(response.body.data.user.name).toBe('Lex Luthor');
      expect(response.body.data.user.local.email).toBe('ceo@luthorcorp.com');
    });
  });

  describe('delete user', () => {
    test('user should not be able to delete other users', async () => {
      const response = await request(app)
        .delete(`/api/v1/admin/users/${userThreeSchema._id}`)
        .set('Authorization', 'Bearer ' + userOneToken);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });
    test('admins should be able to delete other users', async () => {
      const response = await request(app)
        .delete(`/api/v1/admin/users/${userThreeSchema._id}`)
        .set('Authorization', 'Bearer ' + adminToken);

      expect(response.status).toBe(204);
    });
  });
});
