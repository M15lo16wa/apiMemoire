const express = require('express');
const authController = require('./auth.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = express.Router();

// CPS Authentication routes

/**
 * @swagger
 * /auth/cps/login:
 *   post:
 *     summary: Authentification CPS pour professionnels de santé
 *     tags: [Auth - CPS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cpsCode
 *             properties:
 *               cpsCode:
 *                 type: string
 *                 minLength: 4
 *                 maxLength: 4
 *                 example: "3988"
 *                 description: Code CPS à 4 chiffres du professionnel
 *     responses:
 *       200:
 *         description: Authentification CPS réussie
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
 *                   example: "Authentification CPS réussie"
 *                 data:
 *                   type: object
 *                   properties:
 *                     professionnel:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 79
 *                         nom:
 *                           type: string
 *                           example: "Sakura"
 *                         prenom:
 *                           type: string
 *                           example: "Saza"
 *                         specialite:
 *                           type: string
 *                           example: "Cardiologie"
 *                         role:
 *                           type: string
 *                           example: "medecin"
 *                     token:
 *                       type: string
 *                       description: JWT token pour l'authentification
 *       400:
 *         description: Code CPS manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Code CPS requis"
 *       401:
 *         description: Code CPS incorrect
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Code CPS incorrect"
 */
router.post('/cps/login', authController.authenticateCPS);

/**
 * @swagger
 * /auth/authenticate-cps:
 *   post:
 *     summary: Authentification CPS (alias)
 *     tags: [Auth - CPS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cpsCode
 *             properties:
 *               cpsCode:
 *                 type: string
 *                 minLength: 4
 *                 maxLength: 4
 *                 example: "3988"
 *                 description: Code CPS à 4 chiffres du professionnel
 *     responses:
 *       200:
 *         description: Authentification CPS réussie
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
 *                   example: "Authentification CPS réussie"
 *                 data:
 *                   type: object
 *                   properties:
 *                     professionnel:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 79
 *                         nom:
 *                           type: string
 *                           example: "Sakura"
 *                         prenom:
 *                           type: string
 *                           example: "Saza"
 *                         specialite:
 *                           type: string
 *                           example: "Cardiologie"
 *                         role:
 *                           type: string
 *                           example: "medecin"
 *                     token:
 *                       type: string
 *                       description: JWT token pour l'authentification
 *       400:
 *         description: Code CPS manquant ou invalide
 *       401:
 *         description: Code CPS incorrect
 */
router.post('/authenticate-cps', authController.authenticateCPS); // Alias pour compatibilité

/**
 * @swagger
 * /auth/access-options:
 *   get:
 *     summary: Récupérer les options d'accès pour professionnel authentifié
 *     tags: [Auth - CPS]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Options d'accès récupérées
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
 *                     accessOptions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "demande_standard"
 *                           name:
 *                             type: string
 *                             example: "Demande d'accès standard"
 *                           description:
 *                             type: string
 *                             example: "Demander l'accès au dossier médical du patient"
 *                           requiresPatientId:
 *                             type: boolean
 *                             example: true
 *                           type:
 *                             type: string
 *                             example: "standard"
 *                           requiresJustification:
 *                             type: boolean
 *                             example: false
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Vous n'êtes pas connecté"
 */
router.get('/access-options', authMiddleware.protect, authController.getAccessOptions);

// Existing routes

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Auth]
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
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "Dupont"
 *                 description: Nom de l'utilisateur
 *               prenom:
 *                 type: string
 *                 example: "Jean"
 *                 description: Prénom de l'utilisateur
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jean.dupont@example.com"
 *                 description: Adresse email
 *               mot_de_passe:
 *                 type: string
 *                 minLength: 6
 *                 example: "motdepasse123"
 *                 description: Mot de passe
 *               role:
 *                 type: string
 *                 enum: [admin, secretaire]
 *                 default: secretaire
 *                 example: "secretaire"
 *                 description: Rôle de l'utilisateur
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
 *                 token:
 *                   type: string
 *                   description: JWT token pour l'authentification
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id_utilisateur:
 *                           type: integer
 *                         nom:
 *                           type: string
 *                         prenom:
 *                           type: string
 *                         email:
 *                           type: string
 *                         role:
 *                           type: string
 *       400:
 *         description: Données invalides ou champs manquants
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Auth]
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
 *                 example: "jean.dupont@example.com"
 *                 description: Adresse email
 *               mot_de_passe:
 *                 type: string
 *                 example: "motdepasse123"
 *                 description: Mot de passe
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
 *                 token:
 *                   type: string
 *                   description: JWT token pour l'authentification
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id_utilisateur:
 *                           type: integer
 *                         nom:
 *                           type: string
 *                         prenom:
 *                           type: string
 *                         email:
 *                           type: string
 *                         role:
 *                           type: string
 *       401:
 *         description: Email ou mot de passe incorrect
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Déconnexion utilisateur
 *     tags: [Auth]
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
 *                   example: "Logged out successfully"
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Récupération du profil utilisateur connecté
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur
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
 *                     user:
 *                       $ref: '#/components/schemas/Utilisateur'
 *       401:
 *         description: Non autorisé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Vous n'êtes pas connecté! Veuillez vous connecter pour accéder."
 */
router.get('/me', authMiddleware.protect, authController.getMe);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Changement de mot de passe utilisateur
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mot_de_passe_actuel
 *               - nouveau_mot_de_passe
 *             properties:
 *               mot_de_passe_actuel:
 *                 type: string
 *                 example: "ancienMotDePasse123"
 *               nouveau_mot_de_passe:
 *                 type: string
 *                 minLength: 6
 *                 example: "nouveauMotDePasse456"
 *     responses:
 *       200:
 *         description: Mot de passe changé avec succès
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
 *                   example: "Mot de passe mis à jour avec succès"
 *       400:
 *         description: Erreur de validation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Mot de passe actuel incorrect"
 *       401:
 *         description: Non autorisé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Vous n'êtes pas connecté"
 */
router.post('/change-password', authMiddleware.protect, authController.changePassword);

module.exports = router;