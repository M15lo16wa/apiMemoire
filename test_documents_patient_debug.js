const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_TOKEN = 'VOTRE_TOKEN_ICI'; // Remplacez par un token valide

async function testDocumentsPatient() {
    try {
        console.log('🔍 Test de la route GET /api/documents/patient');
        console.log('📋 URL:', `${BASE_URL}/api/documents/patient`);
        console.log('🔑 Token utilisé:', TEST_TOKEN ? 'Token fourni' : 'Aucun token');
        
        const response = await axios.get(`${BASE_URL}/api/documents/patient`, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        console.log('✅ Succès!');
        console.log('📊 Status:', response.status);
        console.log('📋 Données:', response.data);
        
    } catch (error) {
        console.error('❌ Erreur lors du test:');
        
        if (error.response) {
            // Erreur de réponse du serveur
            console.error('📊 Status:', error.response.status);
            console.error('📋 Headers:', error.response.headers);
            console.error('📋 Données d\'erreur:', error.response.data);
            
            // Analyse de l'erreur
            if (error.response.status === 400) {
                console.error('\n🔍 ANALYSE ERREUR 400:');
                console.error('L\'erreur 400 indique une mauvaise requête.');
                console.error('Causes possibles:');
                console.error('1. Token manquant ou invalide');
                console.error('2. ID patient manquant dans le token');
                console.error('3. Problème avec le middleware checkMedicalRecordAccess');
                console.error('4. Données de requête invalides');
            }
            
        } else if (error.request) {
            // Erreur de requête (pas de réponse)
            console.error('📡 Pas de réponse du serveur');
            console.error('💡 Vérifiez que le serveur est démarré sur le port 3000');
        } else {
            // Erreur de configuration
            console.error('⚙️ Erreur de configuration:', error.message);
        }
    }
}

async function testWithDifferentTokens() {
    console.log('\n🔍 Test avec différents types de tokens...');
    
    // Test sans token
    try {
        console.log('\n📋 Test 1: Sans token');
        await axios.get(`${BASE_URL}/api/documents/patient`);
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('✅ Attendu: 401 Unauthorized (pas de token)');
        } else {
            console.error('❌ Erreur inattendue:', error.response?.status);
        }
    }
    
    // Test avec token invalide
    try {
        console.log('\n📋 Test 2: Token invalide');
        await axios.get(`${BASE_URL}/api/documents/patient`, {
            headers: { 'Authorization': 'Bearer invalid_token' }
        });
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('✅ Attendu: 401 Unauthorized (token invalide)');
        } else {
            console.error('❌ Erreur inattendue:', error.response?.status);
        }
    }
    
    // Test avec token valide (si disponible)
    if (TEST_TOKEN && TEST_TOKEN !== 'VOTRE_TOKEN_ICI') {
        try {
            console.log('\n📋 Test 3: Token valide');
            await testDocumentsPatient();
        } catch (error) {
            console.error('❌ Erreur avec token valide:', error.response?.status);
        }
    }
}

// Fonction principale
async function main() {
    console.log('🚀 Démarrage des tests de diagnostic pour GET /api/documents/patient');
    console.log('=' .repeat(60));
    
    // Test principal
    await testDocumentsPatient();
    
    // Tests avec différents tokens
    await testWithDifferentTokens();
    
    console.log('\n🔍 DIAGNOSTIC COMPLET TERMINÉ');
    console.log('\n💡 RECOMMANDATIONS:');
    console.log('1. Vérifiez que le serveur est démarré');
    console.log('2. Vérifiez que le token est valide et contient un ID patient');
    console.log('3. Vérifiez les logs du serveur pour plus de détails');
    console.log('4. Vérifiez que la base de données est accessible');
}

// Exécution
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { testDocumentsPatient, testWithDifferentTokens };
