const axios = require('axios');
const { redis } = require('./src/config/redis');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const TEST_PATIENT = {
  numero_assure: 'TEMP000005',
  mot_de_passe: 'passer123'
};

console.log('🎯 Test final de la solution complète');
console.log('=' * 50);

async function testFinalSolution() {
  try {
    console.log('🔍 Vérification de la configuration...');
    console.log('  - JWT_SECRET défini:', !!process.env.JWT_SECRET);
    console.log('  - REDIS_HOST:', process.env.REDIS_HOST || 'localhost');
    console.log('  - REDIS_PORT:', process.env.REDIS_PORT || 6379);

    // ÉTAPE 1: Connexion patient
    console.log('\n🔐 ÉTAPE 1: Connexion patient');
    const loginResponse = await axios.post(`${BASE_URL}/patient/auth/login`, TEST_PATIENT);
    const token = loginResponse.data.token;
    const patientId = loginResponse.data.data.patient.id_patient;
    
    console.log('✅ Connexion réussie');
    console.log(`  - Patient ID: ${patientId}`);
    console.log(`  - Token: ${token.substring(0, 30)}...`);

    // Vérifier la structure du token
    const tokenParts = token.split('.');
    if (tokenParts.length === 3) {
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      console.log(`  - Token Role: ${payload.role}`);
      console.log(`  - Token Type: ${payload.type}`);
    }

    // ÉTAPE 2: Accès aux routes protégées
    console.log('\n🔒 ÉTAPE 2: Accès aux routes protégées');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Test d'accès
    try {
      const accessResponse = await axios.get(`${BASE_URL}/dossierMedical/patient/${patientId}/complet`, { headers });
      console.log('✅ Accès réussi (200)');
    } catch (error) {
      console.log(`❌ Accès échoué: ${error.response?.status}`);
      return;
    }

    // ÉTAPE 3: Déconnexion
    console.log('\n🚪 ÉTAPE 3: Déconnexion');
    console.log('  - Appel de /patient/auth/logout...');
    
    try {
      const logoutResponse = await axios.post(`${BASE_URL}/patient/auth/logout`, {}, { headers });
      console.log(`  - Déconnexion: ${logoutResponse.status} - ${logoutResponse.data.message}`);
    } catch (error) {
      console.log(`❌ Erreur déconnexion: ${error.response?.status}`);
      return;
    }

    // ÉTAPE 4: Vérification de l'état Redis
    console.log('\n🔍 ÉTAPE 4: Vérification de l\'état Redis');
    
    // Attendre un peu pour s'assurer que Redis a traité les commandes
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const tokenKey = `token:${token}`;
    const sessionKey = `session:${patientId}`;
    const blacklistKey = `blacklist:${token}`;
    
    const tokenInRedis = await redis.get(tokenKey);
    const sessionInRedis = await redis.get(sessionKey);
    const blacklistInRedis = await redis.exists(blacklistKey);
    
    console.log('  - Token dans Redis après logout:', !!tokenInRedis);
    console.log('  - Session dans Redis après logout:', !!sessionInRedis);
    console.log('  - Token dans blacklist après logout:', !!blacklistInRedis);

    // ÉTAPE 5: Test d'accès avec token révoqué
    console.log('\n🚫 ÉTAPE 5: Test d\'accès avec token révoqué');
    try {
      const reuseResponse = await axios.get(`${BASE_URL}/dossierMedical/patient/${patientId}/complet`, { headers });
      console.log(`❌ ERREUR: Token révoqué accepté (${reuseResponse.status})`);
      
      // Si on arrive ici, il y a un problème
      console.log('\n🔍 ANALYSE DU PROBLÈME:');
      console.log('  - Le token est encore accepté par l\'API');
      console.log('  - Cela signifie que la révocation ne fonctionne pas');
      console.log('  - Vérifiez les logs du serveur pour plus de détails');
      
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Token révoqué correctement rejeté (401 Unauthorized)');
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
    console.error('❌ Erreur générale:', error.message);
    if (error.response) {
      console.error('  - Status:', error.response.status);
      console.error('  - Message:', error.response.data.message || error.response.statusText);
    }
  }
}

// Exécuter le test final
testFinalSolution().catch(console.error);
