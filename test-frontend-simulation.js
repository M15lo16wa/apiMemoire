const axios = require('axios');

async function testFrontendSimulation() {
  try {
    console.log('🧪 Simulation du comportement frontend...');
    
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
    
    // Simulation de l'appel API comme le frontend
    console.log('\n🔍 Simulation appel API...');
    const response = await axios.get('http://localhost:3000/api/patient/dmp/droits-acces/notifications', config);
    
    console.log('✅ Réponse API reçue');
    
    // Simulation de l'extraction des données comme le frontend pourrait le faire
    console.log('\n🔍 Test d\'extraction des données...');
    
    // Test 1: Extraction directe (probablement ce que fait le frontend)
    const notificationsDirect = response.data.notifications;
    console.log('1. response.data.notifications:', typeof notificationsDirect);
    console.log('   Est un tableau?', Array.isArray(notificationsDirect));
    if (notificationsDirect && typeof notificationsDirect.filter === 'function') {
      console.log('   ✅ .filter() fonctionne');
    } else {
      console.log('   ❌ .filter() ne fonctionne pas');
    }
    
    // Test 2: Extraction correcte
    const notificationsCorrect = response.data.data.notifications;
    console.log('2. response.data.data.notifications:', typeof notificationsCorrect);
    console.log('   Est un tableau?', Array.isArray(notificationsCorrect));
    if (notificationsCorrect && typeof notificationsCorrect.filter === 'function') {
      console.log('   ✅ .filter() fonctionne');
      console.log('   Nombre d\'éléments:', notificationsCorrect.length);
    } else {
      console.log('   ❌ .filter() ne fonctionne pas');
    }
    
    // Test 3: Simulation de l'erreur frontend
    console.log('\n🔍 Simulation de l\'erreur frontend...');
    try {
      if (notificationsDirect && typeof notificationsDirect.filter === 'function') {
        const filtered = notificationsDirect.filter(n => n.type_notification === 'demande_validation');
        console.log('   ✅ Filtrage réussi avec extraction directe');
      } else {
        console.log('   ❌ Erreur: notificationsDirect.filter is not a function');
      }
    } catch (error) {
      console.log('   ❌ Erreur capturée:', error.message);
    }
    
    // Test 4: Solution correcte
    console.log('\n🔍 Test de la solution correcte...');
    try {
      if (notificationsCorrect && typeof notificationsCorrect.filter === 'function') {
        const filtered = notificationsCorrect.filter(n => n.type_notification === 'demande_validation');
        console.log('   ✅ Filtrage réussi avec extraction correcte');
        console.log('   Nombre d\'éléments filtrés:', filtered.length);
      } else {
        console.log('   ❌ Erreur: notificationsCorrect.filter is not a function');
      }
    } catch (error) {
      console.log('   ❌ Erreur capturée:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testFrontendSimulation();
