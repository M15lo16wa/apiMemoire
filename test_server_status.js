const axios = require('axios');

async function testServerStatus() {
  try {
    console.log('🔍 Test du statut du serveur...');
    
    // Test de base du serveur
    const baseResponse = await axios.get('http://localhost:3000/');
    console.log('✅ Serveur répond sur le port 3000');
    console.log('  - Status:', baseResponse.status);
    console.log('  - Contenu:', baseResponse.data.substring(0, 100) + '...');
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Serveur non accessible sur le port 3000');
      console.log('  - Assurez-vous que le serveur est démarré avec: npm start');
    } else if (error.response) {
      console.log('⚠️  Serveur répond mais avec une erreur:');
      console.log('  - Status:', error.response.status);
      console.log('  - Message:', error.response.statusText);
    } else {
      console.log('❌ Erreur inconnue:', error.message);
    }
  }
}

// Exécuter le test
testServerStatus().catch(console.error);
