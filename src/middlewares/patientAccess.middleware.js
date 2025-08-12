const { Patient } = require('../models');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

/**
 * Middleware to check if user is an authenticated patient
 */
exports.requirePatientAuth = catchAsync(async (req, res, next) => {
  console.log('➡️ [requirePatientAuth] user context', {
    hasUser: !!req.user,
    role: req.user?.role,
    type: req.user?.type,
    id: req.user?.id,
    id_patient: req.user?.id_patient
  });

  // Accepte si role === 'patient' (token patient)
  if (!req.user || !(req.user.role === 'patient' || req.user.type === 'patient')) {
    console.warn('❌ [requirePatientAuth] Accès refusé: utilisateur non patient ou non authentifié');
    return next(new AppError('Accès réservé aux patients', 403));
  }

  // Récupérer l'identifiant patient
  const patientId = req.user.id_patient || req.user.id;
  if (!patientId) {
    console.warn('❌ [requirePatientAuth] Aucun identifiant patient détecté dans req.user');
    return next(new AppError('Patient non trouvé', 404));
  }

  // Chercher le patient si non injecté par un middleware précédent
  const patient = req.patient || await Patient.findByPk(patientId);
  console.log('🔎 [requirePatientAuth] Patient chargé?', !!patient, '| id:', patientId);
  
  if (!patient) {
    return next(new AppError('Patient non trouvé', 404));
  }

  // Add patient info to request
  // req.patient = patient;
  next();
});

/**
 * Middleware to check if patient can access specific authorization
 */
exports.checkPatientAuthorizationAccess = catchAsync(async (req, res, next) => {
  const { authorizationId } = req.params;
  const patientId = req.patient.id_patient;

  console.log('➡️ [checkPatientAuthorizationAccess] Entrée', { authorizationId, patientId });

  if (!authorizationId) {
    return next(new AppError('ID d\'autorisation requis', 400));
  }

  // Verify that the authorization belongs to this patient
  const { AutorisationAcces } = require('../models');
  const autorisation = await AutorisationAcces.findOne({
    where: {
      id_acces: authorizationId,
      patient_id: patientId,
      statut: 'attente_validation'
    }
  });

  console.log('🔎 [checkPatientAuthorizationAccess] Autorisation trouvée?', !!autorisation);

  if (!autorisation) {
    return next(new AppError('Demande d\'autorisation non trouvée ou déjà traitée', 404));
  }

  // Add authorization info to request
  req.authorization = autorisation;
  next();
});
