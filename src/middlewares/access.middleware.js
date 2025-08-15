const { AutorisationAcces, Patient, ProfessionnelSante } = require('../models');
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

/**
 * Middleware pour vérifier si le professionnel connecté a une autorisation d'accès
 * active pour le patient demandé, en utilisant le service d'accès.
 */
exports.checkMedicalRecordAccess = catchAsync(async (req, res, next) => {
    // 1. Récupérer les IDs nécessaires
    const userId = req.user.id;
    const userRole = req.user.role;
    const userType = req.user.type;
    
    // Récupérer l'ID du patient depuis différents endroits possibles
    let patientId = req.params.patient_id || req.params.patientId || req.body.patient_id;
    
    // Si pas d'ID dans les paramètres/body, essayer de le récupérer depuis le token JWT
    if (!patientId) {
        patientId = req.user.patient_id || req.user.id_patient || req.user.id;
    }

    // Pour les routes comme /api/documents/patient, si c'est un patient qui accède à ses propres données
    // et qu'aucun ID n'est spécifié, utiliser l'ID du patient connecté
    if (!patientId && (userRole === 'patient' || userType === 'patient')) {
        patientId = req.user.id;
    }

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

/**
 * Middleware pour récupérer l'identifiant du patient et du médecin concernés par l'autorisation
 * Permet une révocation plus propre et sécurisée
 */
exports.getAuthorizationContext = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id || id === 'null' || id === 'undefined') {
      return next(new AppError('ID de l\'autorisation requis et valide', 400));
    }
    
    // Conversion en nombre
    const authorizationId = parseInt(id, 10);
    if (isNaN(authorizationId) || authorizationId <= 0) {
      return next(new AppError('ID de l\'autorisation doit être un nombre valide', 400));
    }
    
    console.log(`🔍 [getAuthorizationContext] Récupération du contexte de l'autorisation ${authorizationId}`);
    
    // Récupérer l'autorisation avec les relations
    // Les modèles sont déjà importés en haut du fichier
    
    const autorisation = await AutorisationAcces.findByPk(authorizationId, {
      include: [
        {
          model: Patient,
          as: 'patientConcerne',
          attributes: ['id_patient', 'nom', 'prenom', 'date_naissance']
        },
        {
          model: ProfessionnelSante,
          as: 'professionnelDemandeur',
          attributes: ['id_professionnel', 'nom', 'prenom', 'specialite', 'numero_adeli']
        }
      ]
    });
    
    if (!autorisation) {
      return next(new AppError('Autorisation d\'accès non trouvée', 404));
    }
    
    // Ajouter le contexte de l'autorisation à la requête
    req.authorizationContext = {
      autorisation: autorisation,
      patientId: autorisation.patient_id,
      professionnelId: autorisation.professionnel_id,
      currentStatut: autorisation.statut,
      patientInfo: autorisation.patientConcerne,
      professionnelInfo: autorisation.professionnelDemandeur
    };
    
    console.log(`✅ [getAuthorizationContext] Contexte récupéré:`, {
      autorisationId: autorisation.id_acces,
      patientId: autorisation.patient_id,
      professionnelId: autorisation.professionnel_id,
      statut: autorisation.statut,
      patient: `${autorisation.patientConcerne?.nom} ${autorisation.patientConcerne?.prenom}`,
      professionnel: `${autorisation.professionnelDemandeur?.nom} ${autorisation.professionnelDemandeur?.prenom}`
    });
    
    next();
    
  } catch (error) {
    console.error('❌ [getAuthorizationContext] Erreur:', error);
    return next(new AppError('Erreur lors de la récupération du contexte de l\'autorisation', 500));
  }
};

/**
 * Middleware pour vérifier que l'utilisateur connecté peut modifier cette autorisation
 * Basé sur le contexte récupéré par getAuthorizationContext
 */
exports.checkAuthorizationOwnership = (req, res, next) => {
  try {
    const { authorizationContext } = req;
    const { user } = req;
    
    if (!authorizationContext) {
      return next(new AppError('Contexte de l\'autorisation non disponible', 500));
    }
    
    if (!user) {
      return next(new AppError('Utilisateur non authentifié', 401));
    }
    
    console.log(`🔒 [checkAuthorizationOwnership] Vérification des permissions:`, {
      userId: user.id,
      userRole: user.role,
      professionnelId: authorizationContext.professionnelId,
      patientId: authorizationContext.patientId
    });
    
    // Vérifier les permissions selon le rôle
    let hasPermission = false;
    
    if (user.role === 'admin') {
      // Les admins peuvent tout modifier
      hasPermission = true;
      console.log('✅ [checkAuthorizationOwnership] Admin - Accès autorisé');
      
    } else if (user.role === 'medecin' || user.role === 'infirmier') {
      // Les professionnels peuvent modifier leurs propres autorisations
      if (user.id_professionnel === authorizationContext.professionnelId || 
          user.id === authorizationContext.professionnelId) {
        hasPermission = true;
        console.log('✅ [checkAuthorizationOwnership] Professionnel - Accès autorisé (propre autorisation)');
      } else {
        console.log('❌ [checkAuthorizationOwnership] Professionnel - Accès refusé (autorisation d\'un autre)');
      }
      
    } else if (user.role === 'patient') {
      // Les patients peuvent modifier les autorisations les concernant
      if (user.id_patient === authorizationContext.patientId || 
          user.id === authorizationContext.patientId) {
        hasPermission = true;
        console.log('✅ [checkAuthorizationOwnership] Patient - Accès autorisé (propre dossier)');
      } else {
        console.log('❌ [checkAuthorizationOwnership] Patient - Accès refusé (dossier d\'un autre)');
      }
      
    } else {
      console.log('❌ [checkAuthorizationOwnership] Rôle non reconnu:', user.role);
    }
    
    if (!hasPermission) {
      return next(new AppError('Vous n\'avez pas les permissions pour modifier cette autorisation', 403));
    }
    
    console.log('✅ [checkAuthorizationOwnership] Permissions vérifiées avec succès');
    next();
    
  } catch (error) {
    console.error('❌ [checkAuthorizationOwnership] Erreur:', error);
    return next(new AppError('Erreur lors de la vérification des permissions', 500));
  }
};
