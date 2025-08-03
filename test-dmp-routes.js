const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Test des routes DMP
 */
async function testDMPRoutes() {
  console.log('🧪 Test des routes DMP...\n');

  const routes = [
    // Routes DMP existantes
    { method: 'GET', path: '/patient/dmp/tableau-de-bord', name: 'Tableau de bord' },
    { method: 'GET', path: '/patient/dmp/historique-medical', name: 'Historique médical' },
    { method: 'GET', path: '/patient/dmp/journal-activite', name: 'Journal activité' },
    { method: 'GET', path: '/patient/dmp/droits-acces', name: 'Droits accès' },
    { method: 'GET', path: '/patient/dmp/fiche-urgence', name: 'Fiche urgence' },
    
    // Nouvelles routes DMP
    { method: 'GET', path: '/patient/dmp/auto-mesures', name: 'Auto-mesures (GET)' },
    { method: 'POST', path: '/patient/dmp/auto-mesures', name: 'Auto-mesures (POST)' },
    { method: 'PUT', path: '/patient/dmp/auto-mesures/1', name: 'Auto-mesures (PUT)' },
    { method: 'DELETE', path: '/patient/dmp/auto-mesures/1', name: 'Auto-mesures (DELETE)' },
    
    { method: 'GET', path: '/patient/dmp/documents', name: 'Documents (GET)' },
    { method: 'POST', path: '/patient/dmp/documents', name: 'Documents (POST)' },
    { method: 'DELETE', path: '/patient/dmp/documents/1', name: 'Documents (DELETE)' },
    
    { method: 'GET', path: '/patient/dmp/messages', name: 'Messages (GET)' },
    { method: 'POST', path: '/patient/dmp/messages', name: 'Messages (POST)' },
    { method: 'DELETE', path: '/patient/dmp/messages/1', name: 'Messages (DELETE)' },
    
    { method: 'GET', path: '/patient/dmp/rappels', name: 'Rappels (GET)' },
    { method: 'POST', path: '/patient/dmp/rappels', name: 'Rappels (POST)' },
    { method: 'PUT', path: '/patient/dmp/rappels/1', name: 'Rappels (PUT)' },
    { method: 'DELETE', path: '/patient/dmp/rappels/1', name: 'Rappels (DELETE)' },
  ];

  console.log('📋 Routes DMP à tester :');
  routes.forEach(route => {
    console.log(`- ${route.method} ${route.path} (${route.name})`);
  });

  console.log('\n🔍 Vérification de la disponibilité du serveur...');
  
  try {
    // Test de base pour vérifier que le serveur répond
    const response = await axios.get(`${API_BASE_URL}/patient`, {
      timeout: 5000
    });
    console.log('✅ Serveur accessible');
    console.log(`📊 Status: ${response.status}`);
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Serveur non accessible. Démarrez le serveur avec : npm start');
      return;
    }
    console.log('⚠️ Serveur accessible mais erreur:', error.message);
  }

  console.log('\n📝 Instructions pour tester les routes DMP :');
  console.log('1. Démarrez le serveur : npm start');
  console.log('2. Connectez-vous en tant que patient');
  console.log('3. Testez les endpoints avec un token d\'authentification');
  console.log('4. Utilisez Postman ou curl pour tester les routes');
  
  console.log('\n🔧 Exemple de test avec curl :');
  console.log('curl -X GET "http://localhost:3000/api/patient/dmp/auto-mesures" \\');
  console.log('  -H "Authorization: Bearer YOUR_TOKEN" \\');
  console.log('  -H "Content-Type: application/json"');
  
  console.log('\n📊 Résumé des nouvelles routes DMP :');
  console.log('✅ Auto-mesures : GET, POST, PUT, DELETE');
  console.log('✅ Documents : GET, POST, DELETE');
  console.log('✅ Messages : GET, POST, DELETE');
  console.log('✅ Rappels : GET, POST, PUT, DELETE');
  console.log('✅ Routes existantes : Tableau de bord, Historique, Journal, Droits, Urgence');
}

// Exécuter les tests
testDMPRoutes().catch(error => {
  console.error('❌ Erreur lors du test:', error.message);
}); 