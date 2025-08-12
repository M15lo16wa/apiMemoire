const { AutorisationAcces } = require('../models');
const accessService = require('../modules/access/access.service');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');

/**
 * Middleware to verify DMP access token
 */
exports.verifyDMPAccessToken = catchAsync(async (req, res, next) => {
  const token = req.headers['dmp-access-token'] || req.headers['authorization']?.replace('Bearer ', '');

  if (!token) {
    return next(new AppError('Token DMP requis', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify it's a DMP access token
    if (decoded.type !== 'dmp-access') {
      return next(new AppError('Token invalide pour l\'accès DMP', 403));
    }

    // Verify the authorization still exists and is active
    const autorisation = await AutorisationAcces.findByPk(decoded.autorisationId);
    if (!autorisation || autorisation.statut !== 'actif') {
      return next(new AppError('Autorisation DMP non active', 403));
    }

    // Verify the authorization is still valid
    if (!autorisation.AccessAutorised()) {
      return next(new AppError('Autorisation DMP expirée', 403));
    }

    // Add DMP access info to request
    req.dmpAccess = {
      professionnel_id: decoded.id,
      patient_id: decoded.patientId,
      autorisation_id: decoded.autorisationId,
      access_type: decoded.accessType,
      autorisation: autorisation
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Token DMP invalide', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token DMP expiré', 401));
    }
    return next(new AppError('Erreur de vérification du token DMP', 500));
  }
});

// --- VERSION ADAPTÉE DE VOTRE MIDDLEWARE ---
/**
 * Middleware pour vérifier si le professionnel connecté a une autorisation d'accès
 * active pour le patient demandé, en utilisant le service d'accès.
 */
exports.checkMedicalRecordAccess = catchAsync(async (req, res, next) => {
    // 1. Récupérer les IDs nécessaires
    const professionnelId = req.user.id;
    const patientId = req.params.patient_id || req.params.patientId || req.body.patient_id;

    if (!patientId) {
        return next(new AppError('ID du patient manquant pour la vérification d\'accès.', 400));
    }
    if (!professionnelId) {
        return next(new AppError('ID du professionnel non identifié. Assurez-vous d\'être connecté.', 401));
    }

    // 2. Appeler le service centralisé pour vérifier le statut
    // C'est ici que nous utilisons la fonction améliorée du service
    const { accessStatus, authorization } = await accessService.checkAccess(professionnelId, patientId);

    // 3. Vérifier le résultat
    if (accessStatus !== 'active') {
        return next(new AppError("Accès refusé. Vous n'avez pas d'autorisation active pour consulter ce dossier.", 403));
    }

    // 4. (Optionnel mais recommandé) Attacher les informations d'accès à la requête
    // pour les middlewares ou contrôleurs suivants (comme le logger).
    req.authorization = authorization; // L'objet autorisation complet
    req.accessInfo = { // Garder votre structure existante
        hasAccess: true,
        accessType: authorization.type_acces,
        authorizationId: authorization.id_acces
    };

    // 5. Accès autorisé, passer à la suite
    next();
});

/**
 * Middleware to check emergency access permissions
 */
exports.checkEmergencyAccess = catchAsync(async (req, res, next) => {
  const professionnel_id = req.user.id;
  const patient_id = req.params.patient_id || req.params.patientId || req.body.patient_id;

  if (!patient_id) {
    return next(new AppError('ID patient requis', 400));
  }

  // Check for emergency authorization
  const emergencyAuth = await AutorisationAcces.findOne({
    where: {
      professionnel_id,
      patient_id,
      type_acces: 'lecture_urgence',
      statut: 'actif'
    }
  });

  if (!emergencyAuth || !emergencyAuth.AccessAutorised()) {
    return next(new AppError('Accès d\'urgence non autorisé', 403));
  }

  req.accessInfo = {
    hasAccess: true,
    accessType: 'urgence',
    authorizationId: emergencyAuth.id_acces
  };

  next();
});

/**
 * Middleware to log access to medical records
 */
exports.logMedicalRecordAccess = catchAsync(async (req, res, next) => {
  const { HistoriqueAccess } = require('../models');
  
  // Récupérer l'ID patient depuis différents emplacements possibles
  const patient_id = req.params.patient_id || req.params.patientId || req.body.patient_id;
  
  const logData = {
    date_heure_acces: new Date(),
    action: req.accessInfo?.accessType === 'urgence' ? 'acces_urgence_dossier' : 'acces_dossier_medical',
    type_ressource: 'DossierMedical',
    id_ressource: patient_id,
    details: `Accès au dossier médical du patient ${patient_id}`,
    statut: 'SUCCES',
    professionnel_id: req.user.id,
    id_patient: patient_id,
    adresse_ip: req.ip || req.connection.remoteAddress,
    user_agent: req.get('User-Agent')
  };

  // Log the access asynchronously (don't wait for it)
  HistoriqueAccess.create(logData).catch(err => {
    console.error('Erreur lors de l\'enregistrement de l\'accès:', err);
  });

  next();
});

/**
 * Middleware to check if user is a healthcare professional
 */
exports.requireHealthcareProfessional = catchAsync(async (req, res, next) => {
  if (!req.user || req.user.type !== 'professionnel') {
    return next(new AppError('Accès réservé aux professionnels de santé', 403));
  }

  // Check if professional is active
  const { ProfessionnelSante } = require('../models');
  const professionnel = await ProfessionnelSante.findByPk(req.user.id);
  
  if (!professionnel || professionnel.statut !== 'actif') {
    return next(new AppError('Professionnel de santé inactif', 403));
  }

  next();
});
