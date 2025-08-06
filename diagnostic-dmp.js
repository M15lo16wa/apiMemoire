const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function diagnosticDMP() {
  try {
    console.log('🔍 Diagnostic de l\'endpoint DMP...');
    
    // 1. Test de connexion patient
    console.log('\n1️⃣ Test de connexion patient...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login-patient`, {
      numero_assure: 'TEMP000005',
      mot_de_passe: 'passer123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Connexion réussie, token obtenu');
    
    // 2. Test de l'endpoint DMP avec gestion d'erreur détaillée
    console.log('\n2️⃣ Test de l\'endpoint DMP...');
    try {
      const dmpResponse = await axios.get(`${BASE_URL}/patient/dmp`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ Endpoint DMP fonctionne !');
      console.log('Status:', dmpResponse.status);
      console.log('Data:', JSON.stringify(dmpResponse.data, null, 2));
      
    } catch (error) {
      console.error('❌ Erreur endpoint DMP:');
      console.error('Message:', error.message);
      console.error('Status:', error.response?.status);
      console.error('Status Text:', error.response?.statusText);
      console.error('Headers:', error.response?.headers);
      console.error('Data:', error.response?.data);
      
      // 3. Test des autres endpoints pour voir s'ils fonctionnent
      console.log('\n3️⃣ Test des autres endpoints...');
      
      const endpoints = [
        '/patient/dmp/tableau-de-bord',
        '/patient/dmp/documents',
        '/patient/dmp/auto-mesures'
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(`${BASE_URL}${endpoint}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: 5000
          });
          console.log(`✅ ${endpoint}: ${response.status}`);
        } catch (endpointError) {
          console.log(`❌ ${endpoint}: ${endpointError.response?.status || 'Erreur'}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Attendre 3 secondes pour que le serveur démarre
setTimeout(() => {
  diagnosticDMP();
}, 3000); 