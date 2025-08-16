const TwoFactorService = require('../services/twoFactorService');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

/**
 * Middleware pour vérifier que l'utilisateur a activé le 2FA
 */
exports.require2FAEnabled = catchAsync(async (req, res, next) => {
  // Vérifier si l'utilisateur a activé le 2FA
  if (!req.user.twoFactorEnabled) {
    return next(new AppError(
      'L\'authentification à double facteur est requise pour cette action. Veuillez l\'activer dans vos paramètres.', 
      403
    ));
  }
  next();
});

/**
 * Middleware pour vérifier que le 2FA a été validé dans la session
 */
exports.require2FAVerified = catchAsync(async (req, res, next) => {
  // Vérifier si le 2FA a été validé pour cette session
  if (!req.session || !req.session.twoFactorVerified) {
    return next(new AppError(
      'Veuillez valider votre authentification à double facteur pour continuer.', 
      403
    ));
  }
  next();
});

/**
 * Middleware pour vérifier le 2FA avec un token fourni dans la requête
 */
exports.verify2FAToken = catchAsync(async (req, res, next) => {
  const { twoFactorToken } = req.body;
  
  if (!twoFactorToken) {
    return next(new AppError('Code d\'authentification à double facteur requis', 400));
  }

  if (!req.user.twoFactorSecret) {
    return next(new AppError('Configuration 2FA invalide', 500));
  }

  // Vérifier le token 2FA
  const isValid = TwoFactorService.verifyToken(twoFactorToken, req.user.twoFactorSecret);
  
  if (!isValid) {
    return next(new AppError('Code d\'authentification à double facteur invalide', 400));
  }

  // Marquer le 2FA comme validé pour cette session
  if (!req.session) {
    req.session = {};
  }
  req.session.twoFactorVerified = true;
  
  next();
});

/**
 * Middleware pour vérifier un code de récupération
 */
exports.verifyRecoveryCode = catchAsync(async (req, res, next) => {
  const { recoveryCode } = req.body;
  
  if (!recoveryCode) {
    return next(new AppError('Code de récupération requis', 400));
  }

  if (!req.user.recoveryCodes || !Array.isArray(req.user.recoveryCodes)) {
    return next(new AppError('Aucun code de récupération configuré', 500));
  }

  // Vérifier le code de récupération
  const verification = TwoFactorService.verifyRecoveryCode(recoveryCode, req.user.recoveryCodes);
  
  if (!verification.isValid) {
    return next(new AppError('Code de récupération invalide', 400));
  }

  // Marquer le 2FA comme validé pour cette session
  if (!req.session) {
    req.session = {};
  }
  req.session.twoFactorVerified = true;
  req.session.recoveryCodeUsed = verification.usedCode;
  
  next();
});

/**
 * Middleware combiné : vérifie que le 2FA est activé ET validé
 */
exports.require2FA = [
  exports.require2FAEnabled,
  exports.require2FAVerified
];

/**
 * Middleware pour vérifier le 2FA avec token ou code de récupération
 */
exports.verify2FA = [
  exports.require2FAEnabled,
  (req, res, next) => {
    // Si le 2FA est déjà validé dans la session, continuer
    if (req.session && req.session.twoFactorVerified) {
      return next();
    }
    
    // Sinon, vérifier le token ou le code de récupération
    if (req.body.twoFactorToken) {
      return exports.verify2FAToken(req, res, next);
    } else if (req.body.recoveryCode) {
      return exports.verifyRecoveryCode(req, res, next);
    } else {
      return next(new AppError(
        'Code d\'authentification à double facteur ou code de récupération requis', 
        400
      ));
    }
  }
];
