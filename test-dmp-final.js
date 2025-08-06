const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testDMPEndpoint() {
  try {
    console.log('🧪 Test de l\'endpoint DMP après corrections...');
    
    // D'abord, testons si le serveur répond
    try {
      await axios.get(`${BASE_URL}/auth/login-patient`, {
        timeout: 3000
      });
      console.log('✅ Serveur accessible');
    } catch (error) {
      console.log('❌ Serveur non accessible:', error.message);
      return;
    }
    
    // Test de connexion patient
    const loginResponse = await axios.post(`${BASE_URL}/auth/login-patient`, {
      numero_assure: '123456789',
      mot_de_passe: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Connexion patient réussie');
    
    // Test de l'endpoint DMP
    const dmpResponse = await axios.get(`${BASE_URL}/patient/dmp`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Endpoint DMP fonctionne !');
    console.log('Status:', dmpResponse.status);
    console.log('Data:', JSON.stringify(dmpResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Attendre 5 secondes pour que le serveur démarre
setTimeout(() => {
  testDMPEndpoint();
}, 5000); 