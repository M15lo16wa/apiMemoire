const { AutorisationAcces, HistoriqueAccess, Patient, ProfessionnelSante, NotificationAccesDMP } = require('../../models');
const AppError = require('../../utils/appError');
const jwt = require('jsonwebtoken');

/**
 * Create a new Authorization Access
 * @param {Object} accessData
 * @returns {Object} Authorization Access
 */
exports.createAuthorizationAccess = async (accessData) => {
  // Validate that patient exists
  if (accessData.patient_id) {
    const patient = await Patient.findByPk(accessData.patient_id);
    if (!patient) {
      throw new AppError('Patient non trouvé', 404);
    }
  }

  // Validate that professional exists
  if (accessData.professionnel_id) {
    const professionnel = await ProfessionnelSante.findByPk(accessData.professionnel_id);
    if (!professionnel) {
      throw new AppError('Professionnel de santé non trouvé', 404);
    }
  }

  return await AutorisationAcces.creerAutorisation(accessData);
};

/**
 * Get all Authorization Access records with relationships
 * @param {Object} options - Query options
 * @returns {Array} List of Authorization Access
 */
exports.getAllAuthorizationAccess = async (options = {}) => {
  return await AutorisationAcces.findAll({
    include: [
      {
        model: Patient,
        as: 'patientConcerne',
        attributes: ['id_patient', 'nom', 'prenom', 'numero_assure']
      },
      {
        model: ProfessionnelSante,
        as: 'professionnelDemandeur',
        attributes: ['id_professionnel', 'nom', 'prenom', 'specialite']
      },
      {
        model: ProfessionnelSante,
        as: 'autorisateur',
        attributes: ['id_professionnel', 'nom', 'prenom', 'specialite']
      }
    ],
    order: [['date_debut', 'DESC']],
    ...options
  });
};

/**
 * Get Authorization Access by ID
 * @param {number} id - Authorization Access ID
 * @returns {Object} Authorization Access
 */
exports.getAuthorizationAccessById = async (id) => {
  const authAccess = await AutorisationAcces.findByPk(id, {
    include: [
      {
        model: Patient,
        as: 'patientConcerne',
        attributes: ['id_patient', 'nom', 'prenom', 'numero_assure']
      },
      {
        model: ProfessionnelSante,
        as: 'professionnelDemandeur',
        attributes: ['id_professionnel', 'nom', 'prenom', 'specialite']
      },
      {
        model: ProfessionnelSante,
        as: 'autorisateur',
        attributes: ['id_professionnel', 'nom', 'prenom', 'specialite']
      }
    ]
  });

  if (!authAccess) {
    throw new AppError('Autorisation d\'accès non trouvée', 404);
  }

  return authAccess;
};

/**
 * Update Authorization Access
 * @param {number} id - Authorization Access ID
 * @param {Object} updateData - Data to update
 * @returns {Object} Updated Authorization Access
 */
exports.updateAuthorizationAccess = async (id, updateData) => {
  console.log('🔄 [service.updateAuthorizationAccess] Mise à jour autorisation', { id, updateData });
  
  const authAccess = await AutorisationAcces.findByPk(id);
  if (!authAccess) {
    throw new AppError('Autorisation d\'accès non trouvée', 404);
  }

  console.log('🔍 [service.updateAuthorizationAccess] Autorisation trouvée', {
    id: authAccess.id_acces,
    statut_actuel: authAccess.statut,
    professionnel_id: authAccess.professionnel_id,
    patient_id: authAccess.patient_id
  });

  // Mise à jour avec timestamp
  const updateDataWithTimestamp = {
    ...updateData,
    updatedAt: new Date()
  };

  await authAccess.update(updateDataWithTimestamp);
  
  console.log('✅ [service.updateAuthorizationAccess] Autorisation mise à jour', {
    id: authAccess.id_acces,
    nouveau_statut: authAccess.statut,
    date_mise_a_jour: authAccess.updatedAt
  });
  
  return authAccess;
};

/**
 * Revoke Authorization Access (for professionals only)
 * @param {number} id - Authorization Access ID
 * @param {string} reason - Reason for revocation
 * @param {Object} user - User making the request
 * @returns {Object} Updated Authorization Access
 */
exports.revokeAuthorizationAccess = async (id, reason, user) => {
  const authAccess = await AutorisationAcces.findByPk(id);
  if (!authAccess) {
    throw new AppError('Autorisation d\'accès non trouvée', 404);
  }

  // Seuls les professionnels peuvent utiliser cette route
  if (user.role === 'medecin' || user.role === 'infirmier') {
    // Un professionnel ne peut révoquer que ses propres demandes
    if (authAccess.professionnel_id !== user.id_professionnel && 
        authAccess.professionnel_id !== user.id) {
      throw new AppError('Vous ne pouvez révoquer que vos propres autorisations', 403);
    }
  }

  await authAccess.update({
    statut: 'refuse', // ✅ Valeur valide de l'enum
    motif_revocation: reason || 'Révoqué par le professionnel',
    date_revocation: new Date()
  });

  return authAccess;
};

/**
 * Create a new History Access
 * @param {Object} historyData
 * @returns {Object} History Access
 */
exports.createHistoryAccess = async (historyData) => {
  return await HistoriqueAccess.create(historyData);
};

/**
 * Get all History Access records with relationships
 * @param {Object} options - Query options
 * @returns {Array} List of History Access
 */
exports.getAllHistoryAccess = async (options = {}) => {
  return await HistoriqueAccess.findAll({
    order: [['date_heure_acces', 'DESC']],
    ...options
  });
};

/**
 * Get History Access by Patient ID
 * @param {number} patientId - Patient ID
 * @param {Object} options - Query options
 * @returns {Array} List of History Access for the patient
 */
exports.getHistoryAccessByPatient = async (patientId, options = {}) => {
  return await HistoriqueAccess.findAll({
    where: { id_patient: patientId },
    order: [['date_heure_acces', 'DESC']],
    ...options
  });
};

/**
 * Get Authorization Access by Patient ID
 * @param {number} patientId - Patient ID
 * @param {Object} options - Query options
 * @returns {Array} List of Authorization Access for the patient
 */
exports.getAuthorizationAccessByPatient = async (patientId, options = {}) => {
  return await AutorisationAcces.findAll({
    where: { patient_id: patientId },
    include: [
      {
        model: ProfessionnelSante,
        as: 'professionnelDemandeur',
        attributes: ['id_professionnel', 'nom', 'prenom', 'specialite']
      },
      {
        model: ProfessionnelSante,
        as: 'autorisateur',
        attributes: ['id_professionnel', 'nom', 'prenom', 'specialite']
      }
    ],
    order: [['date_debut', 'DESC']],
    ...options
  });
};

/**
 * AMÉLIORÉE : Vérifie le statut de la dernière autorisation entre un professionnel et un patient.
 * Renvoie un objet détaillé avec le statut et l'autorisation.
 * @param {number} professionnelId - Professional ID
 * @param {number} patientId - Patient ID
 * @returns {Promise<{accessStatus: string, authorization: object|null}>}
 */
exports.checkAccess = async (professionnelId, patientId) => {
    const authorization = await AutorisationAcces.findOne({
        where: {
            professionnel_id: professionnelId,
            patient_id: patientId,
        },
        // Important : inclure les informations du professionnel pour l'affichage
        include: [{
            model: ProfessionnelSante,
            as: 'professionnelDemandeur', // Assurez-vous que cet alias est correct
            attributes: ['nom', 'prenom', 'specialite']
        }],
        order: [['createdAt', 'DESC']] // Toujours prendre la plus récente
    });

    if (!authorization) {
        return { accessStatus: 'not_requested', authorization: null };
    }

    // On suppose que votre modèle a une méthode pour vérifier la validité de la date
    // Si elle n'existe pas, vous pouvez la créer ou faire la vérification ici.
    const isCurrentlyValid = () => {
        if (!authorization.date_fin) {
            return true; // Valide indéfiniment si pas de date de fin
        }
        return new Date() <= new Date(authorization.date_fin);
    };

    if (authorization.statut === 'actif' && isCurrentlyValid()) {
        return { accessStatus: 'active', authorization };
    }

    if (authorization.statut === 'attente_validation') {
        return { accessStatus: 'pending', authorization };
    }

    // Tous les autres cas (refusé, révoqué, expiré)
    return { accessStatus: 'denied_or_expired', authorization };
};

/**
 * Log access attempt
 * @param {Object} logData - Access log data
 * @returns {Object} Created history access record
 */
exports.logAccess = async (logData) => {
  const historyData = {
    date_heure_acces: new Date(),
    action: logData.action,
    type_ressource: logData.type_ressource,
    id_ressource: logData.id_ressource,
    details: logData.details,
    statut: logData.statut || 'SUCCES',
    code_erreur: logData.code_erreur,
    message_erreur: logData.message_erreur,
    adresse_ip: logData.adresse_ip,
    user_agent: logData.user_agent,
    device_id: logData.device_id,
    professionnel_id: logData.professionnel_id,
    id_utilisateur: logData.id_utilisateur,
    id_patient: logData.id_patient,
    id_dossier: logData.id_dossier,
    id_service: logData.id_service,
    createdBy: logData.createdBy
  };

  return await HistoriqueAccess.create(historyData);
};

/**
 * Request standard access to patient medical record
 * @param {Object} requestData - Access request data
 * @returns {Object} Created authorization request
 */
exports.requestStandardAccess = async (requestData) => {
  const { professionnel_id, patient_id, raison_demande } = requestData;

  console.log('➡️ [service.requestStandardAccess] Entrée', requestData);

  try {
    // Validate patient exists
    const patient = await Patient.findByPk(patient_id);
    console.log('🔎 [service.requestStandardAccess] Patient trouvé?', !!patient, '| id:', patient_id);
    if (!patient) {
      throw new AppError('Patient non trouvé', 404);
    }

    // Validate professional exists
    const professionnel = await ProfessionnelSante.findByPk(professionnel_id);
    console.log('🔎 [service.requestStandardAccess] Professionnel trouvé?', !!professionnel, '| id:', professionnel_id);
    if (!professionnel) {
      throw new AppError('Professionnel de santé non trouvé', 404);
    }

    // Check if authorization already exists
    let existingAuth;
    try {
      existingAuth = await AutorisationAcces.findOne({
        where: {
          professionnel_id,
          patient_id,
          statut: ['actif', 'attente_validation']
        }
      });
    } catch (e) {
      console.error('❌ [service.requestStandardAccess] Erreur lors de la recherche d\'une autorisation existante', e);
      throw e;
    }

    if (existingAuth) {
      console.log('ℹ️ [service.requestStandardAccess] Autorisation existante détectée', existingAuth?.id_acces);
      throw new AppError('Une demande d\'accès existe déjà pour ce patient', 400);
    }

    // Create authorization request
    let autorisation;
    try {
      autorisation = await AutorisationAcces.create({
        type_acces: 'lecture',
        date_debut: new Date(),
        statut: 'attente_validation',
        raison_demande: raison_demande || 'Demande d\'accès standard',
        patient_id,
        professionnel_id,
        autorisateur_id: professionnel_id
      });
    } catch (e) {
      console.error('❌ [service.requestStandardAccess] Erreur lors de la création de l\'autorisation', e);
      throw e;
    }

    console.log('✅ [service.requestStandardAccess] Autorisation créée', {
      id_acces: autorisation.id_acces,
      statut: autorisation.statut
    });

    // Log the access request
    try {
      await HistoriqueAccess.create({
        date_heure_acces: new Date(),
        action: 'demande_acces_standard',
        type_ressource: 'DossierMedical',
        id_ressource: patient_id,
        details: `Demande d'accès standard au dossier du patient ${patient.nom} ${patient.prenom}`,
        statut: 'SUCCES',
        professionnel_id,
        id_patient: patient_id
      });
    } catch (e) {
      console.error('⚠️ [service.requestStandardAccess] Erreur lors de l\'enregistrement de l\'historique (non bloquant)', e);
    }

    // Create notification for patient (if notification system exists)
    if (NotificationAccesDMP) {
      try {
        await NotificationAccesDMP.create({
          patient_id,
          professionnel_id,
          type_notification: 'demande_acces',
          titre: `Demande d'accès au dossier médical`,
          contenu_notification: `Le Dr. ${professionnel.nom} ${professionnel.prenom} demande l'accès à votre dossier médical`,
          message: `Le Dr. ${professionnel.nom} ${professionnel.prenom} demande l'accès à votre dossier médical`,
          destinataire: patient.email || patient.telephone || 'contact@dmp.fr',
          statut: 'non_lu',
          // === Lien d'autorisation pour suivre la réponse ===
          id_acces_autorisation: autorisation.id_acces 
        });
      } catch (e) {
        console.error('⚠️ [service.requestStandardAccess] Erreur lors de la création de la notification (non bloquant)', e);
      }
    }

    return autorisation;
  } catch (error) {
    console.error('❌ [service.requestStandardAccess] Erreur finale', {
      name: error.name,
      message: error.message,
      errors: error.errors,
      stack: error.stack
    });
    throw error;
  }
};

/**
 * Grant emergency access to patient medical record
 * @param {Object} emergencyData - Emergency access data
 * @returns {Object} Created emergency authorization with DMP access token
 */
exports.grantEmergencyAccess = async (emergencyData) => {
  const { professionnel_id, patient_id, justification_urgence } = emergencyData;

  if (!justification_urgence) {
    throw new AppError('Justification de l\'urgence requise', 400);
  }

  // Validate patient exists
  const patient = await Patient.findByPk(patient_id);
  if (!patient) {
    throw new AppError('Patient non trouvé', 404);
  }

  // Validate professional exists
  const professionnel = await ProfessionnelSante.findByPk(professionnel_id);
  if (!professionnel) {
    throw new AppError('Professionnel de santé non trouvé', 404);
  }

  // Create emergency authorization (immediate access)
  const autorisation = await AutorisationAcces.create({
    type_acces: 'lecture_urgence',
    date_debut: new Date(),
    date_fin: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    statut: 'actif',
    raison_demande: `Accès d'urgence: ${justification_urgence}`,
    conditions_acces: { type: 'urgence', justification: justification_urgence },
    patient_id,
    professionnel_id,
    autorisateur_id: professionnel_id
  });

  // Log the emergency access
  await HistoriqueAccess.create({
    date_heure_acces: new Date(),
    action: 'acces_urgence',
    type_ressource: 'DossierMedical',
    id_ressource: patient_id,
    details: `Accès d'urgence accordé au dossier du patient ${patient.nom} ${patient.prenom}. Justification: ${justification_urgence}`,
    statut: 'SUCCES',
    professionnel_id,
    id_patient: patient_id
  });

  // Generate DMP access token for emergency access
  const dmpAccessToken = jwt.sign({
    id: professionnel_id,
    role: 'medecin',
    type: 'dmp-access',
    patientId: patient_id,
    autorisationId: autorisation.id_acces,
    accessType: 'urgence'
  }, process.env.JWT_SECRET, { expiresIn: '1h' });

  return { 
    autorisation, 
    dmp_token: dmpAccessToken,
    expires_in: 3600 // 1 hour in seconds
  };
};

/**
 * Grant secret access to patient medical record
 * @param {Object} secretData - Secret access data
 * @returns {Object} Created secret authorization with DMP access token
 */
exports.grantSecretAccess = async (secretData) => {
  const { professionnel_id, patient_id, raison_secrete } = secretData;

  // Validate patient exists
  const patient = await Patient.findByPk(patient_id);
  if (!patient) {
    throw new AppError('Patient non trouvé', 404);
  }

  // Validate professional exists
  const professionnel = await ProfessionnelSante.findByPk(professionnel_id);
  if (!professionnel) {
    throw new AppError('Professionnel de santé non trouvé', 404);
  }

  // Create secret authorization
  const autorisation = await AutorisationAcces.create({
    type_acces: 'lecture_secrete',
    date_debut: new Date(),
    date_fin: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
    statut: 'actif',
    raison_demande: raison_secrete || 'Accès secret',
    conditions_acces: { type: 'secret', notification_disabled: true },
    patient_id,
    professionnel_id,
    autorisateur_id: professionnel_id
  });

  // Log the secret access (but don't notify patient)
  await HistoriqueAccess.create({
    date_heure_acces: new Date(),
    action: 'acces_secret',
    type_ressource: 'DossierMedical',
    id_ressource: patient_id,
    details: `Accès secret accordé au dossier du patient ${patient.nom} ${patient.prenom}`,
    statut: 'SUCCES',
    professionnel_id,
    id_patient: patient_id
  });

  // Generate DMP access token for secret access
  const dmpAccessToken = jwt.sign({
    id: professionnel_id,
    role: 'medecin',
    type: 'dmp-access',
    patientId: patient_id,
    autorisationId: autorisation.id_acces,
    accessType: 'secret'
  }, process.env.JWT_SECRET, { expiresIn: '2h' });

  return { 
    autorisation, 
    dmp_token: dmpAccessToken,
    expires_in: 7200 // 2 hours in seconds
  };
};

/**
 * Process patient response to access request.
 * This function ONLY updates the status and logs the action.
 * Token generation is handled separately.
 * @param {number} authorizationId - Authorization ID
 * @param {number} patientId - Patient ID (for security check)
 * @param {string} response - 'accept' or 'refuse'
 * @param {string} comment - Optional comment
 * @returns {Object} Updated authorization
 */
exports.processPatientResponse = async (authorizationId, patientId, response, comment = '') => {
  const autorisation = await AutorisationAcces.findOne({
      where: { id_acces: authorizationId, patient_id: patientId }
    });

  if (autorisation.statut !== 'attente_validation') {
    throw new AppError('Cette demande a déjà été traitée.', 400);
  }

  // Récupérer les informations du patient pour la notification
  const patient = await Patient.findByPk(patientId);
  if (!patient) {
    throw new AppError('Patient non trouvé', 404);
  }

  const newStatus = response === 'accept' ? 'actif' : 'refuse';
  
  await autorisation.update({
    statut: newStatus,
    date_validation: new Date(),
    motif_revocation: response === 'refuse' ? comment : null
  });

  // Log the patient response
  await HistoriqueAccess.create({
    date_heure_acces: new Date(),
    action: `reponse_patient_${response}`,
    type_ressource: 'AutorisationAcces',
    id_ressource: authorizationId,
    details: `Patient a ${response === 'accept' ? 'accepté' : 'refusé'} la demande d'accès`,
    statut: 'SUCCES',
    id_patient: autorisation.patient_id,
    professionnel_id: autorisation.professionnel_id
  });

  // If accepted, generate DMP access token
  if (response === 'accept') {
    const dmpAccessToken = jwt.sign({
      id: autorisation.professionnel_id,
      role: 'medecin',
      type: 'dmp-access',
      patientId: autorisation.patient_id,
      autorisationId: autorisation.id_acces,
      accessType: 'standard'
    }, process.env.JWT_SECRET, { expiresIn: '8h' });

    return { 
      autorisation, 
      dmp_token: dmpAccessToken,
      expires_in: 28800 // 8 hours in seconds
    };
  }
  await NotificationAccesDMP.update(
    { statut: 'lu' },
    { where: { id_acces_autorisation: authorizationId } }
  );
  await NotificationAccesDMP.create({
    patient_id,
    professionnel_id: autorisation.professionnel_id,
    type_notification: 'reponse_acces',
    titre: `Réponse à votre demande d'accès`,
    contenu_notification: `Votre demande d'accès a été ${response === 'accept' ? 'acceptée' : 'refusée'}`,
    message: `Votre demande d'accès a été ${response === 'accept' ? 'acceptée' : 'refusée'}`,
    destinataire: patient.email || patient.telephone || 'contact@dmp.fr',
    statut: 'non_lu'
  });

  return { autorisation };
};

/**
 * Generate DMP access token for existing authorization
 * @param {number} authorizationId - Authorization ID
 * @returns {Object} DMP access token
 */
exports.generateDMPAccessToken = async (authorizationId) => {
  const autorisation = await AutorisationAcces.findByPk(authorizationId);
  if (!autorisation) {
    throw new AppError('Autorisation non trouvée', 404);
  }

  if (autorisation.statut !== 'actif') {
    throw new AppError('Autorisation non active', 403);
  }

  if (!autorisation.AccessAutorised()) {
    throw new AppError('Autorisation expirée', 403);
  }

  // Determine token expiration based on access type
  let expiresIn = '8h'; // Default for standard access
  let expiresInSeconds = 28800;

  if (autorisation.type_acces === 'lecture_urgence') {
    expiresIn = '1h';
    expiresInSeconds = 3600;
  } else if (autorisation.type_acces === 'lecture_secrete') {
    expiresIn = '2h';
    expiresInSeconds = 7200;
  }

  const dmpAccessToken = jwt.sign({
    id: autorisation.professionnel_id,
    role: 'medecin',
    type: 'dmp-access',
    patientId: autorisation.patient_id,
    autorisationId: autorisation.id_acces,
    accessType: autorisation.type_acces
  }, process.env.JWT_SECRET, { expiresIn });

  return { 
    dmp_token: dmpAccessToken,
    expires_in: expiresInSeconds,
    autorisation
  };
};

// Ajoutez cette nouvelle fonction dans exports

/**
 * Marks a notification as read.
 * In this context, it updates the status in the NotificationAccesDMP table.
 * @param {number} notificationId - The ID of the notification
 * @param {number} patientId - The ID of the patient (for security)
 * @returns {Object} Success object
 */
exports.marquerNotificationCommeLue = async (notificationId, patientId) => {
    // Dans notre cas, la "notification" est l'enregistrement dans NotificationAccesDMP
    const notification = await NotificationAccesDMP.findOne({
        where: { id_notification: notificationId, patient_id: patientId }
    });

    if (!notification) {
        throw new AppError('Notification non trouvée.', 404);
    }
    
    // Mettre simplement le statut à "lu"
    await notification.update({ statut: 'lu' });

    return { success: true, message: 'Notification marquée comme lue.' };
};

/**
 * Récupère les demandes d'accès en attente pour le patient
 */
exports.getPendingRequests = async (patientId) => {
  const autorisations = await AutorisationAcces.findAll({
    where: {
      patient_id: patientId,
      statut: 'attente_validation'
    },
    include: [
      {
        model: ProfessionnelSante,
        as: 'professionnelDemandeur',
        attributes: ['nom', 'prenom', 'specialite']
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  return autorisations.map(auth => ({
    id_notification: auth.id_acces,
    id_acces_autorisation: auth.id_acces,
    titre: `Demande d'accès de Dr. ${auth.professionnelDemandeur?.prenom || ''} ${auth.professionnelDemandeur?.nom || ''}`.trim(),
    message: auth.raison_demande || 'Demande d\'accès standard.',
    date_creation: auth.createdAt,
    type_notification: 'demande_validation',
    statut_envoi: 'en_attente',
    professionnel: auth.professionnelDemandeur
  }));
};

/**
 * Check if a professional has an active access for a patient
 */
exports.checkExistingAuthorization = async (professionnelId, patientId) => {
    const existingAuth = await AutorisationAcces.findOne({
        where: {
            professionnel_id: professionnelId,
            patient_id: patientId,
        },
        order: [['createdAt', 'DESC']]
    });

    if (!existingAuth) {
        return 'not_requested';
    }

    // Simplify the status for the front-end
    if (existingAuth.statut === 'attente_validation') {
        return 'pending';
    }
    if (existingAuth.statut === 'actif') {
        return 'active';
    }
    if (['refuse', 'revoque', 'expire'].includes(existingAuth.statut)) {
        return 'denied_or_revoked';
    }
    
    return 'unknown';
};



