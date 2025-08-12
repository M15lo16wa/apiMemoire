// src/modules/dossierMedical/dossierMedical.route.js

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const dossierMedicalController = require('./dossierMedical.controller');
const { handleValidationErrors } = require('../../middlewares/validation.middleware');
const { authenticateToken } = require('../../middlewares/auth.middleware');
const { checkMedicalRecordAccess, logMedicalRecordAccess } = require('../../middlewares/access.middleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     DossierMedical:
 *       type: object
 *       properties:
 *         id_dossier:
 *           type: integer
 *           description: Identifiant unique du dossier médical
 *         dateCreation:
 *           type: string
 *           format: date
 *           description: Date de création du dossier médical
 *         statut:
 *           type: string
 *           enum: [actif, ferme, archive, fusionne]
 *           description: Statut actuel du dossier médical
 *         type_dossier:
 *           type: string
 *           enum: [principal, specialite, urgence, suivi, consultation, autre]
 *           description: Type de dossier médical
 *         patient_id:
 *           type: integer
 *           description: ID du patient propriétaire du dossier
 *         service_id:
 *           type: integer
 *           description: ID du service de santé responsable
 *         medecin_referent_id:
 *           type: integer
 *           description: ID du médecin référent principal
 *         resume:
 *           type: string
 *           description: Résumé clinique du patient
 *         antecedent_medicaux:
 *           type: object
 *           description: Antécédents médicaux structurés
 *         allergies:
 *           type: object
 *           description: Allergies et intolérances
 *         traitements_chroniques:
 *           type: object
 *           description: Traitements au long cours
 *         heart_rate:
 *           type: integer
 *           description: Fréquence cardiaque (battements par minute)
 *         blood_pressure:
 *           type: string
 *           description: Tension artérielle (format systolique/diastolique, ex 120/80)
 *         temperature:
 *           type: number
 *           format: float
 *           description: Température corporelle (en degrés Celsius)
 *         respiratory_rate:
 *           type: integer
 *           description: Fréquence respiratoire (respirations par minute)
 *         oxygen_saturation:
 *           type: number
 *           format: float
 *           description: Saturation en oxygène (pourcentage)
 *         habitudes_vie:
 *           type: object
 *           description: Informations sur le mode de vie
 *         historique_familial:
 *           type: string
 *           description: Antécédents familiaux notables
 *         groupe_sanguin:
 *           type: string
 *           enum: [A_POSITIF, A_NEGATIF, B_POSITIF, B_NEGATIF, AB_POSITIF, AB_NEGATIF, O_POSITIF, O_NEGATIF]
 *           description: Groupe sanguin du patient (système ABO/Rhésus)
 *         directives_anticipées:
 *           type: string
 *           description: Directives anticipées et personnes de confiance
 *         observations:
 *           type: string
 *           description: Notes et observations diverses
 *         createdBy:
 *           type: integer
 *           description: ID de l'utilisateur ayant créé le dossier
 *         updatedBy:
 *           type: integer
 *           description: ID du dernier utilisateur ayant modifié le dossier
 *         date_fermeture:
 *           type: string
 *           format: date-time
 *           description: Date de fermeture du dossier
 *         motif_fermeture:
 *           type: string
 *           description: Raison de la fermeture du dossier
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière mise à jour
 *       required:
 *         - patient_id
 *
 * /dossierMedical:
 *   post:
 *     summary: Créer un nouveau dossier médical
 *     tags: [DossierMedical]
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
 *                 description: ID du patient (obligatoire)
 *               professionnel_sante_id:
 *                 type: integer
 *                 description: ID du professionnel de santé référent
 *               service_id:
 *                 type: integer
 *                 description: ID du service de santé responsable
 *               statut:
 *                 type: string
 *                 enum: [actif, ferme, archive, fusionne]
 *                 description: Statut du dossier
 *               dateOuverture:
 *                 type: string
 *                 format: date
 *                 description: Date d'ouverture du dossier
 *               dateFermeture:
 *                 type: string
 *                 format: date
 *                 description: Date de fermeture du dossier
 *     responses:
 *       201:
 *         description: Dossier médical créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 dossier:
 *                   $ref: '#/components/schemas/DossierMedical'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 *   get:
 *     summary: Récupérer tous les dossiers médicaux
 *     tags: [DossierMedical]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: patient_id
 *         schema:
 *           type: integer
 *         description: Filtrer par ID du patient
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [actif, ferme, archive, fusionne]
 *         description: Filtrer par statut
 *     responses:
 *       200:
 *         description: Liste des dossiers médicaux récupérée avec succès (format simplifié)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: 'success'
 *                 results:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: object
 *                   properties:
 *                     dossiers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id_dossier:
 *                             type: integer
 *                             example: 1
 *                           statut:
 *                             type: string
 *                             example: 'actif'
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 *
 * /dossierMedical/{id}:
 *   get:
 *     summary: Récupérer un dossier médical par ID
 *     tags: [DossierMedical]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Recuperer un dossier médical par son ID
 *     responses:
 *       200:
 *         description: Dossier médical récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DossierMedical'
 *       404:
 *         description: Dossier médical non trouvé
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 *   put:
 *     summary: Mettre à jour un dossier médical
 *     tags: [DossierMedical]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du dossier médical
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               professionnel_sante_id:
 *                 type: integer
 *                 description: ID du professionnel de santé référent
 *               service_id:
 *                 type: integer
 *                 description: ID du service de santé responsable
 *               statut:
 *                 type: string
 *                 enum: [actif, ferme, archive, fusionne]
 *                 description: Statut du dossier
 *               dateOuverture:
 *                 type: string
 *                 format: date
 *                 description: Date d'ouverture du dossier
 *               dateFermeture:
 *                 type: string
 *                 format: date
 *                 description: Date de fermeture du dossier
 *               heart_rate:
 *                 type: integer
 *                 description: Fréquence cardiaque (battements par minute)
 *               blood_pressure:
 *                 type: string
 *                 description: Tension artérielle (format systolique/diastolique, ex 120/80)
 *               temperature:
 *                 type: number
 *                 format: float
 *                 description: Température corporelle (en degrés Celsius)
 *               respiratory_rate:
 *                 type: integer
 *                 description: Fréquence respiratoire (respirations par minute)
 *               oxygen_saturation:
 *                 type: number
 *                 format: float
 *                 description: Saturation en oxygène (pourcentage)
 *               groupe_sanguin:
 *                 type: string
 *                 enum: [A_POSITIF, A_NEGATIF, B_POSITIF, B_NEGATIF, AB_POSITIF, AB_NEGATIF, O_POSITIF, O_NEGATIF]
 *                 description: Groupe sanguin du patient (système ABO/Rhésus)
 *     responses:
 *       200:
 *         description: Dossier médical mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 dossier:
 *                   $ref: '#/components/schemas/DossierMedical'
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Dossier médical non trouvé
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 *   delete:
 *     summary: Supprimer un dossier médical
 *     tags: [DossierMedical]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du dossier médical
 *     responses:
 *       200:
 *         description: Dossier médical supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Dossier médical non trouvé
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 *
 * /dossierMedical/patient/{patient_id}/complet:
 *   get:
 *     summary: Récupérer le dossier médical complet d'un patient
 *     tags: [DossierMedical]
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
 *         description: Dossier médical complet récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     dossier:
 *                       $ref: '#/components/schemas/DossierMedical'
 *                     prescriptions_actives:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Prescription'
 *                     examens_recents:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ExamenLabo'
 *                     consultations_recentes:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Consultation'
 *                     demandes_en_attente:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Prescription'
 *                     resultats_anormaux:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ExamenLabo'
 *                     resume:
 *                       type: object
 *                       properties:
 *                         nombre_prescriptions_actives:
 *                           type: integer
 *                         nombre_examens_recents:
 *                           type: integer
 *                         nombre_consultations_recentes:
 *                           type: integer
 *                         nombre_demandes_en_attente:
 *                           type: integer
 *                         nombre_resultats_anormaux:
 *                           type: integer
 *       403:
 *         description: Accès non autorisé
 *       404:
 *         description: Dossier médical non trouvé
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 *
 * /dossierMedical/patient/{patient_id}/resume:
 *   get:
 *     summary: Récupérer le résumé des informations médicales d'un patient
 *     tags: [DossierMedical]
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
 *         description: Résumé récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     resume:
 *                       type: object
 *                       properties:
 *                         prescriptions_actives:
 *                           type: integer
 *                         examens_valides:
 *                           type: integer
 *                         consultations_total:
 *                           type: integer
 *                     dernieres_activites:
 *                       type: object
 *                       properties:
 *                         derniere_prescription:
 *                           $ref: '#/components/schemas/Prescription'
 *                         dernier_examen:
 *                           $ref: '#/components/schemas/ExamenLabo'
 *                         derniere_consultation:
 *                           $ref: '#/components/schemas/Consultation'
 *       403:
 *         description: Accès non autorisé
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */

// Validation rules pour la création d'un dossier médical
const createDossierValidationRules = [
    body('patient_id').notEmpty().withMessage('L\'ID du patient est requis').isInt(),
    body('professionnel_sante_id').optional().isInt().withMessage('L\'ID du professionnel de santé doit être un entier'),
    body('service_id').optional().isInt().withMessage('L\'ID du service doit être un entier'),
    body('numeroDossier').optional().isLength({ max: 50 }),
    body('statut').optional().isIn(['actif', 'ferme', 'archive', 'fusionne']),
    body('dateOuverture').optional().isISO8601().withMessage('La date d\'ouverture doit être au format ISO'),
    body('dateFermeture').optional().isISO8601().withMessage('La date de fermeture doit être au format ISO'),
    body('groupe_sanguin').optional().isIn(['A_POSITIF', 'A_NEGATIF', 'B_POSITIF', 'B_NEGATIF', 'AB_POSITIF', 'AB_NEGATIF', 'O_POSITIF', 'O_NEGATIF']).withMessage('Le groupe sanguin doit être valide')
];

// Validation rules pour la mise à jour d'un dossier médical
const updateDossierValidationRules = [
    body('professionnel_sante_id').optional().isInt().withMessage('L\'ID du professionnel de santé doit être un entier'),
    body('service_id').optional().isInt().withMessage('L\'ID du service doit être un entier'),
    body('numeroDossier').optional().isLength({ max: 50 }),
    body('statut').optional().isIn(['actif', 'ferme', 'archive', 'fusionne']),
    body('dateOuverture').optional().isISO8601().withMessage('La date d\'ouverture doit être au format ISO'),
    body('dateFermeture').optional().isISO8601().withMessage('La date de fermeture doit être au format ISO'),
    // Validation des signes vitaux
    body('heart_rate').optional().isInt({ min: 20, max: 300 }).withMessage('La fréquence cardiaque doit être entre 20 et 300 bpm'),
    body('blood_pressure').optional().matches(/^\d{2,3}\/\d{2,3}$/).withMessage('La tension artérielle doit être au format systolique/diastolique (ex: 120/80)'),
    body('temperature').optional().isFloat({ min: 30.0, max: 45.0 }).withMessage('La température doit être entre 30.0 et 45.0°C'),
    body('respiratory_rate').optional().isInt({ min: 5, max: 60 }).withMessage('La fréquence respiratoire doit être entre 5 et 60 respirations/min'),
    body('oxygen_saturation').optional().isFloat({ min: 0.0, max: 100.0 }).withMessage('La saturation en oxygène doit être entre 0.0 et 100.0%'),
    body('groupe_sanguin').optional().isIn(['A_POSITIF', 'A_NEGATIF', 'B_POSITIF', 'B_NEGATIF', 'AB_POSITIF', 'AB_NEGATIF', 'O_POSITIF', 'O_NEGATIF']).withMessage('Le groupe sanguin doit être valide')
];

const attachProfessionnel = require('../../middlewares/attachProfessionnel');
// Routes CRUD de base
router.post('/', 
    authenticateToken, 
    attachProfessionnel, // Ajouté uniquement ici
    createDossierValidationRules, 
    handleValidationErrors, 
    dossierMedicalController.createDossier
);

router.get('/', 
    authenticateToken, 
    dossierMedicalController.getAllDossiers
);

router.get('/:id', 
    authenticateToken, 
    dossierMedicalController.getDossierById
);

router.put('/:id', 
    authenticateToken, 
    updateDossierValidationRules, 
    handleValidationErrors, 
    dossierMedicalController.updateDossier
);

router.delete('/:id', 
    authenticateToken, 
    dossierMedicalController.deleteDossier
);

// Routes pour le partage patient-médecin avec middleware d'accès
router.get('/patient/:patient_id/complet', 
    authenticateToken, // 1. Vérifie le token
    checkMedicalRecordAccess, // 2. Vérifie si l'accès au DMP de ce patient est autorisé
    logMedicalRecordAccess, // 3. Log l'accès
    dossierMedicalController.getDossierCompletPatient // 4. Exécute la logique finale
);

router.get('/patient/:patient_id/resume', 
    authenticateToken, // 1. Vérifie le token
    checkMedicalRecordAccess, // 2. Vérifie si l'accès au DMP de ce patient est autorisé
    logMedicalRecordAccess, // 3. Log l'accès
    dossierMedicalController.getResumePatient // 4. Exécute la logique finale
);

module.exports = router;