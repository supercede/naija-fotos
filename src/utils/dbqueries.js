/* eslint-disable implicit-arrow-linebreak, no-underscore-dangle */
import catchAsync from './catchAsync';
import SearchFeatures from './searchFeatures';
import authorize from './authorize';
import filterObj from '../helpers/filterObject';
import deleteImage from '../helpers/deleteImage';
import { NotFoundError } from '../helpers/errors';
import Photo from '../models/photo.model';
import Collection from '../models/collection.model';
import utils from './utils';

const { checkIfExists } = utils;

export default {
  createOne: (Model, ...fields) =>
    catchAsync(async (req, res) => {
      req.body.user = req.user._id;
      if (req.params.photoId) {
        await checkIfExists(Photo, req.params.photoId);
        req.body.photoId = req.params.photoId;
      }

      if (req.params.collectionId) {
        await checkIfExists(Collection, req.params.collectionId);
        req.body.collectionId = req.params.collectionId;
      }

      const collectionObj = filterObj(req.body, ...fields);

      const doc = await Model.create(collectionObj);

      const modelName = Model.collection.collectionName.slice(0, -1);
      const data = {};

      data[modelName] = doc;

      res.status(201).json({
        status: 'success',
        data,
      });
    }),

  getAll: Model =>
    catchAsync(async (req, res) => {
      const filter = {};
      if (req.query.tag) {
        filter.tags = req.query.tag;
      }

      if (req.params.userId) {
        filter.user = req.params.userId;
      }

      if (
        Model.collection.collectionName === 'collections' && (!req.user || req.params.userId !== req.user._id)) {
        filter.private = false;
      }

      const totalCount = await Model.countDocuments(filter);

      const features = new SearchFeatures(Model.find(filter), req.query)
        .filter()
        .sort()
        .fieldLimit()
        .pagination();

      const doc = await features.query;

      const { limit } = features.query.options;
      const { page = 1 } = features.queryStr;

      const data = {};
      data[`${Model.collection.collectionName}`] = doc;

      res.status(200).json({
        status: 'success',
        total: totalCount,
        data,
        meta: {
          page: parseInt(page, 10),
          limit,
        },
      });
    }),

  getOne: (Model, populate = 'user') =>
    catchAsync(async (req, res) => {
      let filter = {};
      const { itemId } = req.params;

      if (Model.collection.collectionName === 'collections') {
        filter.private = false;

        // Return private collection for authenticated user
        if (req.user) {
          filter = { $or: [{ private: false }, { user: req.user._id }] };
        }
      }

      const doc = await Model.findOne({ _id: itemId, ...filter }).populate(
        populate,
        {
          userName: 1,
          name: 1,
          avatar: 1,
          local: 1,
        },
      );

      if (!doc) {
        throw new NotFoundError('Item not found');
      }

      const modelName = Model.collection.collectionName.slice(0, -1);
      const data = {};

      data[modelName] = doc;

      res.status(200).json({
        status: 'success',
        data,
      });
    }),

  updateOne: (Model, ...fields) =>
    catchAsync(async (req, res) => {
      const { id, role } = req.user;

      const { itemId } = req.params;

      await authorize(Model, itemId, id, role);

      const updates = filterObj(req.body, ...fields);
      const updatedDoc = await Model.findByIdAndUpdate(itemId, updates, {
        new: true,
        runValidators: true,
      });

      const result = Model.collection.collectionName.slice(0, -1);
      const data = {};

      data[result] = updatedDoc;

      res.status(200).json({
        status: 'success',
        data,
      });
    }),

  deleteOne: Model =>
    catchAsync(async (req, res) => {
      const { id, role } = req.user;

      const { itemId } = req.params;

      await authorize(Model, itemId, id, role);

      const deletedPhoto = await Model.findByIdAndRemove(itemId);
      if (Model.collection.collectionName === 'photos') {
        deleteImage(deletedPhoto.imageURL);
      }

      res.status(204).json({
        status: 'success',
      });
    }),
};
