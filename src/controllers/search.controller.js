import Photo from '../models/photo.model';
import User from '../models/user.model';
import Collection from '../models/collection.model';
import SearchFeatures from '../utils/searchFeatures';

export default {
  search: async (req, res) => {
    const { searchField = 'users' } = req.query;
    const { searchString } = req.body;
    let Model;

    const usersCount = await User.countDocuments({
      $text: { $search: searchString },
    });
    const photosCount = await Photo.countDocuments({
      $text: { $search: searchString },
    });
    const collectionsCount = await Collection.countDocuments({
      $text: { $search: searchString },
    });

    if (searchField === 'users') {
      Model = User;
    }
    if (searchField === 'photos') {
      Model = Photo;
    }
    if (searchField === 'collections') {
      Model = Collection;
    }

    const features = new SearchFeatures(
      Model.find({ $text: { $search: searchString } }),
      req.query,
    )
      .filter()
      .sort()
      .fieldLimit()
      .pagination();

    const doc = await features.query;

    const { limit } = features.query.options;
    const { page = 1 } = features.queryStr;

    const data = {};
    data[searchField] = doc;

    res.status(200).json({
      status: 'success',
      total: {
        users: usersCount,
        photos: photosCount,
        collections: collectionsCount,
      },
      data,
      meta: {
        page: parseInt(page, 10),
        limit,
      },
    });
  },
};
