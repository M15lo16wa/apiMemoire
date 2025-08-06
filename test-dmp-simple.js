const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwicm9sZSI6InBhdGllbnQiLCJpYXQiOjE3NTQ0OTI0NzYsImV4cCI6MTc2MjI2ODQ3Nn0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

async function testDMPEndpoint() {
  try {
    console.log('🧪 Test de l\'endpoint DMP...');
    
    const response = await axios.get(`${BASE_URL}/patient/dmp`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    console.log('✅ Endpoint DMP fonctionne !');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Attendre 3 secondes pour que le serveur démarre
setTimeout(() => {
  testDMPEndpoint();
}, 3000); 