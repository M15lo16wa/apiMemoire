const jwt = require('jsonwebtoken');
const { Patient } = require('../models');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const patientAuth = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('Vous n\'êtes pas connecté! Veuillez vous connecter pour accéder.', 401)
    );
  }

  // 2) Verification token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3) Check if patient still exists
  const currentPatient = await Patient.findByPk(decoded.id);
  if (!currentPatient) {
    return next(
      new AppError('Le patient propriétaire de ce token n\'existe plus.', 401)
    );
  }

  // 4) Check if patient account is active
  if (currentPatient.statut_compte !== 'actif') {
    return next(
      new AppError('Votre compte n\'est pas actif. Veuillez contacter l\'administration.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.patient = currentPatient;
  next();
});

module.exports = patientAuth;
