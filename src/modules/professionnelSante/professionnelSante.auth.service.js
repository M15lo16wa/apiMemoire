const { ProfessionnelSante, Utilisateur } = require('../../models');
const AppError = require('../../utils/appError');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const tokenService = require('../../services/tokenService');
const TwoFactorService = require('../../services/twoFactorService');

/**
 * Sign JWT token for professional
 * @param {Object} professional - Professional object
 * @returns {string} JWT token
 */
const signToken = (professional) => {
  return jwt.sign(
    { 
      id: professional.id_professionnel, 
      role: professional.role || 'professionnel_sante',
      type: 'professionnel'
    }, 
    process.env.JWT_SECRET, 
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};

/**
 * Create and send JWT token in response
 * @param {Object} professional - Professional object
 * @param {number} statusCode - HTTP status code
 * @param {Object} res - Express response object
 */
const createSendToken = async (professional, statusCode, res) => {
  // Générer et stocker le token avec Redis
  const token = await tokenService.generateAndStoreToken(professional, 'professionnel');

  // Debug des variables d'environnement
  console.log('DEBUG COOKIE - JWT_COOKIE_EXPIRES_IN:', process.env.JWT_COOKIE_EXPIRES_IN);
  console.log('DEBUG COOKIE - Type de JWT_COOKIE_EXPIRES_IN:', typeof process.env.JWT_COOKIE_EXPIRES_IN);
  
  // Validation et valeur par défaut
  const cookieExpiryDays = parseInt(process.env.JWT_COOKIE_EXPIRES_IN) || 7;
  console.log('DEBUG COOKIE - cookieExpiryDays calculé:', cookieExpiryDays);
  
  const cookieExpiryDate = new Date(Date.now() + cookieExpiryDays * 24 * 60 * 60 * 1000);
  console.log('DEBUG COOKIE - Date d\'expiration calculée:', cookieExpiryDate);

  const cookieOptions = {
    expires: cookieExpiryDate,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  };

  console.log('DEBUG COOKIE - Options du cookie:', cookieOptions);
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
 * @param {string} numero_adeli - Professional ADELI number (stored as numero_adeli)
 * @param {string} mot_de_passe - Professional password
 * @returns {Object} Professional object
 */
exports.loginProfessionnel = async (numero_adeli, mot_de_passe) => {
  console.log('DEBUG LOGIN - numero_adeli reçu:', numero_adeli);
  console.log('DEBUG LOGIN - mot_de_passe reçu:', mot_de_passe);

  if (!numero_adeli || !mot_de_passe) {
    throw new AppError('Veuillez fournir votre numéro ADELI et votre mot de passe', 400);
  }

  // Find professional by numero_adeli (as numero_adeli)
  const professionnel = await ProfessionnelSante.findOne({
    where: { numero_adeli: numero_adeli },
    attributes: { include: ['mot_de_passe'] }, // Inclure explicitement le mot de passe
    include: {
      model: Utilisateur,
      as: 'compteUtilisateur',
      attributes: ['id_utilisateur', 'email', 'mot_de_passe', 'role', 'statut']
    }
  });

  if (!professionnel) {
    console.log('DEBUG LOGIN - Aucun professionnel trouvé pour ce numero_adeli');
    throw new AppError('Numéro ADELI ou mot de passe incorrect', 401);
  }

  console.log('DEBUG LOGIN - mot_de_passe stocké (hashé):', professionnel.mot_de_passe);
  console.log('DEBUG LOGIN - utilisateur_id:', professionnel.utilisateur_id);
  console.log('DEBUG LOGIN - statut:', professionnel.statut);

  // Si le professionnel a un compte utilisateur associé, on vérifie sur ce compte
  if (professionnel.compteUtilisateur) {
    try {
      const isPasswordCorrect = await bcrypt.compare(mot_de_passe, professionnel.compteUtilisateur.mot_de_passe);
      if (!isPasswordCorrect) {
        console.log('DEBUG LOGIN - Mot de passe incorrect pour compte utilisateur associé');
        throw new AppError('Numéro ADELI ou mot de passe incorrect', 401);
      }
      if (professionnel.compteUtilisateur.statut !== 'actif') {
        throw new AppError('Votre compte est inactif. Veuillez contacter l\'administrateur.', 401);
      }
      await professionnel.compteUtilisateur.update({ date_derniere_connexion: new Date() });
      professionnel.compteUtilisateur.mot_de_passe = undefined;
      return professionnel;
    } catch (error) {
      console.log('DEBUG LOGIN - Erreur lors de la vérification du compte utilisateur:', error.message);
      // En cas d'erreur avec le compte utilisateur, on continue avec la vérification directe
    }
  }

  // Sinon, on vérifie le mot de passe sur le professionnel lui-même
  console.log('DEBUG LOGIN - Vérification directe du professionnel');
  
  if (!professionnel.mot_de_passe) {
    console.log('DEBUG LOGIN - Aucun mot de passe défini pour ce professionnel');
    throw new AppError('Aucun mot de passe défini pour ce professionnel', 401);
  }
  
  console.log('DEBUG LOGIN - Comparaison des mots de passe...');
  const isPasswordCorrect = await bcrypt.compare(mot_de_passe, professionnel.mot_de_passe);
  console.log('DEBUG LOGIN - Résultat de la comparaison:', isPasswordCorrect);
  
  if (!isPasswordCorrect) {
    console.log('DEBUG LOGIN - Mot de passe incorrect pour professionnel');
    throw new AppError('Numéro ADELI ou mot de passe incorrect', 401);
  }
  
  console.log('DEBUG LOGIN - Mot de passe correct, vérification du statut...');
  // On peut aussi vérifier le statut si besoin (ex: professionnel.statut)
  if (professionnel.statut && professionnel.statut !== 'actif') {
    throw new AppError('Votre compte professionnel est inactif. Veuillez contacter l\'administrateur.', 401);
  }
  
  console.log('DEBUG LOGIN - Authentification réussie, retour du professionnel');
  // On peut mettre à jour une date de connexion si besoin
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

/**
 * Login professional with 2FA verification (OBLIGATOIRE)
 * @param {string} numero_adeli - Professional ADELI number
 * @param {string} mot_de_passe - Professional password
 * @param {string} twoFactorToken - 2FA token (required for second step)
 * @returns {Object} Login result
 */
exports.loginProfessionnelWith2FA = async (numero_adeli, mot_de_passe, twoFactorToken = null) => {
  console.log('🔐 Login attempt with 2FA OBLIGATOIRE pour professionnel:', { 
    numero_adeli, 
    password_length: mot_de_passe ? mot_de_passe.length : 0,
    has2FAToken: !!twoFactorToken
  });
  
  if (!numero_adeli || !mot_de_passe) {
    throw new AppError('Veuillez fournir votre numéro ADELI et votre mot de passe', 400);
  }

  try {
    // Step 1: Verify credentials
    const professionnel = await this.loginProfessionnel(numero_adeli, mot_de_passe);
    
    // Step 2: 2FA OBLIGATOIRE pour tous les professionnels de santé
    if (!twoFactorToken) {
      console.log('🔐 2FA OBLIGATOIRE - Première étape: identifiants vérifiés, 2FA requise');
      
      // Générer un secret 2FA temporaire si l'utilisateur n'en a pas
      let twoFactorSecret = professionnel.two_factor_secret;
      if (!twoFactorSecret) {
        console.log('🔐 Génération d\'un secret 2FA temporaire pour ce professionnel');
        twoFactorSecret = TwoFactorService.generateSecret(professionnel.email || professionnel.numero_adeli);
        
        // Stocker temporairement le secret (en session ou cache)
        // Note: En production, il faudrait l'activer définitivement
      }
      
      // First step: credentials verified, 2FA token required
      return {
        requires2FA: true,
        professionnel: {
          id_professionnel: professionnel.id_professionnel,
          nom: professionnel.nom,
          prenom: professionnel.prenom,
          numero_adeli: professionnel.numero_adeli,
          role: professionnel.role,
          two_factor_enabled: true,
          two_factor_secret: twoFactorSecret // Secret temporaire pour la session
        },
        message: 'Code d\'authentification à double facteur OBLIGATOIRE requis',
        twoFactorSecret: twoFactorSecret // Pour le test, on le renvoie
      };
    }
    
    // Second step: verify 2FA token
    console.log('🔐 2FA OBLIGATOIRE - Deuxième étape: vérification du code 2FA');
    
    // Récupérer le secret 2FA (depuis la session ou le cache en production)
    let twoFactorSecret = professionnel.two_factor_secret;
    if (!twoFactorSecret) {
      // En production, il faudrait récupérer depuis la session/cache
      throw new AppError('Session 2FA expirée, veuillez vous reconnecter', 401);
    }
    
    const is2FAValid = TwoFactorService.verifyToken(twoFactorToken, twoFactorSecret);
    
    if (!is2FAValid) {
      throw new AppError('Code d\'authentification à double facteur invalide', 401);
    }
    
    console.log('✅ 2FA OBLIGATOIRE validée avec succès');
    return {
      requires2FA: false,
      professionnel: professionnel,
      message: 'Authentification complète réussie avec 2FA'
    };
    
  } catch (error) {
    console.error('Error in loginProfessionnelWith2FA:', error);
    throw error;
  }
};

exports.sendAuthToken = createSendToken;