const express = require('express');
const patientController = require('./patient.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const patientAuth = require('../../middlewares/patientAuth');

const router = express.Router();

/**
 * @swagger
 * /patient:
 *   get:
 *     summary: Récupération de tous les patients
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des patients
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Patient'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *   post:
 *     summary: Création d'un patient
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - prenom
 *               - date_naissance
 *               - sexe
 *               - email
 *               - telephone
 *               - numero_assure
 *               - nom_assurance
 *               - mot_de_passe
 *             properties:
 *               nom:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: "Dupont"
 *                 description: "Nom de famille du patient (obligatoire)"
 *               prenom:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: "Jean"
 *                 description: "Prénom du patient (obligatoire)"
 *               date_naissance:
 *                 type: string
 *                 format: date
 *                 example: "1988-05-15"
 *                 description: "Date de naissance du patient (obligatoire)"
 *               sexe:
 *                 type: string
 *                 enum: [M, F, X, I]
 *                 example: "M"
 *                 description: "Sexe du patient (M: Masculin, F: Féminin, X: Non binaire, I: Intersexe)"
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 100
 *                 example: "jean.dupont@email.com"
 *                 description: "Adresse email du patient (unique, obligatoire)"
 *               telephone:
 *                 type: string
 *                 maxLength: 20
 *                 example: "+221701234567"
 *                 description: "Numéro de téléphone du patient (obligatoire)"
 *               adresse:
 *                 type: string
 *                 maxLength: 255
 *                 example: "123 Rue de la République"
 *                 description: "Adresse postale du patient (optionnel)"
 *               identifiantNational:
 *                 type: string
 *                 maxLength: 50
 *                 example: "1234567890123"
 *                 description: "Identifiant national du patient (numéro sécurité sociale, etc.) (optionnel)"
 *               numero_assure:
 *                 type: string
 *                 maxLength: 50
 *                 example: "IPRES123456789"
 *                 description: "Numéro d'assuré pour l'authentification (obligatoire, unique)"
 *               nom_assurance:
 *                 type: string
 *                 maxLength: 100
 *                 example: "IPRES"
 *                 description: "Nom de la compagnie d'assurance (obligatoire)"
 *               mot_de_passe:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: "motdepasse123"
 *                 description: "Mot de passe du patient pour l'authentification (obligatoire)"
 *              
 *     responses:
 *       201:
 *         description: Patient créé avec succès
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */

// Routes principales
router
  .route('/')
  .get(
    authMiddleware.protect, 
    authMiddleware.restrictTo('medecin', 'infirmier', 'secretaire', 'admin'), 
    patientController.getAllPatients
  ) // Professionnels de santé peuvent voir tous les patients
  .post(
    // Route publique pour l'auto-inscription OU route protégée pour création par médecin
    // Si req.user existe, c'est une création par un professionnel
    // Si req.user n'existe pas, c'est une auto-inscription
    patientController.createPatient
  );

/**
 * @swagger
 * /patient/{id}:
 *   get:
 *     summary: Récupération d'un patient spécifique
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du patient
 *     responses:
 *       200:
 *         description: Détails du patient
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Patient non trouvé
 *   patch:
 *     summary: Mise à jour d'un patient
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du patient
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: "Nom de famille du patient"
 *               prenom:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: "Prénom du patient"
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 100
 *                 description: "Adresse email du patient (unique)"
 *               telephone:
 *                 type: string
 *                 maxLength: 20
 *                 description: "Numéro de téléphone du patient"
 *               adresse:
 *                 type: string
 *                 maxLength: 255
 *                 description: "Adresse postale du patient"
 *               identifiantNational:
 *                 type: string
 *                 maxLength: 50
 *                 description: "Identifiant national du patient"
 *               utilisateur_id:
 *                 type: integer
 *                 description: "ID du compte utilisateur lié au patient"
 *     responses:
 *       200:
 *         description: Patient mis à jour
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Patient non trouvé
 *   delete:
 *     summary: Suppression d'un patient
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du patient
 *     responses:
 *       204:
 *         description: Patient supprimé
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Patient non trouvé
 */

router
  .route('/:id')
  .get(
    authMiddleware.protect, 
    authMiddleware.restrictTo('medecin', 'secretaire', 'patient'), 
    patientController.getPatient
  ) // Médecin, secrétaire ou le patient lui-même peut voir le dossier
  .patch(
    authMiddleware.protect, 
    authMiddleware.restrictTo('medecin', 'secretaire', 'patient'), 
    patientController.updatePatient
  ) // Médecin, secrétaire ou le patient lui-même peut modifier
  .delete(
    authMiddleware.protect, 
    authMiddleware.restrictTo('administrateur'), 
    patientController.deletePatient
  ); // Seuls les administrateurs peuvent supprimer

/**
 * @swagger
 * /patient/auth/login:
 *   post:
 *     summary: Connexion d'un patient avec numéro d'assuré et mot de passe
 *     tags: [Patient]
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
 *                 example: "IPRES123456789"
 *                 description: "Numéro d'assuré du patient"
 *               mot_de_passe:
 *                 type: string
 *                 format: password
 *                 example: "motdepasse123"
 *                 description: "Mot de passe du patient"
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
 *                 patient:
 *                   $ref: '#/components/schemas/Patient'
 *       401:
 *         description: Numéro d'assuré ou mot de passe incorrect
 */
router.post('/auth/login', patientController.login);

/**
 * @swagger
 * /patient/auth/2fa-info:
 *   post:
 *     summary: Afficher les informations 2FA (secret et QR code) pour un patient
 *     tags: [Patient]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - numero_assure
 *             properties:
 *               numero_assure:
 *                 type: string
 *                 example: "TEMP000005"
 *                 description: "Numéro d'assuré du patient"
 *     responses:
 *       200:
 *         description: Informations 2FA générées avec succès
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
 *                   example: "Informations 2FA générées avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     patient:
 *                       $ref: '#/components/schemas/Patient'
 *                     twoFactor:
 *                       type: object
 *                       properties:
 *                         secret:
 *                           type: string
 *                           description: "Secret 2FA pour l'application authenticator"
 *                         qrCode:
 *                           type: string
 *                           description: "QR code en base64 pour scanner avec l'app"
 *                         recoveryCodes:
 *                           type: array
 *                           items:
 *                             type: string
 *                           description: "Codes de récupération en cas de perte"
 *                         instructions:
 *                           type: array
 *                           items:
 *                             type: string
 *                           description: "Instructions d'utilisation"
 *       400:
 *         description: Numéro d'assuré manquant
 *       404:
 *         description: Patient non trouvé
 */
router.post('/auth/2fa-info', patientController.show2FAInfo);

/**
 * @swagger
 * /patient/auth/logout:
 *   post:
 *     summary: Déconnexion d'un patient
 *     tags: [Patient]
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 */
router.post('/auth/logout', patientController.logout);

/**
 * @swagger
 * /patient/auth/me:
 *   get:
 *     summary: Récupérer le profil du patient connecté
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil du patient
 *       401:
 *         description: Non authentifié
 */
router.get('/auth/me', patientAuth, patientController.getMe);

/**
 * @swagger
 * /patient/auth/change-password:
 *   post:
 *     summary: Changer le mot de passe du patient
 *     tags: [Patient]
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
 *                 example: "nouveauMotDePasse456"
 *     responses:
 *       200:
 *         description: Mot de passe changé avec succès
 *       401:
 *         description: Mot de passe actuel incorrect
 */
router.post('/auth/change-password', patientAuth, patientController.changePassword);

/**
 * @swagger
 * /patient/notifications/{notificationId}/mark-as-read:
 *   patch:
 *     summary: Marquer une notification comme lue
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la notification à marquer comme lue
 *     responses:
 *       200:
 *         description: Notification marquée comme lue avec succès
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
 *                   example: "Notification marquée comme lue"
 *                 data:
 *                   type: object
 *                   properties:
 *                     notification:
 *                       type: object
 *                       properties:
 *                         id_notification:
 *                           type: integer
 *                         statut:
 *                           type: string
 *                           example: "lue"
 *                         date_lecture:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès non autorisé
 *       404:
 *         description: Notification non trouvée
 */
router.patch('/notifications/:notificationId/mark-as-read', patientController.marquerNotificationLue);

module.exports = router;