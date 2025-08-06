const axios = require('axios');

async function testNotificationsStructure() {
  try {
    console.log('🧪 Test de la structure des notifications...');
    
    // Connexion du patient
    const loginData = {
      numero_assure: 'TEMP000005',
      mot_de_passe: 'passer123'
    };
    
    const loginResponse = await axios.post('http://localhost:3000/api/patient/auth/login', loginData);
    const token = loginResponse.data.token;
    
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    // Test de la route notifications
    console.log('\n🔍 Test GET /api/patient/dmp/droits-acces/notifications');
    const response = await axios.get('http://localhost:3000/api/patient/dmp/droits-acces/notifications', config);
    
    console.log('✅ Réponse reçue:');
    console.log('Status:', response.status);
    console.log('Type de data:', typeof response.data);
    console.log('Type de data.data:', typeof response.data.data);
    console.log('Type de data.data.notifications:', typeof response.data.data.notifications);
    
    if (response.data.data.notifications) {
      console.log('Est un tableau?', Array.isArray(response.data.data.notifications));
      console.log('Longueur:', response.data.data.notifications.length);
      
      if (response.data.data.notifications.length > 0) {
        console.log('\n📋 Premier élément:');
        console.log(JSON.stringify(response.data.data.notifications[0], null, 2));
      }
    } else {
      console.log('\n❌ Structure inattendue:');
      console.log(JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testNotificationsStructure();
