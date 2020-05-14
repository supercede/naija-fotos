import { check } from 'express-validator';

export default {
  createCommentSchema: [
    check('content')
      .not()
      .isEmpty()
      .withMessage('Comment must have a content')
      .trim()
      .isString()
      .isLength({ max: 500 })
      .withMessage('Content must not be more than 500 characters'),
  ],

  CommentUpdateSchema: [
    check('content')
      .not()
      .isEmpty()
      .withMessage('Comment must have a content')
      .trim()
      .isString()
      .isLength({ max: 500 })
      .withMessage('Content must not be more than 500 characters'),
  ],
};
