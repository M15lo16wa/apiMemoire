const express = require('express');
const authController = require('./auth.controller');
const { protect } = require('../../middlewares/auth.middleware');

const router = express.Router();

// =================================================================
// === ROUTES PUBLIQUES ===
// =================================================================

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - prenom
 *               - email
 *               - mot_de_passe
 *               - role
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nom de famille
 *                 example: "Dupont"
 *               prenom:
 *                 type: string
 *                 description: Prénom
 *                 example: "Jean"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Adresse email unique
 *                 example: "jean.dupont@email.com"
 *               mot_de_passe:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: Mot de passe (minimum 8 caractères)
 *                 example: "motdepasse123"
 *               role:
 *                 type: string
 *                 enum: [admin, secretaire, patient]
 *                 description: Rôle de l'utilisateur
 *                 example: "patient"
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: "Utilisateur créé avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/Utilisateur'
 *       400:
 *         description: Données invalides ou email déjà utilisé
 *       500:
 *         description: Erreur serveur
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - mot_de_passe
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Adresse email de l'utilisateur
 *                 example: "jean.dupont@email.com"
 *               mot_de_passe:
 *                 type: string
 *                 format: password
 *                 description: Mot de passe de l'utilisateur
 *                 example: "motdepasse123"
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: "Connexion réussie"
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: JWT token pour l'authentification
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     user:
 *                       $ref: '#/components/schemas/Utilisateur'
 *       400:
 *         description: Données manquantes
 *       401:
 *         description: Email ou mot de passe incorrect
 *       500:
 *         description: Erreur serveur
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /auth/login-professionnel:
 *   post:
 *     summary: Connexion d'un professionnel de santé
 *     tags: [Authentification - Professionnels]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - numero_adeli
 *               - mot_de_passe
 *             properties:
 *               numero_adeli:
 *                 type: string
 *                 description: Numéro ADELI du professionnel
 *                 example: "123456789"
 *               mot_de_passe:
 *                 type: string
 *                 format: password
 *                 description: Mot de passe du professionnel
 *                 example: "motdepasse123"
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: "Connexion réussie"
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: JWT token pour l'authentification
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     professionnel:
 *                       $ref: '#/components/schemas/ProfessionnelSante'
 *       400:
 *         description: Données manquantes
 *       401:
 *         description: Numéro ADELI ou mot de passe incorrect
 *       500:
 *         description: Erreur serveur
 */
router.post('/login-professionnel', authController.loginProfessionnel);

/**
 * @swagger
 * /auth/login-patient:
 *   post:
 *     summary: Connexion d'un patient
 *     tags: [Authentification - Patients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - numero_assure
 *               - mot_de_passe
 *             properties:
 *               numero_assure:
 *                 type: string
 *                 description: Numéro d'assuré du patient
 *                 example: "IPRES123456789"
 *               mot_de_passe:
 *                 type: string
 *                 format: password
 *                 description: Mot de passe du patient
 *                 example: "motdepasse123"
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: "Connexion réussie"
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: JWT token pour l'authentification
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     patient:
 *                       $ref: '#/components/schemas/Patient'
 *       400:
 *         description: Données manquantes
 *       401:
 *         description: Numéro d'assuré ou mot de passe incorrect
 *       500:
 *         description: Erreur serveur
 */
router.post('/login-patient', authController.loginPatient);

// =================================================================
// === ROUTES PROTÉGÉES ===
// =================================================================

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Déconnexion d'un utilisateur
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: "Déconnexion réussie"
 *       401:
 *         description: Non authentifié
 */
router.post('/logout', protect, authController.logout);

/**
 * @swagger
 * /auth/logout-professionnel:
 *   post:
 *     summary: Déconnexion d'un professionnel de santé
 *     tags: [Authentification - Professionnels]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: "Déconnexion réussie"
 *       401:
 *         description: Non authentifié
 */
router.post('/logout-professionnel', protect, authController.logoutProfessionnel);

/**
 * @swagger
 * /auth/logout-patient:
 *   post:
 *     summary: Déconnexion d'un patient
 *     tags: [Authentification - Patients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: "Déconnexion réussie"
 *       401:
 *         description: Non authentifié
 */
router.post('/logout-patient', protect, authController.logoutPatient);

/**
 * @swagger
 * /auth/logout-all-devices:
 *   post:
 *     summary: Déconnexion de tous les appareils
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion de tous les appareils réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: "Déconnexion de tous les appareils réussie"
 *                 data:
 *                   type: object
 *                   properties:
 *                     devicesLoggedOut:
 *                       type: integer
 *                       description: Nombre d'appareils déconnectés
 *                       example: 3
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
router.post('/logout-all-devices', protect, authController.logoutAllDevices);

/**
 * @swagger
 * /auth/session:
 *   get:
 *     summary: Récupérer les informations de session
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informations de session récupérées
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     session:
 *                       type: object
 *                       properties:
 *                         userId:
 *                           type: integer
 *                           description: ID de l'utilisateur
 *                           example: 1
 *                         role:
 *                           type: string
 *                           description: Rôle de l'utilisateur
 *                           example: "medecin"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           description: Date de création de la session
 *                           example: "2025-08-16T18:00:00.000Z"
 *                         expiresAt:
 *                           type: string
 *                           format: date-time
 *                           description: Date d'expiration de la session
 *                           example: "2025-08-17T18:00:00.000Z"
 *                         deviceInfo:
 *                           type: object
 *                           properties:
 *                             userAgent:
 *                               type: string
 *                               example: "Mozilla/5.0..."
 *                             ipAddress:
 *                               type: string
 *                               example: "192.168.1.1"
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
router.get('/session', protect, authController.getSessionInfo);

/**
 * @swagger
 * /auth/redis-stats:
 *   get:
 *     summary: Récupérer les statistiques Redis (admin seulement)
 *     tags: [Authentification - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques Redis récupérées
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalConnections:
 *                           type: integer
 *                           description: Nombre total de connexions
 *                           example: 150
 *                         activeSessions:
 *                           type: integer
 *                           description: Sessions actives
 *                           example: 45
 *                         memoryUsage:
 *                           type: string
 *                           description: Utilisation mémoire
 *                           example: "2.5 MB"
 *                         uptime:
 *                           type: string
 *                           description: Temps de fonctionnement
 *                           example: "2h 30m"
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (rôle admin requis)
 *       500:
 *         description: Erreur serveur
 */
router.get('/redis-stats', protect, authController.getRedisStats);

// =================================================================
// === ROUTES 2FA (AUTHENTIFICATION À DOUBLE FACTEUR) ===
// =================================================================

/**
 * @swagger
 * /auth/setup-2fa:
 *   post:
 *     summary: Configurer l'authentification à double facteur (2FA)
 *     tags: [2FA - Authentification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enable:
 *                 type: boolean
 *                 description: Activer ou désactiver le 2FA
 *                 example: true
 *     responses:
 *       200:
 *         description: 2FA configuré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: "2FA configuré avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     qrCode:
 *                       type: string
 *                       description: Code QR à scanner avec l'application d'authentification
 *                       example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
 *                     secret:
 *                       type: string
 *                       description: Clé secrète pour configurer manuellement l'application
 *                       example: "JBSWY3DPEHPK3PXP"
 *                     backupCodes:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Codes de récupération à conserver en lieu sûr
 *                       example: ["12345678", "87654321", "11223344"]
 *       400:
 *         description: Erreur de configuration
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
router.post('/setup-2fa', protect, authController.setup2FA);

/**
 * @swagger
 * /auth/verify-2fa:
 *   post:
 *     summary: Vérifier un code 2FA
 *     tags: [2FA - Authentification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - code
 *               properties:
 *                 code:
 *                   type: string
 *                   description: Code 2FA à 6 chiffres généré par l'application
 *                   example: "123456"
 *                 rememberDevice:
 *                   type: boolean
 *                   description: Mémoriser cet appareil pour 30 jours
 *                   example: false
 *     responses:
 *       200:
 *         description: Code 2FA vérifié avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: "Code 2FA vérifié avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessionValidated:
 *                       type: boolean
 *                       example: true
 *                     deviceRemembered:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Code invalide ou expiré
 *       401:
 *         description: Non authentifié
 *       429:
 *         description: Trop de tentatives, réessayez plus tard
 */
router.post('/verify-2fa', protect, authController.verify2FA);

/**
 * @swagger
 * /auth/disable-2fa:
 *   post:
 *     summary: Désactiver l'authentification à double facteur
 *     tags: [2FA - Authentification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - password
 *             properties:
 *               code:
 *                 type: string
 *                   description: Code 2FA actuel pour confirmer la désactivation
 *                   example: "123456"
 *               password:
 *                 type: string
 *                   description: Mot de passe de l'utilisateur pour confirmer
 *                   example: "motdepasse123"
 *     responses:
 *       200:
 *         description: 2FA désactivé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: "2FA désactivé avec succès"
 *       400:
 *         description: Code ou mot de passe incorrect
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
router.post('/disable-2fa', protect, authController.disable2FA);

/**
 * @swagger
 * /auth/validate-2fa-session:
 *   post:
 *     summary: Valider une session avec 2FA
 *     tags: [2FA - Authentification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                   description: Code 2FA à 6 chiffres
 *                   example: "123456"
 *     responses:
 *       200:
 *         description: Session validée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: "Session validée avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessionValidated:
 *                       type: boolean
 *                       example: true
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-08-17T18:00:00.000Z"
 *       400:
 *         description: Code invalide
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Session expirée
 */
router.post('/validate-2fa-session', protect, authController.validate2FASession);

/**
 * @swagger
 * /auth/generate-recovery-codes:
 *   post:
 *     summary: Générer de nouveaux codes de récupération 2FA
 *     tags: [2FA - Authentification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                   description: Mot de passe de l'utilisateur pour confirmer
 *                   example: "motdepasse123"
 *     responses:
 *       200:
 *         description: Nouveaux codes de récupération générés
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: "Nouveaux codes de récupération générés"
 *                 data:
 *                   type: object
 *                   properties:
 *                     backupCodes:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Nouveaux codes de récupération (les anciens sont invalidés)
 *                       example: ["ABCD1234", "EFGH5678", "IJKL9012"]
 *                     warning:
 *                       type: string
 *                       example: "Les anciens codes de récupération sont maintenant invalides"
 *       400:
 *         description: Mot de passe incorrect
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
router.post('/generate-recovery-codes', protect, authController.generateRecoveryCodes);

/**
 * @swagger
 * /auth/verify-recovery-code:
 *   post:
 *     summary: Vérifier un code de récupération 2FA
 *     tags: [2FA - Authentification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recoveryCode
 *             properties:
 *               recoveryCode:
 *                 type: string
 *                   description: Code de récupération à utiliser
 *                   example: "ABCD1234"
 *     responses:
 *       200:
 *         description: Code de récupération vérifié avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: "Code de récupération vérifié"
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessionValidated:
 *                       type: boolean
 *                       example: true
 *                     recoveryCodeUsed:
 *                       type: boolean
 *                       example: true
 *                     remainingCodes:
 *                       type: integer
 *                       description: Nombre de codes de récupération restants
 *                       example: 9
 *       400:
 *         description: Code de récupération invalide ou déjà utilisé
 *       401:
 *         description: Non authentifié
 *       429:
 *         description: Trop de tentatives, réessayez plus tard
 */
router.post('/verify-recovery-code', protect, authController.verifyRecoveryCode);

module.exports = router;