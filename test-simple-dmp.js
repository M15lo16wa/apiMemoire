const axios = require('axios');

async function testSimpleDMP() {
  try {
    console.log('🧪 Test simple de l\'endpoint DMP...');
    
    // Test de connexion
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login-patient', {
      numero_assure: 'TEMP000005',
      mot_de_passe: 'passer123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Connexion réussie');
    
    // Test de l'endpoint DMP
    const dmpResponse = await axios.get('http://localhost:3000/api/patient/dmp', {
      headers: {
        'Authorization': `Bearer ${token}`
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

// Attendre 5 secondes
setTimeout(testSimpleDMP, 5000); 