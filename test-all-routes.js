require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testAllRoutes() {
  try {
    console.log('🧪 Test de toutes les routes demandées par le frontend...\n');

    // Test 1: Route de test système
    console.log('1️⃣ Test de la route système...');
    try {
      const systemResponse = await axios.get(`${API_BASE_URL}/medecin/dmp/test/systeme`);
      console.log('✅ Route système fonctionnelle');
      console.log('📊 Réponse:', JSON.stringify(systemResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Erreur route système:', error.message);
    }

    // Test 2: Authentification CPS
    console.log('\n2️⃣ Test d\'authentification CPS...');
    try {
      const authResponse = await axios.post(`${API_BASE_URL}/medecin/dmp/test/authentification-cps`, {
        code_cps: '1234',
        professionnel_id: 79
      });
      console.log('✅ Authentification CPS fonctionnelle');
      console.log('📊 Réponse:', JSON.stringify(authResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Erreur authentification CPS:', error.message);
    }

    // Test 3: Demande d'accès DMP
    console.log('\n3️⃣ Test de demande d\'accès DMP...');
    try {
      const accessResponse = await axios.post(`${API_BASE_URL}/medecin/dmp/test/demande-acces`, {
        session_id: 1,
        mode_acces: 'autorise_par_patient',
        duree_acces: 60,
        raison_acces: 'Suivi médical du patient pour consultation de routine'
      });
      console.log('✅ Demande d\'accès DMP fonctionnelle');
      console.log('📊 Réponse:', JSON.stringify(accessResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Erreur demande d\'accès:', error.message);
      if (error.response?.data) {
        console.log('📋 Détails:', JSON.stringify(error.response.data, null, 2));
      }
    }

    // Test 4: Historique d'accès
    console.log('\n4️⃣ Test d\'historique d\'accès...');
    try {
      const historyResponse = await axios.get(`${API_BASE_URL}/medecin/dmp/test/historique`);
      console.log('✅ Historique d\'accès fonctionnel');
      console.log('📊 Réponse:', JSON.stringify(historyResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Erreur historique:', error.message);
    }

    // Test 5: Historique avec patient spécifique
    console.log('\n5️⃣ Test d\'historique avec patient spécifique...');
    try {
      const historyPatientResponse = await axios.get(`${API_BASE_URL}/medecin/dmp/test/historique/5`);
      console.log('✅ Historique avec patient fonctionnel');
      console.log('📊 Réponse:', JSON.stringify(historyPatientResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Erreur historique patient:', error.message);
    }

    console.log('\n🎉 Tous les tests terminés !');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testAllRoutes(); 