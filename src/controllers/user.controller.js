import mongoose from 'mongoose';
import { ApplicationError, NotFoundError } from '../helpers/errors';
import User from '../models/user.model';
import deleteImage from '../helpers/deleteImage';
import filterObj from '../helpers/filterObject';
import SearchFeatures from '../utils/searchFeatures';

export default {
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

  getAllUsers: async (req, res) => {
    const usersQuery = new SearchFeatures(User.find(), req.query)
      .filter()
      .sort()
      .fieldLimit()
      .pagination();

    const users = await usersQuery.query;

    res.status(200).json({
      status: 'success',
      data: {
        users,
      },
    });
  },

  getMe: (req, res, next) => {
    if (req.user) {
      req.params.userId = req.user._id;
    }
    next();
  },

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

  updateMe: async (req, res) => {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
      throw new ApplicationError(400, 'Empty Request Object');
    }

    const { _id } = req.user;
    if (req.body.password) {
      throw new ApplicationError(
        'You cannot update your password through this route',
      );
    }

    // allow only accepted fields
    const updates = filterObj(
      req.body,
      'name',
      'portfolio',
      'email',
      'userName',
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

  deleteMe: async (req, res) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    return res.status(204).json({
      status: 'success',
      data: null,
    });
  },
};
