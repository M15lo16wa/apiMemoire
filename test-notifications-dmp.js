const axios = require('axios');

async function testNotificationsDMP() {
  try {
    console.log('🧪 Test de la route notifications DMP...');
    
    // Token JWT pour le patient (à adapter selon votre token)
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwicm9sZSI6InBhdGllbnQiLCJpYXQiOjE3NTQ1MDE3MDUsImV4cCI6MTc2MjI3NzcwNX0.B8qs_57y-FSihxqWhrgZTUo_I3KgLtHrVJbZVz4rc1Y';
    
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
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    // Test avec des filtres
    console.log('\n🔍 Test avec filtres...');
    const responseWithFilters = await axios.get('http://localhost:3000/api/patient/dmp/droits-acces/notifications?limit=5&type_notification=demande_validation', config);
    
    console.log('✅ Réponse avec filtres:');
    console.log('Status:', responseWithFilters.status);
    console.log('Data:', JSON.stringify(responseWithFilters.data, null, 2));
    
    console.log('\n✅ Test terminé avec succès !');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testNotificationsDMP();
