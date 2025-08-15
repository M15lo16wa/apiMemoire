require('dotenv').config();
const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

// Configuration axios
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  validateStatus: () => true // Accepter tous les codes de statut pour les tests
});

// Variables globales pour les tests
let authToken = null;
let userId = null;

async function testAuthWithRedis() {
  console.log('🧪 Test d\'authentification avec Redis\n');
  console.log(`📍 URL de base: ${BASE_URL}\n`);

  try {
    // Test 1: Connexion utilisateur
    console.log('1️⃣ Test de connexion utilisateur...');
    const loginResponse = await api.post('/auth/login', {
      email: 'admin@example.com',
      mot_de_passe: 'admin123'
    });

    if (loginResponse.status === 200 && loginResponse.data.token) {
      authToken = loginResponse.data.token;
      userId = loginResponse.data.data.user.id_utilisateur;
      console.log('✅ Connexion réussie');
      console.log(`   - Token: ${authToken.substring(0, 30)}...`);
      console.log(`   - ID utilisateur: ${userId}\n`);
    } else {
      console.log('❌ Échec de la connexion');
      console.log(`   - Status: ${loginResponse.status}`);
      console.log(`   - Réponse: ${JSON.stringify(loginResponse.data)}\n`);
      return;
    }

    // Test 2: Accès à une route protégée
    console.log('2️⃣ Test d\'accès à une route protégée...');
    const protectedResponse = await api.get('/auth/session', {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (protectedResponse.status === 200) {
      console.log('✅ Accès à la route protégée réussi');
      console.log(`   - Session: ${JSON.stringify(protectedResponse.data.data.session, null, 2)}\n`);
    } else {
      console.log('❌ Échec d\'accès à la route protégée');
      console.log(`   - Status: ${protectedResponse.status}`);
      console.log(`   - Réponse: ${JSON.stringify(protectedResponse.data)}\n`);
    }

    // Test 3: Tentative d'utilisation du token après déconnexion
    console.log('3️⃣ Test de déconnexion...');
    const logoutResponse = await api.post('/auth/logout', {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (logoutResponse.status === 200) {
      console.log('✅ Déconnexion réussie\n');
    } else {
      console.log('❌ Échec de la déconnexion');
      console.log(`   - Status: ${logoutResponse.status}`);
      console.log(`   - Réponse: ${JSON.stringify(logoutResponse.data)}\n`);
    }

    // Test 4: Tentative de réutilisation du token révoqué
    console.log('4️⃣ Test de réutilisation du token révoqué...');
    const reusedTokenResponse = await api.get('/auth/session', {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (reusedTokenResponse.status === 401) {
      console.log('✅ Token correctement invalidé après déconnexion');
      console.log(`   - Status: ${reusedTokenResponse.status}`);
      console.log(`   - Message: ${reusedTokenResponse.data.message}\n`);
    } else {
      console.log('❌ Le token est toujours valide après déconnexion');
      console.log(`   - Status: ${reusedTokenResponse.status}`);
      console.log(`   - Réponse: ${JSON.stringify(reusedTokenResponse.data)}\n`);
    }

    // Test 5: Nouvelle connexion
    console.log('5️⃣ Test de nouvelle connexion...');
    const newLoginResponse = await api.post('/auth/login', {
      email: 'admin@example.com',
      mot_de_passe: 'admin123'
    });

    if (newLoginResponse.status === 200 && newLoginResponse.data.token) {
      const newToken = newLoginResponse.data.token;
      console.log('✅ Nouvelle connexion réussie');
      console.log(`   - Nouveau token: ${newToken.substring(0, 30)}...`);
      console.log(`   - Token différent: ${newToken !== authToken ? 'Oui' : 'Non'}\n`);
    } else {
      console.log('❌ Échec de la nouvelle connexion');
      console.log(`   - Status: ${newLoginResponse.status}`);
      console.log(`   - Réponse: ${JSON.stringify(newLoginResponse.data)}\n`);
    }

    // Test 6: Statistiques Redis
    console.log('6️⃣ Test des statistiques Redis...');
    const statsResponse = await api.get('/auth/redis-stats', {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (statsResponse.status === 200) {
      console.log('✅ Statistiques Redis récupérées');
      console.log(`   - Total des clés: ${statsResponse.data.data.stats.totalKeys}`);
      console.log(`   - Tokens actifs: ${statsResponse.data.data.stats.activeTokens}`);
      console.log(`   - Sessions actives: ${statsResponse.data.data.stats.activeSessions}`);
      console.log(`   - Tokens blacklistés: ${statsResponse.data.data.stats.blacklistedTokens}\n`);
    } else {
      console.log('❌ Échec de récupération des statistiques');
      console.log(`   - Status: ${statsResponse.status}`);
      console.log(`   - Réponse: ${JSON.stringify(statsResponse.data)}\n`);
    }

    console.log('🎉 Tests d\'authentification avec Redis terminés !');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
    if (error.response) {
      console.error('   - Status:', error.response.status);
      console.error('   - Données:', error.response.data);
    }
  }
}

// Fonction pour tester avec un utilisateur de test
async function testWithTestUser() {
  console.log('\n🧪 Test avec un utilisateur de test...\n');

  try {
    // Créer un utilisateur de test
    console.log('1️⃣ Création d\'un utilisateur de test...');
    const registerResponse = await api.post('/auth/register', {
      nom: 'Test',
      prenom: 'User',
      email: 'test@example.com',
      mot_de_passe: 'test123',
      role: 'secretaire'
    });

    if (registerResponse.status === 201) {
      console.log('✅ Utilisateur de test créé');
      console.log(`   - ID: ${registerResponse.data.data.user.id_utilisateur}\n`);
    } else {
      console.log('❌ Échec de création de l\'utilisateur de test');
      console.log(`   - Status: ${registerResponse.status}`);
      console.log(`   - Réponse: ${JSON.stringify(registerResponse.data)}\n`);
      return;
    }

    // Connexion avec l'utilisateur de test
    console.log('2️⃣ Connexion avec l\'utilisateur de test...');
    const testLoginResponse = await api.post('/auth/login', {
      email: 'test@example.com',
      mot_de_passe: 'test123'
    });

    if (testLoginResponse.status === 200 && testLoginResponse.data.token) {
      const testToken = testLoginResponse.data.token;
      console.log('✅ Connexion utilisateur de test réussie');
      console.log(`   - Token: ${testToken.substring(0, 30)}...\n`);

      // Test de déconnexion de tous les appareils
      console.log('3️⃣ Test de déconnexion de tous les appareils...');
      const logoutAllResponse = await api.post('/auth/logout-all-devices', {}, {
        headers: { Authorization: `Bearer ${testToken}` }
      });

      if (logoutAllResponse.status === 200) {
        console.log('✅ Déconnexion de tous les appareils réussie\n');
      } else {
        console.log('❌ Échec de la déconnexion de tous les appareils');
        console.log(`   - Status: ${logoutAllResponse.status}`);
        console.log(`   - Réponse: ${JSON.stringify(logoutAllResponse.data)}\n`);
      }

      // Vérifier que le token est invalidé
      console.log('4️⃣ Vérification de l\'invalidation du token...');
      const invalidTokenResponse = await api.get('/auth/session', {
        headers: { Authorization: `Bearer ${testToken}` }
      });

      if (invalidTokenResponse.status === 401) {
        console.log('✅ Token correctement invalidé après déconnexion de tous les appareils\n');
      } else {
        console.log('❌ Le token est toujours valide après déconnexion de tous les appareils');
        console.log(`   - Status: ${invalidTokenResponse.status}`);
        console.log(`   - Réponse: ${JSON.stringify(invalidTokenResponse.data)}\n`);
      }
    } else {
      console.log('❌ Échec de la connexion utilisateur de test');
      console.log(`   - Status: ${testLoginResponse.status}`);
      console.log(`   - Réponse: ${JSON.stringify(testLoginResponse.data)}\n`);
    }

  } catch (error) {
    console.error('❌ Erreur lors des tests avec l\'utilisateur de test:', error.message);
    if (error.response) {
      console.error('   - Status:', error.response.status);
      console.error('   - Données:', error.response.data);
    }
  }
}

// Exécuter les tests
async function runAllTests() {
  await testAuthWithRedis();
  await testWithTestUser();
  console.log('\n🏁 Tous les tests sont terminés !');
}

// Vérifier si axios est installé
try {
  require('axios');
  runAllTests();
} catch (error) {
  console.log('📦 Installation d\'axios...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install axios', { stdio: 'inherit' });
    console.log('✅ Axios installé avec succès\n');
    runAllTests();
  } catch (installError) {
    console.error('❌ Erreur lors de l\'installation d\'axios:', installError.message);
    console.log('💡 Installez manuellement avec: npm install axios');
  }
}
