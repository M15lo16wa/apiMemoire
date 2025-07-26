const patientService = require('./patient.service');
const patientAuthService = require('./patient.auth.service');
const catchAsync = require('../../utils/catchAsync');
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
