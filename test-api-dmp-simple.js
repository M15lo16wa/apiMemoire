const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:3000/api/medecin/dmp';

async function testApiDMP() {
    console.log('=== Test API DMP ===\n');
    
    try {
        // Test 1: Vérifier que l'API répond
        console.log('1. Test de connexion à l\'API...');
        const response = await axios.get(`${API_BASE_URL}/test/systeme`);
        console.log('✅ API accessible');
        console.log('📊 Données reçues:', JSON.stringify(response.data, null, 2));
        
        // Test 2: Test d'authentification CPS
        console.log('\n2. Test d\'authentification CPS...');
        const cpsResponse = await axios.post(`${API_BASE_URL}/test/authentification-cps`, {
            code_cps: '1234',
            professionnel_id: 79
        });
        console.log('✅ Authentification CPS testée');
        console.log('📊 Résultat:', JSON.stringify(cpsResponse.data, null, 2));
        
        // Test 3: Test de création de session
        console.log('\n3. Test de création de session...');
        const sessionResponse = await axios.post(`${API_BASE_URL}/test/creation-session`, {
            professionnel_id: 79,
            patient_id: 5,
            mode_acces: 'autorise_par_patient',
            raison_acces: 'Test complet système DMP'
        });
        console.log('✅ Session créée');
        console.log('📊 Session:', JSON.stringify(sessionResponse.data, null, 2));
        
        // Test 4: Test de notification
        console.log('\n4. Test de notification...');
        const notificationResponse = await axios.post(`${API_BASE_URL}/test/notification`, {
            patient_id: 5,
            professionnel_id: 79,
            session_id: sessionResponse.data.data.session_id,
            type_notification: 'demande_validation'
        });
        console.log('✅ Notification envoyée');
        console.log('📊 Notification:', JSON.stringify(notificationResponse.data, null, 2));
        
        console.log('\n🎉 Tous les tests sont passés avec succès !');
        console.log('✅ Le système DMP est opérationnel');
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error.message);
        if (error.response) {
            console.error('📊 Détails de l\'erreur:', error.response.data);
        }
    }
}

// Vérifier si l'API est accessible avant de lancer les tests
async function checkApiAvailability() {
    try {
        await axios.get(`${API_BASE_URL}/test/systeme`, { timeout: 5000 });
        return true;
    } catch (error) {
        console.log('⚠️  L\'API n\'est pas accessible. Assurez-vous qu\'elle est démarrée sur le port 3000');
        console.log('💡 Démarrez l\'API avec: node src/server.js');
        return false;
    }
}

async function main() {
    console.log('🔍 Vérification de l\'accessibilité de l\'API...');
    const apiAvailable = await checkApiAvailability();
    
    if (apiAvailable) {
        await testApiDMP();
    } else {
        console.log('\n📝 Instructions :');
        console.log('1. Assurez-vous que le fichier .env est configuré');
        console.log('2. Démarrez l\'API: node src/server.js');
        console.log('3. Relancez ce test: node test-api-dmp-simple.js');
    }
}

main(); 