const axios = require('axios');

async function testPatientLogin() {
  try {
    console.log('🧪 Test de connexion patient...');
    
    const loginData = {
      numero_assure: 'TEMP000005',
      mot_de_passe: 'passer123'
    };
    
    console.log('📋 Données de connexion:', loginData);
    
    const response = await axios.post('http://localhost:3000/api/patient/auth/login', loginData);
    
    console.log('✅ Connexion réussie:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testPatientLogin();
