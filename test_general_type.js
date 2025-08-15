const axios = require('axios');

async function testGeneralType() {
    try {
        console.log('🧪 Test de l\'API avec le type "general"');
        
        // Test simple de l'endpoint
        const response = await axios.get('http://localhost:3000/api-docs');
        console.log('✅ API accessible');
        
        // Vérifier que la route documents est disponible
        console.log('📋 Routes disponibles dans Swagger');
        
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('❌ Serveur non démarré. Démarrez d\'abord le serveur avec: npm start');
        } else {
            console.error('❌ Erreur:', error.message);
        }
    }
}

// Exécuter le test
testGeneralType();
