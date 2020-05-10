import { check } from 'express-validator';

export default {
  createCollectionSchema: [
    check('name')
      .not()
      .isEmpty()
      .withMessage('Collection must have a name')
      .trim()
      .isString()
      .isLength({ max: 50 })
      .withMessage('Name must not be more than 40 characters'),

    check('description')
      .optional()
      .trim()
      .isString()
      .isLength({ max: 200 })
      .withMessage('Description must not be more than 200 characters'),

    check('private')
      .optional()
      .isBoolean()
      .withMessage('This field can onlyy be true or false'),
  ],

  collectionUpdateSchema: [
    check('name')
      .optional()
      .trim()
      .isString()
      .isLength({ max: 40 })
      .withMessage('Name must not be more than 40 characters'),

    check('description')
      .optional()
      .trim()
      .isString()
      .isLength({ max: 200 })
      .withMessage('Description must not be more than 200 characters'),

    check('private')
      .optional()
      .isBoolean()
      .withMessage('Expected a string'),
  ],
};
