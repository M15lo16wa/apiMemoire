const express = require('express');
const router = express.Router();
const DMPAccessController = require('./dmpAccess.controller');
const { protect, restrictTo } = require('../../middlewares/auth.middleware');

// === ROUTES PRINCIPALES ===

// Recherche de patients
router.get('/rechercher-patient', 
  protect, 
  restrictTo('medecin'), 
  DMPAccessController.rechercherPatient
);

// Sélection d'un patient
router.post('/selectionner-patient', 
  protect, 
  restrictTo('medecin'), 
  DMPAccessController.selectionnerPatient
);

// Authentification CPS
router.post('/authentification-cps', 
  protect, 
  restrictTo('medecin'), 
  DMPAccessController.authentificationCPS
);

// Demande d'accès DMP (NOUVELLE ROUTE)
router.post('/demande-acces', 
  protect, 
  restrictTo('medecin'), 
  DMPAccessController.demandeAcces
);

// Sélection du mode d'accès
router.post('/selection-mode-acces', 
  protect, 
  restrictTo('medecin'), 
  DMPAccessController.selectionModeAcces
);

// Informations du patient
router.get('/informations-patient/:patientId', 
  protect, 
  restrictTo('medecin'), 
  DMPAccessController.getInformationsPatient
);

// Historique d'accès DMP (NOUVELLE ROUTE)
router.get('/historique/:patientId?', 
  protect, 
  restrictTo('medecin'), 
  DMPAccessController.getHistoriqueAcces
);

// Sessions actives
router.get('/sessions-actives', 
  protect, 
  restrictTo('medecin'), 
  DMPAccessController.getSessionsActives
);

// Terminer une session
router.post('/terminer-session/:sessionId', 
  protect, 
  restrictTo('medecin'), 
  DMPAccessController.terminerSession
);

// === ROUTES DE TEST POUR SWAGGER ===

// Test du système complet
router.get('/test/systeme', DMPAccessController.testSystemeDMP);

// Test d'authentification CPS
router.post('/test/authentification-cps', DMPAccessController.testAuthentificationCPS);

// Test de création de session
router.post('/test/creation-session', DMPAccessController.testCreationSession);

// Test de notification
router.post('/test/notification', DMPAccessController.testNotification);

// Test de demande d'accès
router.post('/test/demande-acces', DMPAccessController.testDemandeAcces);

// Test d'historique
router.get('/test/historique/:patientId?', DMPAccessController.testHistorique);

module.exports = router; 