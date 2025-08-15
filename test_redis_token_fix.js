const axios = require('axios');
const { redis } = require('./src/config/redis');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const TEST_PATIENT = {
  numero_assure: 'IPRES123456789',
  mot_de_passe: 'motdepasse123'
};

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logSuccess = (message) => log(`✅ ${message}`, 'green');
const logError = (message) => log(`❌ ${message}`, 'red');
const logInfo = (message) => log(`ℹ️  ${message}`, 'blue');
const logWarning = (message) => log(`⚠️  ${message}`, 'yellow');

// Test de connexion Redis
async function testRedisConnection() {
  try {
    logInfo('🔍 Test de connexion Redis...');
    await redis.ping();
    logSuccess('Redis connecté avec succès');
    return true;
  } catch (error) {
    logError(`Erreur de connexion Redis: ${error.message}`);
    return false;
  }
}

// Test de génération et stockage de token
async function testTokenGeneration() {
  try {
    logInfo('🔍 Test de génération et stockage de token...');
    
    const tokenService = require('./src/services/tokenService');
    
    // Simuler un utilisateur
    const mockUser = {
      id_utilisateur: 999,
      nom: 'Test',
      prenom: 'User',
      email: 'test@example.com',
      role: 'test'
    };
    
    // Générer et stocker un token
    const token = await tokenService.generateAndStoreToken(mockUser, 'utilisateur');
    logSuccess(`Token généré: ${token.substring(0, 20)}...`);
    
    // Vérifier que le token est stocké dans Redis
    const validation = await tokenService.validateToken(token);
    if (validation) {
      logSuccess('Token validé avec succès dans Redis');
      logInfo(`Données du token: ${JSON.stringify(validation)}`);
    } else {
      logError('Token non trouvé dans Redis');
      return false;
    }
    
    // Nettoyer le token de test
    await tokenService.revokeToken(token, mockUser.id_utilisateur);
    logSuccess('Token de test révoqué');
    
    return true;
  } catch (error) {
    logError(`Erreur lors du test de génération de token: ${error.message}`);
    return false;
  }
}

// Test de connexion patient
async function testPatientLogin() {
  try {
    logInfo('🔍 Test de connexion patient...');
    
    const response = await axios.post(`${BASE_URL}/patient/auth/login`, TEST_PATIENT);
    
    if (response.status === 200) {
      logSuccess('Connexion patient réussie');
      logInfo(`Token reçu: ${response.data.token ? response.data.token.substring(0, 20) + '...' : 'Aucun token'}`);
      
      // Vérifier que le token est dans Redis
      const token = response.data.token;
      if (token) {
        const tokenService = require('./src/services/tokenService');
        const validation = await tokenService.validateToken(token);
        
        if (validation) {
          logSuccess('Token trouvé et validé dans Redis');
          return { token, patient: response.data.data.patient };
        } else {
          logError('Token non trouvé dans Redis après connexion');
          return null;
        }
      }
      
      return response.data;
    } else {
      logError(`Connexion échouée avec le statut: ${response.status}`);
      return null;
    }
  } catch (error) {
    if (error.response) {
      logError(`Erreur de connexion: ${error.response.status} - ${error.response.data.message || error.response.statusText}`);
    } else {
      logError(`Erreur de connexion: ${error.message}`);
    }
    return null;
  }
}

// Test d'accès à une route protégée
async function testProtectedRoute(token, patientId) {
  try {
    logInfo('🔍 Test d\'accès à une route protégée...');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Test d'accès au dossier médical
    const response = await axios.get(`${BASE_URL}/dossierMedical/patient/${patientId}/complet`, { headers });
    
    if (response.status === 200) {
      logSuccess('Accès à la route protégée réussi');
      return true;
    } else {
      logError(`Accès échoué avec le statut: ${response.status}`);
      return false;
    }
  } catch (error) {
    if (error.response) {
      logError(`Erreur d'accès: ${error.response.status} - ${error.response.data.message || error.response.statusText}`);
    } else {
      logError(`Erreur d'accès: ${error.message}`);
    }
    return false;
  }
}

// Test de déconnexion
async function testPatientLogout(token) {
  try {
    logInfo('🔍 Test de déconnexion patient...');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    const response = await axios.post(`${BASE_URL}/patient/auth/logout`, {}, { headers });
    
    if (response.status === 200) {
      logSuccess('Déconnexion réussie');
      
      // Vérifier que le token est révoqué dans Redis
      const tokenService = require('./src/services/tokenService');
      const validation = await tokenService.validateToken(token);
      
      if (!validation) {
        logSuccess('Token révoqué avec succès dans Redis');
        return true;
      } else {
        logError('Token toujours valide dans Redis après déconnexion');
        return false;
      }
    } else {
      logError(`Déconnexion échouée avec le statut: ${response.status}`);
      return false;
    }
  } catch (error) {
    if (error.response) {
      logError(`Erreur de déconnexion: ${error.response.status} - ${error.response.data.message || error.response.statusText}`);
    } else {
      logError(`Erreur de déconnexion: ${error.message}`);
    }
    return false;
  }
}

// Test de réutilisation de token révoqué
async function testTokenReuse(token) {
  try {
    logInfo('🔍 Test de réutilisation de token révoqué...');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Essayer d'accéder à une route protégée avec le token révoqué
    const response = await axios.get(`${BASE_URL}/access/patient/status`, { headers });
    
    if (response.status === 401) {
      logSuccess('Token révoqué correctement rejeté (401 Unauthorized)');
      return true;
    } else {
      logError(`Token révoqué accepté avec le statut: ${response.status}`);
      return false;
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      logSuccess('Token révoqué correctement rejeté (401 Unauthorized)');
      return true;
    } else {
      logError(`Erreur lors du test de réutilisation: ${error.message}`);
      return false;
    }
  }
}

// Test principal
async function runTests() {
  log('🚀 Démarrage des tests de gestion des tokens Redis', 'bright');
  log('=' * 60, 'cyan');
  
  try {
    // Test 1: Connexion Redis
    const redisOk = await testRedisConnection();
    if (!redisOk) {
      logError('Tests arrêtés: Redis non disponible');
      return;
    }
    
    log('', 'reset');
    
    // Test 2: Génération de token
    const tokenGenOk = await testTokenGeneration();
    if (!tokenGenOk) {
      logError('Tests arrêtés: Génération de token échouée');
      return;
    }
    
    log('', 'reset');
    
    // Test 3: Connexion patient
    const loginResult = await testPatientLogin();
    if (!loginResult || !loginResult.token) {
      logError('Tests arrêtés: Connexion patient échouée');
      return;
    }
    
    const { token, patient } = loginResult;
    log('', 'reset');
    
    // Test 4: Accès à une route protégée
    const accessOk = await testProtectedRoute(token, patient.id_patient);
    if (!accessOk) {
      logError('Tests arrêtés: Accès à la route protégée échoué');
      return;
    }
    
    log('', 'reset');
    
    // Test 5: Déconnexion
    const logoutOk = await testPatientLogout(token);
    if (!logoutOk) {
      logError('Tests arrêtés: Déconnexion échouée');
      return;
    }
    
    log('', 'reset');
    
    // Test 6: Réutilisation de token révoqué
    const reuseOk = await testTokenReuse(token);
    if (!reuseOk) {
      logError('Tests arrêtés: Test de réutilisation échoué');
      return;
    }
    
    log('', 'reset');
    
    // Résumé
    log('🎉 Tous les tests sont passés avec succès !', 'bright');
    log('✅ La gestion des tokens Redis fonctionne correctement', 'green');
    log('✅ Les tokens sont stockés dans Redis lors de la connexion', 'green');
    log('✅ Les tokens sont validés dans Redis pour les routes protégées', 'green');
    log('✅ Les tokens sont révoqués dans Redis lors de la déconnexion', 'green');
    log('✅ Les tokens révoqués sont rejetés', 'green');
    
  } catch (error) {
    logError(`Erreur générale lors des tests: ${error.message}`);
  } finally {
    // Fermer la connexion Redis
    await redis.quit();
    log('🔌 Connexion Redis fermée', 'cyan');
  }
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testRedisConnection,
  testTokenGeneration,
  testPatientLogin,
  testProtectedRoute,
  testPatientLogout,
  testTokenReuse,
  runTests
};
