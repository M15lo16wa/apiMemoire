const axios = require('axios');

async function testNewStructure() {
  try {
    console.log('🧪 Test de la nouvelle structure de réponse...');
    
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
    
    // Test de la route notifications avec nouvelle structure
    console.log('\n🔍 Test GET /api/patient/dmp/droits-acces/notifications');
    const response = await axios.get('http://localhost:3000/api/patient/dmp/droits-acces/notifications', config);
    
    console.log('✅ Réponse reçue:');
    console.log('Status:', response.status);
    console.log('Type de data:', typeof response.data);
    console.log('Type de data.notifications:', typeof response.data.notifications);
    
    if (response.data.notifications) {
      console.log('Est un tableau?', Array.isArray(response.data.notifications));
      console.log('Longueur:', response.data.notifications.length);
      
      // Test du filtrage comme le frontend
      console.log('\n🔍 Test du filtrage frontend...');
      try {
        const filtered = response.data.notifications.filter(n => n.type_notification === 'demande_validation');
        console.log('✅ Filtrage réussi!');
        console.log('Nombre d\'éléments filtrés:', filtered.length);
        
        if (filtered.length > 0) {
          console.log('\n📋 Premier élément filtré:');
          console.log('ID:', filtered[0].id_notification);
          console.log('Type:', filtered[0].type_notification);
          console.log('Professionnel:', filtered[0].professionnel?.nom, filtered[0].professionnel?.prenom);
        }
      } catch (error) {
        console.log('❌ Erreur de filtrage:', error.message);
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

testNewStructure();
