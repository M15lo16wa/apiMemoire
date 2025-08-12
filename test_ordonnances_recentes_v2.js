const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
const ENDPOINT = '/api/prescription/ordonnances-recentes';

// Token de test valide pour le professionnel ID 2 (Diop Mamadou)
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6InByb2Zlc3Npb25uZWwiLCJpZF9wcm9mZXNzaW9ubmVsIjoyLCJudW1lcm9fYWRlbGkiOiJBSDIzNDU2NzgwIiwiaWF0IjoxNzU1MDA3MDIyLCJleHAiOjE3NTUwOTM0MjJ9.b2Bcs6vDpEiu1mf4DSMQt04Gd_e6Rz4lfzdZEGFtmL0';

async function testOrdonnancesRecentesV2() {
  console.log('🧪 Test de la route /ordonnances-recentes (Nouvelle version)');
  console.log('========================================================\n');

  try {
    // Test 1: Sans paramètres (doit retourner les 10 plus récentes par défaut)
    console.log('1️⃣ Test sans paramètres (défaut):');
    try {
      const response = await axios.get(`${BASE_URL}${ENDPOINT}`, {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Succès: 200 OK');
      console.log('   Status:', response.data.status);
      console.log('   Message:', response.data.message);
      console.log('   Total prescriptions:', response.data.data.total);
      console.log('   Limit appliqué:', response.data.data.limit);
      console.log('   Type filtré:', response.data.data.type);
      console.log('   Prescriptions retournées:', response.data.data.prescriptions.length);
    } catch (error) {
      if (error.response) {
        console.log('❌ Erreur:', error.response.status, error.response.data.message || error.response.data);
      } else {
        console.log('❌ Erreur réseau:', error.message);
      }
    }

    console.log('\n2️⃣ Test avec limite personnalisée:');
    try {
      const response = await axios.get(`${BASE_URL}${ENDPOINT}?limit=5`, {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Succès: 200 OK');
      console.log('   Limit demandé: 5');
      console.log('   Limit appliqué:', response.data.data.limit);
      console.log('   Prescriptions retournées:', response.data.data.prescriptions.length);
    } catch (error) {
      if (error.response) {
        console.log('❌ Erreur:', error.response.status, error.response.data.message || error.response.data);
      } else {
        console.log('❌ Erreur réseau:', error.message);
      }
    }

    console.log('\n3️⃣ Test avec filtre par type (ordonnances uniquement):');
    try {
      const response = await axios.get(`${BASE_URL}${ENDPOINT}?type=ordonnance&limit=10`, {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Succès: 200 OK');
      console.log('   Type filtré: ordonnance');
      console.log('   Total ordonnances:', response.data.data.total);
      console.log('   Prescriptions retournées:', response.data.data.prescriptions.length);
      
      // Vérifier que toutes sont bien des ordonnances
      const allOrdonnances = response.data.data.prescriptions.every(p => p.type_prescription === 'ordonnance');
      console.log('   Toutes sont des ordonnances:', allOrdonnances ? '✅' : '❌');
    } catch (error) {
      if (error.response) {
        console.log('❌ Erreur:', error.response.status, error.response.data.message || error.response.data);
      } else {
        console.log('❌ Erreur réseau:', error.message);
      }
    }

    console.log('\n4️⃣ Test avec filtre par patient:');
    try {
      const response = await axios.get(`${BASE_URL}${ENDPOINT}?patient_id=5&limit=10`, {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Succès: 200 OK');
      console.log('   Patient ID: 5');
      console.log('   Total prescriptions pour ce patient:', response.data.data.total);
      console.log('   Prescriptions retournées:', response.data.data.prescriptions.length);
      
      // Vérifier que toutes appartiennent au patient 5
      const allForPatient = response.data.data.prescriptions.every(p => p.patient_id === 5);
      console.log('   Toutes pour le patient 5:', allForPatient ? '✅' : '❌');
    } catch (error) {
      if (error.response) {
        console.log('❌ Erreur:', error.response.status, error.response.data.message || error.response.data);
      } else {
        console.log('❌ Erreur réseau:', error.message);
      }
    }

    console.log('\n5️⃣ Test sans token (doit retourner 401):');
    try {
      const response = await axios.get(`${BASE_URL}${ENDPOINT}`);
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
testOrdonnancesRecentesV2();
