const professionnelSanteService = require('./professionnelSante.service');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');

exports.getAllProfessionnels = catchAsync(async (req, res, next) => {
  const professionnels = await professionnelSanteService.getAllProfessionnels();
  res.status(200).json({
    status: 'success',
    results: professionnels.length,
    data: {
      professionnels,
    },
  });
});

exports.getProfessionnel = catchAsync(async (req, res, next) => {
  const professionnel = await professionnelSanteService.getProfessionnelById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: {
      professionnel,
    },
  });
});

// Correction de getProfessionnel
exports.getProfessionnel = catchAsync(async (req, res, next) => {
  const professionnel = await professionnelSanteService.getProfessionnelById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: {
      professionnel,
    },
  });
});


exports.createProfessionnel = catchAsync(async (req, res, next) => {
  // Assurez-vous que les champs essentiels sont présents
  if (!req.body.nom || !req.body.prenom || !req.body.date_naissance || !req.body.sexe || !req.body.role) {
    return next(new AppError('Missing required professional fields (nom, prenom, date_naissance, sexe, role)', 400));
  }

  // Le service gère la logique de liaison et de validation des rôles
  const newProfessionnel = await professionnelSanteService.createProfessionnel(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      professionnel: newProfessionnel,
    },
  });
});

exports.updateProfessionnel = catchAsync(async (req, res, next) => {
  const updatedProfessionnel = await professionnelSanteService.updateProfessionnel(req.params.id, req.body);
  res.status(200).json({
    status: 'success',
    data: {
      professionnel: updatedProfessionnel,
    },
  });
});

exports.deleteProfessionnel = catchAsync(async (req, res, next) => {
  await professionnelSanteService.deleteProfessionnel(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});