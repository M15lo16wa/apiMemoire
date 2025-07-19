const { Patient } = require('../../models');
const AppError = require('../../utils/appError');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (patient, statusCode, res) => {
  const token = signToken(patient.id_patient);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  };

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  patient.mot_de_passe = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      patient,
    },
  });
};

exports.registerPatient = async (patientData) => {
  // Vérifier si l'email existe déjà
  const existingPatient = await Patient.findOne({ where: { email: patientData.email } });
  if (existingPatient) {
    throw new AppError('Un compte patient avec cet email existe déjà.', 400);
  }

  // Vérifier si le numéro de sécurité sociale existe déjà (s'il est fourni)
  if (patientData.numero_securite_sociale) {
    const existingPatientBySSN = await Patient.findOne({ 
      where: { numero_securite_sociale: patientData.numero_securite_sociale } 
    });
    if (existingPatientBySSN) {
      throw new AppError('Un patient avec ce numéro de sécurité sociale existe déjà.', 400);
    }
  }

  try {
    // Le mot de passe sera automatiquement haché par le hook beforeCreate du modèle
    const newPatient = await Patient.create(patientData);
    return newPatient;
  } catch (error) {
    console.error('Erreur lors de la création du patient:', error);
    console.error('Détails de l\'erreur:', {
      name: error.name,
      message: error.message,
      errors: error.errors
    });
    throw new AppError('Erreur lors de la création du compte patient. Veuillez réessayer.', 500);
  }
};

exports.loginPatient = async (email, mot_de_passe) => {
  if (!email || !mot_de_passe) {
    throw new AppError('Veuillez fournir un email et un mot de passe!', 400);
  }

  const patient = await Patient.scope('withPassword').findOne({
    where: { email },
  });

  if (!patient) {
    throw new AppError('Email ou mot de passe incorrect', 401);
  }

  if (!patient.mot_de_passe) {
    throw new AppError('Email ou mot de passe incorrect', 401);
  }

  // Vérifier le statut du compte
  if (patient.statut_compte !== 'actif') {
    throw new AppError('Votre compte n\'est pas actif. Veuillez contacter l\'administration.', 401);
  }

  const isMatch = await bcrypt.compare(mot_de_passe, patient.mot_de_passe);

  if (!isMatch) {
    throw new AppError('Email ou mot de passe incorrect', 401);
  }

  // Mettre à jour la date de dernière connexion
  await patient.update({ date_derniere_connexion: new Date() });

  return patient;
};

exports.changePatientPassword = async (patientId, currentPassword, newPassword) => {
  const patient = await Patient.scope('withPassword').findByPk(patientId);
  
  if (!patient) {
    throw new AppError('Patient non trouvé', 404);
  }

  // Vérifier le mot de passe actuel
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, patient.mot_de_passe);
  if (!isCurrentPasswordValid) {
    throw new AppError('Mot de passe actuel incorrect', 400);
  }

  // Mettre à jour avec le nouveau mot de passe (sera automatiquement haché par le hook)
  await patient.update({ mot_de_passe: newPassword });
  
  return { message: 'Mot de passe mis à jour avec succès' };
};

exports.sendAuthToken = createSendToken;
