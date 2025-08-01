const accessService = require('./access.service');
const { AutorisationAcces, HistoriqueAccess } = require('../../models');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');

/**
 * Create a new authorization access
 */
exports.createAuthorizationAccess = catchAsync(async (req, res, next) => {
  const { typeAcces, dateDebut, dateFin, statut, raison, patient_id, professionnel_id } = req.body;

  if (!typeAcces || !patient_id || !professionnel_id) {
    return next(new AppError('Type d\'accès, ID patient et ID professionnel sont requis', 400));
  }

  const newAuthAccess = await accessService.createAuthorizationAccess({
    typeAcces,
    dateDebut: dateDebut || new Date(),
    dateFin,
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
  
  const updatedAuthAccess = await accessService.updateAuthorizationAccess(id, req.body);
  
  res.status(200).json({
    status: 'success',
    data: {
      authorizationAccess: updatedAuthAccess,
    },
  });
});

/**
 * Revoke authorization access
 */
exports.revokeAuthorizationAccess = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;
  
  const revokedAuthAccess = await accessService.revokeAuthorizationAccess(id, reason);
  
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
  
  const hasAccess = await accessService.checkAccess(professionnelId, patientId, typeAcces);
  
  res.status(200).json({
    status: 'success',
    data: {
      hasAccess: hasAccess,
      message: hasAccess ? 'Accès autorisé' : 'Accès refusé'
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
