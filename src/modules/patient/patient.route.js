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
 *     summary: Création d'un patient (par un médecin ou auto-inscription)
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
 *               - lieu_naissance
 *               - civilite
 *               - sexe
 *               - numero_assure
 *               - nom_assurance
 *               - adresse
 *               - ville
 *               - pays
 *               - email
 *               - telephone
 *               - mot_de_passe
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "Dupont"
 *               prenom:
 *                 type: string
 *                 example: "Jean"
 *               date_naissance:
 *                 type: string
 *                 format: date
 *                 example: "1988-05-15"
 *               lieu_naissance:
 *                 type: string
 *                 example: "Dakar"
 *               civilite:
 *                 type: string
 *                 enum: [M., Mme, Mlle]
 *                 example: "M."
 *               sexe:
 *                 type: string
 *                 enum: [M, F, Autre]
 *                 example: "M"
 *               numero_assure:
 *                 type: string
 *                 example: "SN123456789"
 *               nom_assurance:
 *                 type: string
 *                 example: "IPRES"
 *               adresse:
 *                 type: string
 *                 example: "123 Rue de la République"
 *               ville:
 *                 type: string
 *                 example: "Dakar"
 *               pays:
 *                 type: string
 *                 example: "Sénégal"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jean.dupont@email.com"
 *               telephone:
 *                 type: string
 *                 example: "+221701234567"
 *               mot_de_passe:
 *                 type: string
 *                 format: password
 *                 example: "motdepasse123"
 *               code_postal:
 *                 type: string
 *                 example: "10000"
 *               groupe_sanguin:
 *                 type: string
 *                 enum: [A+, A-, B+, B-, AB+, AB-, O+, O-, Inconnu]
 *                 example: "A+"
 *               personne_contact:
 *                 type: string
 *                 example: "Marie Dupont"
 *               telephone_urgence:
 *                 type: string
 *                 example: "+221701234568"
 *               lien_parente:
 *                 type: string
 *                 example: "Épouse"
 *               profession:
 *                 type: string
 *                 example: "Ingénieur"
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
 *               prenom:
 *                 type: string
 *               email:
 *                 type: string
 *               telephone:
 *                 type: string
 *               adresse:
 *                 type: string
 *               ville:
 *                 type: string
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
 *                 example: "SN123456789"
 *               mot_de_passe:
 *                 type: string
 *                 example: "motdepasse123"
 *     responses:
 *       200:
 *         description: Connexion réussie
 *       401:
 *         description: Numéro d'assuré ou mot de passe incorrect
 */
router.post('/auth/login', patientController.login);

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

module.exports = router;