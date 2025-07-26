const { ProfessionnelSante, Utilisateur } = require('../../models');
const AppError = require('../../utils/appError');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Sign JWT token for professional
 * @param {number} id - Professional ID
 * @returns {string} JWT token
 */
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 * Create and send JWT token in response
 * @param {Object} professional - Professional object
 * @param {number} statusCode - HTTP status code
 * @param {Object} res - Express response object
 */
const createSendToken = (professional, statusCode, res) => {
  const token = signToken(professional.id_professionnel);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  };

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      professional,
    },
  });
};

/**
 * Login professional with numero_adeli (numero_licence) and password
 * @param {string} numero_adeli - Professional ADELI number (stored as numero_licence)
 * @param {string} mot_de_passe - Professional password
 * @returns {Object} Professional object
 */
exports.loginProfessionnel = async (numero_adeli, mot_de_passe) => {
  if (!numero_adeli || !mot_de_passe) {
    throw new AppError('Veuillez fournir votre numéro ADELI et votre mot de passe', 400);
  }

  // Find professional by numero_licence (as numero_adeli)
  const professionnel = await ProfessionnelSante.findOne({
    where: { numero_licence: numero_adeli },
    include: {
      model: Utilisateur,
      as: 'compteUtilisateur',
      attributes: ['id_utilisateur', 'email', 'mot_de_passe', 'role', 'statut']
    }
  });

  if (!professionnel) {
    throw new AppError('Numéro ADELI ou mot de passe incorrect', 401);
  }

  // Check if professional has an associated user account
  if (!professionnel.compteUtilisateur) {
    throw new AppError('Compte utilisateur non trouvé pour ce professionnel', 401);
  }

  // Check if password is correct
  const isPasswordCorrect = await bcrypt.compare(mot_de_passe, professionnel.compteUtilisateur.mot_de_passe);
  
  if (!isPasswordCorrect) {
    throw new AppError('Numéro ADELI ou mot de passe incorrect', 401);
  }

  // Check if user account is active
  if (professionnel.compteUtilisateur.statut !== 'actif') {
    throw new AppError('Votre compte est inactif. Veuillez contacter l\'administrateur.', 401);
  }

  // Update last login date
  await professionnel.compteUtilisateur.update({ date_derniere_connexion: new Date() });

  // Remove sensitive data
  professionnel.compteUtilisateur.mot_de_passe = undefined;

  return professionnel;
};

/**
 * Change professional password
 * @param {number} professionnelId - Professional ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 */
exports.changeProfessionnelPassword = async (professionnelId, currentPassword, newPassword) => {
  if (!professionnelId) {
    throw new AppError('Vous devez être connecté pour changer votre mot de passe', 401);
  }

  const professionnel = await ProfessionnelSante.findByPk(professionnelId, {
    include: {
      model: Utilisateur,
      as: 'compteUtilisateur',
      attributes: ['id_utilisateur', 'mot_de_passe']
    }
  });
  
  if (!professionnel) {
    throw new AppError('Professionnel non trouvé', 404);
  }

  if (!professionnel.compteUtilisateur) {
    throw new AppError('Compte utilisateur non trouvé pour ce professionnel', 404);
  }

  // Check if current password is correct
  const isPasswordCorrect = await bcrypt.compare(currentPassword, professionnel.compteUtilisateur.mot_de_passe);
  
  if (!isPasswordCorrect) {
    throw new AppError('Mot de passe actuel incorrect', 401);
  }

  // Update password
  await professionnel.compteUtilisateur.update({ 
    mot_de_passe: newPassword,
    // The password will be hashed by the Utilisateur model's beforeUpdate hook
  });

  return { message: 'Mot de passe mis à jour avec succès' };
};

exports.sendAuthToken = createSendToken;