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

/**
 * Middleware de validation pour les paramètres de route
 * Valide que les paramètres requis sont présents et valides
 */
exports.validateRouteParams = (paramNames) => {
  return (req, res, next) => {
    const missingParams = [];
    const invalidParams = [];

    paramNames.forEach(paramName => {
      const paramValue = req.params[paramName];
      
      if (!paramValue || paramValue === 'undefined') {
        missingParams.push(paramName);
        return;
      }

      // Si le paramètre doit être un nombre (ID)
      if (paramName.toLowerCase().includes('id')) {
        const numValue = parseInt(paramValue, 10);
        if (isNaN(numValue) || numValue <= 0) {
          invalidParams.push(`${paramName} doit être un nombre valide`);
        }
      }
    });

    if (missingParams.length > 0) {
      return next(new AppError(`Paramètres manquants: ${missingParams.join(', ')}`, 400));
    }

    if (invalidParams.length > 0) {
      return next(new AppError(`Paramètres invalides: ${invalidParams.join(', ')}`, 400));
    }

    next();
  };
}; 