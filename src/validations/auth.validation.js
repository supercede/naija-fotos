import { check } from 'express-validator';

export default {
  userSignUpSchema: [
    check('name')
      .trim()
      .not()
      .isEmpty()
      .withMessage('name is required')
      .isLength({ min: 2, max: 30 })
      .withMessage('name should be between 2 to 30 characters')
      .matches(/^[a-zA-ZÀ-ÖØ-öø-ÿ '.-]*$/)
      .withMessage('Enter a valid email address'),

    check('email')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Email address is required')
      .isEmail()
      .withMessage('Enter a valid email address'),

    check('password')
      .trim()
      .not()
      .isEmpty({ ignore_whitespace: true })
      .withMessage('Password is required')
      .isLength({ min: 8, max: 18 })
      .withMessage('Password should be between 8 to 20 characters'),

    check('userName')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Username is required')
      .isLength({ min: 3, max: 20 })
      .withMessage('Username should be between 3 and 20 characters')
      .matches(/^[a-zA-Z0-9_]*$/)
      .withMessage('Use only numbers, letters and underscores'),

    check('passwordConfirm')
      .trim()
      .not()
      .isEmpty({ ignore_whitespace: true })
      .withMessage('PasswordConfirm field is required')
      .custom((value, { req, loc, path }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords don't match");
        } else {
          return value;
        }
      })
      .isLength({ min: 8, max: 18 })
      .withMessage('Password should be between 8 to 20 characters'),

    check('portfolio')
      .trim()
      .optional()
      .isURL()
      .withMessage('Personal website must be a URL'),
  ],

  userLogInSchema: [
    check('email')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Username is required'),

    check('password')
      .trim()
      .not()
      .isEmpty({ ignore_whitespace: true })
      .withMessage('Password is required')
      .isLength({ min: 8, max: 18 })
      .withMessage('Password should be between 8 to 20 characters'),
  ],

  userForgotPasswordSchema: [
    check('email')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Email address is required')
      .isEmail()
      .withMessage('Enter a valid email address')
      .normalizeEmail(),
  ],

  userResetPasswordSchema: [
    check('password')
      .trim()
      .not()
      .isEmpty({ ignore_whitespace: true })
      .withMessage('Password is required')
      .isLength({ min: 8, max: 18 })
      .withMessage('Password should be between 8 to 20 characters'),

    check('passwordConfirm')
      .trim()
      .not()
      .isEmpty({ ignore_whitespace: true })
      .withMessage('PasswordConfirm field is required')
      .custom((value, { req, loc, path }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords don't match");
        } else {
          return value;
        }
      })
      .isLength({ min: 8, max: 18 })
      .withMessage('Password should be between 8 to 20 characters'),
  ],
};
