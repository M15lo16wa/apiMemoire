const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const TEST_PATIENT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwicm9sZSI6InBhdGllbnQiLCJpYXQiOjE3NTQ0OTI0NzYsImV4cCI6MTc2MjI2ODQ3Nn0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'; // Token de test

async function testDMPEndpoint() {
  try {
    console.log('🧪 Test de l\'endpoint DMP...');
    
    // Test de l'endpoint principal DMP
    const response = await axios.get(`${BASE_URL}/patient/dmp`, {
      headers: {
        'Authorization': `Bearer ${TEST_PATIENT_TOKEN}`,
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
    } else {
      console.error('Message:', error.message);
    }
    return false;
  }
}

async function testTableauDeBord() {
  try {
    console.log('\n🧪 Test de l\'endpoint tableau de bord...');
    
    const response = await axios.get(`${BASE_URL}/patient/dmp/tableau-de-bord`, {
      headers: {
        'Authorization': `Bearer ${TEST_PATIENT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Endpoint tableau de bord fonctionne !');
    console.log('📊 Données reçues:', JSON.stringify(response.data, null, 2));
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test du tableau de bord:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }
    return false;
  }
}

async function runTests() {
  console.log('🚀 Démarrage des tests DMP...\n');
  
  const dmpTest = await testDMPEndpoint();
  const tableauTest = await testTableauDeBord();
  
  console.log('\n📋 Résumé des tests:');
  console.log(`DMP principal: ${dmpTest ? '✅' : '❌'}`);
  console.log(`Tableau de bord: ${tableauTest ? '✅' : '❌'}`);
  
  if (dmpTest && tableauTest) {
    console.log('\n🎉 Tous les tests sont passés !');
  } else {
    console.log('\n⚠️ Certains tests ont échoué.');
  }
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testDMPEndpoint, testTableauDeBord }; 