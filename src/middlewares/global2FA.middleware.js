/**
 * Middleware global pour la vérification automatique des exigences 2FA
 * Ce middleware s'applique à toutes les routes et vérifie automatiquement
 * si la 2FA est requise selon la configuration
 */

const { get2FARequirement } = require('../config/2fa-protected-routes');
const TwoFactorMiddleware = require('./twoFactor.middleware');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

/**
 * Middleware principal pour la vérification automatique 2FA
 * Vérifie si la route nécessite la 2FA et applique les vérifications appropriées
 */
exports.global2FACheck = catchAsync(async (req, res, next) => {
  // 1. Vérifier si la route nécessite la 2FA
  const { requires2FA, level } = get2FARequirement(req.path, req.method);
  
  if (!requires2FA) {
    return next(); // Pas de 2FA requis, continuer
  }

  // 2. Vérifier que l'utilisateur est authentifié
  if (!req.user && !req.professionnel) {
    return next(new AppError('Authentification requise pour cette route', 401));
  }

  // 3. Déterminer le type d'utilisateur et ses informations 2FA
  let userInfo = null;
  let userType = null;

  if (req.user) {
    userInfo = req.user;
    userType = 'utilisateur';
  } else if (req.professionnel) {
    userInfo = req.professionnel;
    userType = 'professionnel';
  }

  // 4. Vérifier si la 2FA est activée pour cet utilisateur
  if (!userInfo.two_factor_enabled) {
    return next(new AppError(
      `L'authentification à double facteur est requise pour cette route. Veuillez l'activer dans vos paramètres de sécurité.`,
      403
    ));
  }

  // 5. Appliquer la vérification 2FA selon le niveau de sécurité
  if (level === 'critical') {
    // Pour les routes critiques, toujours demander la vérification 2FA
    return TwoFactorMiddleware.require2FAVerified(req, res, next);
  } else if (level === 'sensitive') {
    // Pour les routes sensibles, vérifier si la session 2FA est encore valide
    return TwoFactorMiddleware.require2FAVerified(req, res, next);
  }

  next();
});

/**
 * Middleware pour forcer la vérification 2FA sur une route spécifique
 * Utile pour les routes qui nécessitent toujours une vérification 2FA
 * même si elle n'est pas configurée comme critique
 */
exports.force2FAVerification = catchAsync(async (req, res, next) => {
  // Vérifier que l'utilisateur est authentifié
  if (!req.user && !req.professionnel) {
    return next(new AppError('Authentification requise', 401));
  }

  // Forcer la vérification 2FA
  return TwoFactorMiddleware.require2FAVerified(req, res, next);
});

/**
 * Middleware pour vérifier la 2FA uniquement si elle est activée
 * Utile pour les routes qui peuvent fonctionner avec ou sans 2FA
 */
exports.conditional2FACheck = catchAsync(async (req, res, next) => {
  // Vérifier que l'utilisateur est authentifié
  if (!req.user && !req.professionnel) {
    return next(new AppError('Authentification requise', 401));
  }

  let userInfo = null;
  if (req.user) {
    userInfo = req.user;
  } else if (req.professionnel) {
    userInfo = req.professionnel;
  }

  // Si la 2FA est activée, l'appliquer
  if (userInfo.two_factor_enabled) {
    return TwoFactorMiddleware.require2FAVerified(req, res, next);
  }

  // Sinon, continuer sans 2FA
  next();
});

/**
 * Middleware pour logger les tentatives d'accès aux routes protégées 2FA
 */
exports.log2FAAccess = catchAsync(async (req, res, next) => {
  const { requires2FA, level } = get2FARequirement(req.path, req.method);
  
  if (requires2FA) {
    const userInfo = req.user || req.professionnel;
    const userType = req.user ? 'utilisateur' : 'professionnel';
    
    console.log(`[2FA ACCESS LOG] Route: ${req.method} ${req.path}, Niveau: ${level}, Utilisateur: ${userType} ID: ${userInfo?.id || userInfo?.id_professionnel}, IP: ${req.ip}, Timestamp: ${new Date().toISOString()}`);
  }
  
  next();
});

/**
 * Middleware pour vérifier la 2FA avec gestion des erreurs spécifiques
 */
exports.smart2FACheck = catchAsync(async (req, res, next) => {
  try {
    const { requires2FA, level } = get2FARequirement(req.path, req.method);
    
    if (!requires2FA) {
      return next();
    }

    // Vérifier l'authentification de base
    if (!req.user && !req.professionnel) {
      return next(new AppError('Authentification requise', 401));
    }

    let userInfo = req.user || req.professionnel;
    
    // Vérifier si la 2FA est activée
    if (!userInfo.two_factor_enabled) {
      return next(new AppError(
        'Cette action nécessite l\'activation de l\'authentification à double facteur. Veuillez l\'activer dans vos paramètres de sécurité.',
        403
      ));
    }

    // Appliquer la vérification 2FA
    return TwoFactorMiddleware.require2FAVerified(req, res, next);
    
  } catch (error) {
    console.error('[2FA MIDDLEWARE ERROR]', error);
    return next(new AppError('Erreur lors de la vérification 2FA', 500));
  }
});

module.exports = exports;
