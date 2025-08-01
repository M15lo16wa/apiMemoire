const express = require('express');
const accessController = require('./access.controller');
const { protect } = require('../../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     AuthorizationAccess:
 *       type: object
 *       required:
 *         - typeAcces
 *         - patient_id
 *         - professionnel_id
 *       properties:
 *         id_acces:
 *           type: integer
 *           description: ID unique de l'autorisation d'accès
 *         typeAcces:
 *           type: string
 *           description: Type d'accès autorisé
 *           example: "lecture"
 *         dateDebut:
 *           type: string
 *           format: date
 *           description: Date de début de l'autorisation
 *         dateFin:
 *           type: string
 *           format: date
 *           description: Date de fin de l'autorisation
 *         statut:
 *           type: string
 *           enum: [Actif, Révoqué, Expiré]
 *           description: Statut de l'autorisation
 *         raison:
 *           type: string
 *           description: Raison de l'autorisation
 *         patient_id:
 *           type: integer
 *           description: ID du patient
 *         professionnel_id:
 *           type: integer
 *           description: ID du professionnel
 *     HistoryAccess:
 *       type: object
 *       required:
 *         - action
 *       properties:
 *         id_historique:
 *           type: integer
 *           description: ID unique de l'historique d'accès
 *         date_heure_acces:
 *           type: string
 *           format: date-time
 *           description: Date et heure de l'accès
 *         action:
 *           type: string
 *           description: Action effectuée
 *           example: "consultation_dossier"
 *         type_ressource:
 *           type: string
 *           description: Type de ressource accédée
 *         id_ressource:
 *           type: integer
 *           description: ID de la ressource accédée
 *         details:
 *           type: string
 *           description: Détails de l'action
 *         statut:
 *           type: string
 *           description: Statut de l'action
 *           example: "SUCCES"
 *         adresse_ip:
 *           type: string
 *           description: Adresse IP de l'utilisateur
 *         user_agent:
 *           type: string
 *           description: User Agent du navigateur
 *         professionnel_id:
 *           type: integer
 *           description: ID du professionnel
 *         id_patient:
 *           type: integer
 *           description: ID du patient
 *         id_dossier:
 *           type: integer
 *           description: ID du dossier médical
 */

/**
 * @swagger
 * /api/access/authorization:
 *   post:
 *     summary: Créer une nouvelle autorisation d'accès
 *     tags: [Authorization Access]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - typeAcces
 *               - patient_id
 *               - professionnel_id
 *             properties:
 *               typeAcces:
 *                 type: string
 *                 example: "lecture"
 *               dateDebut:
 *                 type: string
 *                 format: date
 *               dateFin:
 *                 type: string
 *                 format: date
 *               statut:
 *                 type: string
 *                 enum: [Actif, Révoqué, Expiré]
 *               raison:
 *                 type: string
 *               patient_id:
 *                 type: integer
 *               professionnel_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Autorisation d'accès créée avec succès
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
 *                     authorizationAccess:
 *                       $ref: '#/components/schemas/AuthorizationAccess'
 *       400:
 *         description: Données requises manquantes
 *       401:
 *         description: Non autorisé
 *   get:
 *     summary: Obtenir toutes les autorisations d'accès
 *     tags: [Authorization Access]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des autorisations d'accès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     authorizationAccess:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AuthorizationAccess'
 */
router.route('/authorization')
  .post(protect, accessController.createAuthorizationAccess)
  .get(protect, accessController.getAllAuthorizationAccess);

/**
 * @swagger
 * /api/access/authorization/patient/{patientId}:
 *   get:
 *     summary: Obtenir les autorisations d'accès pour un patient
 *     tags: [Authorization Access]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du patient
 *     responses:
 *       200:
 *         description: Liste des autorisations d'accès pour le patient
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     authorizationAccess:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AuthorizationAccess'
 *       400:
 *         description: ID patient requis
 *       404:
 *         description: Patient non trouvé
 */
router.get('/authorization/patient/:patientId', protect, accessController.getAuthorizationAccessByPatient);

// Additional Authorization Access Routes
router.get('/authorization/:id', protect, accessController.getAuthorizationAccessById);
router.patch('/authorization/:id', protect, accessController.updateAuthorizationAccess);
router.patch('/authorization/:id/revoke', protect, accessController.revokeAuthorizationAccess);

/**
 * @swagger
 * /api/access/history:
 *   post:
 *     summary: Créer un nouvel enregistrement d'historique d'accès
 *     tags: [History Access]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 example: "consultation_dossier"
 *               type_ressource:
 *                 type: string
 *                 example: "dossier_medical"
 *               id_ressource:
 *                 type: integer
 *               details:
 *                 type: string
 *                 example: "Consultation du dossier médical"
 *               statut:
 *                 type: string
 *                 example: "SUCCES"
 *               professionnel_id:
 *                 type: integer
 *               id_patient:
 *                 type: integer
 *               id_dossier:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Enregistrement d'historique créé avec succès
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
 *                     historyAccess:
 *                       $ref: '#/components/schemas/HistoryAccess'
 *       400:
 *         description: Action requise
 *       401:
 *         description: Non autorisé
 *   get:
 *     summary: Obtenir tous les enregistrements d'historique d'accès
 *     tags: [History Access]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des enregistrements d'historique d'accès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     historyAccess:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/HistoryAccess'
 */
router.route('/history')
  .post(protect, accessController.createHistoryAccess)
  .get(protect, accessController.getAllHistoryAccess);

/**
 * @swagger
 * /api/access/history/patient/{patientId}:
 *   get:
 *     summary: Obtenir l'historique d'accès pour un patient
 *     tags: [History Access]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du patient
 *     responses:
 *       200:
 *         description: Liste de l'historique d'accès pour le patient
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     historyAccess:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/HistoryAccess'
 *       400:
 *         description: ID patient requis
 *       404:
 *         description: Patient non trouvé
 */
router.get('/history/patient/:patientId', protect, accessController.getHistoryAccessByPatient);

// Additional Utility Routes
/**
 * @swagger
 * /api/access/check/{professionnelId}/{patientId}/{typeAcces}:
 *   get:
 *     summary: Vérifier les permissions d'accès
 *     tags: [Access Control]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: professionnelId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du professionnel
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du patient
 *       - in: path
 *         name: typeAcces
 *         required: true
 *         schema:
 *           type: string
 *         description: Type d'accès requis
 *     responses:
 *       200:
 *         description: Résultat de la vérification d'accès
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
 *                     hasAccess:
 *                       type: boolean
 *                     message:
 *                       type: string
 */
router.get('/check/:professionnelId/:patientId/:typeAcces', protect, accessController.checkAccess);

/**
 * @swagger
 * /api/access/log:
 *   post:
 *     summary: Enregistrer une tentative d'accès
 *     tags: [Access Logging]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 example: "consultation_dossier"
 *               type_ressource:
 *                 type: string
 *                 example: "dossier_medical"
 *               id_ressource:
 *                 type: integer
 *               details:
 *                 type: string
 *               statut:
 *                 type: string
 *                 example: "SUCCES"
 *               code_erreur:
 *                 type: string
 *               message_erreur:
 *                 type: string
 *               professionnel_id:
 *                 type: integer
 *               id_patient:
 *                 type: integer
 *               id_dossier:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Tentative d'accès enregistrée avec succès
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
 *                     logEntry:
 *                       $ref: '#/components/schemas/HistoryAccess'
 */
router.post('/log', protect, accessController.logAccess);

module.exports = router;
