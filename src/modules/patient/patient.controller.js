const patientService = require('./patient.service');
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
  // Implémentation de la logique d'accès granulaire
  // Un patient ne devrait pouvoir voir que son propre dossier
  if (req.patient && req.patient.role === 'patient' && req.patient.id_patient !== parseInt(req.params.id)) {
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
  // Simplement pour l'exemple, valider la présence de champs essentiels
  if (!req.body.nom || !req.body.prenom || !req.body.dateNaissance || !req.body.sexe) {
    return next(new AppError('Missing required patient fields (nom, prenom, dateNaissance, sexe)', 400));
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
  res.status(204).json({ // 204 No Content pour une suppression réussie
    status: 'success',
    data: null,
  });
});