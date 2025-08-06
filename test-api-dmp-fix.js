require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testDMPSystem() {
  try {
    console.log('🧪 Test du système DMP...\n');

    // Test 1: Vérifier l'accessibilité de l'API
    console.log('1️⃣ Vérification de l\'accessibilité de l\'API...');
    try {
      const response = await axios.get(`${API_BASE_URL}/medecin/dmp/test/systeme`, {
        timeout: 5000
      });
      console.log('✅ API accessible');
      console.log('📊 Réponse:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ API non accessible:', error.message);
      if (error.response) {
        console.log('📋 Détails:', error.response.data);
      }
      return;
    }

    // Test 2: Authentification CPS
    console.log('\n2️⃣ Test d\'authentification CPS...');
    try {
      const authResponse = await axios.post(`${API_BASE_URL}/medecin/dmp/authentification-cps`, {
        numero_adeli: 'AH23456780',
        code_cps: '1234',
        patient_id: 5
      });
      console.log('✅ Authentification CPS réussie');
      console.log('📊 Réponse:', JSON.stringify(authResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Échec authentification CPS:', error.message);
      if (error.response) {
        console.log('📋 Détails:', error.response.data);
      }
    }

    // Test 3: Création de session
    console.log('\n3️⃣ Test de création de session...');
    try {
      const sessionResponse = await axios.post(`${API_BASE_URL}/medecin/dmp/creer-session`, {
        professionnel_id: 79,
        patient_id: 5,
        mode_acces: 'autorise_par_patient',
        duree_acces: 60,
        raison_acces: 'Test système DMP'
      });
      console.log('✅ Session créée avec succès');
      console.log('📊 Réponse:', JSON.stringify(sessionResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Échec création session:', error.message);
      if (error.response) {
        console.log('📋 Détails:', error.response.data);
      }
    }

    console.log('\n🎉 Tests terminés !');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Vérifier si l'API est démarrée
async function checkAPIAvailability() {
  try {
    await axios.get(`${API_BASE_URL}/medecin/dmp/test/systeme`, { timeout: 3000 });
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('🔍 Vérification de l\'accessibilité de l\'API...');
  
  const isAvailable = await checkAPIAvailability();
  if (!isAvailable) {
    console.log('⚠️ L\'API n\'est pas accessible. Assurez-vous qu\'elle est démarrée sur le port 3000');
    console.log('💡 Démarrez l\'API avec: node src/server.js');
    return;
  }

  await testDMPSystem();
}

main(); 