import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app';
import '../../src/db/mongoose';
import { setupDB, tearDownDB, userOneToken } from '../fixtures/data';

import '../../src/db/mongoose';

beforeAll(async () => {
  await setupDB();
});

afterAll(async () => {
  await tearDownDB();
  mongoose.connection.close();
});

describe('search tests', () => {
  test('should not search for result without a query string', async () => {
    const response = await request(app).post('/api/v1/search');

    expect(response.status).toBe(400);
    expect(response.body.error.message).toBe('validation error');
  });

  test('should search for photos', async () => {
    const response = await request(app)
      .post('/api/v1/search?searchField=photos')
      .send({ searchString: 'person' });

    expect(response.status).toBe(200);
    expect(response.body.total).toHaveProperty('users', 'photos', 'collections');
    expect(response.body.data).toHaveProperty('photos');
  });

  test('should search for users', async () => {
    const response = await request(app)
      .post('/api/v1/search?searchField=users')
      .send({ searchString: 'person' });

    expect(response.status).toBe(200);
    expect(response.body.total).toHaveProperty('users', 'photos', 'collections');
    expect(response.body.data).toHaveProperty('users');
  });

  test('should search for collctions', async () => {
    const response = await request(app)
      .post('/api/v1/search?searchField=collections')
      .send({ searchString: 'person' });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('collections');
  });

  test('should default to users if searchField is not specified', async () => {
    const response = await request(app)
      .post('/api/v1/search')
      .send({ searchString: 'person' });

    expect(response.status).toBe(200);
    expect(response.body.total).toHaveProperty('users', 'photos', 'collections');
    expect(response.body.data).toHaveProperty('users');
  });
});
