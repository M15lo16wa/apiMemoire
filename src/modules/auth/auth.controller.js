const authService = require('./auth.service');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');

exports.register = catchAsync(async (req, res, next) => {
  // Validation des champs requis pour un utilisateur
  const requiredFields = ['nom', 'prenom', 'email', 'mot_de_passe'];
  const missingFields = requiredFields.filter(field => !req.body[field]);
  
  if (missingFields.length > 0) {
    return next(new AppError(`Les champs suivants sont requis : ${missingFields.join(', ')}`, 400));
  }

  try {
    // Préparation des données utilisateur
    const userData = {
      nom: req.body.nom.trim(),
      prenom: req.body.prenom.trim(),
      email: req.body.email.toLowerCase().trim(),
      mot_de_passe: req.body.mot_de_passe,
      role: ['admin','secretaire','visiteur'].includes(req.body.role) ? req.body.role : 'visiteur',
      statut: 'actif'
    };

    // Création de l'utilisateur
    const newUser = await authService.register(userData);
    
    // Envoi de la réponse avec le token JWT
    authService.sendAuthToken(newUser, 201, res);
  } catch (error) {
    // Gestion des erreurs de validation Sequelize
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const messages = error.errors.map(err => err.message);
      return next(new AppError(`Erreur de validation : ${messages.join('. ')}`, 400));
    }
    next(error);
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, mot_de_passe } = req.body;

  if (!email || !mot_de_passe) {
    return next(new AppError('Veuillez fournir un email et un mot de passe', 400));
  }

  try {
    const user = await authService.login(email, mot_de_passe);
    authService.sendAuthToken(user, 200, res);
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
    res.status(200).json({ status: 'success', message: 'Logged out successfully' });
};

// Exemple de route protégée pour tester l'authentification
// Changement de mot de passe pour patient
const patientAuthService = require('./patient-auth.service');

exports.changePassword = catchAsync(async (req, res, next) => {
  const patientId = req.user && req.user.id_patient;
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

exports.getMe = (req, res, next) => {
    // req.user est attaché par le middleware auth.protect
    if (!req.user) {
        return next(new AppError('User not found in request. Authentication failed.', 500));
    }
    res.status(200).json({
        status: 'success',
        data: {
            user: {
                id: req.user.id_utilisateur,
                nom: req.user.nom,
                prenom: req.user.prenom,
                email: req.user.email,
                role: req.user.role,
                // N'exposez pas le mot de passe ni d'autres informations sensibles
            }
        }
    });
};