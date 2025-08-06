require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testAPICPSFixed() {
  try {
    console.log('🧪 Test de l\'API CPS corrigée...\n');

    // Test 1: Route de test d'authentification CPS avec code "1234"
    console.log('1️⃣ Test d\'authentification CPS avec code "1234"...');
    try {
      const authResponse = await axios.post(`${API_BASE_URL}/medecin/dmp/test/authentification-cps`, {
        code_cps: '1234',
        professionnel_id: 79
      });
      console.log('✅ Authentification CPS réussie');
      console.log('📊 Réponse:', JSON.stringify(authResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Erreur authentification CPS:', error.message);
      if (error.response?.data) {
        console.log('📋 Détails:', JSON.stringify(error.response.data, null, 2));
      }
    }

    // Test 2: Route principale d'authentification CPS (avec token JWT)
    console.log('\n2️⃣ Test de la route principale d\'authentification CPS...');
    try {
      const authMainResponse = await axios.post(`${API_BASE_URL}/medecin/dmp/authentification-cps`, {
        code_cps: '1234',
        patient_id: 5
      }, {
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9mZXNzaW9ubmVsX2lkIjo3OSwibnVtZXJvX2FkZWxpIjoiQUgyMzQ1Njc4MCIsIm5vbSI6IlNha3VyYSIsInByZW5vbSI6IlNhemEiLCJyb2xlIjoibWVkZWNpbiIsImlhdCI6MTc1NDQ3OTczOCwiZXhwIjoxNzU0NTY2MTM4fQ.Y1Gwy-NNJK7eZMdWTxt77MKzyjdQx6mp_ZCpRY2IX5s'
        }
      });
      console.log('✅ Authentification CPS principale réussie');
      console.log('📊 Réponse:', JSON.stringify(authMainResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Erreur authentification CPS principale:', error.message);
      if (error.response?.data) {
        console.log('📋 Détails:', JSON.stringify(error.response.data, null, 2));
      }
    }

    console.log('\n🎉 Tests terminés !');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testAPICPSFixed(); 