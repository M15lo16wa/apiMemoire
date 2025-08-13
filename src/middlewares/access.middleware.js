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
    const userId = req.user.id;
    const userRole = req.user.role;
    const userType = req.user.type;
    const patientId = req.params.patient_id || req.params.patientId || req.body.patient_id;

    if (!patientId) {
        return next(new AppError('ID du patient manquant pour la vérification d\'accès.', 400));
    }

    // 2. Vérifier si c'est un patient qui accède à ses propres données
    if (userRole === 'patient' || userType === 'patient') {
        const patientUserId = req.user.id_patient || req.user.id;
        
        if (parseInt(patientId) === parseInt(patientUserId)) {
            // Le patient accède à ses propres données - autorisé
            req.accessInfo = {
                hasAccess: true,
                accessType: 'patient_own_data',
                authorizationId: null,
                isPatientAccess: true
            };
            return next();
        } else {
            return next(new AppError("Accès refusé. Un patient ne peut accéder qu'à ses propres données.", 403));
        }
    }

    // 3. Si c'est un professionnel, vérifier l'autorisation
    if (userRole === 'professionnel' || userType === 'professionnel' || req.professionnel) {
        const professionnelId = req.user.id_professionnel || req.user.id;
        
        if (!professionnelId) {
            return next(new AppError('ID du professionnel non identifié. Assurez-vous d\'être connecté.', 401));
        }

        // Appeler le service centralisé pour vérifier le statut
        const { accessStatus, authorization } = await accessService.checkAccess(professionnelId, patientId);

        // Vérifier le résultat
        if (accessStatus !== 'active') {
            return next(new AppError("Accès refusé. Vous n'avez pas d'autorisation active pour consulter ce dossier.", 403));
        }

        // Attacher les informations d'accès à la requête
        req.authorization = authorization;
        req.accessInfo = {
            hasAccess: true,
            accessType: authorization.type_acces,
            authorizationId: authorization.id_acces,
            isPatientAccess: false
        };
        
        return next();
    }

    // 4. Si aucun des cas ci-dessus, accès refusé
    return next(new AppError('Type d\'utilisateur non reconnu ou accès non autorisé.', 403));
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
  
  // Déterminer l'action selon le type d'accès
  let action = 'acces_dossier_medical';
  if (req.accessInfo?.accessType === 'urgence') {
    action = 'acces_urgence_dossier';
  } else if (req.accessInfo?.isPatientAccess) {
    action = 'acces_patient_propre_dossier';
  }
  
  const logData = {
    date_heure_acces: new Date(),
    action: action,
    type_ressource: 'DossierMedical',
    id_ressource: patient_id,
    details: `Accès au dossier médical du patient ${patient_id}`,
    statut: 'SUCCES',
    professionnel_id: req.accessInfo?.isPatientAccess ? null : req.user.id_professionnel || req.user.id,
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
