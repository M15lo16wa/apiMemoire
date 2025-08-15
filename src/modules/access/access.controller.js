const accessService = require('./access.service');
const { AutorisationAcces, HistoriqueAccess } = require('../../models');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');

/**
 * Create a new authorization access
 */
exports.createAuthorizationAccess = catchAsync(async (req, res, next) => {
  const { typeAcces, date_debut, date_fin, statut, raison, patient_id, professionnel_id } = req.body;

  if (!typeAcces || !patient_id || !professionnel_id) {
    return next(new AppError('Type d\'accès, ID patient et ID professionnel sont requis', 400));
  }

  const newAuthAccess = await accessService.createAuthorizationAccess({
    typeAcces,
    date_debut: date_debut || new Date(),
    date_fin,
    statut: statut || 'Actif',
    raison,
    patient_id,
    professionnel_id,
    autorisateur_id: req.user?.id // ID de l'utilisateur qui accorde l'autorisation
  });

  res.status(201).json({
    status: 'success',
    data: {
      authorizationAccess: newAuthAccess,
    },
  });
});

/**
 * Get all authorization access records
 */
exports.getAllAuthorizationAccess = catchAsync(async (req, res, next) => {
  const authAccess = await accessService.getAllAuthorizationAccess();
  
  res.status(200).json({
    status: 'success',
    results: authAccess.length,
    data: {
      authorizationAccess: authAccess,
    },
  });
});

/**
 * Create a new history access record
 */
exports.createHistoryAccess = catchAsync(async (req, res, next) => {
  const { 
    action, 
    type_ressource, 
    id_ressource, 
    details, 
    statut,
    professionnel_id,
    id_patient,
    id_dossier 
  } = req.body;

  if (!action) {
    return next(new AppError('L\'action est requise', 400));
  }

  // Extract IP and User Agent from request
  const adresse_ip = req.ip || req.connection.remoteAddress;
  const user_agent = req.get('User-Agent');

  const newHistoryAccess = await accessService.createHistoryAccess({
    date_heure_acces: new Date(),
    action,
    type_ressource,
    id_ressource,
    details,
    statut: statut || 'SUCCES',
    adresse_ip,
    user_agent,
    professionnel_id,
    id_patient,
    id_dossier,
    id_utilisateur: req.user?.id,
    createdBy: req.user?.id
  });

  res.status(201).json({
    status: 'success',
    data: {
      historyAccess: newHistoryAccess,
    },
  });
});

/**
 * Get all history access records
 */
exports.getAllHistoryAccess = catchAsync(async (req, res, next) => {
  const historyAccess = await accessService.getAllHistoryAccess();
  
  res.status(200).json({
    status: 'success',
    results: historyAccess.length,
    data: {
      historyAccess: historyAccess,
    },
  });
});

/**
 * Get history access records by patient ID
 */
exports.getHistoryAccessByPatient = catchAsync(async (req, res, next) => {
  const { patientId } = req.params;
  
  if (!patientId) {
    return next(new AppError('ID patient est requis', 400));
  }

  const historyAccess = await HistoriqueAccess.findAll({
    where: { id_patient: patientId },
    order: [['date_heure_acces', 'DESC']]
  });
  
  res.status(200).json({
    status: 'success',
    results: historyAccess.length,
    data: {
      historyAccess: historyAccess,
    },
  });
});

/**
 * Get authorization access records by patient ID
 */
exports.getAuthorizationAccessByPatient = catchAsync(async (req, res, next) => {
  const { patientId } = req.params;
  
  if (!patientId) {
    return next(new AppError('ID patient est requis', 400));
  }

  const authAccess = await accessService.getAuthorizationAccessByPatient(patientId);
  
  res.status(200).json({
    status: 'success',
    results: authAccess.length,
    data: {
      authorizationAccess: authAccess,
    },
  });
});

/**
 * Get authorization access by ID
 */
exports.getAuthorizationAccessById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const authAccess = await accessService.getAuthorizationAccessById(id);
  
  res.status(200).json({
    status: 'success',
    data: {
      authorizationAccess: authAccess,
    },
  });
});

/**
 * Update authorization access
 */
exports.updateAuthorizationAccess = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;
  const { authorizationContext } = req;
  
  console.log('🔄 [updateAuthorizationAccess] Mise à jour autorisation', {
    id,
    updateData,
    user: req.user?.role,
    userId: req.user?.id,
    context: {
      patientId: authorizationContext?.patientId,
      professionnelId: authorizationContext?.professionnelId,
      currentStatut: authorizationContext?.currentStatut
    }
  });
  
  // Validation des données de mise à jour
  if (updateData.statut && !['actif', 'inactif', 'attente_validation', 'refuse', 'expire'].includes(updateData.statut)) {
    return next(new AppError('Statut invalide. Valeurs autorisées: actif, inactif, attente_validation, refuse, expire', 400));
  }
  
  // Validation spécifique pour le statut 'expire'
  if (updateData.statut === 'expire') {
    if (!updateData.raison_demande && !updateData.motif_revocation) {
      return next(new AppError('Une raison est requise lors de l\'expiration d\'une autorisation', 400));
    }
    
    // Si le statut passe à 'expire', mettre à jour automatiquement la date de fin
    if (!updateData.date_fin) {
      updateData.date_fin = new Date();
    }
    
    console.log('📅 [updateAuthorizationAccess] Expiration automatique configurée:', {
      date_fin: updateData.date_fin,
      raison: updateData.raison_demande || updateData.motif_revocation
    });
  }
  
  // Ajouter des informations de traçabilité
  const updateDataWithTrace = {
    ...updateData,
    updatedBy: req.user?.id,
    updatedAt: new Date()
  };
  
  const updatedAuthAccess = await accessService.updateAuthorizationAccess(id, updateDataWithTrace);
  
  console.log('✅ [updateAuthorizationAccess] Autorisation mise à jour avec succès', {
    id,
    oldStatut: authorizationContext?.currentStatut,
    newStatut: updatedAuthAccess.statut,
    updatedBy: req.user?.id,
    patient: `${authorizationContext?.patientInfo?.nom} ${authorizationContext?.patientInfo?.prenom}`,
    professionnel: `${authorizationContext?.professionnelInfo?.nom} ${authorizationContext?.professionnelInfo?.prenom}`
  });
  
  // Créer un historique de la modification
  try {
    const historyData = {
      date_heure_acces: new Date(),
      action: 'modification_autorisation',
      type_ressource: 'AutorisationAcces',
      id_ressource: id,
      details: `Modification de l'autorisation ${id} - Statut: ${authorizationContext?.currentStatut} → ${updatedAuthAccess.statut}`,
      statut: 'SUCCES',
      professionnel_id: authorizationContext?.professionnelId,
      id_patient: authorizationContext?.patientId,
      adresse_ip: req.ip || req.connection.remoteAddress,
      user_agent: req.get('User-Agent'),
      id_utilisateur: req.user?.id,
      createdBy: req.user?.id
    };
    
    await accessService.createHistoryAccess(historyData);
    console.log('📝 [updateAuthorizationAccess] Historique créé avec succès');
    
  } catch (historyError) {
    console.warn('⚠️ [updateAuthorizationAccess] Erreur lors de la création de l\'historique:', historyError.message);
    // Ne pas faire échouer la mise à jour à cause de l'historique
  }
  
  res.status(200).json({
    status: 'success',
    message: 'Autorisation mise à jour avec succès',
    data: {
      authorizationAccess: updatedAuthAccess,
      context: {
        patientInfo: authorizationContext?.patientInfo,
        professionnelInfo: authorizationContext?.professionnelInfo,
        modificationDetails: {
          oldStatut: authorizationContext?.currentStatut,
          newStatut: updatedAuthAccess.statut,
          updatedBy: req.user?.id,
          updatedAt: updatedAuthAccess.updatedAt
        }
      }
    },
  });
});

/**
 * Revoke authorization access
 */
exports.revokeAuthorizationAccess = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;
  
  // Passer l'utilisateur connecté au service
  const revokedAuthAccess = await accessService.revokeAuthorizationAccess(id, reason, req.user);
  
  res.status(200).json({
    status: 'success',
    message: 'Autorisation révoquée avec succès',
    data: {
      authorizationAccess: revokedAuthAccess,
    },
  });
});

/**
 * Check access permission
 */
exports.checkAccess = catchAsync(async (req, res, next) => {
  const { professionnelId, patientId, typeAcces } = req.params;
  
  // Utiliser la fonction avec 2 paramètres comme définie dans le service
  const accessResult = await accessService.checkAccess(professionnelId, patientId);
  
  res.status(200).json({
    status: 'success',
    data: {
      hasAccess: accessResult.accessStatus === 'active',
      accessStatus: accessResult.accessStatus,
      authorization: accessResult.authorization,
      message: accessResult.accessStatus === 'active' ? 'Accès autorisé' : 'Accès refusé'
    },
  });
});

/**
 * Log access attempt
 */
exports.logAccess = catchAsync(async (req, res, next) => {
  // Extract IP and User Agent from request
  const logData = {
    ...req.body,
    adresse_ip: req.ip || req.connection.remoteAddress,
    user_agent: req.get('User-Agent'),
    id_utilisateur: req.user?.id,
    createdBy: req.user?.id
  };

  const logEntry = await accessService.logAccess(logData);
  
  res.status(201).json({
    status: 'success',
    data: {
      logEntry: logEntry,
    },
  });
});

/**
 * Request standard access to patient medical record
 */
exports.requestStandardAccess = catchAsync(async (req, res, next) => {
  const { patient_id, raison_demande } = req.body;
  const professionnel_id = req.user.id;

  console.log('➡️ [requestStandardAccess] Entrée', {
    professionnel_id,
    role: req.user?.role,
    body: { patient_id, raison_demande }
  });

  if (!patient_id) {
    return next(new AppError('ID patient requis', 400));
  }

  try {
    const autorisation = await accessService.requestStandardAccess({
      professionnel_id,
      patient_id,
      raison_demande
    });

    console.log('✅ [requestStandardAccess] Autorisation créée', {
      id_acces: autorisation?.id_acces,
      statut: autorisation?.statut
    });

    res.status(201).json({
      status: 'success',
      message: 'Demande d\'accès envoyée avec succès',
      data: {
        autorisation
      }
    });
  } catch (error) {
    console.error('❌ [requestStandardAccess] Erreur', {
      name: error.name,
      message: error.message,
      errors: error.errors,
      stack: error.stack
    });
    return next(error);
  }
});

/**
 * Grant emergency access to patient medical record
 */
exports.grantEmergencyAccess = catchAsync(async (req, res, next) => {
  const { patient_id, justification_urgence } = req.body;
  const professionnel_id = req.user.id;

  if (!patient_id || !justification_urgence) {
    return next(new AppError('ID patient et justification d\'urgence requis', 400));
  }

  const result = await accessService.grantEmergencyAccess({
    professionnel_id,
    patient_id,
    justification_urgence
  });

  res.status(201).json({
    status: 'success',
    message: 'Accès d\'urgence accordé',
    data: {
      autorisation: result.autorisation,
      dmp_token: result.dmp_token,
      expires_in: result.expires_in
    }
  });
});

/**
 * Grant secret access to patient medical record
 */
exports.grantSecretAccess = catchAsync(async (req, res, next) => {
  const { patient_id, raison_secrete } = req.body;
  const professionnel_id = req.user.id;

  if (!patient_id) {
    return next(new AppError('ID patient requis', 400));
  }

  const result = await accessService.grantSecretAccess({
    professionnel_id,
    patient_id,
    raison_secrete
  });

  res.status(201).json({
    status: 'success',
    message: 'Accès secret accordé',
    data: {
      autorisation: result.autorisation,
      dmp_token: result.dmp_token,
      expires_in: result.expires_in
    }
  });
});

/**
 * Process patient response to access request (patient endpoint)
 */
exports.processPatientResponse = catchAsync(async (req, res, next) => {
  const { authorizationId } = req.params;
  const { response, comment } = req.body;
  const patientId = req.patient.id_patient;

  if (!response || !['accept', 'refuse'].includes(response)) {
    return next(new AppError('Réponse invalide. Doit être "accept" ou "refuse"', 400));
  }

  // Verify that the authorization belongs to this patient
  const { AutorisationAcces } = require('../../models');
  const autorisation = await AutorisationAcces.findOne({
    where: {
      id_acces: authorizationId,
      patient_id: patientId,
      statut: 'attente_validation'
    }
  });

  if (!autorisation) {
    return next(new AppError('Demande d\'autorisation non trouvée ou déjà traitée', 404));
  }

  const result = await accessService.processPatientResponse(authorizationId, patientId, response, comment);

  const responseData = {
    autorisation: result.autorisation
  };

  // Include DMP token if access was accepted
  if (response === 'accept' && result.dmp_token) {
    responseData.dmp_token = result.dmp_token;
    responseData.expires_in = result.expires_in;
  }

  res.status(200).json({
    status: 'success',
    message: `Demande ${response === 'accept' ? 'acceptée' : 'refusée'} avec succès`,
    data: responseData
  });
});

/**
 * Generate DMP access token for existing authorization
 */
exports.generateDMPAccessToken = catchAsync(async (req, res, next) => {
  const { authorizationId } = req.params;
  const professionnel_id = req.user.id;

  // Verify that the authorization belongs to this professional
  const autorisation = await AutorisationAcces.findOne({
    where: {
      id_acces: authorizationId,
      professionnel_id,
      statut: 'actif'
    }
  });

  if (!autorisation) {
    return next(new AppError('Autorisation non trouvée ou non active', 404));
  }

  const result = await accessService.generateDMPAccessToken(authorizationId);

  res.status(200).json({
    status: 'success',
    message: 'Token DMP généré avec succès',
    data: {
      dmp_token: result.dmp_token,
      expires_in: result.expires_in,
      autorisation: result.autorisation
    }
  });
});

/**
 * Get pending access requests for a patient (patient endpoint)
 */
exports.getPatientPendingRequests = catchAsync(async (req, res, next) => {
  const patientId = req.patient.id_patient;

  const pendingRequests = await accessService.getPendingRequests(patientId);

  res.status(200).json({
    status: 'success',
    results: pendingRequests.length,
    data: {
      pendingRequests
    }
  });
});

/**
 * Get access history for a professional
 */
exports.getProfessionalAccessHistory = catchAsync(async (req, res, next) => {
  const professionnel_id = req.user.id;

  const history = await HistoriqueAccess.findAll({
    where: { professionnel_id },
    order: [['date_heure_acces', 'DESC']],
    limit: 50
  });

  res.status(200).json({
    status: 'success',
    results: history.length,
    data: {
      history
    }
  });
});

/**
 * Get access history for a patient (patient endpoint)
 */
exports.getPatientAccessHistory = catchAsync(async (req, res, next) => {
  const patientId = req.patient.id_patient;

  const { HistoriqueAccess } = require('../../models');
  const history = await HistoriqueAccess.findAll({
    where: { id_patient: patientId },
    order: [['date_heure_acces', 'DESC']],
    limit: 50
  });

  res.status(200).json({
    status: 'success',
    results: history.length,
    data: {
      history
    }
  });
});

/**
 * Get active authorizations for a patient (patient endpoint)
 */
exports.getPatientActiveAuthorizations = catchAsync(async (req, res, next) => {
  console.log('--- [1] Entrée dans le contrôleur "getPatientActiveAuthorizations" ---');
  const patientId = req.patient.id_patient;
  console.log(`--- [2] ID du patient récupéré: ${patientId}`);

  try {
    const { AutorisationAcces } = require('../../models');
    const authorizations = await AutorisationAcces.findAll({
      where: { 
        patient_id: patientId,
        statut: 'actif'
      },
      include: [
        {
          model: require('../../models').ProfessionnelSante,
          as: 'professionnelDemandeur',
          attributes: ['id_professionnel', 'nom', 'prenom', 'specialite', 'role']
        }
      ],
      order: [['date_debut', 'DESC']]
    });

    console.log(`--- [4] Requête findAll terminée. Résultats: ${authorizations.length}`);

    res.status(200).json({
      status: 'success',
      results: authorizations.length,
      data: {
        authorizations
      }
    });
  } catch (error) {
    console.error('❌ [getPatientActiveAuthorizations] Erreur lors du chargement des autorisations actives', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return next(error);
  }
});

/**
 * Get access status for a patient
 */
exports.getAccessStatusForPatient = catchAsync(async (req, res, next) => {
    const { patientId } = req.params;
    
    // Validation du paramètre patientId
    if (!patientId || patientId === 'undefined') {
        return next(new AppError('ID du patient requis et valide', 400));
    }
    
    // Validation que patientId est un nombre valide
    const patientIdNum = parseInt(patientId, 10);
    if (isNaN(patientIdNum) || patientIdNum <= 0) {
        return next(new AppError('ID du patient doit être un nombre valide', 400));
    }
    
    // Déterminer l'ID du professionnel selon le contexte
    let professionnelId = req.user.id_professionnel || req.user.id;

    // Si l'appel est fait avec un token patient, on tente de lire un professionnelId en query
    if (req.user.role === 'patient') {
        professionnelId = req.query.professionnelId || null;
    }

    if (!professionnelId) {
        return next(new AppError("Endpoint réservé aux professionnels ou 'professionnelId' manquant pour la vérification.", 403));
    }

    try {
        const status = await accessService.checkExistingAuthorization(professionnelId, patientIdNum);
        
        res.status(200).json({
            status: 'success',
            data: {
                status: status
            }
        });
    } catch (error) {
        console.error('❌ [getAccessStatusForPatient] Erreur lors de la vérification du statut:', {
            patientId: patientIdNum,
            professionnelId,
            error: error.message
        });
        return next(error);
    }
});


/**
 * Get active authorizations for a professional
 */
exports.getProfessionalActiveAuthorizations = catchAsync(async (req, res, next) => {
  const professionnel_id = req.user.id;

  const { AutorisationAcces } = require('../../models');
  const authorizations = await AutorisationAcces.findAll({
    where: { 
      professionnel_id,
      statut: 'actif'
    },
    include: [
      {
        model: require('../../models').Patient,
        attributes: ['id_patient', 'nom', 'prenom', 'numero_assure']
      }
    ],
    order: [['date_debut', 'DESC']]
  });

  res.status(200).json({
    status: 'success',
    results: authorizations.length,
    data: {
      authorizations
    }
  });
});

/**
 * Get access status for the connected patient
 */
exports.getPatientAccessStatus = catchAsync(async (req, res, next) => {
  try {
    // Récupérer l'ID du patient connecté
    const patientId = req.user.id_patient || req.user.id;
    
    if (!patientId) {
      return next(new AppError('ID du patient non identifié', 400));
    }

    console.log('🔍 [getPatientAccessStatus] Vérification du statut d\'accès pour le patient:', patientId);
    console.log('🔍 [getPatientAccessStatus] Clause WHERE appliquée:', { patient_id: patientId });

    // Récupérer UNIQUEMENT les demandes d'accès pour ce patient connecté
    let accessRequests = await AutorisationAcces.findAll({
      where: { 
        patient_id: patientId // ✅ Filtrage strict par patient_id
      },
      include: [
        {
          model: require('../../models').ProfessionnelSante,
          as: 'professionnelDemandeur', // ✅ Alias correct pour le professionnel qui demande
          attributes: ['id_professionnel', 'nom', 'prenom', 'specialite', 'numero_adeli'],
          include: [{
            model: require('../../models').Utilisateur,
            as: 'compteUtilisateur',
            attributes: ['nom', 'prenom', 'email']
          }]
        },
        {
          model: require('../../models').ProfessionnelSante,
          as: 'autorisateur', // ✅ Alias correct pour le professionnel qui autorise
          attributes: ['id_professionnel', 'nom', 'prenom', 'specialite', 'numero_adeli'],
          required: false // ✅ Optionnel car peut être null
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Vérification de sécurité : s'assurer que toutes les données appartiennent au patient connecté
    const unauthorizedData = accessRequests.filter(req => req.patient_id !== patientId);
    if (unauthorizedData.length > 0) {
      console.warn('⚠️ [getPatientAccessStatus] Données non autorisées détectées:', unauthorizedData.map(req => req.patient_id));
      // Filtrer pour ne garder que les données du patient connecté
      accessRequests = accessRequests.filter(req => req.patient_id === patientId);
    }

    // Séparer les demandes par statut
    const pendingRequests = accessRequests.filter(req => req.statut === 'attente_validation');
    const activeAuthorizations = accessRequests.filter(req => req.statut === 'actif');
    const deniedRequests = accessRequests.filter(req => req.statut === 'refuse' || req.statut === 'expire');

    console.log('✅ [getPatientAccessStatus] Statut récupéré avec succès:', {
      total: accessRequests.length,
      pending: pendingRequests.length,
      active: activeAuthorizations.length,
      denied: deniedRequests.length
    });

    res.status(200).json({
      status: 'success',
      data: {
        patient_id: patientId,
        summary: {
          total_requests: accessRequests.length,
          pending_requests: pendingRequests.length,
          active_authorizations: activeAuthorizations.length,
          denied_requests: deniedRequests.length
        },
        accessRequests: pendingRequests,
        activeAuthorizations: activeAuthorizations,
        deniedRequests: deniedRequests,
        allRequests: accessRequests
      }
    });

  } catch (error) {
    console.error('❌ [getPatientAccessStatus] Erreur lors de la récupération du statut:', {
      patientId: req.user.id_patient || req.user.id,
      error: error.message,
      stack: error.stack
    });
    return next(error);
  }
});

/**
 * Revoke authorization access for patients (their own authorizations only)
 */
exports.revokePatientAuthorization = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;
  
  // Récupérer l'ID du patient connecté
  const patientId = req.user.id_patient || req.user.id;
  
  if (!patientId) {
    return next(new AppError('ID du patient non identifié', 400));
  }

  try {
    // Vérifier que l'autorisation appartient au patient connecté
    const authAccess = await AutorisationAcces.findByPk(id);
    if (!authAccess) {
      return next(new AppError('Autorisation d\'accès non trouvée', 404));
    }

    if (authAccess.patient_id !== patientId) {
      return next(new AppError('Vous ne pouvez révoquer que vos propres autorisations', 403));
    }

    // Mettre à jour l'autorisation
    await authAccess.update({
      statut: 'refuse', // ✅ Valeur valide de l'enum
      motif_revocation: reason || 'Révoqué par le patient',
      date_revocation: new Date()
    });

    res.status(200).json({
      status: 'success',
      message: 'Autorisation révoquée avec succès',
      data: {
        authorizationAccess: authAccess,
      },
    });

  } catch (error) {
    console.error('❌ [revokePatientAuthorization] Erreur:', error);
    return next(error);
  }
});
