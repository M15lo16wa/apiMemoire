const { AutorisationAcces, HistoriqueAccess, Patient, ProfessionnelSante } = require('../../models');
const AppError = require('../../utils/appError');

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
        attributes: ['id_patient', 'nom', 'prenom', 'numero_assure']
      },
      {
        model: ProfessionnelSante,
        as: 'professionnel',
        attributes: ['id_professionnel', 'nom', 'prenom', 'specialite']
      },
      {
        model: ProfessionnelSante,
        as: 'autorisateur',
        attributes: ['id_professionnel', 'nom', 'prenom', 'specialite']
      }
    ],
    order: [['dateDebut', 'DESC']],
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
        attributes: ['id_patient', 'nom', 'prenom', 'numero_assure']
      },
      {
        model: ProfessionnelSante,
        as: 'professionnel',
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
  const authAccess = await AutorisationAcces.findByPk(id);
  if (!authAccess) {
    throw new AppError('Autorisation d\'accès non trouvée', 404);
  }

  await authAccess.update(updateData);
  return authAccess;
};

/**
 * Revoke Authorization Access
 * @param {number} id - Authorization Access ID
 * @param {string} reason - Reason for revocation
 * @returns {Object} Updated Authorization Access
 */
exports.revokeAuthorizationAccess = async (id, reason) => {
  const authAccess = await AutorisationAcces.findByPk(id);
  if (!authAccess) {
    throw new AppError('Autorisation d\'accès non trouvée', 404);
  }

  await authAccess.update({
    statut: 'Révoqué',
    raison: reason || authAccess.raison
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
    include: [
      {
        model: Patient,
        attributes: ['id_patient', 'nom', 'prenom', 'numero_assure']
      },
      {
        model: ProfessionnelSante,
        attributes: ['id_professionnel', 'nom', 'prenom', 'specialite']
      }
    ],
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
    include: [
      {
        model: ProfessionnelSante,
        attributes: ['id_professionnel', 'nom', 'prenom', 'specialite']
      }
    ],
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
        as: 'professionnel',
        attributes: ['id_professionnel', 'nom', 'prenom', 'specialite']
      },
      {
        model: ProfessionnelSante,
        as: 'autorisateur',
        attributes: ['id_professionnel', 'nom', 'prenom', 'specialite']
      }
    ],
    order: [['dateDebut', 'DESC']],
    ...options
  });
};

/**
 * Check if a professional has access to a patient's data
 * @param {number} professionnelId - Professional ID
 * @param {number} patientId - Patient ID
 * @param {string} typeAcces - Type of access required
 * @returns {boolean} Whether access is authorized
 */
exports.checkAccess = async (professionnelId, patientId, typeAcces = 'lecture') => {
  const authorizations = await AutorisationAcces.findAll({
    where: {
      professionnel_id: professionnelId,
      patient_id: patientId,
      typeAcces: typeAcces,
      statut: 'Actif'
    }
  });

  // Check if any authorization is currently valid
  for (const auth of authorizations) {
    if (auth.AccessAutorised()) {
      return true;
    }
  }

  return false;
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

