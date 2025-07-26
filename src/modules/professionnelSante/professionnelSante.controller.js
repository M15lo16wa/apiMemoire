const professionnelSanteService = require('./professionnelSante.service');
const professionnelAuthService = require('./professionnelSante.auth.service');
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

// Authentication endpoints for doctors
exports.login = catchAsync(async (req, res, next) => {
  const { numero_adeli, mot_de_passe } = req.body;

  if (!numero_adeli || !mot_de_passe) {
    return next(new AppError('Veuillez fournir votre numéro ADELI et votre mot de passe', 400));
  }

  try {
    const professionnel = await professionnelAuthService.loginProfessionnel(numero_adeli, mot_de_passe);
    professionnelAuthService.sendAuthToken(professionnel, 200, res);
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
  const professionnelId = req.professionnel && req.professionnel.id_professionnel;
  const { mot_de_passe_actuel, nouveau_mot_de_passe } = req.body;

  if (!mot_de_passe_actuel || !nouveau_mot_de_passe) {
    return next(new AppError('Veuillez fournir votre mot de passe actuel et le nouveau mot de passe.', 400));
  }
  
  try {
    await professionnelAuthService.changeProfessionnelPassword(professionnelId, mot_de_passe_actuel, nouveau_mot_de_passe);
    res.status(200).json({
      status: 'success',
      message: 'Mot de passe mis à jour avec succès'
    });
  } catch (error) {
    next(error);
  }
});

exports.getMe = catchAsync(async (req, res, next) => {
  // req.professionnel est attaché par le middleware medAuth
  if (!req.professionnel) {
    return next(new AppError('Professionnel non trouvé dans la requête. Authentification échouée.', 500));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      professionnel: req.professionnel
    }
  });
});