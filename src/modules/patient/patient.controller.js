const { Patient } = require('../../models');
const patientService = require('./patient.service');
const patientAuthService = require('./patient.auth.service');
const catchAsync = require('../../utils/catchAsync');
const accessService = require('../access/access.service');
const tokenService = require('../../services/tokenService');
const TwoFactorService = require('../../services/twoFactorService');

const AppError = require('../../utils/appError');

exports.getAllPatients = catchAsync(async (req, res, next) => {
  const patients = await patientService.getAllPatients();
  res.status(200).json({
    status: 'success',
    results: patients.length,
    data: {
      patients,
    },
  });
});

exports.getPatient = catchAsync(async (req, res, next) => {
  const patient = await patientService.getPatientById(req.params.id);
  
  // Logique d'accès granulaire
  // Un patient ne peut voir que son propre dossier
  if (req.user && req.user.role === 'patient' && req.user.id_patient !== parseInt(req.params.id)) {
    return next(new AppError('Vous n\'êtes pas autorisé à voir ce dossier patient.', 403));
  }
  res.status(200).json({
    status: 'success',
    data: {
      patient,
    },
  });
});

exports.createPatient = catchAsync(async (req, res, next) => {
  // Validation des champs requis
  const requiredFields = ['nom', 'prenom', 'date_naissance', 'lieu_naissance', 'civilite', 'sexe', 'numero_assure', 'nom_assurance', 'adresse', 'ville', 'pays', 'email', 'telephone', 'mot_de_passe'];
  const missingFields = requiredFields.filter(field => !req.body[field]);
  
  if (missingFields.length > 0) {
    return next(new AppError(`Champs requis manquants : ${missingFields.join(', ')}`, 400));
  }

  const newPatient = await patientService.createPatient(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      patient: newPatient,
    },
  });
});

exports.updatePatient = catchAsync(async (req, res, next) => {
  // Vérification d'accès : un patient ne peut modifier que son propre dossier
  if (req.user && req.user.role === 'patient' && req.user.id_patient !== parseInt(req.params.id)) {
    return next(new AppError('Vous ne pouvez modifier que votre propre dossier.', 403));
  }

  const updatedPatient = await patientService.updatePatient(req.params.id, req.body);
  res.status(200).json({
    status: 'success',
    data: {
      patient: updatedPatient,
    },
  });
});

exports.deletePatient = catchAsync(async (req, res, next) => {
  await patientService.deletePatient(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Authentication endpoints for patients
exports.login = catchAsync(async (req, res, next) => {
  const { numero_assure, mot_de_passe, twoFactorToken } = req.body;

  if (!numero_assure || !mot_de_passe) {
    return next(new AppError('Veuillez fournir votre numéro d\'assuré et votre mot de passe', 400));
  }

  try {
    // Utiliser la nouvelle méthode de connexion avec 2FA
    const loginResult = await patientAuthService.loginPatientWith2FA(numero_assure, mot_de_passe, twoFactorToken);
    
    if (loginResult.requires2FA) {
      // Première étape : identifiants vérifiés, 2FA requise
      return res.status(200).json({
        status: 'requires2FA',
        message: loginResult.message,
        data: {
          patient: loginResult.patient,
          requires2FA: true
        },
        twoFactorSecret: loginResult.twoFactorSecret // Ajouter le secret 2FA pour le test
      });
    }
    
    // Deuxième étape : 2FA validée ou non requise, connexion complète
    await patientAuthService.sendAuthToken(loginResult.patient, 200, res);
  } catch (error) {
    next(error);
  }
});

exports.logout = catchAsync(async (req, res, next) => {
  try {
    console.log('🔍 DEBUG logout - Début de la fonction logout');
    
    // Récupérer le token depuis les cookies ou headers
    let token;
    if (req.cookies.jwt) {
      token = req.cookies.jwt;
      console.log('🔍 DEBUG logout - Token trouvé dans les cookies');
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('🔍 DEBUG logout - Token trouvé dans les headers Authorization');
    } else {
      console.log('🔍 DEBUG logout - Aucun token trouvé');
    }

    console.log('🔍 DEBUG logout - Token extrait:', token ? token.substring(0, 30) + '...' : 'Aucun token');

    if (token) {
      try {
        // Décoder le token JWT pour extraire l'ID utilisateur
        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(token);
        
        if (decoded && decoded.id) {
          const userId = decoded.id;
          console.log(`🔍 DEBUG logout - ID utilisateur extrait du token: ${userId}`);
          console.log(`🔍 DEBUG logout - Type utilisateur: ${decoded.type}, Rôle: ${decoded.role}`);
          
          // Appeler tokenService.revokeToken
          console.log(`🔍 DEBUG logout - Appel de tokenService.revokeToken pour l'utilisateur ID: ${userId}`);
          const revokeResult = await tokenService.revokeToken(token, userId);
          console.log(`🔍 DEBUG logout - Résultat de la révocation:`, revokeResult);
          
          if (revokeResult) {
            console.log('✅ DEBUG logout - Token révoqué avec succès dans Redis');
          } else {
            console.log('❌ DEBUG logout - Échec de la révocation du token');
          }
        } else {
          console.log('⚠️  DEBUG logout - Impossible de décoder le token ou ID manquant');
        }
      } catch (decodeError) {
        console.error('❌ DEBUG logout - Erreur lors du décodage du token:', decodeError.message);
      }
    }

    // Invalider le cookie
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000), // Expire dans 10 secondes pour forcer la déconnexion
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    });

    console.log('🔍 DEBUG logout - Cookie invalidé, envoi de la réponse');
    res.status(200).json({ 
      status: 'success', 
      message: 'Déconnexion réussie' 
    });
  } catch (error) {
    console.error('❌ DEBUG logout - Erreur lors de la déconnexion:', error);
    // Même en cas d'erreur, on invalide le cookie
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    });
    
    res.status(200).json({ 
      status: 'success', 
      message: 'Déconnexion réussie' 
    });
  }
});

exports.changePassword = catchAsync(async (req, res, next) => {
  const patientId = req.patient && req.patient.id_patient;
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

exports.getMe = catchAsync(async (req, res, next) => {
  // req.patient est attaché par le middleware patientAuth
  if (!req.patient) {
    return next(new AppError('Patient non trouvé dans la requête. Authentification échouée.', 500));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      patient: req.patient
    }
  });
});

// === CONTRÔLEURS POUR LA GESTION DES NOTIFICATIONS ET ACCÈS ===

/**
 * Récupère les demandes d'accès en attente pour le patient connecté.
 */
exports.getPendingAccessRequests = catchAsync(async (req, res, next) => {
    const patientId = req.patient.id_patient; // 'req.patient' vient du middleware 'patientAuth'

    // On doit appeler le service qui gère la logique d'accès
    const accessService = require('../access/access.service');
    const pendingRequests = await accessService.getPendingRequests(patientId);

    res.status(200).json({
        status: 'success',
        results: pendingRequests.length,
        data: {
            // Le front-end s'attend à un champ 'notifications'
            notifications: pendingRequests
        }
    });
});

/**
 * Répond à une demande d'accès.
 */
exports.respondToAccessRequest = catchAsync(async (req, res, next) => {
    const patientId = req.patient.id_patient;
    const { authorizationId } = req.params;
    const { response, comment } = req.body; // 'accept' ou 'refuse'

    const accessService = require('../access/access.service');

    // On vérifie que le patient a le droit de répondre à CETTE demande spécifique
    const autorisation = await accessService.processPatientResponse(authorizationId, patientId, response, comment);

    res.status(200).json({
        status: 'success',
        message: `Demande ${response === 'accept' ? 'acceptée' : 'refusée'}`,
        data: { autorisation }
    });
});

/**
 * Marque une notification comme lue.
 */
exports.marquerNotificationLue = catchAsync(async (req, res, next) => {
    const patientId = req.patient.id_patient;
    const { notificationId } = req.params;

    // Le service d'accès gère aussi les notifications liées à l'accès
    const accessService = require('../access/access.service');
    await accessService.marquerNotificationCommeLue(notificationId, patientId);

    res.status(200).json({
        status: 'success',
        message: 'Notification marquée comme lue'
    });
});

/**
 * Marque une notification spécifique comme lue.
 */
exports.marquerNotificationLue = catchAsync(async (req, res, next) => {
    // 1. On récupère les informations de la requête
    const patientId = req.patient.id_patient; // Vient du middleware `patientAuth`
    const { notificationId } = req.params;   // Vient de l'URL (ex: /notifications/123/mark-as-read)

    // 2. On appelle le service que vous venez de créer
    await accessService.marquerNotificationCommeLue(notificationId, patientId);

    // 3. On envoie une réponse de succès
    res.status(200).json({
        status: 'success',
        message: 'Notification marquée comme lue.'
    });
});

/**
 * Afficher les informations 2FA (secret et QR code) pour un patient
 * Accessible après connexion initiale réussie
 */
exports.show2FAInfo = catchAsync(async (req, res, next) => {
  const { numero_assure } = req.body;
  
  if (!numero_assure) {
    return next(new AppError('Numéro d\'assuré requis', 400));
  }

  try {
    // Trouver le patient
    const patient = await Patient.findOne({
      where: { numero_assure }
    });

    if (!patient) {
      return next(new AppError('Patient non trouvé', 404));
    }

    // Générer ou récupérer le secret 2FA
    let twoFactorSecret = patient.two_factor_secret;
    if (!twoFactorSecret) {
      twoFactorSecret = TwoFactorService.generateSecret(patient.email || patient.numero_assure);
      
      // Optionnel : sauvegarder le secret en base
      // await patient.update({ two_factor_secret: twoFactorSecret });
    }

    // Générer le QR code
    const qrCodeDataURL = await TwoFactorService.generateQRCode(
      patient.email || patient.numero_assure,
      twoFactorSecret,
      'DMP Platform'
    );

    // Générer des codes de récupération
    const recoveryCodes = TwoFactorService.generateRecoveryCodes(5);

    res.status(200).json({
      status: 'success',
      message: 'Informations 2FA générées avec succès',
      data: {
        patient: {
          id_patient: patient.id_patient,
          nom: patient.nom,
          prenom: patient.prenom,
          numero_assure: patient.numero_assure
        },
        twoFactor: {
          secret: twoFactorSecret,
          qrCode: qrCodeDataURL,
          recoveryCodes: recoveryCodes,
          instructions: [
            '1. Scannez le QR code avec votre application authenticator (Google Authenticator, Authy, etc.)',
            '2. Entrez le code 6 chiffres affiché dans votre app pour finaliser la connexion',
            '3. Conservez les codes de récupération en lieu sûr'
          ]
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la génération des informations 2FA:', error);
    return next(new AppError('Erreur lors de la génération des informations 2FA', 500));
  }
});