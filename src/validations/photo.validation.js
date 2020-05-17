import { check } from 'express-validator';

export default {
  photoUploadSchema: [
    check('description')
      .trim()
      .isString()
      .isLength({ max: 200 })
      .withMessage('Description must not be more than 200 characters'),

    check('tags')
      .not()
      .isEmpty()
      .withMessage('Pictures must have tags')
      .isArray({ min: 1 })
      .withMessage('Tags should be an array'),

    check('tags.*')
      .isString()
      .withMessage('Expected tags to be an array of strings'),
  ],

  photoUpdateSchema: [
    check('description')
      .trim()
      .isString()
      .isLength({ max: 200 })
      .withMessage('Description must not be more than 200 characters'),

    check('tags')
      .optional()
      .isArray({ min: 1 })
      .withMessage('Tags should be an array'),

    check('tags.*')
      .optional()
      .isString()
      .withMessage('Expected a string'),
  ],
};
