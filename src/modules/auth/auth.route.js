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

// =================================================================
// === ROUTES 2FA (AUTHENTIFICATION À DOUBLE FACTEUR) ===
// =================================================================

// Configuration et gestion du 2FA
router.post('/setup-2fa', protect, authController.setup2FA);
router.post('/verify-2fa', protect, authController.verify2FA);
router.post('/disable-2fa', protect, authController.disable2FA);

// Validation 2FA pour session
router.post('/validate-2fa-session', protect, authController.validate2FASession);

// Gestion des codes de récupération
router.post('/generate-recovery-codes', protect, authController.generateRecoveryCodes);
router.post('/verify-recovery-code', protect, authController.verifyRecoveryCode);

module.exports = router;