const { Patient } = require('../../models');
const AppError = require('../../utils/appError');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const tokenService = require('../../services/tokenService');
const TwoFactorService = require('../../services/twoFactorService');

/**
 * Sign JWT token for patient
 * @param {number} id - Patient ID
 * @returns {string} JWT token
 */
const signToken = (id) => {
  return jwt.sign({ id, role: 'patient' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 * Create and send JWT token in response
 * @param {Object} patient - Patient object
 * @param {number} statusCode - HTTP status code
 * @param {Object} res - Express response object
 */
const createSendToken = async (patient, statusCode, res) => {
  console.log(' DEBUG createSendToken - Patient reçu:', {
    id_patient: patient.id_patient,
    nom: patient.nom,
    prenom: patient.prenom,
    numero_assure: patient.numero_assure,
    hasPassword: !!patient.mot_de_passe
  });

  try {
    // Générer et stocker le token avec Redis
    console.log(' DEBUG - Appel de tokenService.generateAndStoreToken...');
    const token = await tokenService.generateAndStoreToken(patient, 'patient');
    console.log(' DEBUG - Token généré avec succès:', token ? token.substring(0, 20) + '...' : 'Aucun token');

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

    console.log('DEBUG - Envoi de la réponse avec token');
    res.status(statusCode).json({
      status: 'success',
      token,
      data: {
        patient,
      },
    });
  } catch (error) {
    console.error(' ERREUR dans createSendToken:', error);
    throw error;
  }
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
 * Login patient with 2FA verification (OBLIGATOIRE)
 * @param {string} numero_assure - Patient insurance number
 * @param {string} mot_de_passe - Patient password
 * @param {string} twoFactorToken - 2FA token (required for second step)
 * @returns {Object} Login result
 */
exports.loginPatientWith2FA = async (numero_assure, mot_de_passe, twoFactorToken = null) => {
  console.log('Login attempt with 2FA OBLIGATOIRE:', { 
    numero_assure, 
    password_length: mot_de_passe ? mot_de_passe.length : 0,
    has2FAToken: !!twoFactorToken
  });
  
  if (!numero_assure || !mot_de_passe) {
    throw new AppError('Veuillez fournir votre numéro d\'assuré et votre mot de passe', 400);
  }

  try {
    // Step 1: Verify credentials
    const patient = await this.loginPatient(numero_assure, mot_de_passe);
    
    // Step 2: 2FA OBLIGATOIRE pour tous les patients
    if (!twoFactorToken) {
      console.log('2FA OBLIGATOIRE - Première étape: identifiants vérifiés, 2FA requise');
      
      // Générer un secret 2FA temporaire si l'utilisateur n'en a pas
      let twoFactorSecret = patient.two_factor_secret;
      console.log(' DEBUG - Secret 2FA du patient:', twoFactorSecret);
      
      if (!twoFactorSecret) {
        console.log('Génération d\'un secret 2FA temporaire pour ce patient');
        twoFactorSecret = TwoFactorService.generateSecret(patient.email || patient.numero_assure);
        console.log('DEBUG - Nouveau secret 2FA généré:', twoFactorSecret);
        
        // Stocker temporairement le secret en base pour cette session
        await patient.update({ two_factor_secret: twoFactorSecret });
        console.log(' DEBUG - Secret 2FA sauvegardé en base temporairement');
      }
      
      // First step: credentials verified, 2FA token required
      return {
        requires2FA: true,
        patient: {
          id_patient: patient.id_patient,
          nom: patient.nom,
          prenom: patient.prenom,
          numero_assure: patient.numero_assure,
          two_factor_enabled: true,
          two_factor_secret: twoFactorSecret // Secret temporaire pour la session
        },
        message: 'Code d\'authentification à double facteur OBLIGATOIRE requis',
        twoFactorSecret: twoFactorSecret // Pour le test, on le renvoie
      };
    }
    
    // Second step: verify 2FA token
    console.log('2FA OBLIGATOIRE - Deuxième étape: vérification du code 2FA');
    
    // SOLUTION TEMPORAIRE: Utiliser le même secret que celui généré dans la première étape
    // En production, il faudrait utiliser Redis ou une session pour stocker le secret
    let twoFactorSecret = patient.two_factor_secret;
    if (!twoFactorSecret) {
      // Générer le même secret basé sur l'identifiant unique du patient
      console.log('Génération du secret 2FA pour la vérification (même algorithme)');
      twoFactorSecret = TwoFactorService.generateSecret(patient.numero_assure);
    }
    
    const is2FAValid = TwoFactorService.verifyToken(twoFactorToken, twoFactorSecret);
    
    if (!is2FAValid) {
      throw new AppError('Code d\'authentification à double facteur invalide', 401);
    }
    
    console.log('2FA OBLIGATOIRE validée avec succès');
    return {
      requires2FA: false,
      patient: patient,
      message: 'Authentification complète réussie avec 2FA'
    };
    
  } catch (error) {
    console.error('Error in loginPatientWith2FA:', error);
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
