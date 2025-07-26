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
      new AppError('Vous n\'êtes pas connecté! Veuillez vous connecter pour accéder à votre DMP.', 401)
    );
  }

  // 2) Verification token with specific error handling
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Token invalide. Veuillez vous reconnecter.', 401));
    } else if (error.name === 'TokenExpiredError') {
      return next(new AppError('Votre session a expiré. Veuillez vous reconnecter à votre DMP.', 401));
    } else if (error.name === 'NotBeforeError') {
      return next(new AppError('Token non encore valide.', 401));
    }
    return next(new AppError('Erreur d\'authentification.', 401));
  }

  // 3) Check if patient still exists
  const currentPatient = await Patient.findByPk(decoded.id);
  if (!currentPatient) {
    return next(
      new AppError('Le patient propriétaire de ce token n\'existe plus.', 401)
    );
  }

  // 4) Check if patient account is active (commented for testing)
  /*
  if (currentPatient.statut_compte !== 'actif') {
    return next(
      new AppError('Votre compte DMP n\'est pas actif. Veuillez contacter l\'administration.', 403)
    );
  }
  */

  // 5) Check if patient has access to DMP
  if (currentPatient.acces_dmp === false) {
    return next(
      new AppError('Votre accès au DMP a été révoqué. Contactez votre médecin traitant.', 403)
    );
  }

  // 6) Check if DMP access has not expired (if applicable)
  if (currentPatient.acces_expire && new Date() > currentPatient.acces_expire) {
    return next(
      new AppError('Votre accès au DMP a expiré. Veuillez contacter votre médecin traitant.', 403)
    );
  }

  // 7) Check if password was changed after token was issued
  if (currentPatient.password_changed_at) {
    const passwordChangedTimestamp = parseInt(
      currentPatient.password_changed_at.getTime() / 1000,
      10
    );
    if (decoded.iat < passwordChangedTimestamp) {
      return next(
        new AppError('Mot de passe récemment modifié. Veuillez vous reconnecter.', 401)
      );
    }
  }

  // 8) Security audit logging for DMP access
  console.log(`[DMP ACCESS] Patient ID: ${currentPatient.id}, IP: ${req.ip}, User-Agent: ${req.get('User-Agent')}, Timestamp: ${new Date().toISOString()}`);

  // 9) Update last access timestamp for security monitoring
  try {
    await currentPatient.update({
      derniere_connexion: new Date(),
      derniere_ip: req.ip
    });
  } catch (error) {
    // Log error but don't block access
    console.error('Erreur mise à jour dernière connexion:', error);
  }

  // 10) Set req.patient and req.user for compatibility with getPatient
  req.patient = currentPatient;
  req.user = {
    role: 'patient',
    id_patient: currentPatient.id_patient
  };
  res.locals.patient = currentPatient; // Available in views if needed

  next();
});

module.exports = patientAuth;