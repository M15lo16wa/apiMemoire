const express = require('express');
const router = express.Router();
const rendezVousController = require('./rendezVous.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../../middlewares/validation.middleware');

/**
 * @swagger
 * tags:
 *   name: RendezVous
 *   description: Gestion des rendez-vous
 */

// Validation pour la création et la mise à jour d'un rendez-vous
const rendezVousValidationRules = [
  body('nom').notEmpty().withMessage('Le nom est requis').isString(),
  body('prenom').notEmpty().withMessage('Le prénom est requis').isString(),
  body('email').notEmpty().withMessage('L\'email est requis').isEmail().withMessage('Email invalide'),
  body('dateNaissance').notEmpty().withMessage('La date de naissance est requise').isDate().withMessage('Format de date invalide'),
  body('sexe').notEmpty().withMessage('Le sexe est requis').isIn(['Masculin', 'Feminin', 'Autre', 'Inconnu']).withMessage('Valeur invalide pour le sexe'),
  body('telephone').notEmpty().withMessage('Le téléphone est requis').isString(),
  body('DateHeure').notEmpty().withMessage('La date et l\'heure sont requises').isISO8601().withMessage('Format de date/heure invalide'),
  body('motif_consultation').notEmpty().withMessage('Le motif de consultation est requis').isString(),
  body('id_hopital').notEmpty().withMessage('L\'ID de l\'hôpital est requis').isInt().withMessage('L\'ID de l\'hôpital doit être un nombre entier'),
  body('id_service').notEmpty().withMessage('L\'ID du service est requis').isInt().withMessage('L\'ID du service doit être un nombre entier'),
  body('numero_assure').notEmpty().withMessage('Le numéro d\'assuré est requis').isString(),
  body('assureur').notEmpty().withMessage('L\'assureur est requis').isString()
];

/**
 * @swagger
 * /rendez-vous:
 *   post:
 *     summary: Créer un nouveau rendez-vous
 *     tags: [RendezVous]
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
 *               - dateNaissance
 *               - sexe
 *               - telephone
 *               - DateHeure
 *               - motif_consultation
 *               - id_hopital
 *               - id_service
 *               - numero_assure
 *               - assureur
 *             properties:
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               dateNaissance:
 *                 type: string
 *                 format: date
 *               sexe:
 *                 type: string
 *                 enum: [Masculin, Feminin, Autre, Inconnu]
 *               telephone:
 *                 type: string
 *               DateHeure:
 *                 type: string
 *                 format: date-time
 *               motif_consultation:
 *                 type: string
 *               id_hopital:
 *                 type: integer
 *               id_service:
 *                 type: integer
 *               id_medecin:
 *                 type: integer
 *               numero_assure:
 *                 type: string
 *               assureur:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Rendez-vous créé avec succès
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Ressource non trouvée
 *       500:
 *         description: Erreur serveur
 *
 *   get:
 *     summary: Récupérer tous les rendez-vous
 *     tags: [RendezVous]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: patient_id
 *         schema:
 *           type: integer
 *         description: Filtrer par ID du patient
 *       - in: query
 *         name: professionnel_id
 *         schema:
 *           type: integer
 *         description: Filtrer par ID du professionnel
 *       - in: query
 *         name: service_id
 *         schema:
 *           type: integer
 *         description: Filtrer par ID du service
 *       - in: query
 *         name: hopital_id
 *         schema:
 *           type: integer
 *         description: Filtrer par ID de l'hôpital
 *       - in: query
 *         name: date_debut
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début pour filtrer les rendez-vous
 *       - in: query
 *         name: date_fin
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin pour filtrer les rendez-vous
 *     responses:
 *       200:
 *         description: Liste des rendez-vous
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /rendez-vous/{id}:
 *   get:
 *     summary: Récupérer un rendez-vous par son ID
 *     tags: [RendezVous]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du rendez-vous
 *     responses:
 *       200:
 *         description: Détails du rendez-vous
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Rendez-vous non trouvé
 *       500:
 *         description: Erreur serveur
 *
 *   put:
 *     summary: Mettre à jour un rendez-vous
 *     tags: [RendezVous]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du rendez-vous
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               DateHeure:
 *                 type: string
 *                 format: date-time
 *               motif_consultation:
 *                 type: string
 *               statut:
 *                 type: string
 *                 enum: [Planifié, Confirmé, Annulé, Terminé]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rendez-vous mis à jour avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Rendez-vous non trouvé
 *       500:
 *         description: Erreur serveur
 *
 *   delete:
 *     summary: Supprimer un rendez-vous
 *     tags: [RendezVous]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du rendez-vous
 *     responses:
 *       204:
 *         description: Rendez-vous supprimé avec succès
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Rendez-vous non trouvé
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /rendez-vous/prendre:
 *   post:
 *     summary: Prendre un rendez-vous (implémentation de PrendreRendezVous)
 *     tags: [RendezVous]
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
 *               - dateNaissance
 *               - sexe
 *               - telephone
 *               - DateHeure
 *               - motif_consultation
 *               - id_hopital
 *               - id_service
 *               - numero_assure
 *               - assureur
 *             properties:
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               dateNaissance:
 *                 type: string
 *                 format: date
 *               sexe:
 *                 type: string
 *                 enum: [Masculin, Feminin, Autre, Inconnu]
 *               telephone:
 *                 type: string
 *               DateHeure:
 *                 type: string
 *                 format: date-time
 *               motif_consultation:
 *                 type: string
 *               id_hopital:
 *                 type: integer
 *               id_service:
 *                 type: integer
 *               id_medecin:
 *                 type: integer
 *               numero_assure:
 *                 type: string
 *               assureur:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Rendez-vous pris avec succès
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Ressource non trouvée
 *       500:
 *         description: Erreur serveur
 */

// Routes publiques
router.post('/', rendezVousValidationRules, handleValidationErrors, rendezVousController.createRendezVous);
router.post('/prendre', rendezVousValidationRules, handleValidationErrors, rendezVousController.prendreRendezVous);

// Routes protégées
router.get('/', authMiddleware.protect, rendezVousController.getAllRendezVous);
router.get('/:id', authMiddleware.protect, rendezVousController.getRendezVousById);
router.put('/:id', authMiddleware.protect, rendezVousController.updateRendezVous);
router.delete('/:id', authMiddleware.protect, rendezVousController.deleteRendezVous);

module.exports = router;