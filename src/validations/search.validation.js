import { check, query } from 'express-validator';

export default {
  searchSchema: [
    query('searchField')
      .optional()
      .isIn(['users', 'collections', 'photos'])
      .withMessage('search field can only be one of users, photos or collections'),

    check('searchString')
      .not()
      .isEmpty()
      .withMessage('searchString is compulsory')
      .trim(),
  ],
};
