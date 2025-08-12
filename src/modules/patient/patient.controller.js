const patientService = require('./patient.service');
const patientAuthService = require('./patient.auth.service');
const catchAsync = require('../../utils/catchAsync');
const accessService = require('../access/access.service');

const AppError = require('../../utils/appError');

exports.getAllPatients = catchAsync(async (req, res, next) => {
  const patients = await patientService.getAllPatients();
  res.status(200).json({
    status: 'success',
    results: patients.length,
    data: {
      patients,
    },
  });
});

exports.getPatient = catchAsync(async (req, res, next) => {
  const patient = await patientService.getPatientById(req.params.id);
  
  // Logique d'accès granulaire
  // Un patient ne peut voir que son propre dossier
  if (req.user && req.user.role === 'patient' && req.user.id_patient !== parseInt(req.params.id)) {
    return next(new AppError('Vous n\'êtes pas autorisé à voir ce dossier patient.', 403));
  }
  res.status(200).json({
    status: 'success',
    data: {
      patient,
    },
  });
});

exports.createPatient = catchAsync(async (req, res, next) => {
  // Validation des champs requis
  const requiredFields = ['nom', 'prenom', 'date_naissance', 'lieu_naissance', 'civilite', 'sexe', 'numero_assure', 'nom_assurance', 'adresse', 'ville', 'pays', 'email', 'telephone', 'mot_de_passe'];
  const missingFields = requiredFields.filter(field => !req.body[field]);
  
  if (missingFields.length > 0) {
    return next(new AppError(`Champs requis manquants : ${missingFields.join(', ')}`, 400));
  }

  const newPatient = await patientService.createPatient(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      patient: newPatient,
    },
  });
});

exports.updatePatient = catchAsync(async (req, res, next) => {
  // Vérification d'accès : un patient ne peut modifier que son propre dossier
  if (req.user && req.user.role === 'patient' && req.user.id_patient !== parseInt(req.params.id)) {
    return next(new AppError('Vous ne pouvez modifier que votre propre dossier.', 403));
  }

  const updatedPatient = await patientService.updatePatient(req.params.id, req.body);
  res.status(200).json({
    status: 'success',
    data: {
      patient: updatedPatient,
    },
  });
});

exports.deletePatient = catchAsync(async (req, res, next) => {
  await patientService.deletePatient(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Authentication endpoints for patients
exports.login = catchAsync(async (req, res, next) => {
  const { numero_assure, mot_de_passe } = req.body;

  if (!numero_assure || !mot_de_passe) {
    return next(new AppError('Veuillez fournir votre numéro d\'assuré et votre mot de passe', 400));
  }

  try {
    const patient = await patientAuthService.loginPatient(numero_assure, mot_de_passe);
    patientAuthService.sendAuthToken(patient, 200, res);
  } catch (error) {
    next(error);
  }
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000), // Expire dans 10 secondes pour forcer la déconnexion
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  });
  res.status(200).json({ status: 'success', message: 'Déconnexion réussie' });
};

exports.changePassword = catchAsync(async (req, res, next) => {
  const patientId = req.patient && req.patient.id_patient;
  const { mot_de_passe_actuel, nouveau_mot_de_passe } = req.body;

  if (!mot_de_passe_actuel || !nouveau_mot_de_passe) {
    return next(new AppError('Veuillez fournir votre mot de passe actuel et le nouveau mot de passe.', 400));
  }
  
  try {
    await patientAuthService.changePatientPassword(patientId, mot_de_passe_actuel, nouveau_mot_de_passe);
    res.status(200).json({
      status: 'success',
      message: 'Mot de passe mis à jour avec succès'
    });
  } catch (error) {
    next(error);
  }
});

exports.getMe = catchAsync(async (req, res, next) => {
  // req.patient est attaché par le middleware patientAuth
  if (!req.patient) {
    return next(new AppError('Patient non trouvé dans la requête. Authentification échouée.', 500));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      patient: req.patient
    }
  });
});

// === CONTRÔLEURS POUR LA GESTION DES NOTIFICATIONS ET ACCÈS ===

/**
 * Récupère les demandes d'accès en attente pour le patient connecté.
 */
exports.getPendingAccessRequests = catchAsync(async (req, res, next) => {
    const patientId = req.patient.id_patient; // 'req.patient' vient du middleware 'patientAuth'

    // On doit appeler le service qui gère la logique d'accès
    const accessService = require('../access/access.service');
    const pendingRequests = await accessService.getPendingRequests(patientId);

    res.status(200).json({
        status: 'success',
        results: pendingRequests.length,
        data: {
            // Le front-end s'attend à un champ 'notifications'
            notifications: pendingRequests
        }
    });
});

/**
 * Répond à une demande d'accès.
 */
exports.respondToAccessRequest = catchAsync(async (req, res, next) => {
    const patientId = req.patient.id_patient;
    const { authorizationId } = req.params;
    const { response, comment } = req.body; // 'accept' ou 'refuse'

    const accessService = require('../access/access.service');

    // On vérifie que le patient a le droit de répondre à CETTE demande spécifique
    const autorisation = await accessService.processPatientResponse(authorizationId, patientId, response, comment);

    res.status(200).json({
        status: 'success',
        message: `Demande ${response === 'accept' ? 'acceptée' : 'refusée'}`,
        data: { autorisation }
    });
});

/**
 * Marque une notification comme lue.
 */
exports.marquerNotificationLue = catchAsync(async (req, res, next) => {
    const patientId = req.patient.id_patient;
    const { notificationId } = req.params;

    // Le service d'accès gère aussi les notifications liées à l'accès
    const accessService = require('../access/access.service');
    await accessService.marquerNotificationCommeLue(notificationId, patientId);

    res.status(200).json({
        status: 'success',
        message: 'Notification marquée comme lue'
    });
});

/**
 * Marque une notification spécifique comme lue.
 */
exports.marquerNotificationLue = catchAsync(async (req, res, next) => {
    // 1. On récupère les informations de la requête
    const patientId = req.patient.id_patient; // Vient du middleware `patientAuth`
    const { notificationId } = req.params;   // Vient de l'URL (ex: /notifications/123/mark-as-read)

    // 2. On appelle le service que vous venez de créer
    await accessService.marquerNotificationCommeLue(notificationId, patientId);

    // 3. On envoie une réponse de succès
    res.status(200).json({
        status: 'success',
        message: 'Notification marquée comme lue.'
    });
});