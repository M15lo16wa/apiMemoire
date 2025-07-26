const express = require('express');
const professionnelSanteController = require('./professionnelSante.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const medAuth = require('../../middlewares/medAuh');

const router = express.Router();

/**
 * @swagger
 * /professionnelSante:
 *   get:
 *     summary: Récupérer tous les professionnels de santé
 *     tags: [ProfessionnelSante]
 *     responses:
 *       200:
 *         description: Liste des professionnels de santé
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
 *                     $ref: '#/components/schemas/ProfessionnelSante'
 *   post:
 *     summary: Créer un professionnel de santé
 *     tags: [ProfessionnelSante]
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
 *               - sexe
 *               - role
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "Martin"
 *               prenom:
 *                 type: string
 *                 example: "Dr. Sophie"
 *               date_naissance:
 *                 type: string
 *                 format: date
 *                 example: "1980-03-15"
 *               sexe:
 *                 type: string
 *                 enum: [M, F, Autre, Non précisé]
 *                 example: "F"
 *               specialite:
 *                 type: string
 *                 example: "Cardiologie"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "sophie.martin@hopital.fr"
 *               telephone:
 *                 type: string
 *                 example: "+33123456789"
 *               telephone_portable:
 *                 type: string
 *                 example: "+33612345678"
 *               adresse: 
 *                 type: string
 *                 example: "456 Avenue des Médecins"
 *               code_postal:
 *                 type: string
 *                 example: "75002"
 *               ville:
 *                 type: string
 *                 example: "Paris"
 *               pays:
 *                 type: string
 *                 example: "France"
 *               role:
 *                 type: string
 *                 enum: [medecin, infirmier, secretaire, aide_soignant, technicien_laboratoire, pharmacien, kinesitherapeute, chirurgien, radiologue, anesthesiste, autre]
 *                 example: "medecin"
 *               numero_licence:
 *                 type: string
 *                 example: "123456789"
 *               date_obtention_licence:
 *                 type: string
 *                 format: date
 *                 example: "2005-06-20"
 *               statut:
 *                 type: string
 *                 enum: [actif, inactif, en_conges, retraite]
 *                 example: "actif"
 *               date_embauche:
 *                 type: string
 *                 format: date
 *                 example: "2010-09-01"
 *               description:
 *                 type: string
 *                 example: "Spécialiste en cardiologie avec 15 ans d'expérience"
 *               photo_url:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/photo.jpg"
 *     responses:
 *       201:
 *         description: Professionnel créé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/ProfessionnelSante'
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
 *                   example: "A professional with this license number already exists"
 *       401:
 *         description: Non authentifié (token manquant ou invalide)
 *       403:
 *         description: Accès refusé (rôle admin requis)
 */
router.route('/')
  .get(professionnelSanteController.getAllProfessionnels)
  .post(authMiddleware.protect, authMiddleware.restrictTo('admin'), professionnelSanteController.createProfessionnel);

/**
 * @swagger
 * /professionnelSante/{id}:
 *   get:
 *     summary: Récupérer un professionnel de santé par ID
 *     tags: [ProfessionnelSante]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du professionnel
 *     responses:
 *       200:
 *         description: Détails du professionnel
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/ProfessionnelSante'
 *       401:
 *         description: Non authentifié (token manquant ou invalide)
 *       404:
 *         description: Professionnel non trouvé
 *   patch:
 *     summary: Mettre à jour un professionnel de santé
 *     tags: [ProfessionnelSante]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du professionnel
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
 *               specialite:
 *                 type: string
 *               email:
 *                 type: string
 *               telephone:
 *                 type: string
 *               role:
 *                 type: string
 *               statut:
 *                 type: string
 *     responses:
 *       200:
 *         description: Professionnel mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/ProfessionnelSante'
 *       401:
 *         description: Non authentifié (token manquant ou invalide)
 *       403:
 *         description: Accès refusé (rôle admin requis)
 *       404:
 *         description: Professionnel non trouvé
 *   delete:
 *     summary: Supprimer un professionnel de santé
 *     tags: [ProfessionnelSante]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du professionnel
 *     responses:
 *       204:
 *         description: Professionnel supprimé
 *       401:
 *         description: Non authentifié (token manquant ou invalide)
 *       403:
 *         description: Accès refusé (rôle admin requis)
 *       404:
 *         description: Professionnel non trouvé
 */
router.route('/:id')
  .get(authMiddleware.protect, professionnelSanteController.getProfessionnel)
  .patch(authMiddleware.protect, authMiddleware.restrictTo('admin'), professionnelSanteController.updateProfessionnel)
  .delete(authMiddleware.protect, authMiddleware.restrictTo('admin'), professionnelSanteController.deleteProfessionnel);

/**
 * @swagger
 * /professionnelSante/auth/login:
 *   post:
 *     summary: Connexion d'un médecin avec numéro ADELI et mot de passe
 *     tags: [ProfessionnelSante]
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
 *                 example: "123456789"
 *               mot_de_passe:
 *                 type: string
 *                 example: "motdepasse123"
 *     responses:
 *       200:
 *         description: Connexion réussie
 *       401:
 *         description: Numéro ADELI ou mot de passe incorrect
 */
router.post('/auth/login', professionnelSanteController.login);

/**
 * @swagger
 * /professionnelSante/auth/logout:
 *   post:
 *     summary: Déconnexion d'un médecin
 *     tags: [ProfessionnelSante]
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 */
router.post('/auth/logout', professionnelSanteController.logout);

/**
 * @swagger
 * /professionnelSante/auth/me:
 *   get:
 *     summary: Récupérer le profil du médecin connecté
 *     tags: [ProfessionnelSante]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil du médecin
 *       401:
 *         description: Non authentifié
 */
router.get('/auth/me', medAuth, professionnelSanteController.getMe);

/**
 * @swagger
 * /professionnelSante/auth/change-password:
 *   post:
 *     summary: Changer le mot de passe du médecin
 *     tags: [ProfessionnelSante]
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
router.post('/auth/change-password', medAuth, professionnelSanteController.changePassword);

module.exports = router;