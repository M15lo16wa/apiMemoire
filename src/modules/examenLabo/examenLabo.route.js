const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const examenLaboController = require('./examenLabo.controller');
const { handleValidationErrors } = require('../../middlewares/validation.middleware');
const { authenticateToken } = require('../../middlewares/auth.middleware');

/**
 * @swagger
 * /examen-labo/resultat:
 *   post:
 *     summary: Créer un nouveau résultat d'examen de laboratoire
 *     tags: [ExamenLabo]
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
 *               - type_examen
 *               - resultat
 *             properties:
 *               patient_id:
 *                 type: integer
 *                 description: ID du patient
 *               dossier_id:
 *                 type: integer
 *                 description: ID du dossier médical (optionnel)
 *               prescription_id:
 *                 type: integer
 *                 description: ID de la prescription (optionnel)
 *               service_id:
 *                 type: integer
 *                 description: ID du service (optionnel)
 *               type_examen:
 *                 type: string
 *                 maxLength: 100
 *                 description: Type d'examen de laboratoire
 *               resultat:
 *                 type: string
 *                 enum: [normal, anormal, limite]
 *                 description: Résultat de l'examen
 *               valeur_normale:
 *                 type: string
 *                 maxLength: 100
 *                 description: Valeurs normales de référence
 *               commentaire:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Commentaires sur le résultat
 *               date_examen:
 *                 type: string
 *                 format: date-time
 *                 description: Date de réalisation de l'examen
 *     responses:
 *       201:
 *         description: Résultat d'examen créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamenLabo'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *
 * /examen-labo/patient/{patient_id}:
 *   get:
 *     summary: Récupérer tous les résultats d'examens d'un patient
 *     tags: [ExamenLabo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patient_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du patient
 *     responses:
 *       200:
 *         description: Liste des résultats d'examens du patient
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExamenLabo'
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Patient non trouvé
 *
 * /examen-labo/{id}:
 *   get:
 *     summary: Récupérer un résultat d'examen par ID
 *     tags: [ExamenLabo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du résultat d'examen
 *     responses:
 *       200:
 *         description: Détails du résultat d'examen
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamenLabo'
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Résultat d'examen non trouvé
 *   put:
 *     summary: Mettre à jour un résultat d'examen
 *     tags: [ExamenLabo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du résultat d'examen
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type_examen:
 *                 type: string
 *                 maxLength: 100
 *               resultat:
 *                 type: string
 *                 enum: [normal, anormal, limite]
 *               valeur_normale:
 *                 type: string
 *                 maxLength: 100
 *               commentaire:
 *                 type: string
 *                 maxLength: 1000
 *               statut:
 *                 type: string
 *                 enum: [en_attente, valide, rejete]
 *     responses:
 *       200:
 *         description: Résultat d'examen mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamenLabo'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Résultat d'examen non trouvé
 *   delete:
 *     summary: Supprimer un résultat d'examen
 *     tags: [ExamenLabo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du résultat d'examen
 *     responses:
 *       204:
 *         description: Résultat d'examen supprimé
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Résultat d'examen non trouvé
 *
 * /examen-labo/{id}/valider:
 *   patch:
 *     summary: Valider un résultat d'examen
 *     tags: [ExamenLabo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du résultat d'examen
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               commentaire_validation:
 *                 type: string
 *                 maxLength: 500
 *                 description: Commentaire de validation
 *     responses:
 *       200:
 *         description: Résultat d'examen validé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamenLabo'
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Résultat d'examen non trouvé
 *
 * /examen-labo/en-attente:
 *   get:
 *     summary: Récupérer tous les résultats d'examens en attente
 *     tags: [ExamenLabo]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des résultats d'examens en attente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExamenLabo'
 *       401:
 *         description: Non authentifié
 *
 * /examen-labo/patient/{patient_id}/statistiques:
 *   get:
 *     summary: Récupérer les statistiques d'examens d'un patient
 *     tags: [ExamenLabo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patient_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du patient
 *     responses:
 *       200:
 *         description: Statistiques des examens du patient
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_examens:
 *                   type: integer
 *                 examens_normaux:
 *                   type: integer
 *                 examens_anormaux:
 *                   type: integer
 *                 examens_limites:
 *                   type: integer
 *                 taux_anormalite:
 *                   type: number
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Patient non trouvé
 */

// Validation rules pour les résultats d'examen
const resultatExamenValidationRules = [
    body('patient_id').notEmpty().withMessage('L\'ID du patient est requis').isInt(),
    body('dossier_id').optional().isInt().withMessage('L\'ID du dossier doit être un entier'),
    body('prescription_id').optional().isInt().withMessage('L\'ID de la prescription doit être un entier'),
    body('service_id').optional().isInt().withMessage('L\'ID du service doit être un entier'),
    body('type_examen').notEmpty().withMessage('Le type d\'examen est requis').isLength({ max: 100 }),
    body('resultat').notEmpty().withMessage('Le résultat est requis').isIn(['normal', 'anormal', 'limite']),
    body('valeur_normale').optional().isLength({ max: 100 }),
    body('commentaire').optional().isLength({ max: 1000 }),
    body('date_examen').optional().isISO8601().withMessage('La date d\'examen doit être au format ISO')
];

// Validation rules pour les mises à jour
const updateResultatValidationRules = [
    body('type_examen').optional().isLength({ max: 100 }),
    body('resultat').optional().isIn(['normal', 'anormal', 'limite']),
    body('valeur_normale').optional().isLength({ max: 100 }),
    body('commentaire').optional().isLength({ max: 1000 }),
    body('statut').optional().isIn(['en_attente', 'valide', 'rejete'])
];

// Routes pour les résultats d'examen
router.post('/resultat', 
    authenticateToken, 
    resultatExamenValidationRules, 
    handleValidationErrors, 
    examenLaboController.createResultatExamen
);

// Routes pour récupérer les résultats
router.get('/patient/:patient_id', 
    authenticateToken, 
    examenLaboController.getResultatsByPatient
);

router.get('/:id', 
    authenticateToken, 
    examenLaboController.getResultatById
);

// Routes pour modifier les résultats
router.put('/:id', 
    authenticateToken, 
    updateResultatValidationRules, 
    handleValidationErrors, 
    examenLaboController.updateResultat
);

router.delete('/:id', 
    authenticateToken, 
    examenLaboController.deleteResultat
);

// Routes spécialisées
router.patch('/:id/valider', 
    authenticateToken, 
    [body('commentaire_validation').optional().isLength({ max: 500 })], 
    handleValidationErrors, 
    examenLaboController.validerResultat
);

router.get('/en-attente', 
    authenticateToken, 
    examenLaboController.getResultatsEnAttente
);

router.get('/patient/:patient_id/statistiques', 
    authenticateToken, 
    examenLaboController.getStatistiquesPatient
);

module.exports = router; 