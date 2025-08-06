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
    console.log('🔍 Token décodé:', decoded);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', 401));
    } else if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired. Please log in again.', 401));
    } else {
      return next(new AppError('Token verification failed. Please log in again.', 401));
    }
  }

  // 4) Gestion fine selon le contenu du token
  const { ProfessionnelSante, Utilisateur, Patient } = require('../models');
  const professionnelId = decoded.professionnel_id || decoded.id_professionnel;
  console.log('🔍 Token décodé:', decoded);
  console.log('🔍 Professionnel ID recherché:', professionnelId);
  console.log('🔍 Rôle dans le token:', decoded.role);

  // Vérifier si c'est un token patient
  if (decoded.role === 'patient' && decoded.id) {
    console.log('🔍 Token patient détecté, ID:', decoded.id);
    const patient = await Patient.findByPk(decoded.id);
    if (!patient) {
      return next(new AppError('Le patient lié à ce token n\'existe plus.', 401));
    }
    if (patient.acces_dmp === false) {
      return next(new AppError('Votre accès au DMP a été révoqué.', 403));
    }
    console.log('✅ Patient trouvé:', {
      id: patient.id_patient,
      nom: patient.nom,
      prenom: patient.prenom,
      acces_dmp: patient.acces_dmp
    });
    req.user = {
      role: 'patient',
      id_patient: patient.id_patient,
      ...patient.toJSON()
    };
    req.patient = patient;
    res.locals.user = req.user;
    return next();
  } else if (professionnelId && decoded.professionnel_id) {
    // Cas professionnel de santé (clé compatible)
    const professionnel = await ProfessionnelSante.findByPk(professionnelId);
    if (!professionnel) {
      return next(new AppError('Le professionnel de santé lié à ce token n\'existe plus.', 401));
    }
    if (professionnel.statut !== 'actif') {
      return next(new AppError('Votre compte professionnel n\'est pas actif.', 401));
    }
    console.log('🔍 Professionnel trouvé:', {
      id: professionnel.id_professionnel,
      nom: professionnel.nom,
      prenom: professionnel.prenom,
      role: professionnel.role,
      statut: professionnel.statut
    });
    req.user = professionnel;
    req.professionnel = professionnel;
    res.locals.user = professionnel;
    return next();
  } else if (decoded.id) {
    // Cas utilisateur classique
    const currentUser = await Utilisateur.findByPk(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }
    if (currentUser.statut !== 'actif') {
      return next(new AppError('Your account is not active. Please contact an administrator.', 401));
    }
    req.user = currentUser;
    res.locals.user = currentUser;
    return next();
  } else {
    return next(new AppError('Token invalide ou incomplet.', 401));
  }
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
    
    console.log('🔍 Vérification des rôles:');
    console.log('📋 Rôles requis:', roles);
    console.log('📋 Utilisateur:', {
      id: req.user.id_professionnel || req.user.id,
      role: req.user.role,
      role_utilisateur: req.user.role_utilisateur
    });
    
    // Vérifier si l'utilisateur a un rôle
    const userRole = req.user.role || req.user.role_utilisateur;
    if (!userRole) {
      console.log('❌ Aucun rôle défini pour l\'utilisateur');
      return next(new AppError('User role not defined', 403));
    }
    
    console.log('📋 Rôle de l\'utilisateur:', userRole);
    console.log('📋 Rôles autorisés:', roles);
    console.log('📋 Accès autorisé:', roles.includes(userRole));
    
    if (!roles.includes(userRole)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};