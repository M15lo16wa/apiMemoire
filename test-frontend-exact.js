require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// Token JWT utilisé par le frontend
const FRONTEND_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9mZXNzaW9ubmVsX2lkIjo3OSwidXRpbGlzYXRldXJfaWQiOm51bGwsInJvbGUiOiJtZWRlY2luIiwiaWF0IjoxNzU0NDE1MDM0LCJleHAiOjE3NjIxOTEwMzR9.JiQwkWYIJdMSR6pNwDMR6mve2_F9C9jn8uR5WbUK5Fg';

async function testFrontendExact() {
  try {
    console.log('🧪 Test avec les données exactes du frontend...\n');

    // Données exactes envoyées par le frontend
    const requestData = {
      professionnel_id: 79,
      patient_id: '5',  // String comme dans le frontend
      mode_acces: 'autorise_par_patient',
      duree_acces: 60,
      raison_acces: 'verification de antécédent medical'
    };

    console.log('📋 Données envoyées:', requestData);
    console.log('📋 Token utilisé:', FRONTEND_TOKEN);

    // Test de la route principale avec authentification
    console.log('\n1️⃣ Test de la route principale /api/medecin/dmp/demande-acces...');
    try {
      const response = await axios.post(`${API_BASE_URL}/medecin/dmp/demande-acces`, requestData, {
        headers: {
          'Authorization': `Bearer ${FRONTEND_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Route principale fonctionnelle');
      console.log('📊 Réponse:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ Erreur route principale:', error.message);
      if (error.response?.data) {
        console.log('📋 Détails de l\'erreur:', JSON.stringify(error.response.data, null, 2));
      }
    }

    console.log('\n🎉 Test terminé !');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testFrontendExact(); 