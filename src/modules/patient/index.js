/**
 * Index des modules patient
 */

const express = require('express');
const patientRoutes = require('./patient.route');
const autoMesureRoutes = require('./autoMesure.route');
const autoMesureSwagger = require('./autoMesure.swagger');

// Créer un routeur parent qui combine toutes les routes patient
const patientRouter = express.Router();

// Monter les routes auto-mesures en premier (routes spécifiques)
// Les routes auto-mesures sont déjà définies avec leurs propres chemins
patientRouter.use('/', autoMesureRoutes);

// Monter les routes patient ensuite (routes génériques)
patientRouter.use('/', patientRoutes);

module.exports = {
    patientRoutes: patientRouter,
    autoMesureRoutes,
    autoMesureSwagger
};
