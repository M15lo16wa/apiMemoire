const axios = require('axios');
const { redis } = require('./src/config/redis');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const TEST_PATIENT = {
  numero_assure: 'TEMP000005',
  mot_de_passe: 'passer123'
};

console.log('🔧 Test de la fonction logout corrigée');
console.log('=' * 50);

async function testLogoutFixed() {
  try {
    // ÉTAPE 1: Connexion patient
    console.log('\n🔐 ÉTAPE 1: Connexion patient');
    const loginResponse = await axios.post(`${BASE_URL}/patient/auth/login`, TEST_PATIENT);
    const token = loginResponse.data.token;
    const patientId = loginResponse.data.data.patient.id_patient;
    
    console.log('✅ Connexion réussie');
    console.log(`  - Patient ID: ${patientId}`);
    console.log(`  - Token: ${token.substring(0, 30)}...`);

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

    // ÉTAPE 3: Déconnexion via API (avec la fonction corrigée)
    console.log('\n🚪 ÉTAPE 3: Déconnexion via API (fonction corrigée)');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('  - Appel de /patient/auth/logout...');
    const logoutResponse = await axios.post(`${BASE_URL}/patient/auth/logout`, {}, { headers });
    console.log('  - Réponse déconnexion:', logoutResponse.status, logoutResponse.data.message);

    // ÉTAPE 4: Vérifier l'état après déconnexion
    console.log('\n🔍 ÉTAPE 4: État après déconnexion');
    
    // Attendre un peu pour s'assurer que Redis a traité les commandes
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
      
      // Si on arrive ici, il y a encore un problème
      console.log('\n🔍 ANALYSE DU PROBLÈME:');
      console.log('  - Le token est encore accepté par l\'API');
      console.log('  - Vérifiez les logs du serveur pour voir si tokenService.revokeToken est appelé');
      
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('  - ✅ Token révoqué correctement rejeté (401)');
        console.log(`  - Message: ${error.response.data.message || 'Token invalide'}`);
        
        // SUCCÈS ! Testons la reconnexion
        console.log('\n🔄 Test de reconnexion...');
        try {
          const reloginResponse = await axios.post(`${BASE_URL}/patient/auth/login`, TEST_PATIENT);
          if (reloginResponse.status === 200 && reloginResponse.data.token) {
            console.log('✅ Reconnexion réussie');
            console.log('🎉 TOUS LES TESTS SONT PASSÉS !');
            console.log('🔐 La gestion des tokens Redis fonctionne parfaitement !');
          } else {
            console.log('❌ Reconnexion échouée');
          }
        } catch (reloginError) {
          console.log(`❌ Erreur reconnexion: ${reloginError.response?.status}`);
        }
      } else {
        console.log(`⚠️  Réponse inattendue: ${error.response?.status}`);
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
testLogoutFixed().catch(console.error);
