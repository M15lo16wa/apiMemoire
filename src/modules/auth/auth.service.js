const { Utilisateur, ProfessionnelSante,  HistoriqueAccess } = require('../../models');
const { Op } = require('sequelize');

const AppError = require('../../utils/appError');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id_utilisateur);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  };

  res.cookie('jwt', token, cookieOptions);

  user.mot_de_passe = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.register = async (userData) => {
  // Vérifier si l'email existe déjà
  const existingUser = await Utilisateur.findOne({ where: { email: userData.email } });
  if (existingUser) {
    throw new AppError('Un compte avec cet email existe déjà.', 400);
  }

  // Le mot de passe sera automatiquement haché par le hook beforeCreate du modèle

  try {
    const newUser = await Utilisateur.create(userData);
    return newUser;
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    console.error('Détails de l\'erreur:', {
      name: error.name,
      message: error.message,
      errors: error.errors
    });
    throw new AppError('Erreur lors de la création du compte. Veuillez réessayer.', 500);
  }
};

exports.login = async (email, mot_de_passe) => {
  if (!email || !mot_de_passe) {
    throw new AppError('Please provide email and password!', 400);
  }

  const user = await Utilisateur.scope('withPassword').findOne({
    where: { email },
    // attributes: ['id_utilisateur', 'nom', 'mot_de_passe', 'role']
  });

  if (!user) {
    throw new AppError('Incorrect email or password', 401);
  }

  if (!user.mot_de_passe) {
    throw new AppError('Incorrect email or password', 401);
  }

  const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);

  if (!isMatch) {
    throw new AppError('Incorrect email or password', 401);
  }

  // Mettre à jour la date de dernière connexion (optionnel)
  await user.update({ date_derniere_connexion: new Date() });

  return user;
};

exports.sendAuthToken = createSendToken;

// =================================================================
// === AUTHENTIFICATION SPÉCIFIQUE POUR LES PROFESSIONNELS DE SANTÉ ===
// =================================================================

/**
 * Authenticate a professional with their public identifier and their secret CPS code.
 * @param {string} publicIdentifier - The professional's public ID (e.g., email or numero_adeli).
 * @param {string} cpsCode - The 4-digit secret CPS code.
 * @returns {Object} The authenticated professional's data.
 */
exports.authenticateCPS = async (cpsCode) => {
  // 1. Validation des entrées
  if (!cpsCode) {
    throw new AppError('Un code CPS est requis.', 400);
  }
  if (!/^\d{4}$/.test(cpsCode)) {
    throw new AppError('Code CPS invalide. Il doit contenir 4 chiffres.', 400);
  }

  // 2. Retrouver tous les professionnels actifs avec un code CPS
  const professionnels = await ProfessionnelSante.scope('withPassword').findAll({
    where: {
      statut: 'actif',
      code_cps: {
        [Op.ne]: null // Code CPS non null
      }
    }
  });

  // 3. Vérifier le code CPS pour chaque professionnel
  let professionnelAuthentifie = null;
  
  for (const professionnel of professionnels) {
    if (professionnel.code_cps) {
      const isMatch = await bcrypt.compare(cpsCode, professionnel.code_cps);
      if (isMatch) {
        professionnelAuthentifie = professionnel;
        break;
      }
    }
  }

  if (!professionnelAuthentifie) {
    // Ne pas donner d'info précise si l'utilisateur n'existe pas ou n'a pas de code CPS
    throw new AppError('Identifiant ou code CPS invalide.', 401);
  }

  // 4. Loguer la tentative réussie dans l'historique
  try {
    await HistoriqueAccess.create({
      action: 'authentification_cps_reussie',
      statut: 'SUCCES',
      professionnel_id: professionnelAuthentifie.id_professionnel,
      details: `Authentification par code CPS réussie pour ${professionnelAuthentifie.nom} ${professionnelAuthentifie.prenom}.`
    });
  } catch (error) {
    // Si l'historique échoue, on continue quand même
    console.warn('Erreur lors de la création de l\'historique:', error.message);
  }
  
  // On ne retourne pas le code CPS hashé
  professionnelAuthentifie.code_cps = undefined; 
  return professionnelAuthentifie;
};


/**
 * Generate a specific access token for a professional after successful authentication.
 * @param {Object} professionnel - Professional data from the database.
 * @returns {string} JWT token.
 */
exports.generateAccessToken = (professionnel) => {
  return jwt.sign(
    { 
      id: professionnel.id_professionnel,
      role: professionnel.role, // ex: 'medecin'
      type: 'professionnel' // Indique que c'est un token de session pour un professionnel
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '8h' } // Une session de 8 heures
  );
};
