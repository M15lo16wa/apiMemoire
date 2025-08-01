const { Patient } = require('../../models');
const AppError = require('../../utils/appError');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Sign JWT token for patient
 * @param {number} id - Patient ID
 * @returns {string} JWT token
 */
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 * Create and send JWT token in response
 * @param {Object} patient - Patient object
 * @param {number} statusCode - HTTP status code
 * @param {Object} res - Express response object
 */
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

/**
 * Login patient with numero_assure and password
 * @param {string} numero_assure - Patient insurance number
 * @param {string} mot_de_passe - Patient password
 * @returns {Object} Patient object
 */
exports.loginPatient = async (numero_assure, mot_de_passe) => {
  console.log('Login attempt with:', { numero_assure, password_length: mot_de_passe ? mot_de_passe.length : 0 });
  
  if (!numero_assure || !mot_de_passe) {
    throw new AppError('Veuillez fournir votre numéro d\'assuré et votre mot de passe', 400);
  }

  try {
    // Find patient by numero_assure with password field included
    const patient = await Patient.scope('withPassword').findOne({
      where: { numero_assure }
    });

    console.log('Patient found:', patient ? `ID: ${patient.id_patient}, Name: ${patient.nom}` : 'No patient found');

    if (!patient) {
      throw new AppError('Numéro d\'assuré ou mot de passe incorrect', 401);
    }

    // Check if password exists in database
    if (!patient.mot_de_passe) {
      throw new AppError('Mot de passe non défini pour ce patient', 500);
    }

    // Check if password is correct
    const isPasswordCorrect = await bcrypt.compare(mot_de_passe, patient.mot_de_passe);
    
    if (!isPasswordCorrect) {
      throw new AppError('Numéro d\'assuré ou mot de passe incorrect', 401);
    }

    // Update last login date
    await patient.update({ derniere_connexion: new Date() });

    return patient;
  } catch (error) {
    console.error('Error in loginPatient:', error);
    throw error;
  }
};

/**
 * Change patient password
 * @param {number} patientId - Patient ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 */
exports.changePatientPassword = async (patientId, currentPassword, newPassword) => {
  if (!patientId) {
    throw new AppError('Vous devez être connecté pour changer votre mot de passe', 401);
  }

  const patient = await Patient.scope('withPassword').findByPk(patientId);
  
  if (!patient) {
    throw new AppError('Patient non trouvé', 404);
  }

  // Check if current password is correct
  const isPasswordCorrect = await bcrypt.compare(currentPassword, patient.mot_de_passe);
  
  if (!isPasswordCorrect) {
    throw new AppError('Mot de passe actuel incorrect', 401);
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  
  // Update password
  await patient.update({ 
    mot_de_passe: hashedPassword,
    password_changed_at: new Date()
  });

  return { message: 'Mot de passe mis à jour avec succès' };
};

exports.sendAuthToken = createSendToken;
