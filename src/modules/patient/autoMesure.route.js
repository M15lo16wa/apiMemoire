/**
 * Routes pour la gestion des auto-mesures des patients
 */

const express = require('express');
const router = express.Router();
const { body, query, param } = require('express-validator');
const autoMesureController = require('./autoMesure.controller');
const { handleValidationErrors } = require('../../middlewares/validation.middleware');
const { authenticateToken } = require('../../middlewares/auth.middleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     AutoMesure:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Identifiant unique de l'auto-mesure
 *         patient_id:
 *           type: integer
 *           description: ID du patient propriétaire de l'auto-mesure
 *         type_mesure:
 *           type: string
 *           enum: [poids, taille, tension_arterielle, glycemie, temperature, saturation]
 *           description: Type de mesure effectuée
 *         valeur:
 *           type: number
 *           format: float
 *           description: Valeur principale de la mesure
 *         valeur_secondaire:
 *           type: number
 *           format: float
 *           description: Valeur secondaire (ex: diastolique pour tension)
 *         unite:
 *           type: string
 *           description: Unité de mesure principale
 *         unite_secondaire:
 *           type: string
 *           description: Unité de mesure secondaire
 *         date_mesure:
 *           type: string
 *           format: date-time
 *           description: Date de la mesure
 *         heure_mesure:
 *           type: string
 *           format: time
 *           description: Heure de la mesure
 *         notes:
 *           type: string
 *           description: Notes additionnelles sur la mesure
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création de l'enregistrement
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière modification
 *       required:
 *         - patient_id
 *         - type_mesure
 *         - valeur
 *       example:
 *         id: 1
 *         patient_id: 123
 *         type_mesure: "tension_arterielle"
 *         valeur: 120.0
 *         valeur_secondaire: 80.0
 *         unite: "mmHg"
 *         unite_secondaire: "mmHg"
 *         date_mesure: "2025-08-16T10:00:00.000Z"
 *         heure_mesure: "10:00:00"
 *         notes: "Mesure effectuée au repos"
 *         createdAt: "2025-08-16T10:00:00.000Z"
 *         updatedAt: "2025-08-16T10:00:00.000Z"
 * 
 *     AutoMesureCreate:
 *       type: object
 *       properties:
 *         type_mesure:
 *           type: string
 *           enum: [poids, taille, tension_arterielle, glycemie, temperature, saturation]
 *           description: Type de mesure à effectuer
 *         valeur:
 *           type: number
 *           format: float
 *           description: Valeur de la mesure
 *         valeur_secondaire:
 *           type: number
 *           format: float
 *           description: Valeur secondaire si applicable
 *         unite:
 *           type: string
 *           description: Unité de mesure
 *         unite_secondaire:
 *           type: string
 *           description: Unité de mesure secondaire
 *         date_mesure:
 *           type: string
 *           format: date-time
 *           description: Date de la mesure (optionnel, défaut: maintenant)
 *         heure_mesure:
 *           type: string
 *           format: time
 *           description: Heure de la mesure (optionnel, défaut: maintenant)
 *         notes:
 *           type: string
 *           description: Notes sur la mesure
 *       required:
 *         - type_mesure
 *         - valeur
 *       example:
 *         type_mesure: "glycemie"
 *         valeur: 95.0
 *         unite: "mg/dL"
 *         notes: "Mesure à jeun"
 * 
 *     AutoMesureUpdate:
 *       type: object
 *       properties:
 *         type_mesure:
 *           type: string
 *           enum: [poids, taille, tension_arterielle, glycemie, temperature, saturation]
 *         valeur:
 *           type: number
 *           format: float
 *         valeur_secondaire:
 *           type: number
 *           format: float
 *         unite:
 *           type: string
 *         unite_secondaire:
 *           type: string
 *         date_mesure:
 *           type: string
 *           format: date-time
 *         heure_mesure:
 *           type: string
 *           format: time
 *         notes:
 *           type: string
 * 
 *     AutoMesureStats:
 *       type: object
 *       properties:
 *         type_mesure:
 *           type: string
 *           description: Type de mesure
 *         total_mesures:
 *           type: integer
 *           description: Nombre total de mesures
 *         moyenne:
 *           type: number
 *           format: float
 *           description: Valeur moyenne
 *         minimum:
 *           type: number
 *           format: float
 *           description: Valeur minimale
 *         maximum:
 *           type: number
 *           format: float
 *           description: Valeur maximale
 *         derniere_mesure:
 *           type: string
 *           format: date
 *           description: Date de la dernière mesure
 */

// Validation rules pour la création d'une auto-mesure
const createAutoMesureValidationRules = [
    body('type_mesure')
        .isIn(['poids', 'taille', 'tension_arterielle', 'glycemie', 'temperature', 'saturation'])
        .withMessage('Type de mesure invalide'),
    body('valeur')
        .isFloat({ min: 0 })
        .withMessage('La valeur doit être un nombre positif'),
    body('valeur_secondaire')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('La valeur secondaire doit être un nombre positif'),
    body('unite')
        .optional()
        .isLength({ max: 20 })
        .withMessage('L\'unité ne peut pas dépasser 20 caractères'),
    body('notes')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Les notes ne peuvent pas dépasser 1000 caractères')
];

// Validation rules pour la mise à jour d'une auto-mesure
const updateAutoMesureValidationRules = [
    body('type_mesure')
        .optional()
        .isIn(['poids', 'taille', 'tension_arterielle', 'glycemie', 'temperature', 'saturation'])
        .withMessage('Type de mesure invalide'),
    body('valeur')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('La valeur doit être un nombre positif'),
    body('valeur_secondaire')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('La valeur secondaire doit être un nombre positif'),
    body('unite')
        .optional()
        .isLength({ max: 20 })
        .withMessage('L\'unité ne peut pas dépasser 20 caractères'),
    body('notes')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Les notes ne peuvent pas dépasser 1000 caractères')
];

// ===== ROUTES SPÉCIFIQUES (AVANT LES ROUTES AVEC PARAMÈTRES) =====

/**
 * @swagger
 * /api/patient/auto-mesures:
 *   post:
 *     summary: Créer une nouvelle auto-mesure
 *     tags: [AutoMesures]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AutoMesureCreate'
 *     responses:
 *       201:
 *         description: Auto-mesure créée avec succès
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
 *                   example: Auto-mesure créée avec succès
 *                 data:
 *                   $ref: '#/components/schemas/AutoMesure'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 *   get:
 *     summary: Récupérer toutes les auto-mesures (avec filtres)
 *     tags: [AutoMesures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: patient_id
 *         schema:
 *           type: integer
 *         description: Filtrer par ID du patient
 *       - in: query
 *         name: type_mesure
 *         schema:
 *           type: string
 *           enum: [poids, taille, tension_arterielle, glycemie, temperature, saturation]
 *         description: Filtrer par type de mesure
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Nombre maximum de résultats
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Nombre de résultats à ignorer
 *     responses:
 *       200:
 *         description: Liste des auto-mesures récupérée avec succès
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AutoMesure'
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.post('/',
    authenticateToken,
    createAutoMesureValidationRules,
    handleValidationErrors,
    autoMesureController.createAutoMesure
);

router.get('/',
    authenticateToken,
    autoMesureController.getAllAutoMesures
);

/**
 * @swagger
 * /api/patient/{patient_id}/auto-mesures:
 *   get:
 *     summary: Récupérer toutes les auto-mesures d'un patient spécifique
 *     tags: [AutoMesures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patient_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du patient
 *       - in: query
 *         name: type_mesure
 *         schema:
 *           type: string
 *           enum: [poids, taille, tension_arterielle, glycemie, temperature, saturation]
 *         description: Filtrer par type de mesure
 *     responses:
 *       200:
 *         description: Liste des auto-mesures du patient récupérée avec succès
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AutoMesure'
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès interdit
 *       500:
 *         description: Erreur serveur
 */
router.get('/patient/:patient_id',
    authenticateToken,
    param('patient_id').isInt({ min: 1 }).withMessage('ID du patient invalide'),
    handleValidationErrors,
    autoMesureController.getAutoMesuresByPatient
);

/**
 * @swagger
 * /api/patient/{patient_id}/auto-mesures/stats:
 *   get:
 *     summary: Obtenir les statistiques des auto-mesures d'un patient
 *     tags: [AutoMesures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patient_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du patient
 *       - in: query
 *         name: type_mesure
 *         schema:
 *           type: string
 *           enum: [poids, taille, tension_arterielle, glycemie, temperature, saturation]
 *         description: Filtrer par type de mesure (optionnel)
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
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
 *                     $ref: '#/components/schemas/AutoMesureStats'
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès interdit
 *       500:
 *         description: Erreur serveur
 */
router.get('/patient/:patient_id/stats',
    authenticateToken,
    param('patient_id').isInt({ min: 1 }).withMessage('ID du patient invalide'),
    autoMesureController.getAutoMesuresStats
);

/**
 * @swagger
 * /api/patient/{patient_id}/auto-mesures/last/{type_mesure}:
 *   get:
 *     summary: Obtenir la dernière auto-mesure d'un patient par type
 *     tags: [AutoMesures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patient_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du patient
 *       - in: path
 *         name: type_mesure
 *         required: true
 *         schema:
 *           type: string
 *           enum: [poids, taille, tension_arterielle, glycemie, temperature, saturation]
 *         description: Type de mesure
 *     responses:
 *       200:
 *         description: Dernière auto-mesure récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/AutoMesure'
 *       404:
 *         description: Aucune auto-mesure trouvée pour ce type
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès interdit
 *       500:
 *         description: Erreur serveur
 */
router.get('/patient/:patient_id/last/:type_mesure',
    authenticateToken,
    param('patient_id').isInt({ min: 1 }).withMessage('ID du patient invalide'),
    param('type_mesure')
        .isIn(['poids', 'taille', 'tension_arterielle', 'glycemie', 'temperature', 'saturation'])
        .withMessage('Type de mesure invalide'),
    handleValidationErrors,
    autoMesureController.getLastAutoMesureByType
);

// ===== ROUTES AVEC PARAMÈTRES (APRÈS LES ROUTES SPÉCIFIQUES) =====

/**
 * @swagger
 * /api/patient/auto-mesures/{id}:
 *   get:
 *     summary: Récupérer une auto-mesure par ID
 *     tags: [AutoMesures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'auto-mesure
 *     responses:
 *       200:
 *         description: Auto-mesure récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/AutoMesure'
 *       404:
 *         description: Auto-mesure non trouvée
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès interdit
 *       500:
 *         description: Erreur serveur
 *   put:
 *     summary: Mettre à jour une auto-mesure
 *     tags: [AutoMesures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'auto-mesure
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AutoMesureUpdate'
 *     responses:
 *       200:
 *         description: Auto-mesure mise à jour avec succès
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
 *                   example: Auto-mesure mise à jour avec succès
 *                 data:
 *                   $ref: '#/components/schemas/AutoMesure'
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Auto-mesure non trouvée
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès interdit
 *       500:
 *         description: Erreur serveur
 *   delete:
 *     summary: Supprimer une auto-mesure
 *     tags: [AutoMesures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'auto-mesure
 *     responses:
 *       200:
 *         description: Auto-mesure supprimée avec succès
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
 *                   example: Auto-mesure supprimée avec succès
 *       404:
 *         description: Auto-mesure non trouvée
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès interdit
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id',
    authenticateToken,
    param('id').isInt({ min: 1 }).withMessage('ID invalide'),
    handleValidationErrors,
    autoMesureController.getAutoMesureById
);

router.put('/:id',
    authenticateToken,
    param('id').isInt({ min: 1 }).withMessage('ID invalide'),
    updateAutoMesureValidationRules,
    handleValidationErrors,
    autoMesureController.updateAutoMesure
);

router.delete('/:id',
    authenticateToken,
    param('id').isInt({ min: 1 }).withMessage('ID invalide'),
    handleValidationErrors,
    autoMesureController.deleteAutoMesure
);

module.exports = router;
