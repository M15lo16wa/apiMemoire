require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testSimpleAuth() {
  try {
    console.log('🧪 Test simple d\'authentification...\n');

    // Test 1: Route de test sans authentification
    console.log('1️⃣ Test de la route de test sans authentification...');
    try {
      const testResponse = await axios.get(`${API_BASE_URL}/medecin/dmp/test/systeme`);
      console.log('✅ Route de test accessible');
      console.log('📊 Réponse:', JSON.stringify(testResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Erreur route de test:', error.message);
    }

    // Test 2: Route de test d'authentification CPS
    console.log('\n2️⃣ Test de la route de test d\'authentification CPS...');
    try {
      const authTestResponse = await axios.post(`${API_BASE_URL}/medecin/dmp/test/authentification-cps`, {
        numero_adeli: 'AH23456780',
        code_cps: '1234',
        patient_id: 5
      });
      console.log('✅ Test d\'authentification CPS réussi');
      console.log('📊 Réponse:', JSON.stringify(authTestResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Erreur test authentification CPS:', error.message);
      if (error.response?.data) {
        console.log('📋 Détails:', JSON.stringify(error.response.data, null, 2));
      }
    }

    // Test 3: Route de test de création de session
    console.log('\n3️⃣ Test de la route de test de création de session...');
    try {
      const sessionTestResponse = await axios.post(`${API_BASE_URL}/medecin/dmp/test/creation-session`, {
        professionnel_id: 79,
        patient_id: 5,
        mode_acces: 'autorise_par_patient',
        duree_acces: 60,
        raison_acces: 'Test système DMP'
      });
      console.log('✅ Test de création de session réussi');
      console.log('📊 Réponse:', JSON.stringify(sessionTestResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Erreur test création session:', error.message);
      if (error.response?.data) {
        console.log('📋 Détails:', JSON.stringify(error.response.data, null, 2));
      }
    }

    console.log('\n🎉 Tests terminés !');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testSimpleAuth(); 