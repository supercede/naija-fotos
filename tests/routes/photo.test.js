import path from 'path';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app';
import { setupDB, tearDownDB, userOneToken } from '../fixtures/data';

import '../../src/db/mongoose';

beforeAll(async () => {
  await setupDB();
});

afterAll(async () => {
  await tearDownDB();
  mongoose.connection.close();
});

describe('photos tests', () => {
  test('should throw an error if user is not logged in', async () => {
    const response = await request(app).post('/api/v1/photos');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });

  test('should throw an error if photo is not uploaded with image', async () => {
    const response = await request(app)
      .post('/api/v1/photos')
      .set('Authorization', 'Bearer ' + userOneToken)
      .send({ description: 'my desc', tags: ['anime', 'HunterxHunter'] });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error.message).toBe('Please upload an image');
  });

  test('should throw an error if photo is not greater than 500x500', async () => {
    const imagePath = path.join(__dirname, '../fixtures/media/image.jpg');
    const response = await request(app)
      .post('/api/v1/photos')
      .set('Authorization', 'Bearer ' + userOneToken)
      .attach('photo', imagePath)
      .field('description', 'my desc')
      .field('tags', ['anime', 'HunterxHunter']);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error.message).toBe(
      'File size should be at least than 500px * 500px',
    );
  });

  test('should get all photos', async () => {
    const response = await request(app).get('/api/v1/photos');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('photos');
    expect(response.body.data.photos.length).toBe(4);
  });

  test('should paginate photos', async () => {
    const response = await request(app).get('/api/v1/photos?limit=2');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('photos');
    expect(response.body.data.photos.length).toBe(2);
  });

  test('should filter image by tags', async () => {
    const response = await request(app).get('/api/v1/photos?tag=person');

    const checkArr = response.body.data.photos.every(photo =>
      photo.tags.includes('person'),
    );

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('photos');
    expect(checkArr).toBe(true);
  });

  test('should get one photo', async () => {
    const response = await request(app).get(
      '/api/v1/photos/5ead797a6466441ab099bcc6',
    );

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('photo');
    expect(response.body.data.photo._id).toEqual('5ead797a6466441ab099bcc6');
  });

  test('should throw Not Found Error if ID does not exist', async () => {
    const response = await request(app).get(
      '/api/v1/photos/5ead797a6466441ab099bcd7',
    );

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
  });

  test('should update a picture', async () => {
    const response = await request(app)
      .patch('/api/v1/photos/5ead797a6466441ab099bcc6')
      .set('Authorization', 'Bearer ' + userOneToken)
      .send({ description: 'something else', tags: ['girls', 'like', 'you'] });

    expect(response.status).toBe(200);
    expect(response.body.data.photo.description).toBe('something else');
  });

  test('should not update a picture if user is not logged in', async () => {
    const response = await request(app)
      .patch('/api/v1/photos/5ead797a6466441ab099bcc6')
      .send({ description: 'something else', tags: ['girls', 'like', 'you'] });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });

  test('should not update picture not owned by logged in user', async () => {
    const response = await request(app)
      .patch('/api/v1/photos/5ead787600c8513f3cc1ccb6')
      .set('Authorization', 'Bearer ' + userOneToken)
      .send({ description: 'something else', tags: ['girls', 'like', 'you'] });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error');
  });

  test('should throw Not Found Error if photo for delete is not in user library', async () => {
    const response = await request(app)
      .delete('/api/v1/photos/5ead797a6466441ab099bcd9')
      .set('Authorization', 'Bearer ' + userOneToken);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
  });

  test('should not delete a picture if user is not logged in', async () => {
    const response = await request(app).delete(
      '/api/v1/photos/5ead797a6466441ab099bcc6',
    );

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });

  test('should not delete picture not owned by logged in user', async () => {
    const response = await request(app)
      .delete('/api/v1/photos/5ead787600c8513f3cc1ccb6')
      .set('Authorization', 'Bearer ' + userOneToken);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error');
  });

  test('should delete a picture', async () => {
    const response = await request(app)
      .delete('/api/v1/photos/5ead797a6466441ab099bcc6')
      .set('Authorization', 'Bearer ' + userOneToken);

    expect(response.status).toBe(204);
  });
});
