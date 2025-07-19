const express = require('express');
const authRoutes = require('../modules/auth/auth.route');
// const authController = require('../modules/auth/auth.controller');
const patientRoutes = require('../modules/patient/patient.route');
const professionnelSanteRoutes = require('../modules/professionnelSante/professionnelSante.route');
const dossierMedicalRoutes = require('../modules/dossierMedical/dossierMedical.route');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/patient', patientRoutes);
router.use('/professionnelSante', professionnelSanteRoutes);
// router.use('/authcontroller', authController);

router.use('/dossierMedical', dossierMedicalRoutes);
// Route de déconnexion directe pour plus de commodité

module.exports = router;