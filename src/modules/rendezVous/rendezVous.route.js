const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const rendezVousController = require('./rendezVous.controller');
const { handleValidationErrors } = require('../../middlewares/validation.middleware');
const { authenticateToken } = require('../../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: RendezVous
 *   description: Gestion des rendez-vous
 */

// Validation rules pour les rendez-vous
const rendezVousValidationRules = [
    body('DateHeure').notEmpty().withMessage('La date et heure sont requises').isISO8601(),
    body('motif_consultation').notEmpty().withMessage('Le motif de consultation est requis').isLength({ max: 500 }),
    body('patient_id').optional().isInt().withMessage('L\'ID du patient doit être un entier'),
    body('id_medecin').optional().isInt().withMessage('L\'ID du médecin doit être un entier'),
    body('id_service').optional().isInt().withMessage('L\'ID du service doit être un entier'),
    body('id_hopital').optional().isInt().withMessage('L\'ID de l\'hôpital doit être un entier'),
    body('duree').optional().isInt({ min: 15, max: 480 }).withMessage('La durée doit être entre 15 et 480 minutes'),
    body('statut').optional().isIn(['Planifié', 'Confirmé', 'En cours', 'Terminé', 'Annulé'])
];

// Validation rules pour les rappels
const rappelValidationRules = [
    body('patient_id').notEmpty().withMessage('L\'ID du patient est requis').isInt(),
    body('date_rappel').notEmpty().withMessage('La date du rappel est requise').isISO8601(),
    body('message').notEmpty().withMessage('Le message est requis').isLength({ max: 500 }),
    body('id_medecin').optional().isInt().withMessage('L\'ID du médecin doit être un entier'),
    body('type_rappel').optional().isIn(['general', 'medicament', 'examen', 'consultation']),
    body('rendez_vous_id').optional().isInt().withMessage('L\'ID du rendez-vous doit être un entier')
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

// Routes CRUD de base
router.post('/', 
    authenticateToken, 
    rendezVousValidationRules, 
    handleValidationErrors, 
    rendezVousController.createRendezVous
);

router.get('/', 
    authenticateToken, 
    rendezVousController.getAllRendezVous
);

router.get('/:id', 
    authenticateToken, 
    rendezVousController.getRendezVousById
);

router.put('/:id', 
    authenticateToken, 
    rendezVousValidationRules, 
    handleValidationErrors, 
    rendezVousController.updateRendezVous
);

router.delete('/:id', 
    authenticateToken, 
    rendezVousController.deleteRendezVous
);

// Route spécialisée pour prendre un rendez-vous
router.post('/prendre', 
    authenticateToken, 
    rendezVousValidationRules, 
    handleValidationErrors, 
    rendezVousController.prendreRendezVous
);

// Routes pour les rappels
router.post('/rappel', 
    authenticateToken, 
    rappelValidationRules, 
    handleValidationErrors, 
    rendezVousController.creerRappel
);

router.get('/patient/:patient_id/rappels', 
    authenticateToken, 
    rendezVousController.getRappelsByPatient
);

router.get('/patient/:patient_id/avenir', 
    authenticateToken, 
    rendezVousController.getRendezVousAVenir
);

// Routes pour l'annulation
router.patch('/:id/annuler', 
    authenticateToken, 
    [body('motif').notEmpty().withMessage('Le motif d\'annulation est requis').isLength({ max: 500 })], 
    handleValidationErrors, 
    rendezVousController.annulerRendezVous
);

// Routes pour la gestion des rappels (interne)
router.get('/rappels/a-envoyer', 
    authenticateToken, 
    rendezVousController.getRappelsAEnvoyer
);

router.patch('/rappel/:id/envoye', 
    authenticateToken, 
    rendezVousController.marquerRappelEnvoye
);

module.exports = router;