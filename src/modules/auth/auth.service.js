const { Utilisateur } = require('../../models');

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