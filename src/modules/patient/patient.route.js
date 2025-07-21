const express = require('express');
const patientController = require('./patient.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = express.Router();

// Appliquer le middleware de protection à toutes les routes ci-dessous
router.use(authMiddleware.protect);

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
 *         description: Non authentifié (token manquant ou invalide)
 *       403:
 *         description: Accès refusé (rôle admin requis)
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
 *             description: >
 *               Les champs 'utilisateur_id' et 'role' sont interdits et provoqueront une erreur 400.
 *             required:
 *               - nom
 *               - prenom
 *               - age
 *               - sexe
 *               - email
 *               - telephone
 *               - ville
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "Dupont"
 *               prenom:
 *                 type: string
 *                 example: "Jean"
 *               age:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 150
 *                 example: 35
 *               sexe:
 *                 type: string
 *                 enum: [M, F, Autre, Non précisé]
 *                 example: "M"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jean.dupont@email.com"
 *               telephone:
 *                 type: string
 *                 example: "+33123456789"
 *               ville:
 *                 type: string
 *                 example: "Paris"
 *               date_naissance:
 *                 type: string
 *                 format: date
 *                 example: "1988-05-15"
 *               lieu_naissance:
 *                 type: string
 *                 example: "Paris"
 *               adresse:
 *                 type: string
 *                 example: "123 Rue de la Paix"
 *               code_postal:
 *                 type: string
 *                 example: "75001"
 *               pays:
 *                 type: string
 *                 example: "France"
 *               groupe_sanguin:
 *                 type: string
 *                 enum: [A+, A-, B+, B-, AB+, AB-, O+, O-, Inconnu]
 *                 example: "A+"
 *               assurance_maladie:
 *                 type: string
 *                 example: "CPAM"
 *               numero_assurance:
 *                 type: string
 *                 example: "1234567890123"
 *               personne_urgence_nom:
 *                 type: string
 *                 example: "Marie Dupont"
 *               personne_urgence_telephone:
 *                 type: string
 *                 example: "+33123456789"
 *               personne_urgence_lien:
 *                 type: string
 *                 example: "Épouse"
 *               profession:
 *                 type: string
 *                 example: "Ingénieur"
 *               situation_familiale:
 *                 type: string
 *                 enum: [Célibataire, Marié(e), Pacsé(e), Divorcé(e), Veuf/Veuve, Union libre, Autre]
 *                 example: "Marié(e)"
 *               nombre_enfants:
 *                 type: integer
 *                 minimum: 0
 *                 example: 2
 *               commentaires:
 *                 type: string
 *                 example: "Allergie aux pénicillines"
 *     responses:
 *       201:
 *         description: Patient créé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Patient'
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
 *                   example: "Les champs 'utilisateur_id' et 'role' ne sont pas autorisés"
 *       401:
 *         description: Non authentifié (token manquant ou invalide)
 *       403:
 *         description: Accès refusé (rôle admin requis)
 */
// Routes avec restriction de rôle (exemple)
router
  .route('/')
  .get(authMiddleware.protect, authMiddleware.restrictTo('medecin', 'infirmier','secretaire'), patientController.getAllPatients) // Seuls les medecins, l'infirmier et secrétaires peuvent voir tous les patients
  .post(authMiddleware.protect, authMiddleware.restrictTo('medecin'), patientController.createPatient); // Seuls les medecins peuvent créer des patients

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Patient'
 *       401:
 *         description: Non authentifié (token manquant ou invalide)
 *       403:
 *         description: Accès refusé (rôle requis)
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
 *               age:
 *                 type: integer
 *               sexe:
 *                 type: string
 *               email:
 *                 type: string
 *               telephone:
 *                 type: string
 *               ville:
 *                 type: string
 *     responses:
 *       200:
 *         description: Patient mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Patient'
 *       401:
 *         description: Non authentifié (token manquant ou invalide)
 *       403:
 *         description: Accès refusé (rôle admin ou secretaire requis)
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
 *         description: Non authentifié (token manquant ou invalide)
 *       403:
 *         description: Accès refusé (rôle admin requis)
 *       404:
 *         description: Patient non trouvé
 */
router
  .route('/:id')
  .get(authMiddleware.protect, authMiddleware.restrictTo('medecin', 'secretaire'), patientController.getPatient) // Un patient peut voir son propre dossier (avec la logique dans le contrôleur)
  .patch(authMiddleware.protect, authMiddleware.restrictTo('medecin', 'secretaire'), patientController.updatePatient)
  .delete(authMiddleware.protect, authMiddleware.restrictTo('admin'), patientController.deletePatient); // Seuls les admins peuvent supprimer un patient

module.exports = router;