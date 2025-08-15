const express = require('express');
const accessController = require('./access.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const patientAccessMiddleware = require('../../middlewares/patientAccess.middleware');
const validationMiddleware = require('../../middlewares/validation.middleware');
const accessMiddleware = require('../../middlewares/access.middleware');

const router = express.Router();

// Protect all routes
router.use(authMiddleware.protect);

// Access request routes (for professionals)

/**
 * @swagger
 * /access/request-standard:
 *   post:
 *     summary: Demander un accès standard au dossier médical
 *     tags: [Access - Professional]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patient_id
 *             properties:
 *               patient_id:
 *                 type: integer
 *                 example: 123
 *                 description: ID du patient
 *               raison_demande:
 *                 type: string
 *                 example: "Consultation de routine"
 *                 description: Raison de la demande d'accès
 *     responses:
 *       201:
 *         description: Demande d'accès créée avec succès
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
 *                   example: "Demande d'accès envoyée avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/AutorisationAcces'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Patient non trouvé
 */
router.post('/request-standard', accessController.requestStandardAccess);

// --- NOUVELLE ROUTE AJOUTÉE ICI ---
/**
 * @swagger
 * /access/status/{patientId}:
 *   get:
 *     summary: Vérifier le statut d'accès actuel d'un professionnel pour un patient
 *     tags: [Access - Professional]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: integer
 *         description: L'ID du patient concerné
 *     responses:
 *       200:
 *         description: Statut de l'accès récupéré avec succès
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
 *                     accessStatus:
 *                       type: string
 *                       enum: [not_requested, pending, active, denied_or_expired]
 *                     authorization:
 *                       $ref: '#/components/schemas/AutorisationAcces'
 */
// Route pour les professionnels (existant)
router.get(
    '/status/:patientId',
    authMiddleware.protect,
    authMiddleware.restrictTo('medecin', 'infirmier'),
    validationMiddleware.validateRouteParams(['patientId']),
    accessController.getAccessStatusForPatient
);

// NOUVELLE ROUTE pour permettre aux patients d'accéder à leur propre statut d'accès
/**
 * @swagger
 * /access/patient/status:
 *   get:
 *     summary: Récupérer le statut d'accès du patient connecté
 *     tags: [Access - Patient]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statut d'accès récupéré avec succès
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
 *                     patient_id:
 *                       type: integer
 *                       description: ID du patient
 *                     accessRequests:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AutorisationAcces'
 *                     activeAuthorizations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AutorisationAcces'
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 */
router.get(
    '/patient/status',
    authMiddleware.protect,
    patientAccessMiddleware.requirePatientAuth,
    accessController.getPatientAccessStatus
);

/**
 * @swagger
 * /access/grant-emergency:
 *   post:
 *     summary: Accorder un accès d'urgence au dossier médical
 *     tags: [Access - Professional]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patient_id
 *               - justification_urgence
 *             properties:
 *               patient_id:
 *                 type: integer
 *                 example: 123
 *                 description: ID du patient
 *               justification_urgence:
 *                 type: string
 *                 example: "Patient en détresse vitale"
 *                 description: Justification de l'urgence
 *     responses:
 *       201:
 *         description: Accès d'urgence accordé
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
 *                   example: "Accès d'urgence accordé"
 *                 data:
 *                   type: object
 *                   properties:
 *                     autorisation:
 *                       $ref: '#/components/schemas/AutorisationAcces'
 *                     dmp_token:
 *                       type: string
 *                       description: Token DMP pour accès immédiat
 *                     expires_in:
 *                       type: integer
 *                       example: 3600
 *                       description: Durée de validité en secondes
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Patient non trouvé
 */
router.post('/grant-emergency', accessController.grantEmergencyAccess);

/**
 * @swagger
 * /access/grant-secret:
 *   post:
 *     summary: Accorder un accès secret au dossier médical
 *     tags: [Access - Professional]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patient_id
 *             properties:
 *               patient_id:
 *                 type: integer
 *                 example: 123
 *                 description: ID du patient
 *               raison_secrete:
 *                 type: string
 *                 example: "Investigation médicale"
 *                 description: Raison secrète de l'accès
 *     responses:
 *       201:
 *         description: Accès secret accordé
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
 *                   example: "Accès secret accordé"
 *                 data:
 *                   type: object
 *                   properties:
 *                     autorisation:
 *                       $ref: '#/components/schemas/AutorisationAcces'
 *                     dmp_token:
 *                       type: string
 *                       description: Token DMP pour accès immédiat
 *                     expires_in:
 *                       type: integer
 *                       example: 7200
 *                       description: Durée de validité en secondes
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Patient non trouvé
 */
router.post('/grant-secret', accessController.grantSecretAccess);

// DMP token generation

/**
 * @swagger
 * /access/dmp-token/{authorizationId}:
 *   get:
 *     summary: Générer un token DMP pour une autorisation existante
 *     tags: [Access - Professional]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: authorizationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'autorisation
 *     responses:
 *       200:
 *         description: Token DMP généré avec succès
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
 *                   example: "Token DMP généré avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/DMPAccessToken'
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Autorisation non active ou expirée
 *       404:
 *         description: Autorisation non trouvée
 */
router.get('/dmp-token/:authorizationId', accessController.generateDMPAccessToken);

// Professional history and authorizations

/**
 * @swagger
 * /access/history/professional:
 *   get:
 *     summary: Récupérer l'historique des accès pour le professionnel
 *     tags: [Access - Professional]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historique récupéré
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
 *                   example: 15
 *                 data:
 *                   type: object
 *                   properties:
 *                     history:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/HistoriqueAccess'
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès réservé aux professionnels
 */
router.get('/history/professional', accessController.getProfessionalAccessHistory);

/**
 * @swagger
 * /access/authorizations/active:
 *   get:
 *     summary: Récupérer les autorisations actives du professionnel
 *     tags: [Access - Professional]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Autorisations actives récupérées
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
 *                   example: 5
 *                 data:
 *                   type: object
 *                   properties:
 *                     authorizations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AutorisationAcces'
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès réservé aux professionnels
 */
router.get('/authorizations/active', accessController.getProfessionalActiveAuthorizations);

// Patient response routes (for patients)

/**
 * @swagger
 * /access/patient/pending:
 *   get:
 *     summary: Récupérer les demandes d'accès en attente
 *     tags: [Access - Patient]
 *     security:
 *       - patientAuth: []
 *     responses:
 *       200:
 *         description: Demandes en attente récupérées
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
 *                   example: 2
 *                 data:
 *                   type: object
 *                   properties:
 *                     pendingRequests:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AutorisationAcces'
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès réservé aux patients
 */
router.get('/patient/pending', authMiddleware.protect,authMiddleware.restrictTo('patient'), patientAccessMiddleware.requirePatientAuth, accessController.getPatientPendingRequests);

/**
 * @swagger
 * /access/patient/response/{authorizationId}:
 *   patch:
 *     summary: Répondre à une demande d'accès
 *     tags: [Access - Patient]
 *     security:
 *       - patientAuth: []
 *     parameters:
 *       - in: path
 *         name: authorizationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'autorisation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - response
 *             properties:
 *               response:
 *                 type: string
 *                 enum: [accept, refuse]
 *                 example: "accept"
 *                 description: Réponse du patient
 *               comment:
 *                 type: string
 *                 example: "Autorisation accordée pour consultation"
 *                 description: Commentaire optionnel
 *     responses:
 *       200:
 *         description: Réponse traitée avec succès
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
 *                   example: "Demande acceptée avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     autorisation:
 *                       $ref: '#/components/schemas/AutorisationAcces'
 *                     dmp_token:
 *                       type: string
 *                       description: Token DMP (si accepté)
 *                     expires_in:
 *                       type: integer
 *                       description: Durée de validité (si accepté)
 *       400:
 *         description: Réponse invalide
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès réservé aux patients
 *       404:
 *         description: Demande non trouvée
 */
router.patch('/patient/response/:authorizationId',
  authMiddleware.protect, 
  authMiddleware.restrictTo('patient'),
  patientAccessMiddleware.requirePatientAuth, 
  patientAccessMiddleware.checkPatientAuthorizationAccess, 
  accessController.processPatientResponse
);

/**
 * @swagger
 * /access/patient/history:
 *   get:
 *     summary: Récupérer l'historique des accès pour le patient
 *     tags: [Access - Patient]
 *     security:
 *       - patientAuth: []
 *     responses:
 *       200:
 *         description: Historique récupéré
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
 *                   example: 10
 *                 data:
 *                   type: object
 *                   properties:
 *                     history:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/HistoriqueAccess'
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès réservé aux patients
 */
router.get('/patient/history', patientAccessMiddleware.requirePatientAuth, accessController.getPatientAccessHistory);

/**
 * @swagger
 * /access/patient/authorizations:
 *   get:
 *     summary: Récupérer les autorisations actives pour le patient
 *     tags: [Access - Patient]
 *     security:
 *       - patientAuth: []
 *     responses:
 *       200:
 *         description: Autorisations actives récupérées
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
 *                   example: 3
 *                 data:
 *                   type: object
 *                   properties:
 *                     authorizations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AutorisationAcces'
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès réservé aux patients
 */
router.get('/patient/authorizations', authMiddleware.restrictTo('patient'), patientAccessMiddleware.requirePatientAuth, accessController.getPatientActiveAuthorizations);

// Existing routes

/**
 * @swagger
 * /access/authorization:
 *   post:
 *     summary: Créer une nouvelle autorisation d'accès
 *     tags: [Access - Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type_acces
 *               - patient_id
 *               - professionnel_id
 *             properties:
 *               type_acces:
 *                 type: string
 *                 enum: [lecture, lecture_urgence, lecture_secrete]
 *                 example: "lecture"
 *               patient_id:
 *                 type: integer
 *                 example: 123
 *               professionnel_id:
 *                 type: integer
 *                 example: 79
 *               raison_demande:
 *                 type: string
 *                 example: "Consultation médicale"
 *     responses:
 *       201:
 *         description: Autorisation créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/AutorisationAcces'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 */
router.post('/authorization', accessController.createAuthorizationAccess);

/**
 * @swagger
 * /access/authorization:
 *   get:
 *     summary: Récupérer toutes les autorisations d'accès
 *     tags: [Access - Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des autorisations récupérée
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
 *                   example: 25
 *                 data:
 *                   type: object
 *                   properties:
 *                     authorizations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AutorisationAcces'
 *       401:
 *         description: Non autorisé
 */
router.get('/authorization', accessController.getAllAuthorizationAccess);

/**
 * @swagger
 * /access/authorization/{id}:
 *   get:
 *     summary: Récupérer une autorisation par ID
 *     tags: [Access - Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'autorisation
 *     responses:
 *       200:
 *         description: Autorisation récupérée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/AutorisationAcces'
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Autorisation non trouvée
 */
router.get('/authorization/:id', accessController.getAuthorizationAccessById);

/**
 * @swagger
 * /access/authorization/{id}:
 *   patch:
 *     summary: Modifier une autorisation d'accès
 *     description: Permet aux utilisateurs autorisés de modifier une autorisation d'accès (statut, raison, etc.)
 *     tags: [Access - Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'autorisation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               statut:
 *                 type: string
 *                 enum: [actif, inactif, attente_validation, refuse, expire]
 *                 example: "expire"
 *                 description: Nouveau statut de l'autorisation
 *               raison_demande:
 *                 type: string
 *                 example: "Médecin a quitté l'espace de santé du patient"
 *                 description: Raison de la modification
 *               motif_revocation:
 *                 type: string
 *                 example: "Révocation demandée par le patient"
 *                 description: Motif de révocation (si applicable)
 *               date_fin:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-31T23:59:59.000Z"
 *                 description: Nouvelle date de fin (si applicable)
 *     responses:
 *       200:
 *         description: Autorisation mise à jour avec succès
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
 *                   example: "Autorisation mise à jour avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     authorizationAccess:
 *                       $ref: '#/components/schemas/AutorisationAcces'
 *                     context:
 *                       type: object
 *                       properties:
 *                         patientInfo:
 *                           type: object
 *                           properties:
 *                             nom:
 *                               type: string
 *                             prenom:
 *                               type: string
 *                         professionnelInfo:
 *                           type: object
 *                           properties:
 *                             nom:
 *                               type: string
 *                             prenom:
 *                               type: string
 *                             specialite:
 *                               type: string
 *       400:
 *         description: Données invalides ou ID manquant
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Permissions insuffisantes
 *       404:
 *         description: Autorisation non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.patch('/authorization/:id', 
  authMiddleware.protect,
  accessMiddleware.getAuthorizationContext,
  accessMiddleware.checkAuthorizationOwnership,
  accessController.updateAuthorizationAccess
);

/**
 * @swagger
 * /access/authorization/{id}:
 *   delete:
 *     summary: Révoquer une autorisation d'accès
 *     tags: [Access - Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'autorisation
 *     responses:
 *       204:
 *         description: Autorisation révoquée avec succès
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Autorisation non trouvée
 */
router.delete('/authorization/:id', 
  authMiddleware.protect, 
  authMiddleware.restrictTo('medecin', 'infirmier', 'admin'),
  accessController.revokeAuthorizationAccess
);

/**
 * @swagger
 * /access/history:
 *   post:
 *     summary: Créer une entrée d'historique d'accès
 *     tags: [Access - Management]
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
 *               - professionnel_id
 *               - id_patient
 *             properties:
 *               action:
 *                 type: string
 *                 example: "consultation_dossier"
 *               professionnel_id:
 *                 type: integer
 *                 example: 79
 *               id_patient:
 *                 type: integer
 *                 example: 123
 *               details:
 *                 type: string
 *                 example: "Consultation du dossier médical"
 *     responses:
 *       201:
 *         description: Historique créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/HistoriqueAccess'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 */
router.post('/history', accessController.createHistoryAccess);

/**
 * @swagger
 * /access/history:
 *   get:
 *     summary: Récupérer tout l'historique d'accès
 *     tags: [Access - Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historique récupéré
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
 *                   example: 50
 *                 data:
 *                   type: object
 *                   properties:
 *                     history:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/HistoriqueAccess'
 *       401:
 *         description: Non autorisé
 */
router.get('/history', accessController.getAllHistoryAccess);

/**
 * @swagger
 * /access/history/patient/{patientId}:
 *   get:
 *     summary: Récupérer l'historique d'accès pour un patient
 *     tags: [Access - Management]
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
 *         description: Historique du patient récupéré
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
 *                   example: 10
 *                 data:
 *                   type: object
 *                   properties:
 *                     history:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/HistoriqueAccess'
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Patient non trouvé
 */
router.get('/history/patient/:patientId', accessController.getHistoryAccessByPatient);

/**
 * @swagger
 * /access/authorization/patient/{patientId}:
 *   get:
 *     summary: Récupérer les autorisations d'accès pour un patient
 *     tags: [Access - Management]
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
 *         description: Autorisations du patient récupérées
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
 *                   example: 5
 *                 data:
 *                   type: object
 *                   properties:
 *                     authorizations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AutorisationAcces'
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Patient non trouvé
 */
router.get('/authorization/patient/:patientId', accessController.getAuthorizationAccessByPatient);

/**
 * @swagger
 * /access/check/{professionnelId}/{patientId}/{typeAcces}:
 *   get:
 *     summary: Vérifier l'accès d'un professionnel à un patient
 *     tags: [Access - Management]
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
 *           enum: [lecture, lecture_urgence, lecture_secrete]
 *         description: Type d'accès à vérifier
 *     responses:
 *       200:
 *         description: Accès vérifié
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
 *                       example: true
 *                     authorization:
 *                       $ref: '#/components/schemas/AutorisationAcces'
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Professionnel ou patient non trouvé
 */
router.get('/check/:professionnelId/:patientId/:typeAcces', accessController.checkAccess);

/**
 * @swagger
 * /access/log:
 *   post:
 *     summary: Enregistrer un accès au dossier médical
 *     tags: [Access - Management]
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
 *               - professionnel_id
 *               - id_patient
 *             properties:
 *               action:
 *                 type: string
 *                 example: "consultation_dossier"
 *               professionnel_id:
 *                 type: integer
 *                 example: 79
 *               id_patient:
 *                 type: integer
 *                 example: 123
 *               details:
 *                 type: string
 *                 example: "Consultation du dossier médical complet"
 *     responses:
 *       201:
 *         description: Accès enregistré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/HistoriqueAccess'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 */
router.post('/log', accessController.logAccess);

/**
 * @swagger
 * /access/patient/authorization/{id}:
 *   delete:
 *     summary: Révoquer une autorisation d'accès (pour les patients)
 *     tags: [Access - Patient]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'autorisation
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Raison de la révocation
 *     responses:
 *       200:
 *         description: Autorisation révoquée avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Autorisation non trouvée
 */
router.delete('/patient/authorization/:id',
  authMiddleware.protect,
  patientAccessMiddleware.requirePatientAuth,
  accessController.revokePatientAuthorization
);

module.exports = router;
