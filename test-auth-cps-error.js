require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testAuthCPSError() {
  try {
    console.log('🧪 Test d\'authentification CPS avec erreur détaillée...\n');

    // Test d'authentification CPS
    console.log('📤 Envoi de la requête d\'authentification CPS...');
    console.log('📋 Données envoyées:', {
      numero_adeli: 'AH23456780',
      code_cps: '1234',
      patient_id: 5
    });

    const authResponse = await axios.post(`${API_BASE_URL}/medecin/dmp/authentification-cps`, {
      numero_adeli: 'AH23456780',
      code_cps: '1234',
      patient_id: 5
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Authentification CPS réussie');
    console.log('📊 Réponse:', JSON.stringify(authResponse.data, null, 2));

  } catch (error) {
    console.log('❌ Erreur lors de l\'authentification CPS:');
    console.log('📋 Message:', error.message);
    console.log('📋 Code de statut:', error.response?.status);
    console.log('📋 Détails de l\'erreur:', JSON.stringify(error.response?.data, null, 2));
    
    if (error.response?.data?.stack) {
      console.log('📋 Stack trace:', error.response.data.stack);
    }
  }
}

testAuthCPSError(); 