import { check } from 'express-validator';

export default {
  userUpdateSchema: [
    check('name')
      .trim()
      .optional()
      .isLength({ min: 2, max: 30 })
      .withMessage('name should be between 2 to 30 characters')
      .matches(/^[a-zA-ZÀ-ÖØ-öø-ÿ '.-]*$/)
      .withMessage('Enter a valid email address'),

    check('email')
      .trim()
      .optional()
      .isEmail()
      .withMessage('Enter a valid email address'),

    check('userName')
      .trim()
      .optional()
      .isLength({ min: 3, max: 20 })
      .withMessage('Username should be between 3 and 20 characters')
      .matches(/^[a-zA-Z0-9_]*$/)
      .withMessage('Use only numbers, letters and underscores'),

    check('portfolio')
      .trim()
      .optional()
      .isURL()
      .withMessage('Personal website must be a URL'),

    check('bio')
      .optional()
      .isString()
      .withMessage('Expect bio to be a string')
      .trim()
      .isLength({ max: 400 })
      .withMessage('Bio cannot be more than 400 characters'),

    check('interests')
      .optional()
      .isArray({ min: 1 })
      .withMessage('Interests should be an array'),

    check('interests.*')
      .isString()
      .withMessage('Expected interests to be an array of strings')
      .trim(),
  ],
};
