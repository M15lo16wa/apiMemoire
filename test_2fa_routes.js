const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'testpassword123';

// Configuration axios
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Test des routes 2FA
async function test2FARoutes() {
  console.log('🧪 Test des routes 2FA...\n');

  try {
    // Test 1: Vérifier que le serveur répond
    console.log('1️⃣ Test de connexion au serveur...');
    const response = await api.get('/auth/session');
    console.log('✅ Serveur accessible');
    console.log('');

    // Test 2: Tentative d'accès à une route 2FA sans authentification
    console.log('2️⃣ Test d\'accès à setup-2fa sans authentification...');
    try {
      await api.post('/auth/setup-2fa');
      console.log('❌ Erreur: Route accessible sans authentification');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Route protégée correctement (401 Unauthorized)');
      } else {
        console.log('⚠️ Statut inattendu:', error.response?.status);
      }
    }
    console.log('');

    // Test 3: Test de la route de validation 2FA
    console.log('3️⃣ Test de la route validate-2fa-session...');
    try {
      await api.post('/auth/validate-2fa-session', {
        twoFactorToken: '123456'
      });
      console.log('❌ Erreur: Route accessible sans authentification');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Route protégée correctement (401 Unauthorized)');
      } else {
        console.log('⚠️ Statut inattendu:', error.response?.status);
      }
    }
    console.log('');

    console.log('🎉 Tests des routes 2FA terminés avec succès !');
    console.log('📝 Note: Les tests d\'authentification nécessitent un token valide');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Serveur non accessible. Assurez-vous qu\'il soit démarré sur le port 3000');
    } else {
      console.error('❌ Erreur lors des tests:', error.message);
    }
  }
}

// Exécuter les tests
test2FARoutes();
