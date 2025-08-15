const axios = require('axios');

async function testPatientAuth() {
  try {
    console.log('🧪 Test de l\'authentification patient...');
    
    // Test sans token (devrait retourner 401)
    console.log('\n1️⃣ Test sans token:');
    try {
      await axios.delete('http://localhost:3000/api/access/patient/authorization/7');
    } catch (error) {
      if (error.response) {
        console.log('✅ Sans token:', error.response.status, error.response.statusText);
      }
    }
    
    // Test avec token invalide (devrait retourner 401)
    console.log('\n2️⃣ Test avec token invalide:');
    try {
      await axios.delete('http://localhost:3000/api/access/patient/authorization/7', {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
    } catch (error) {
      if (error.response) {
        console.log('✅ Token invalide:', error.response.status, error.response.statusText);
      }
    }
    
    // Test avec token patient valide (devrait fonctionner ou donner une erreur différente)
    console.log('\n3️⃣ Test avec token patient valide:');
    try {
      // Remplacez par un vrai token patient si vous en avez un
      const patientToken = 'your-patient-token-here';
      await axios.delete('http://localhost:3000/api/access/patient/authorization/7', {
        headers: {
          'Authorization': `Bearer ${patientToken}`
        }
      });
      console.log('✅ Avec token patient valide: Succès');
    } catch (error) {
      if (error.response) {
        console.log('❌ Avec token patient:', error.response.status, error.response.statusText);
        console.log('Réponse:', error.response.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Exécuter le test
testPatientAuth();
