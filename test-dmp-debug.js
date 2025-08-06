const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';

async function testPatientLogin() {
  try {
    console.log('🔐 Test de connexion patient...');
    
    const loginResponse = await axios.post(`${BASE_URL}/auth/login-patient`, {
      numero_assure: '123456789',
      mot_de_passe: 'password123'
    });

    console.log('✅ Connexion réussie !');
    console.log('Token:', loginResponse.data.token);
    
    return loginResponse.data.token;
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.response?.data || error.message);
    return null;
  }
}

async function testDMPEndpoint(token) {
  try {
    console.log('\n🧪 Test de l\'endpoint DMP...');
    
    const response = await axios.get(`${BASE_URL}/patient/dmp`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Endpoint DMP fonctionne !');
    console.log('📊 Données reçues:', JSON.stringify(response.data, null, 2));
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test de l\'endpoint DMP:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else {
      console.error('Message:', error.message);
    }
    return false;
  }
}

async function testServerStatus() {
  try {
    console.log('🏥 Test du statut du serveur...');
    
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Serveur en ligne !');
    console.log('Status:', response.status);
    
    return true;
  } catch (error) {
    console.error('❌ Serveur inaccessible:', error.message);
    return false;
  }
}

async function runDebugTests() {
  console.log('🚀 Démarrage des tests de débogage DMP...\n');
  
  // Test 1: Vérifier que le serveur fonctionne
  const serverStatus = await testServerStatus();
  if (!serverStatus) {
    console.log('❌ Le serveur n\'est pas accessible. Vérifiez qu\'il est démarré.');
    return;
  }
  
  // Test 2: Connexion patient
  const token = await testPatientLogin();
  if (!token) {
    console.log('❌ Impossible de se connecter. Vérifiez les identifiants.');
    return;
  }
  
  // Test 3: Endpoint DMP
  const dmpTest = await testDMPEndpoint(token);
  
  console.log('\n📋 Résumé des tests:');
  console.log(`Serveur: ${serverStatus ? '✅' : '❌'}`);
  console.log(`Connexion: ${token ? '✅' : '❌'}`);
  console.log(`DMP endpoint: ${dmpTest ? '✅' : '❌'}`);
  
  if (serverStatus && token && dmpTest) {
    console.log('\n🎉 Tous les tests sont passés !');
  } else {
    console.log('\n⚠️ Certains tests ont échoué.');
  }
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runDebugTests().catch(console.error);
}

module.exports = { testPatientLogin, testDMPEndpoint, testServerStatus }; 