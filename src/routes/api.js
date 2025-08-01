const express = require('express');
const authRoutes = require('../modules/auth/auth.route');
// const authController = require('../modules/auth/auth.controller');
const patientRoutes = require('../modules/patient/patient.route');
const professionnelSanteRoutes = require('../modules/professionnelSante/professionnelSante.route');
const dossierMedicalRoutes = require('../modules/dossierMedical/dossierMedical.route');
const consultationRoutes = require('../modules/consultation/consultationRoutes');
const hopitalRoutes = require('../modules/hopitaux/hopitaux.route');
const serviceSanteRoutes = require('../modules/serviceSante/serviceSante.route');
const rendezVousRoutes = require('../modules/rendezVous/rendezVous.route');
const prescriptionRoutes = require('../modules/prescription/prescription.route');
const examenLaboRoutes = require('../modules/examenLabo/examenLabo.route');
const accessRoutes = require('../modules/access/access.route');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/patient', patientRoutes);
router.use('/professionnelSante', professionnelSanteRoutes);
router.use('/hopital', hopitalRoutes);
router.use('/service-sante', serviceSanteRoutes);
// router.use('/authcontroller', authController);
router.use('/access', accessRoutes);

router.use('/dossierMedical', dossierMedicalRoutes);
router.use('/consultation', consultationRoutes);
router.use('/rendez-vous', rendezVousRoutes);
router.use('/prescription', prescriptionRoutes);
router.use('/examen-labo', examenLaboRoutes);
// Route de déconnexion directe pour plus de commodité

module.exports = router;