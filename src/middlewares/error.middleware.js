const AppError = require('../utils/appError');

// Fonctions d'aide pour gérer différents types d'erreurs en production
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  // Pour les erreurs de duplication de Sequelize, on doit extraire le champ dupliqué
  const value = err.errors[0].path; // Exemple: 'nom_utilisateur'
  const message = `Duplicate field value: '${value}'. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);

// Envoi des erreurs en mode développement (plus de détails pour le débogage)
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// Envoi des erreurs en mode production (moins de détails pour l'utilisateur)
const sendErrorProd = (err, res) => {
  // Erreurs opérationnelles que nous voulons envoyer au client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // Erreurs de programmation ou autres erreurs inconnues : ne pas fuiter les détails
  } else {
    // 1) Log l'erreur
    console.error('ERROR 💥', err);

    // 2) Envoyer un message générique
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err }; // Copie l'erreur pour la modifier sans affecter l'originale
    error.message = err.message; // Copie le message

    // Gérer les erreurs spécifiques de Sequelize ou autres
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === '23505') error = handleDuplicateFieldsDB(error); // Code d'erreur PostgreSQL pour duplication
    if (error.name === 'SequelizeValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};