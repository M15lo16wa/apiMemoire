const axios = require('axios');

async function testPatientNotifications() {
  try {
    console.log('🧪 Test de connexion patient et récupération notifications...');
    
    // 1. Connexion du patient
    console.log('\n🔐 1. Connexion du patient...');
    const loginData = {
      numero_assure: 'TEMP000005',
      mot_de_passe: 'passer123'
    };
    
    const loginResponse = await axios.post('http://localhost:3000/api/patient/auth/login', loginData);
    
    console.log('✅ Connexion réussie:');
    console.log('Status:', loginResponse.status);
    console.log('Token:', loginResponse.data.token ? 'Présent' : 'Absent');
    
    const token = loginResponse.data.token;
    
    if (!token) {
      console.log('❌ Pas de token reçu');
      return;
    }
    
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    // 2. Test de la route notifications
    console.log('\n🔍 2. Test GET /api/patient/dmp/droits-acces/notifications');
    const notificationsResponse = await axios.get('http://localhost:3000/api/patient/dmp/droits-acces/notifications', config);
    
    console.log('✅ Notifications récupérées:');
    console.log('Status:', notificationsResponse.status);
    console.log('Nombre de notifications:', notificationsResponse.data.data.notifications.length);
    
    // Afficher les détails des notifications
    if (notificationsResponse.data.data.notifications.length > 0) {
      console.log('\n📋 Détails des notifications:');
      notificationsResponse.data.data.notifications.forEach((notification, index) => {
        console.log(`\n${index + 1}. Notification ID: ${notification.id_notification}`);
        console.log(`   - Type: ${notification.type_notification}`);
        console.log(`   - Statut: ${notification.statut_envoi}`);
        console.log(`   - Date création: ${notification.date_creation}`);
        console.log(`   - Professionnel: ${notification.professionnel?.nom} ${notification.professionnel?.prenom}`);
        console.log(`   - Raison: ${notification.metadata?.raison_acces || 'Non spécifiée'}`);
      });
    } else {
      console.log('❌ Aucune notification trouvée');
    }
    
    // 3. Test avec filtres
    console.log('\n🔍 3. Test avec filtres (demande_validation uniquement)...');
    const filteredResponse = await axios.get('http://localhost:3000/api/patient/dmp/droits-acces/notifications?type_notification=demande_validation&limit=5', config);
    
    console.log('✅ Notifications filtrées:');
    console.log('Status:', filteredResponse.status);
    console.log('Nombre de notifications filtrées:', filteredResponse.data.data.notifications.length);
    
    // 4. Test de la route droits d'accès
    console.log('\n🔍 4. Test GET /api/patient/dmp/droits-acces');
    const droitsResponse = await axios.get('http://localhost:3000/api/patient/dmp/droits-acces', config);
    
    console.log('✅ Droits d\'accès récupérés:');
    console.log('Status:', droitsResponse.status);
    console.log('Nombre d\'autorisations:', droitsResponse.data.data.length);
    
    console.log('\n✅ Test terminé avec succès !');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testPatientNotifications();
