/* eslint-disable no-underscore-dangle */
import mongoose from 'mongoose';
import { ApplicationError, NotFoundError } from '../helpers/errors';
import User from '../models/user.model';
import deleteImage from '../helpers/deleteImage';
import filterObj from '../helpers/filterObject';
import dbqueries from '../utils/dbqueries';
import Favourite from '../models/favourite.model';

const {
  getAll,
  deleteOne,
  updateOne,
  getContent,
} = dbqueries;

export default {
  /**
   * @function uploadAvatar
   * @description handles user upload avatar
   *
   * @param {Object} request - the request object
   * @param {Object} response - the response object
   *
   * @returns {Object} response - the response object
   */
  uploadAvatar: async (req, res) => {
    const { _id } = req.user;
    let oldAvatar = null;
    if (req.user.avatar) {
      oldAvatar = req.user.avatar;
    }
    if (req.file) {
      req.body.avatar = req.file.secure_url;

      const updatedUser = await User.findByIdAndUpdate(
        _id,
        { avatar: req.body.avatar },
        { new: true, runValidators: true },
      );

      if (oldAvatar) {
        deleteImage(oldAvatar);
      }

      res.status(201).json({
        status: 'success',
        data: {
          user: updatedUser,
        },
      });
    } else {
      throw new ApplicationError(400, 'Please upload an image');
    }
  },

  getAllUsers: getAll(User),

  /**
   * @function getOneUser
   * @description handles sets userId parameter to logged in user id
   *
   * @param {Object} request - the request object
   * @param {Object} response - the response object
   * @param {Function} next - to call the next middleware
   *
   * @returns {Function} next - to call the next middleware
   */
  getMe: (req, res, next) => {
    if (req.user) {
      req.params.userId = req.user._id;
    }
    next();
  },

  /**
   * @function getOneUser
   * @description handles get one user
   *
   * @param {Object} request - the request object
   * @param {Object} response - the response object
   *
   * @returns {Object} response - the response object
   */
  getUser: async (req, res) => {
    let userId;
    if (mongoose.Types.ObjectId.isValid(req.params.userId)) {
      userId = req.params.userId;
    }

    const user = await User.findById(userId).populate('photos', {
      upvoteCount: 1,
      commentCount: 1,
      imageURL: 1,
      description: 1,
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  },

  /**
   * @function updateMe
   * @description handles update logged in user
   *
   * @param {Object} request - the request object
   * @param {Object} response - the response object
   *
   * @returns {Object} response - the response object
   */
  updateMe: async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
      throw new ApplicationError(400, 'Empty Request Object');
    }

    const { _id } = req.user;
    if (req.body.password) {
      throw new ApplicationError(
        400,
        'You cannot update your password through this route',
      );
    }

    if (req.body.userName) {
      const checkUserName = await User.checkExistingUserName(req.body.userName);
      if (checkUserName) {
        throw new ApplicationError(409, 'This username is already taken');
      }
    }

    // allow only accepted fields
    const updates = filterObj(
      req.body,
      'name',
      'portfolio',
      'email',
      'userName',
      'bio',
      'interests',
    );

    const updatedUser = await User.findByIdAndUpdate(_id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  },

  /**
   * @function deleteMe
   * @description handles delete current logged in user
   *
   * @param {Object} request - the request object
   * @param {Object} response - the response object
   *
   * @returns {Object} response - the response object
   */
  deleteMe: async (req, res) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    return res.status(204).json({
      status: 'success',
      data: null,
    });
  },

  /**
   * @function followOrUnfollow
   * @description handles following and unfollowing another user
   *
   * @param {Object} request - the request object
   * @param {Object} response - the response object
   *
   * @returns {Object} response - the response object
   */
  followOrUnfollow: async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApplicationError(400, 'Invalid request');
    }

    // check if your id doesn't match the id of the user you want to follow
    if (req.user.id === userId) {
      throw new ApplicationError(409, 'You cannot follow or unfollow yourself');
    }

    const checkUserToFollow = await User.findById(userId);

    if (!checkUserToFollow) {
      throw new NotFoundError('User not found');
    }

    let updateUserFollowing;
    const isFollowing = req.user.following.includes(userId);

    if (!isFollowing) {
      // Follow user if not following
      updateUserFollowing = await User.findByIdAndUpdate(
        req.user._id,
        {
          $addToSet: { following: userId },
          // inc count
        },
        {
          new: true,
          runValidators: true,
        },
      ).select('name avatar following role');

      if (updateUserFollowing) {
        await User.findByIdAndUpdate(
          userId,
          {
            $addToSet: { followers: req.user._id },
          },
          {
            new: true,
            runValidators: true,
          },
        );
      } else {
        throw new ApplicationError('Failed to follow this user');
      }
    } else {
      updateUserFollowing = await User.findByIdAndUpdate(
        req.user._id,
        {
          $pull: { following: userId },
        },
        {
          new: true,
          runValidators: true,
        },
      ).select('name avatar following role');

      if (updateUserFollowing) {
        await User.findByIdAndUpdate(
          userId,
          {
            $pull: { followers: req.user._id },
          },
          {
            new: true,
            runValidators: true,
          },
        );
      } else {
        throw new ApplicationError('Failed to unfollow this user');
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        message: `You ${isFollowing ? 'unfollowed' : 'followed'} ${
          checkUserToFollow.name
        } successfully`,
        user: updateUserFollowing,
      },
    });
  },

  /**
   * @function getUserFollowers
   * @description handles getting a user's followers
   *
   * @param {Object} request - the request object
   * @param {Object} response - the response object
   *
   * @returns {Object} response - the response object
   */
  getUserFollowers: async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('name _id userName followers avatar')
      .populate({ path: 'followers', select: 'name userName avatar' });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { followers } = user;
    const followersCount = followers.length;
    // Paginate
    res.status(200).json({
      status: 'success',
      data: {
        followersCount,
        user,
      },
    });
  },

  /**
   * @function getUserFollowing
   * @description handles getting people following a user
   *
   * @param {Object} request - the request object
   * @param {Object} response - the response object
   *
   * @returns {Object} response - the response object
   */
  getUserFollowing: async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('name _id userName following avatar')
      .populate({ path: 'following', select: 'name userName avatar' });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { following } = user;
    const followingCount = following.length;

    res.status(200).json({
      status: 'success',
      data: {
        followingCount,
        user,
      },
    });
  },

  getUserLikes: getAll(Favourite),

  deleteUser: deleteOne(User),

  updateUser: updateOne(
    User,
    'role',
    'email',
    'userName',
    'name',
    'portfolio',
    'interests',
    'bio',
  ),

  /**
   * @function getUserInterests
   * @description handles getting a user's content based on content
   *
   * @param {Object} request - the request object
   * @param {Object} response - the response object
   *
   * @returns {Function} getContent - to get photos and collections based on a user's interests
   */
  getUserInterests: async (req, res) => {
    const { interests } = req.user;

    if (!interests || interests.length === 0) {
      throw new NotFoundError(
        'You currently have not chosen any interests. Add interests to your profile',
      );
    }

    await getContent(req, res, 'tags', interests);
  },

  /**
   * @function getFollowingContent
   * @description handles getting a user's content based on who they follow
   *
   * @param {Object} request - the request object
   * @param {Object} response - the response object
   *
   * @returns {Function} getContent - to get photos and collections based on who a user follows
   */
  getFollowingContent: async (req, res) => {
    const { following } = req.user;

    if (following.length === 0 || !following) {
      throw new NotFoundError(
        'You are not following anyone currently, follow others to see more content',
      );
    }

    await getContent(req, res, 'user', following);
  },
};
