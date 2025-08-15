const axios = require('axios');
const { redis } = require('./src/config/redis');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const TEST_PATIENT = {
  numero_assure: 'TEMP000005',
  mot_de_passe: 'passer123'
};

console.log('🔍 Test d\'intégration de la déconnexion');
console.log('=' * 50);

async function testLogoutIntegration() {
  try {
    // ÉTAPE 1: Connexion
    console.log('\n🔐 ÉTAPE 1: Connexion patient');
    const loginResponse = await axios.post(`${BASE_URL}/patient/auth/login`, TEST_PATIENT);
    const token = loginResponse.data.token;
    const patientId = loginResponse.data.data.patient.id_patient;
    
    console.log('✅ Connexion réussie');
    console.log(`  - Token: ${token.substring(0, 30)}...`);
    console.log(`  - Patient ID: ${patientId}`);

    // ÉTAPE 2: Vérifier l'état initial dans Redis
    console.log('\n🔍 ÉTAPE 2: État initial dans Redis');
    const tokenKey = `token:${token}`;
    const sessionKey = `session:${patientId}`;
    const blacklistKey = `blacklist:${token}`;
    
    const tokenInRedis = await redis.get(tokenKey);
    const sessionInRedis = await redis.get(sessionKey);
    const blacklistInRedis = await redis.exists(blacklistKey);
    
    console.log('  - Token dans Redis:', !!tokenInRedis);
    console.log('  - Session dans Redis:', !!sessionInRedis);
    console.log('  - Token dans blacklist:', !!blacklistInRedis);

    // ÉTAPE 3: Déconnexion via API
    console.log('\n🚪 ÉTAPE 3: Déconnexion via API');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('  - Appel de /patient/auth/logout...');
    const logoutResponse = await axios.post(`${BASE_URL}/patient/auth/logout`, {}, { headers });
    console.log('  - Réponse déconnexion:', logoutResponse.status, logoutResponse.data.message);

    // ÉTAPE 4: Vérifier l'état après déconnexion
    console.log('\n🔍 ÉTAPE 4: État après déconnexion');
    
    // Attendre un peu
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const tokenAfterLogout = await redis.get(tokenKey);
    const sessionAfterLogout = await redis.get(sessionKey);
    const blacklistAfterLogout = await redis.exists(blacklistKey);
    
    console.log('  - Token dans Redis après logout:', !!tokenAfterLogout);
    console.log('  - Session dans Redis après logout:', !!sessionAfterLogout);
    console.log('  - Token dans blacklist après logout:', !!blacklistAfterLogout);

    // ÉTAPE 5: Test d'accès avec le token révoqué
    console.log('\n🚫 ÉTAPE 5: Test d\'accès avec token révoqué');
    try {
      const accessResponse = await axios.get(`${BASE_URL}/dossierMedical/patient/${patientId}/complet`, { headers });
      console.log(`  - ❌ ERREUR: Accès réussi avec token révoqué (${accessResponse.status})`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('  - ✅ Token révoqué correctement rejeté (401)');
        console.log(`  - Message: ${error.response.data.message || 'Token invalide'}`);
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
testLogoutIntegration().catch(console.error);
