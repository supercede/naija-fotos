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

const { checkIfExists, updateCount } = utils;

export default {
  createOne: (Model, ...fields) =>
    catchAsync(async (req, res) => {
      let relatedModel, id;

      req.body.user = req.user._id;
      if (req.params.photoId) {
        await checkIfExists(Photo, req.params.photoId);
        req.body.photoId = req.params.photoId;
        id = req.params.photoId;
        relatedModel = Photo;
      }

      if (req.params.collectionId) {
        await checkIfExists(Collection, req.params.collectionId);
        req.body.collectionId = req.params.collectionId;
        id = req.params.collectionId;
        relatedModel = Collection;
      }

      if (Model.collection.collectionName === 'comments') {
        await updateCount(relatedModel, id, 1, 'commentCount');
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
      let populate, select;
      const filter = {};
      if (req.query.tag) {
        filter.tags = req.query.tag;
      }

      if (req.params.userId) {
        filter.user = req.params.userId;
      }

      if (req.params.photoId) {
        await checkIfExists(Photo, req.params.photoId);
        filter.photoId = req.params.photoId;
      } else if (req.params.collectionId) {
        await checkIfExists(Collection, req.params.collectionId);
        filter.collectionId = req.params.collectionId;
      }

      if (Model.collection.collectionName === 'favourites') {
        if (req.params.userId) {
          populate = 'photoId collectionId';
          select = 'name imageURL upvoteCount';
        } else {
          populate = 'user';
          select = 'name avatar userName';
        }
      }

      if (
        Model.collection.collectionName === 'collections' &&
        (!req.user || req.params.userId !== req.user._id)
      ) {
        filter.private = false;
      }

      const totalCount = await Model.countDocuments(filter);

      const features = new SearchFeatures(Model.find(filter), req.query)
        .filter()
        .sort()
        .fieldLimit()
        .pagination();

      const doc = await features.query.populate(populate, select);

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
      let relatedModel, modelId;

      const { id, role } = req.user;

      const { itemId } = req.params;

      await authorize(Model, itemId, id, role);

      const deletedItem = await Model.findByIdAndRemove(itemId);
      if (Model.collection.collectionName === 'photos') {
        deleteImage(deletedItem.imageURL);
      }

      if (Model.collection.collectionName === 'comments') {
        if (deletedItem.collectionId) {
          relatedModel = Collection;
          modelId = deletedItem.collectionId;
        }
        if (deletedItem.photoId) {
          relatedModel = Photo;
          modelId = deletedItem.photoId;
        }

        await updateCount(relatedModel, modelId, -1, 'commentCount');
      }

      res.status(204).json({
        status: 'success',
      });
    }),

  getContent: async (req, res, prop, column) => {
    let Model;
    if (req.url.includes('photos')) {
      Model = Photo;
    }
    if (req.url.includes('collections')) {
      Model = Collection;
    }

    const totalCount = await Model.countDocuments({
      [`${prop}`]: { $in: column },
    });

    if (totalCount === 0) {
      throw new NotFoundError('No results found matching your search');
    }

    const features = new SearchFeatures(
      Model.find({ [`${prop}`]: { $in: column } }),
      req.query,
    )
      .filter()
      .sort()
      .fieldLimit()
      .pagination();

    const docs = await features.query;

    const field = Model.collection.collectionName;
    const data = {};

    data[field] = docs;

    res.status(200).json({
      status: 'success',
      total: totalCount,
      data,
    });
  },
};
