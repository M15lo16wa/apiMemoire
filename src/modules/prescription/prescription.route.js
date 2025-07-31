const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const prescriptionController = require('./prescription.controller');
const { handleValidationErrors } = require('../../middlewares/validation.middleware');
const { authenticateToken } = require('../../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Prescription
 *   description: Gestion des ordonnances et demandes d'examen
 */

// Validation rules pour les ordonnances
const ordonnanceValidationRules = [
    body('patient_id').notEmpty().withMessage('L\'ID du patient est requis').isInt(),
    body('dossier_id').optional().isInt().withMessage('L\'ID du dossier doit être un entier'),
    body('consultation_id').optional().isInt().withMessage('L\'ID de la consultation doit être un entier'),
    body('service_id').optional().isInt().withMessage('L\'ID du service doit être un entier'),
    body('medicament').notEmpty().withMessage('Le médicament est requis').isLength({ max: 150 }),
    body('dosage').notEmpty().withMessage('Le dosage est requis').isLength({ max: 100 }),
    body('frequence').notEmpty().withMessage('La fréquence est requise').isLength({ max: 100 }),
    body('duree').optional().isLength({ max: 100 }),
    body('instructions').optional().isLength({ max: 1000 }),
    body('voie_administration').optional().isIn(['orale', 'cutanée', 'nasale', 'oculaire', 'auriculaire', 'vaginale', 'rectale', 'inhalée', 'injection', 'autre']),
    body('renouvelable').optional().isBoolean(),
    body('nb_renouvellements').optional().isInt({ min: 0, max: 12 })
];

// Validation rules pour les demandes d'examen
const demandeExamenValidationRules = [
    body('patient_id').notEmpty().withMessage('L\'ID du patient est requis').isInt(),
    body('dossier_id').optional().isInt().withMessage('L\'ID du dossier doit être un entier'),
    body('consultation_id').optional().isInt().withMessage('L\'ID de la consultation doit être un entier'),
    body('service_id').optional().isInt().withMessage('L\'ID du service doit être un entier'),
    body('medicament').notEmpty().withMessage('Le type d\'examen est requis').isLength({ max: 150 }),
    body('dosage').notEmpty().withMessage('Les paramètres d\'examen sont requis').isLength({ max: 100 }),
    body('frequence').notEmpty().withMessage('La fréquence/urgence est requise').isLength({ max: 100 }),
    body('instructions').optional().isLength({ max: 1000 })
];

// Validation rules pour les mises à jour
const updateValidationRules = [
    body('medicament').optional().isLength({ max: 150 }),
    body('dosage').optional().isLength({ max: 100 }),
    body('frequence').optional().isLength({ max: 100 }),
    body('duree').optional().isLength({ max: 100 }),
    body('instructions').optional().isLength({ max: 1000 }),
    body('voie_administration').optional().isIn(['orale', 'cutanée', 'nasale', 'oculaire', 'auriculaire', 'vaginale', 'rectale', 'inhalée', 'injection', 'autre']),
    body('statut').optional().isIn(['active', 'suspendue', 'terminee', 'annulee', 'en_attente'])
];

/**
 * @swagger
 * /prescription/ordonnance:
 *   post:
 *     summary: Créer une nouvelle ordonnance
 *     tags: [Prescription]
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
 *               - medicament
 *               - dosage
 *               - frequence
 *             properties:
 *               patient_id:
 *                 type: integer
 *                 description: ID du patient
 *               dossier_id:
 *                 type: integer
 *                 description: ID du dossier médical (optionnel)
 *               consultation_id:
 *                 type: integer
 *                 description: ID de la consultation (optionnel)
 *               service_id:
 *                 type: integer
 *                 description: ID du service (optionnel)
 *               medicament:
 *                 type: string
 *                 maxLength: 150
 *                 description: Nom du médicament
 *               dosage:
 *                 type: string
 *                 maxLength: 100
 *                 description: Dosage prescrit
 *               frequence:
 *                 type: string
 *                 maxLength: 100
 *                 description: Fréquence de prise
 *               duree:
 *                 type: string
 *                 maxLength: 100
 *                 description: Durée du traitement
 *               instructions:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Instructions spéciales
 *               voie_administration:
 *                 type: string
 *                 enum: [orale, cutanée, nasale, oculaire, auriculaire, vaginale, rectale, inhalée, injection, autre]
 *                 description: Voie d'administration
 *               renouvelable:
 *                 type: boolean
 *                 description: Si la prescription est renouvelable
 *               nb_renouvellements:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 12
 *                 description: Nombre de renouvellements autorisés
 *     responses:
 *       201:
 *         description: Ordonnance créée avec succès
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
 *                     ordonnance:
 *                       $ref: '#/components/schemas/Prescription'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Patient ou professionnel non trouvé
 */

// Routes pour les ordonnances
router.post('/ordonnance', 
    authenticateToken, 
    ordonnanceValidationRules, 
    handleValidationErrors, 
    prescriptionController.createOrdonnance
);

/**
 * @swagger
 * /prescription/demande-examen:
 *   post:
 *     summary: Créer une demande d'examen
 *     tags: [Prescription]
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
 *               - medicament
 *               - dosage
 *               - frequence
 *             properties:
 *               patient_id:
 *                 type: integer
 *                 description: ID du patient
 *               dossier_id:
 *                 type: integer
 *                 description: ID du dossier médical (optionnel)
 *               consultation_id:
 *                 type: integer
 *                 description: ID de la consultation (optionnel)
 *               service_id:
 *                 type: integer
 *                 description: ID du service (optionnel)
 *               medicament:
 *                 type: string
 *                 maxLength: 150
 *                 description: Type d'examen demandé
 *               dosage:
 *                 type: string
 *                 maxLength: 100
 *                 description: Paramètres d'examen
 *               frequence:
 *                 type: string
 *                 maxLength: 100
 *                 description: Fréquence/urgence de l'examen
 *               instructions:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Instructions spéciales
 *     responses:
 *       201:
 *         description: Demande d'examen créée avec succès
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
 *                     demande:
 *                       $ref: '#/components/schemas/Prescription'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Patient ou professionnel non trouvé
 */

// Routes pour les demandes d'examen
router.post('/demande-examen', 
    authenticateToken, 
    demandeExamenValidationRules, 
    handleValidationErrors, 
    prescriptionController.createDemandeExamen
);

/**
 * @swagger
 * /prescription/patient/{patient_id}:
 *   get:
 *     summary: Récupérer les prescriptions d'un patient
 *     tags: [Prescription]
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
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [active, suspendue, terminee, annulee, en_attente]
 *         description: Filtrer par statut
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [traitement, examen]
 *         description: Filtrer par type (traitement ou examen)
 *       - in: query
 *         name: includes
 *         schema:
 *           type: string
 *         description: Modèles à inclure (patient,medecin,dossier,consultation)
 *     responses:
 *       200:
 *         description: Liste des prescriptions
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
 *                   description: Nombre de prescriptions
 *                 data:
 *                   type: object
 *                   properties:
 *                     prescriptions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Prescription'
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Patient non trouvé
 */

// Routes pour récupérer les prescriptions
router.get('/patient/:patient_id', 
    authenticateToken, 
    prescriptionController.getPrescriptionsByPatient
);

/**
 * @swagger
 * /prescription/{id}:
 *   get:
 *     summary: Récupérer une prescription par son ID
 *     tags: [Prescription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la prescription
 *     responses:
 *       200:
 *         description: Détail de la prescription
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
 *                     prescription:
 *                       $ref: '#/components/schemas/Prescription'
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Prescription non trouvée
 */

router.get('/:id', 
    authenticateToken, 
    prescriptionController.getPrescriptionById
);

/**
 * @swagger
 * /prescription/{id}:
 *   put:
 *     summary: Mettre à jour une prescription
 *     tags: [Prescription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la prescription
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               medicament:
 *                 type: string
 *                 maxLength: 150
 *               dosage:
 *                 type: string
 *                 maxLength: 100
 *               frequence:
 *                 type: string
 *                 maxLength: 100
 *               duree:
 *                 type: string
 *                 maxLength: 100
 *               instructions:
 *                 type: string
 *                 maxLength: 1000
 *               voie_administration:
 *                 type: string
 *                 enum: [orale, cutanée, nasale, oculaire, auriculaire, vaginale, rectale, inhalée, injection, autre]
 *               statut:
 *                 type: string
 *                 enum: [active, suspendue, terminee, annulee, en_attente]
 *     responses:
 *       200:
 *         description: Prescription mise à jour
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
 *                     prescription:
 *                       $ref: '#/components/schemas/Prescription'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Prescription non trouvée
 */

// Routes pour modifier les prescriptions
router.put('/:id', 
    authenticateToken, 
    updateValidationRules, 
    handleValidationErrors, 
    prescriptionController.updatePrescription
);

/**
 * @swagger
 * /prescription/{id}:
 *   delete:
 *     summary: Supprimer une prescription
 *     tags: [Prescription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la prescription
 *     responses:
 *       204:
 *         description: Prescription supprimée
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Prescription non trouvée
 */

router.delete('/:id', 
    authenticateToken, 
    prescriptionController.deletePrescription
);

/**
 * @swagger
 * /prescription/{id}/renouveler:
 *   patch:
 *     summary: Renouveler une prescription
 *     tags: [Prescription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la prescription
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motif_renouvellement:
 *                 type: string
 *                 maxLength: 500
 *                 description: Motif du renouvellement
 *     responses:
 *       200:
 *         description: Prescription renouvelée
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
 *                     prescription:
 *                       $ref: '#/components/schemas/Prescription'
 *       400:
 *         description: Prescription non renouvelable
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Prescription non trouvée
 */

// Routes spécialisées
router.patch('/:id/renouveler', 
    authenticateToken, 
    [body('motif_renouvellement').optional().isLength({ max: 500 })], 
    handleValidationErrors, 
    prescriptionController.renouvelerPrescription
);

/**
 * @swagger
 * /prescription/{id}/suspendre:
 *   patch:
 *     summary: Suspendre une prescription
 *     tags: [Prescription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la prescription
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - motif_arret
 *             properties:
 *               motif_arret:
 *                 type: string
 *                 maxLength: 500
 *                 description: Motif de l'arrêt
 *     responses:
 *       200:
 *         description: Prescription suspendue
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
 *                     prescription:
 *                       $ref: '#/components/schemas/Prescription'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Prescription non trouvée
 */

router.patch('/:id/suspendre', 
    authenticateToken, 
    [body('motif_arret').notEmpty().withMessage('Le motif d\'arrêt est requis').isLength({ max: 500 })], 
    handleValidationErrors, 
    prescriptionController.suspendrePrescription
);

/**
 * @swagger
 * /prescription/{id}/transferer:
 *   post:
 *     summary: Transférer une prescription à un patient
 *     description: Transfère une prescription existante vers le dossier médical d'un autre patient. Cette action est tracée dans l'historique des accès.
 *     tags: [Prescription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID de la prescription à transférer
 *         example: ID
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
 *                 minimum: 1
 *                 description: ID du patient destinataire qui recevra la prescription
 *                 example: ID
 *           example:
 *             patient_id: ID
 *     responses:
 *       200:
 *         description: Prescription transférée avec succès
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
 *                   example: "Prescription transférée avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     prescription:
 *                       $ref: '#/components/schemas/Prescription'
 *                     transfert:
 *                       type: object
 *                       properties:
 *                         date:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-07-30T10:30:00Z"
 *                         effectue_par:
 *                           type: integer
 *                           example: 789
 *                         patient_destinataire:
 *                           type: integer
 *                           example: 456
 *       400:
 *         description: Données de requête invalides
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
 *                   examples:
 *                     missing_patient_id:
 *                       value: "ID du patient destinataire requis"
 *                     invalid_prescription_id:
 *                       value: "ID de prescription invalide"
 *                     invalid_patient_id:
 *                       value: "ID du patient destinataire invalide"
 *       401:
 *         description: Non autorisé - Token d'authentification requis ou invalide
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
 *                   example: "Token d'authentification requis"
 *       403:
 *         description: Permissions insuffisantes pour effectuer cette action
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
 *                   example: "Permissions insuffisantes pour transférer cette prescription"
 *       404:
 *         description: Ressource non trouvée
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
 *                   examples:
 *                     prescription_not_found:
 *                       value: "Prescription non trouvée"
 *                     patient_not_found:
 *                       value: "Patient destinataire non trouvé"
 *                     dossier_not_found:
 *                       value: "Dossier médical du patient destinataire non trouvé"
 *       500:
 *         description: Erreur serveur interne
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
 *                   example: "Impossible de transférer la prescription"
 */
router.post('/:id/transferer',
    authenticateToken,
    [
        param('id')
            .isInt({ min: 1 })
            .withMessage('ID de prescription invalide'),
        body('patient_id')
            .notEmpty()
            .withMessage('ID du patient destinataire requis')
            .isInt({ min: 1 })
            .withMessage('ID du patient destinataire doit être un entier positif')
    ],
    handleValidationErrors,
    prescriptionController.transfererPrescription
);
/**
 * @swagger
 * /prescription/{id}/transferer:
 *   get:
 *     summary: Récupérer une prescription par son ID
 *     tags: [Prescription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la prescription
 *     responses:
 *       200:
 *         description: Détail de la prescription
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
 *                     prescription:
 *                       $ref: '#/components/schemas/Prescription'
 *       401:
 *         description: Non autorisé
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
 *                   example: "Token d'authentification requis"
 *       404:
 *         description: Prescription non trouvée
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
 *                   example: "Prescription non trouvée"
 *       500:
 *         description: Erreur serveur interne
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
 *                   example: "Erreur lors de la récupération de la prescription"
 */
router.get('/:id', 
    authenticateToken, 
    prescriptionController.getPrescriptionById
);

module.exports = router; 