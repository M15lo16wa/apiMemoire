// src/modules/dossierMedical/dossierMedical.route.js

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const dossierMedicalController = require('./dossierMedical.controller');
const { handleValidationErrors } = require('../../middlewares/validation.middleware');
const { authenticateToken } = require('../../middlewares/auth.middleware');

// Validation rules pour la création d'un dossier médical
const createDossierValidationRules = [
    body('patient_id').notEmpty().withMessage('L\'ID du patient est requis').isInt(),
    body('professionnel_sante_id').optional().isInt().withMessage('L\'ID du professionnel de santé doit être un entier'),
    body('service_id').optional().isInt().withMessage('L\'ID du service doit être un entier'),
    body('numeroDossier').optional().isLength({ max: 50 }),
    body('statut').optional().isIn(['Ouvert', 'Fermé', 'Archivé']),
    body('dateOuverture').optional().isISO8601().withMessage('La date d\'ouverture doit être au format ISO'),
    body('dateFermeture').optional().isISO8601().withMessage('La date de fermeture doit être au format ISO')
];

// Validation rules pour la mise à jour d'un dossier médical
const updateDossierValidationRules = [
    body('professionnel_sante_id').optional().isInt().withMessage('L\'ID du professionnel de santé doit être un entier'),
    body('service_id').optional().isInt().withMessage('L\'ID du service doit être un entier'),
    body('numeroDossier').optional().isLength({ max: 50 }),
    body('statut').optional().isIn(['Ouvert', 'Fermé', 'Archivé']),
    body('dateOuverture').optional().isISO8601().withMessage('La date d\'ouverture doit être au format ISO'),
    body('dateFermeture').optional().isISO8601().withMessage('La date de fermeture doit être au format ISO')
];

// Routes CRUD de base
router.post('/', 
    authenticateToken, 
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

// Nouvelles routes pour le partage patient-médecin
router.get('/patient/:patient_id/complet', 
    authenticateToken, 
    dossierMedicalController.getDossierCompletPatient
);

router.get('/patient/:patient_id/resume', 
    authenticateToken, 
    dossierMedicalController.getResumePatient
);

module.exports = router;