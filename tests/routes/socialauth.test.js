/* eslint-disable no-undef, no-underscore-dangle */
import request from 'supertest';
import mongoose from 'mongoose';
import passport from 'passport';

import app from '../../src/app';
import User from '../../src/models/user.model';

import { setupDB, tearDownDB } from '../fixtures/data';
import { facebookProfile, googleProfile } from '../fixtures/social-profile';

import '../../src/db/mongoose';

beforeAll(async () => {
  await setupDB();
});

afterAll(async () => {
  await tearDownDB();
  mongoose.connection.close();
});

describe('Social signup/login tests', () => {
  test('should signup with facebook', async () => {
    const strategy = passport._strategies.facebook;
    // const strategy = passport.Strategy['facebook']

    strategy._token_response = {
      access_token: 'at-1234',
      expires_in: 3600,
    };

    strategy._profile = facebookProfile;
    const response = await request(app)
      .get('/api/v1/auth/facebook/redirect')
      .redirects(1);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body.data).toHaveProperty('user');
    expect(response.header['set-cookie'][0]).toMatch(/^jwt/);
  });

  test('should signup with google', async () => {
    const strategy = passport._strategies.google;

    strategy._token_response = {
      access_token: 'at-1234',
      expires_in: 3600,
    };

    strategy._profile = googleProfile;

    const response = await request(app)
      .get('/api/v1/auth/google/redirect')
      .redirects(1);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body.data).toHaveProperty('user');
    expect(response.header['set-cookie'][0]).toMatch(/^jwt/);
  });
});
