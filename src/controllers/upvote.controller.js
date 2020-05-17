/* eslint-disable no-underscore-dangle */
import Photo from '../models/photo.model';
import Collection from '../models/collection.model';
import dbqueries from '../utils/dbqueries';
import SearchFeatures from '../utils/searchFeatures';
import utils from '../utils/utils';
import Favourite from '../models/favourite.model';

const { getAll, updateOne, deleteOne, getOne, createOne } = dbqueries;
const { checkIfExists } = utils;

const updateCount = async (Model, id, val) => {
  const doc = await Model.findOneAndUpdate(
    { _id: id },
    { $inc: { upvoteCount: val } },
    {
      new: true,
      runValidators: true,
    },
  ).select('name imageURL description user upvoteCount');

  return doc;
};

export default {
  likeOrUnlikeResource: async (req, res) => {
    let field, id, Model, doc, like;
    const { photoId, collectionId } = req.params;
    const { user } = req;

    if (photoId) {
      field = 'photoId';
      await checkIfExists(Photo, req.params.photoId);
      Model = Photo;
      id = photoId;
    }
    if (collectionId) {
      field = 'collectionId';
      await checkIfExists(Collection, req.params.collectionId);
      id = collectionId;
      Model = Collection;
    }

    const favourite = await Favourite.findOne({
      [`${field}`]: id,
      user: user._id,
    });

    if (!favourite) {
      await Favourite.create({
        user: user._id,
        photoId,
        collectionId,
      });

      like = true;
      doc = await updateCount(Model, id, 1);
    } else {
      await Favourite.findOneAndDelete({ [`${field}`]: id, user: user._id });
      like = false;
      doc = await updateCount(Model, id, -1);
    }

    const modelName = Model.collection.collectionName.slice(0, -1);
    const data = [];
    data[modelName] = doc;

    res.status(200).json({
      status: 'success',
      data: {
        ...data,
        message: `You ${like ? 'liked' : 'unliked'} this ${modelName}`,
      },
    });
  },

  getResourceLikes: getAll(Favourite),
};
