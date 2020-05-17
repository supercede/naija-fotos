import Photo from '../models/photo.model';
import Collection from '../models/collection.model';
import dbqueries from '../utils/dbqueries';
import Comment from '../models/comment.model';
import SearchFeatures from '../utils/searchFeatures';
import utils from '../utils/utils';

const {
  getAll,
  updateOne,
  deleteOne,
  getOne,
  createOne,
} = dbqueries;
const { checkIfExists } = utils;

export default {
  postComment: createOne(Comment, 'user', 'photoId', 'collectionId', 'content'),

  getAllComments: getAll(Comment),

  getOneComment: getOne(Comment),

  updateComment: updateOne(Comment, 'content'),

  deleteComment: deleteOne(Comment),

  getPhotoCollectionComments: async (req, res) => {
    let field, id;

    if (req.params.photoId) {
      field = 'photoId';
      await checkIfExists(Photo, req.params.photoId);
      id = req.params.photoId;
    } else if (req.params.collectionId) {
      field = 'collectionId';
      await checkIfExists(Collection, req.params.collectionId);
      id = req.params.collectionId;
    }

    const totalCount = await Comment.countDocuments({ [`${field}`]: id });

    const features = new SearchFeatures(
      Comment.find({ [`${field}`]: id }).populate({
        path: 'user',
        select: 'name userName avatar',
      }),
      req.query,
    )
      .sort()
      .fieldLimit()
      .pagination();

    const comments = await features.query;

    const { limit } = features.query.options;
    const { page = 1 } = features.queryStr;

    res.status(200).json({
      status: 'success',
      total: totalCount,
      data: {
        comments,
      },
      meta: {
        page: parseInt(page, 10),
        limit,
      },
    });
  },
};
