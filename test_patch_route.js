const axios = require('axios');

async function testPatchRoute() {
  try {
    console.log('🧪 Test de la route PATCH /api/access/authorization/7...');
    
    // Test de la méthode PATCH (qui devrait fonctionner)
    const response = await axios.patch('http://localhost:3000/api/access/authorization/7', {
      statut: 'actif',
      raison_demande: 'Test PATCH route'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log('✅ PATCH fonctionne ! Status:', response.status);
    console.log('Réponse:', response.data);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Erreur HTTP:', error.response.status);
      console.log('URL testée:', error.config.url);
      console.log('Méthode utilisée:', error.config.method);
      console.log('Réponse:', error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ Serveur non accessible. Assurez-vous qu\'il tourne sur le port 3000');
    } else {
      console.log('❌ Erreur:', error.message);
    }
  }
}

// Exécuter le test
testPatchRoute();
