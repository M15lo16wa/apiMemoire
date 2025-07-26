const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const examenLaboController = require('./examenLabo.controller');
const { handleValidationErrors } = require('../../middlewares/validation.middleware');
const { authenticateToken } = require('../../middlewares/auth.middleware');

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