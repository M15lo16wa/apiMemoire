const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { Utilisateur } = require('../models');

// Middleware pour protéger les routes (vérifie si l'utilisateur est connecté)
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Vérifier si le token existe
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // 2) Nettoyer le token des guillemets et apostrophes
  if (token.startsWith('"') && token.endsWith('"')) {
    token = token.slice(1, -1);
  }
  if (token.startsWith("'") && token.endsWith("'")) {
    token = token.slice(1, -1);
  }

  // 3) Vérifier la validité du token
  let decoded;
  try {
    decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', 401));
    } else if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired. Please log in again.', 401));
    } else {
      return next(new AppError('Token verification failed. Please log in again.', 401));
    }
  }

  // 4) Vérifier si l'utilisateur existe toujours
  const currentUser = await Utilisateur.findByPk(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  // 5) Vérifier si l'utilisateur est actif
  if (currentUser.statut !== 'actif') {
    return next(new AppError('Your account is not active. Please contact an administrator.', 401));
  }

  // 6) Grant access to protected route
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// Alias pour authenticateToken (compatibilité avec les modules existants)
exports.authenticateToken = exports.protect;

// Middleware pour restreindre l'accès en fonction des rôles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user doit être défini par le middleware 'protect'
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};