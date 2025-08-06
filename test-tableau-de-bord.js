require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// Token JWT patient
const PATIENT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXRpZW50X2lkIjo1LCJ1dGlsaXNhdGV1cl9pZCI6bnVsbCwicm9sZSI6InBhdGllbnQiLCJpYXQiOjE3NTQ0OTMzMjgsImV4cCI6MTc1NzA4NTMyOH0.IZNHLvGVNzOtnTGzqjaQlI9o46X6UwygzIYLpl5t9n0';

async function testTableauDeBord() {
  try {
    console.log('🧪 Test du tableau de bord avec token patient...\n');

    // Test de la route tableau de bord
    console.log('1️⃣ Test de /api/patient/dmp/tableau-de-bord...');
    try {
      const response = await axios.get(`${API_BASE_URL}/patient/dmp/tableau-de-bord`, {
        headers: {
          'Authorization': `Bearer ${PATIENT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Tableau de bord fonctionnel');
      console.log('📊 Réponse:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ Erreur tableau de bord:', error.message);
      if (error.response?.data) {
        console.log('📋 Détails de l\'erreur:', JSON.stringify(error.response.data, null, 2));
      }
    }

    console.log('\n🎉 Test terminé !');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testTableauDeBord(); 