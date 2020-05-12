import request from 'supertest';
import { config } from 'dotenv';
import mongoose from 'mongoose';
import app from '../../src/app';
import User from '../../src/models/user.model';
import {
  userOneSchema,
  userTwoSchema,
  userSchema,
  setupDB,
  tearDownDB,
  incompleteUser,
  userOneToken,
  userThreeToken,
} from '../fixtures/data';

import '../../src/db/mongoose';

beforeAll(async () => {
  await setupDB();
});

afterAll(async () => {
  await tearDownDB();
  mongoose.connection.close();
});

describe('followers test', () => {
  describe('should follow or unfollow user', () => {
    test('should not follow/unfollow user if request is not authenticated', async () => {
      const response = await request(app).patch(
        '/api/v1/users/profile/5eaafc623d468947a0ec9a82/following',
      );

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    test('should throw error if user is not found', async () => {
      const response = await request(app)
        .patch('/api/v1/users/profile/5eaafc623d468947a0ec9a82/following')
        .set('Authorization', 'Bearer ' + userOneToken);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    test('should throw error if userId is not valid', async () => {
      const response = await request(app)
        .patch('/api/v1/users/profile/invalid/following')
        .set('Authorization', 'Bearer ' + userOneToken);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toBe('Invalid request');
    });

    test('should throw error if user tries to follow/unfollow self', async () => {
      const response = await request(app)
        .patch(`/api/v1/users/profile/${userOneSchema._id}/following`)
        .set('Authorization', 'Bearer ' + userOneToken);

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error');
    });

    test('shold follow a user if not being followed', async () => {
      const response = await request(app)
        .patch(`/api/v1/users/profile/${userTwoSchema._id}/following`)
        .set('Authorization', 'Bearer ' + userOneToken);

      const userOne = await User.findById(userOneSchema._id);
      const userTwo = await User.findById(userTwoSchema._id);

      const checkFollowing =
        userOne.following.includes(userTwoSchema._id) &&
        userTwo.followers.includes(userOneSchema._id);

      expect(response.status).toBe(200);
      expect(response.body.data.message).toEqual(
        `You followed ${userTwoSchema.name} successfully`,
      );
      expect(checkFollowing).toBe(true);
    });

    test('should unfollow a user if not being followed', async () => {
      const response = await request(app)
        .patch(`/api/v1/users/profile/${userTwoSchema._id}/following`)
        .set('Authorization', 'Bearer ' + userOneToken);

      const userOne = await User.findById(userOneSchema._id);
      const userTwo = await User.findById(userTwoSchema._id);

      const checkFollowing =
        userOne.following.includes(userTwoSchema._id) &&
        userTwo.followers.includes(userOneSchema._id);

      expect(response.status).toBe(200);
      expect(response.body.data.message).toEqual(
        `You unfollowed ${userTwoSchema.name} successfully`,
      );
      expect(checkFollowing).toBe(false);
    });
  });

  describe('get followers/following', () => {
    test('should not get followers if request is not authenticated', async () => {
      const response = await request(app).get(
        `/api/v1/users/${userTwoSchema._id}/followers`,
      );

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    test('should not get following list if request is not authenticated', async () => {
      const response = await request(app).get(
        `/api/v1/users/${userTwoSchema._id}/following`,
      );

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    test('should not return following list is user is not found', async () => {
      const response = await request(app)
        .get('/api/v1/users/5eaafc623d468947a0ec9a82/following')
        .set('Authorization', 'Bearer ' + userOneToken);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    test('should not return follower list is user is not found', async () => {
      const response = await request(app)
        .get('/api/v1/users/5eaafc623d468947a0ec9a82/followers')
        .set('Authorization', 'Bearer ' + userOneToken);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    test('should get following list', async () => {
      const response = await request(app)
        .get(`/api/v1/users/${userTwoSchema._id}/following`)
        .set('Authorization', 'Bearer ' + userOneToken);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('followingCount');
    });

    test('should get followers list', async () => {
      const response = await request(app)
        .get(`/api/v1/users/${userTwoSchema._id}/followers`)
        .set('Authorization', 'Bearer ' + userOneToken);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('followersCount');
    });
  });

  describe('Get logged in user followers and following', () => {
    test('should get logged in user followers', async () => {
      const response = await request(app)
        .get('/api/v1/users/myFollowers')
        .set('Authorization', 'Bearer ' + userOneToken);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('followersCount');
    });

    test('should get logged in user following', async () => {
      const response = await request(app)
        .get('/api/v1/users/myFollowing')
        .set('Authorization', 'Bearer ' + userOneToken);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('followingCount');
    });
  });
});
