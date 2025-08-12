const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
const ENDPOINT = '/api/prescription/ordonnances-recentes';

// Token de test valide pour le professionnel ID 2 (Diop Mamadou)
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6InByb2Zlc3Npb25uZWwiLCJpZF9wcm9mZXNzaW9ubmVsIjoyLCJudW1lcm9fYWRlbGkiOiJBSDIzNDU2NzgwIiwiaWF0IjoxNzU1MDA3MDIyLCJleHAiOjE3NTUwOTM0MjJ9.b2Bcs6vDpEiu1mf4DSMQt04Gd_e6Rz4lfzdZEGFtmL0';

async function testOrdonnancesRecentes() {
  console.log('🧪 Test de la route /ordonnances-recentes');
  console.log('=====================================\n');

  try {
    // Test 1: Sans paramètre prescription_id (doit retourner 400)
    console.log('1️⃣ Test sans paramètre prescription_id:');
    try {
      const response = await axios.get(`${BASE_URL}${ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Erreur: Devrait retourner 400 mais a retourné:', response.status);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Succès: 400 Bad Request retourné comme attendu');
        console.log('   Message:', error.response.data.message);
      } else {
        console.log('❌ Erreur inattendue:', error.message);
      }
    }

    console.log('\n2️⃣ Test avec prescription_id valide:');
    try {
      const response = await axios.get(`${BASE_URL}${ENDPOINT}?prescription_id=1`, {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Succès: 200 OK');
      console.log('   Status:', response.data.status);
      console.log('   Message:', response.data.message);
      console.log('   Données reçues:', JSON.stringify(response.data.data, null, 2));
    } catch (error) {
      if (error.response) {
        console.log('❌ Erreur:', error.response.status, error.response.data.message || error.response.data);
      } else {
        console.log('❌ Erreur réseau:', error.message);
      }
    }

    console.log('\n3️⃣ Test avec prescription_id invalide:');
    try {
      const response = await axios.get(`${BASE_URL}${ENDPOINT}?prescription_id=999999`, {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Succès: 200 OK (mais liste vide)');
      console.log('   Total ordonnances:', response.data.data.total);
    } catch (error) {
      if (error.response) {
        console.log('❌ Erreur:', error.response.status, error.response.data.message || error.response.data);
      } else {
        console.log('❌ Erreur réseau:', error.message);
      }
    }

    console.log('\n4️⃣ Test sans token (doit retourner 401):');
    try {
      const response = await axios.get(`${BASE_URL}${ENDPOINT}?prescription_id=1`);
      console.log('❌ Erreur: Devrait retourner 401 mais a retourné:', response.status);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Succès: 401 Unauthorized retourné comme attendu');
      } else {
        console.log('❌ Erreur inattendue:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Exécuter le test
testOrdonnancesRecentes();
