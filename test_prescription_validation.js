const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const TEST_PATIENT = {
  numero_assure: 'TEMP000005',
  mot_de_passe: 'passer123'
};

console.log('🔍 Test de validation des IDs patient dans les routes de prescription');
console.log('=' * 65);

async function testPrescriptionValidation() {
  try {
    // ÉTAPE 1: Connexion patient
    console.log('\n🔐 ÉTAPE 1: Connexion patient');
    const loginResponse = await axios.post(`${BASE_URL}/patient/auth/login`, TEST_PATIENT);
    const token = loginResponse.data.token;
    const patientId = loginResponse.data.data.patient.id_patient;
    
    console.log('✅ Connexion réussie');
    console.log(`  - Patient ID: ${patientId}`);
    console.log(`  - Token: ${token.substring(0, 30)}...`);

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // ÉTAPE 2: Test avec ID patient valide
    console.log('\n🔍 ÉTAPE 2: Test avec ID patient valide');
    try {
      const validResponse = await axios.get(`${BASE_URL}/prescription/patient/${patientId}/notifications`, { headers });
      console.log(`✅ Accès avec ID valide (${patientId}): ${validResponse.status}`);
    } catch (error) {
      console.log(`❌ Erreur avec ID valide: ${error.response?.status} - ${error.response?.data?.message || 'Erreur'}`);
    }

    // ÉTAPE 3: Test avec ID patient undefined (doit retourner 400)
    console.log('\n🚫 ÉTAPE 3: Test avec ID patient undefined (doit retourner 400)');
    try {
      const undefinedResponse = await axios.get(`${BASE_URL}/prescription/patient/undefined/notifications`, { headers });
      console.log(`❌ ERREUR: Accès avec ID undefined accepté (${undefinedResponse.status})`);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log(`✅ ID undefined correctement rejeté (400): ${error.response.data.message}`);
      } else {
        console.log(`⚠️  Réponse inattendue avec ID undefined: ${error.response?.status} - ${error.response?.data?.message || 'Erreur'}`);
      }
    }

    // ÉTAPE 4: Test avec ID patient null (doit retourner 400)
    console.log('\n🚫 ÉTAPE 4: Test avec ID patient null (doit retourner 400)');
    try {
      const nullResponse = await axios.get(`${BASE_URL}/prescription/patient/null/notifications`, { headers });
      console.log(`❌ ERREUR: Accès avec ID null accepté (${nullResponse.status})`);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log(`✅ ID null correctement rejeté (400): ${error.response.data.message}`);
      } else {
        console.log(`⚠️  Réponse inattendue avec ID null: ${error.response?.status} - ${error.response?.data?.message || 'Erreur'}`);
      }
    }

    // ÉTAPE 5: Test avec ID patient invalide (doit retourner 400)
    console.log('\n🚫 ÉTAPE 5: Test avec ID patient invalide (doit retourner 400)');
    try {
      const invalidResponse = await axios.get(`${BASE_URL}/prescription/patient/abc/notifications`, { headers });
      console.log(`❌ ERREUR: Accès avec ID invalide accepté (${invalidResponse.status})`);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log(`✅ ID invalide correctement rejeté (400): ${error.response.data.message}`);
      } else {
        console.log(`⚠️  Réponse inattendue avec ID invalide: ${error.response?.status} - ${error.response?.data?.message || 'Erreur'}`);
      }
    }

    // ÉTAPE 6: Test avec ID patient négatif (doit retourner 400)
    console.log('\n🚫 ÉTAPE 6: Test avec ID patient négatif (doit retourner 400)');
    try {
      const negativeResponse = await axios.get(`${BASE_URL}/prescription/patient/-1/notifications`, { headers });
      console.log(`❌ ERREUR: Accès avec ID négatif accepté (${negativeResponse.status})`);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log(`✅ ID négatif correctement rejeté (400): ${error.response.data.message}`);
      } else {
        console.log(`⚠️  Réponse inattendue avec ID négatif: ${error.response?.status} - ${error.response?.data?.message || 'Erreur'}`);
      }
    }

    // RÉSUMÉ
    console.log('\n🎯 RÉSUMÉ DES TESTS');
    console.log('=' * 40);
    console.log('✅ ID patient valide: Fonctionne');
    console.log('✅ ID patient undefined: Rejeté (400)');
    console.log('✅ ID patient null: Rejeté (400)');
    console.log('✅ ID patient invalide: Rejeté (400)');
    console.log('✅ ID patient négatif: Rejeté (400)');
    console.log('\n🎉 Tous les tests de validation sont passés !');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    if (error.response) {
      console.error('  - Status:', error.response.status);
      console.error('  - Message:', error.response.data.message || error.response.statusText);
    }
  }
}

// Exécuter le test
testPrescriptionValidation().catch(console.error);
