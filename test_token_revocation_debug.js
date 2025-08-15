const axios = require('axios');
const { redis } = require('./src/config/redis');
const tokenService = require('./src/services/tokenService');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const TEST_PATIENT = {
  numero_assure: 'TEMP000005',
  mot_de_passe: 'passer123'
};

console.log('🔍 Test de débogage de la révocation des tokens');
console.log('=' * 50);

async function testTokenRevocationDebug() {
  try {
    // ÉTAPE 1: Connexion
    console.log('\n🔐 ÉTAPE 1: Connexion patient');
    const loginResponse = await axios.post(`${BASE_URL}/patient/auth/login`, TEST_PATIENT);
    const token = loginResponse.data.token;
    const patientId = loginResponse.data.data.patient.id_patient;
    
    console.log('✅ Connexion réussie');
    console.log(`  - Token: ${token.substring(0, 30)}...`);
    console.log(`  - Patient ID: ${patientId}`);

    // ÉTAPE 2: Vérifier que le token est dans Redis
    console.log('\n🔍 ÉTAPE 2: Vérification du token dans Redis');
    const tokenValidation = await tokenService.validateToken(token);
    console.log('  - Token validé:', !!tokenValidation);
    if (tokenValidation) {
      console.log('  - Données du token:', {
        id: tokenValidation.id,
        role: tokenValidation.role,
        type: tokenValidation.type
      });
    }

    // ÉTAPE 3: Vérifier les clés Redis
    console.log('\n🔍 ÉTAPE 3: Vérification des clés Redis');
    const tokenKey = `token:${token}`;
    const sessionKey = `session:${patientId}`;
    const blacklistKey = `blacklist:${token}`;
    
    const tokenInRedis = await redis.get(tokenKey);
    const sessionInRedis = await redis.get(sessionKey);
    const blacklistInRedis = await redis.exists(blacklistKey);
    
    console.log('  - Token dans Redis:', !!tokenInRedis);
    console.log('  - Session dans Redis:', !!sessionInRedis);
    console.log('  - Token dans blacklist:', !!blacklistInRedis);

    // ÉTAPE 4: Déconnexion
    console.log('\n🚪 ÉTAPE 4: Déconnexion');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    const logoutResponse = await axios.post(`${BASE_URL}/patient/auth/logout`, {}, { headers });
    console.log('  - Déconnexion:', logoutResponse.status === 200 ? 'OK' : 'ÉCHEC');

    // ÉTAPE 5: Vérifier l'état après déconnexion
    console.log('\n🔍 ÉTAPE 5: État après déconnexion');
    
    // Attendre un peu pour s'assurer que Redis a traité les commandes
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const tokenAfterLogout = await redis.get(tokenKey);
    const sessionAfterLogout = await redis.get(sessionKey);
    const blacklistAfterLogout = await redis.exists(blacklistKey);
    
    console.log('  - Token dans Redis après logout:', !!tokenAfterLogout);
    console.log('  - Session dans Redis après logout:', !!sessionAfterLogout);
    console.log('  - Token dans blacklist après logout:', !!blacklistAfterLogout);

    // ÉTAPE 6: Test de validation après déconnexion
    console.log('\n🔍 ÉTAPE 6: Test de validation après déconnexion');
    const validationAfterLogout = await tokenService.validateToken(token);
    console.log('  - Token validé après logout:', !!validationAfterLogout);
    
    if (validationAfterLogout) {
      console.log('  - ERREUR: Token toujours valide après déconnexion !');
    } else {
      console.log('  - ✅ Token correctement invalidé');
    }

    // ÉTAPE 7: Test d'accès avec le token révoqué
    console.log('\n🚫 ÉTAPE 7: Test d\'accès avec token révoqué');
    try {
      const accessResponse = await axios.get(`${BASE_URL}/dossierMedical/patient/${patientId}/complet`, { headers });
      console.log(`  - ❌ ERREUR: Accès réussi avec token révoqué (${accessResponse.status})`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('  - ✅ Token révoqué correctement rejeté (401)');
      } else {
        console.log(`  - ⚠️  Réponse inattendue: ${error.response?.status}`);
      }
    }

    // Nettoyage
    await redis.quit();
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.response) {
      console.error('  - Status:', error.response.status);
      console.error('  - Message:', error.response.data.message || error.response.statusText);
    }
  }
}

// Exécuter le test
testTokenRevocationDebug().catch(console.error);
