const authService = require('./auth.service');
const tokenService = require('../../services/tokenService');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const jwt = require('jsonwebtoken');
const TwoFactorService = require('../../services/twoFactorService');

// =================================================================
// === AUTHENTIFICATION STANDARD ===
// =================================================================

exports.register = catchAsync(async (req, res, next) => {
  const userData = req.body;
  const newUser = await authService.register(userData);
  
  res.status(201).json({
    status: 'success',
    message: 'Compte créé avec succès',
    data: {
      user: newUser
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, mot_de_passe } = req.body;
  
  if (!email || !mot_de_passe) {
    return next(new AppError('Veuillez fournir un email et un mot de passe', 400));
  }

  const user = await authService.login(email, mot_de_passe);
  await authService.sendAuthToken(user, 200, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  try {
    let token;
    
    // Récupérer le token depuis les headers ou cookies
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (token) {
      // Révoquer le token dans Redis
      const decoded = jwt.decode(token);
      if (decoded && decoded.id) {
        await tokenService.revokeToken(token, decoded.id);
      }
    }

    // Supprimer le cookie JWT
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      status: 'success',
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    res.status(200).json({
      status: 'success',
      message: 'Déconnexion réussie'
    });
  }
});

exports.logoutAllDevices = catchAsync(async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return next(new AppError('Utilisateur non authentifié', 401));
    }

    // Révoquer tous les tokens de l'utilisateur
    await tokenService.revokeAllUserTokens(req.user.id);

    // Supprimer le cookie JWT
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      status: 'success',
      message: 'Déconnexion de tous les appareils réussie'
    });
  } catch (error) {
    console.error('Erreur lors de la déconnexion de tous les appareils:', error);
    return next(new AppError('Erreur lors de la déconnexion', 500));
  }
});

// =================================================================
// === AUTHENTIFICATION PROFESSIONNELS DE SANTÉ ===
// =================================================================

exports.loginProfessionnel = catchAsync(async (req, res, next) => {
  const { publicIdentifier, codeCPS } = req.body;
  
  if (!publicIdentifier || !codeCPS) {
    return next(new AppError('Veuillez fournir un identifiant public et un code CPS', 400));
  }

  const professionnel = await authService.authenticateProfessionnel(publicIdentifier, codeCPS);
  
  // Générer et stocker le token avec Redis
  const token = await tokenService.generateAndStoreToken(professionnel, 'professionnel');
  
  // Définir le cookie
  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  };

  res.cookie('jwt', token, cookieOptions);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      professionnel: {
        id: professionnel.id_professionnel,
        nom: professionnel.nom,
        prenom: professionnel.prenom,
        role: professionnel.role,
        specialite: professionnel.specialite
      }
    }
  });
});

exports.logoutProfessionnel = catchAsync(async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (token) {
      const decoded = jwt.decode(token);
      if (decoded && decoded.id) {
        await tokenService.revokeToken(token, decoded.id);
      }
    }

    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      status: 'success',
      message: 'Déconnexion professionnel réussie'
    });
  } catch (error) {
    console.error('Erreur lors de la déconnexion professionnel:', error);
    res.status(200).json({
      status: 'success',
      message: 'Déconnexion professionnel réussie'
    });
  }
});

// =================================================================
// === AUTHENTIFICATION PATIENTS ===
// =================================================================

exports.loginPatient = catchAsync(async (req, res, next) => {
  const { numeroSecu, dateNaissance } = req.body;
  
  if (!numeroSecu || !dateNaissance) {
    return next(new AppError('Veuillez fournir un numéro de sécurité sociale et une date de naissance', 400));
  }

  const patient = await authService.authenticatePatient(numeroSecu, dateNaissance);
  
  // Générer et stocker le token avec Redis
  const token = await tokenService.generateAndStoreToken(patient, 'patient');
  
  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  };

  res.cookie('jwt', token, cookieOptions);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      patient: {
        id: patient.id_patient,
        nom: patient.nom,
        prenom: patient.prenom,
        dateNaissance: patient.date_naissance
      }
    }
  });
});

exports.logoutPatient = catchAsync(async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (token) {
      const decoded = jwt.decode(token);
      if (decoded && decoded.id) {
        await tokenService.revokeToken(token, decoded.id);
      }
    }

    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      status: 'success',
      message: 'Déconnexion patient réussie'
    });
  } catch (error) {
    console.error('Erreur lors de la déconnexion patient:', error);
    res.status(200).json({
      status: 'success',
      message: 'Déconnexion patient réussie'
    });
  }
});

// =================================================================
// === ROUTES DE GESTION DES SESSIONS ===
// =================================================================

exports.getSessionInfo = catchAsync(async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return next(new AppError('Utilisateur non authentifié', 401));
  }

  const session = await tokenService.getUserSession(req.user.id);
  
  res.status(200).json({
    status: 'success',
    data: {
      session,
      user: req.user
    }
  });
});

exports.getRedisStats = catchAsync(async (req, res, next) => {
  const stats = await tokenService.getStats();
  
  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

// =================================================================
// === ROUTES 2FA (AUTHENTIFICATION À DOUBLE FACTEUR) ===
// =================================================================

/**
 * Configuration initiale du 2FA pour un utilisateur
 */
exports.setup2FA = catchAsync(async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return next(new AppError('Utilisateur non authentifié', 401));
  }

  // Vérifier si le 2FA est déjà configuré
  if (req.user.twoFactorEnabled) {
    return next(new AppError('Le 2FA est déjà configuré pour ce compte', 400));
  }

  // Générer un nouveau secret
  const secret = TwoFactorService.generateSecret(req.user.email);
  
  // Générer le QR code
  const qrCode = await TwoFactorService.generateQRCode(
    req.user.email, 
    secret, 
    'DMP Platform'
  );

  // Générer des codes de récupération
  const recoveryCodes = TwoFactorService.generateRecoveryCodes(5);

  // Stocker temporairement le secret et les codes (pas encore activé)
  // TODO: Implémenter le stockage en base de données
  
  res.status(200).json({
    status: 'success',
    message: 'Configuration 2FA initialisée',
    data: {
      qrCode,
      secret, // À retirer en production
      recoveryCodes,
      message: 'Scannez le QR code avec votre app authenticator, puis validez avec un code'
    }
  });
});

/**
 * Validation du 2FA avec un code
 */
exports.verify2FA = catchAsync(async (req, res, next) => {
  const { token } = req.body;
  
  if (!token) {
    return next(new AppError('Code 2FA requis', 400));
  }

  if (!req.user.twoFactorSecret) {
    return next(new AppError('Configuration 2FA invalide', 500));
  }

  // Vérifier le token
  const isValid = TwoFactorService.verifyToken(token, req.user.twoFactorSecret);
  
  if (!isValid) {
    return next(new AppError('Code 2FA invalide', 400));
  }

  // Activer le 2FA pour l'utilisateur
  // TODO: Mettre à jour la base de données
  
  // Marquer la session comme validée
  if (!req.session) {
    req.session = {};
  }
  req.session.twoFactorVerified = true;

  res.status(200).json({
    status: 'success',
    message: '2FA activé avec succès',
    data: {
      twoFactorEnabled: true
    }
  });
});

/**
 * Désactivation du 2FA
 */
exports.disable2FA = catchAsync(async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return next(new AppError('Utilisateur non authentifié', 401));
  }

  // TODO: Implémenter la désactivation en base de données
  
  res.status(200).json({
    status: 'success',
    message: '2FA désactivé avec succès',
    data: {
      twoFactorEnabled: false
    }
  });
});

/**
 * Validation du 2FA pour une session
 */
exports.validate2FASession = catchAsync(async (req, res, next) => {
  const { twoFactorToken } = req.body;
  
  if (!twoFactorToken) {
    return next(new AppError('Code 2FA requis', 400));
  }

  if (!req.user.twoFactorSecret) {
    return next(new AppError('Configuration 2FA invalide', 500));
  }

  // Vérifier le token
  const isValid = TwoFactorService.verifyToken(twoFactorToken, req.user.twoFactorSecret);
  
  if (!isValid) {
    return next(new AppError('Code 2FA invalide', 400));
  }

  // Marquer la session comme validée
  if (!req.session) {
    req.session = {};
  }
  req.session.twoFactorVerified = true;

  res.status(200).json({
    status: 'success',
    message: 'Session 2FA validée',
    data: {
      twoFactorVerified: true
    }
  });
});

/**
 * Génération de nouveaux codes de récupération
 */
exports.generateRecoveryCodes = catchAsync(async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return next(new AppError('Utilisateur non authentifié', 401));
  }

  const recoveryCodes = TwoFactorService.generateRecoveryCodes(5);
  
  // TODO: Mettre à jour la base de données avec les nouveaux codes
  
  res.status(200).json({
    status: 'success',
    message: 'Nouveaux codes de récupération générés',
    data: {
      recoveryCodes
    }
  });
});

/**
 * Validation d'un code de récupération
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

  // Marquer la session comme validée
  if (!req.session) {
    req.session = {};
  }
  req.session.twoFactorVerified = true;
  req.session.recoveryCodeUsed = verification.usedCode;

  res.status(200).json({
    status: 'success',
    message: 'Code de récupération validé',
    data: {
      twoFactorVerified: true,
      recoveryCodeUsed: verification.usedCode
    }
  });
});