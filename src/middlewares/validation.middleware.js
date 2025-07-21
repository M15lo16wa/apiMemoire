const { validationResult } = require('express-validator');
const AppError = require('../utils/appError');

exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return next(new AppError(`Erreurs de validation: ${errorMessages.join(', ')}`, 400));
  }
  next();
}; 