const jwt = require('jsonwebtoken');
const { ProfessionnelSante, Utilisateur } = require('../models');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const medAuth = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('Vous n\'êtes pas connecté! Veuillez vous connecter pour accéder.', 401)
    );
  }

  // 2) Verification token with specific error handling
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Token invalide. Veuillez vous reconnecter.', 401));
    } else if (error.name === 'TokenExpiredError') {
      return next(new AppError('Votre session a expiré. Veuillez vous reconnecter.', 401));
    } else if (error.name === 'NotBeforeError') {
      return next(new AppError('Token non encore valide.', 401));
    }
    return next(new AppError('Erreur d\'authentification.', 401));
  }

  // 3) Check if professional still exists
  const currentProfessionnel = await ProfessionnelSante.findByPk(decoded.id, {
    include: {
      model: Utilisateur,
      as: 'compteUtilisateur',
      attributes: ['id_utilisateur', 'email', 'nom', 'prenom', 'role', 'statut']
    }
  });
  
  if (!currentProfessionnel) {
    return next(
      new AppError('Le professionnel propriétaire de ce token n\'existe plus.', 401)
    );
  }

  // 4) Check if professional account is active
  if (currentProfessionnel.statut !== 'actif') {
    return next(
      new AppError('Votre compte n\'est pas actif. Veuillez contacter l\'administration.', 403)
    );
  }

  // 5) Check if user account is active
  if (currentProfessionnel.compteUtilisateur && currentProfessionnel.compteUtilisateur.statut !== 'actif') {
    return next(
      new AppError('Votre compte utilisateur n\'est pas actif. Veuillez contacter l\'administration.', 403)
    );
  }

  // 6) Check if professional is a doctor (medecin)
  const doctorRoles = ['medecin', 'chirurgien', 'radiologue', 'anesthesiste'];
  if (!doctorRoles.includes(currentProfessionnel.role)) {
    return next(
      new AppError('Accès réservé aux médecins.', 403)
    );
  }

  // 7) Security audit logging for access
  console.log(`[MEDECIN ACCESS] Professionnel ID: ${currentProfessionnel.id_professionnel}, IP: ${req.ip}, User-Agent: ${req.get('User-Agent')}, Timestamp: ${new Date().toISOString()}`);

  // 8) Update last access timestamp for security monitoring
  try {
    if (currentProfessionnel.compteUtilisateur) {
      await currentProfessionnel.compteUtilisateur.update({
        date_derniere_connexion: new Date(),
        last_ip_address: req.ip
      });
    }
  } catch (error) {
    // Log error but don't block access
    console.error('Erreur mise à jour dernière connexion:', error);
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.professionnel = currentProfessionnel;
  res.locals.professionnel = currentProfessionnel; // Available in views if needed
  
  next();
});

module.exports = medAuth;