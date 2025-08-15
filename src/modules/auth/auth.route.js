const express = require('express');
const authController = require('./auth.controller');
const { protect } = require('../../middlewares/auth.middleware');

const router = express.Router();

// =================================================================
// === ROUTES PUBLIQUES ===
// =================================================================

// Authentification standard
router.post('/register', authController.register);
router.post('/login', authController.login);

// Authentification professionnels de santé
router.post('/login-professionnel', authController.loginProfessionnel);

// Authentification patients
router.post('/login-patient', authController.loginPatient);

// =================================================================
// === ROUTES PROTÉGÉES ===
// =================================================================

// Déconnexion (nécessite un token valide)
router.post('/logout', protect, authController.logout);
router.post('/logout-professionnel', protect, authController.logoutProfessionnel);
router.post('/logout-patient', protect, authController.logoutPatient);

// Déconnexion de tous les appareils
router.post('/logout-all-devices', protect, authController.logoutAllDevices);

// Informations de session
router.get('/session', protect, authController.getSessionInfo);

// Statistiques Redis (admin seulement)
router.get('/redis-stats', protect, authController.getRedisStats);

module.exports = router;