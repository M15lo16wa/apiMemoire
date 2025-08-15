const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';

// Token de test patient (à remplacer par un token valide)
const TEST_PATIENT_TOKEN = 'VOTRE_TOKEN_PATIENT_ICI';

// Token de test professionnel (à remplacer par un token valide)
const TEST_PROFESSIONAL_TOKEN = 'VOTRE_TOKEN_PROFESSIONNEL_ICI';

async function testDocumentsPatientWithPatientToken() {
    console.log('\n🔍 Test 1: GET /api/documents/patient avec token patient');
    
    if (!TEST_PATIENT_TOKEN || TEST_PATIENT_TOKEN === 'VOTRE_TOKEN_PATIENT_ICI') {
        console.log('⚠️ Token patient non configuré, test ignoré');
        return;
    }
    
    try {
        const response = await axios.get(`${BASE_URL}/api/documents/patient`, {
            headers: {
                'Authorization': `Bearer ${TEST_PATIENT_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Succès avec token patient!');
        console.log('📊 Status:', response.status);
        console.log('📋 Données reçues:', response.data);
        
    } catch (error) {
        console.error('❌ Erreur avec token patient:');
        if (error.response) {
            console.error('📊 Status:', error.response.status);
            console.error('📋 Erreur:', error.response.data);
        }
    }
}

async function testDocumentsPatientWithProfessionalToken() {
    console.log('\n🔍 Test 2: GET /api/documents/patient avec token professionnel');
    
    if (!TEST_PROFESSIONAL_TOKEN || TEST_PROFESSIONAL_TOKEN === 'VOTRE_TOKEN_PROFESSIONNEL_ICI') {
        console.log('⚠️ Token professionnel non configuré, test ignoré');
        return;
    }
    
    try {
        const response = await axios.get(`${BASE_URL}/api/documents/patient`, {
            headers: {
                'Authorization': `Bearer ${TEST_PROFESSIONAL_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Succès avec token professionnel!');
        console.log('📊 Status:', response.status);
        console.log('📋 Données reçues:', response.data);
        
    } catch (error) {
        console.error('❌ Erreur avec token professionnel:');
        if (error.response) {
            console.error('📊 Status:', error.response.status);
            console.error('📋 Erreur:', error.response.data);
        }
    }
}

async function testDocumentsPatientWithoutToken() {
    console.log('\n🔍 Test 3: GET /api/documents/patient sans token');
    
    try {
        const response = await axios.get(`${BASE_URL}/api/documents/patient`);
        console.log('❌ Test échoué: la route devrait être protégée');
        
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('✅ Attendu: 401 Unauthorized (route protégée)');
        } else {
            console.error('❌ Erreur inattendue:', error.response?.status);
        }
    }
}

async function testDocumentsPatientWithInvalidToken() {
    console.log('\n🔍 Test 4: GET /api/documents/patient avec token invalide');
    
    try {
        const response = await axios.get(`${BASE_URL}/api/documents/patient`, {
            headers: {
                'Authorization': 'Bearer invalid_token_123',
                'Content-Type': 'application/json'
            }
        });
        console.log('❌ Test échoué: la route devrait rejeter un token invalide');
        
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('✅ Attendu: 401 Unauthorized (token invalide)');
        } else {
            console.error('❌ Erreur inattendue:', error.response?.status);
        }
    }
}

async function testDocumentsPatientWithQueryParams() {
    console.log('\n🔍 Test 5: GET /api/documents/patient avec paramètres de requête');
    
    if (!TEST_PATIENT_TOKEN || TEST_PATIENT_TOKEN === 'VOTRE_TOKEN_PATIENT_ICI') {
        console.log('⚠️ Token patient non configuré, test ignoré');
        return;
    }
    
    try {
        const response = await axios.get(`${BASE_URL}/api/documents/patient?type=ordonnance`, {
            headers: {
                'Authorization': `Bearer ${TEST_PATIENT_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Succès avec paramètres de requête!');
        console.log('📊 Status:', response.status);
        console.log('📋 Données reçues:', response.data);
        
    } catch (error) {
        console.error('❌ Erreur avec paramètres de requête:');
        if (error.response) {
            console.error('📊 Status:', error.response.status);
            console.error('📋 Erreur:', error.response.data);
        }
    }
}

// Fonction principale
async function main() {
    console.log('🚀 Test de la correction de l\'erreur 400 sur GET /api/documents/patient');
    console.log('=' .repeat(70));
    
    // Tests
    await testDocumentsPatientWithoutToken();
    await testDocumentsPatientWithInvalidToken();
    await testDocumentsPatientWithPatientToken();
    await testDocumentsPatientWithProfessionalToken();
    await testDocumentsPatientWithQueryParams();
    
    console.log('\n🔍 RÉSUMÉ DES TESTS');
    console.log('=' .repeat(40));
    console.log('✅ Tests terminés');
    console.log('\n💡 INTERPRÉTATION:');
    console.log('- Test 1: Doit réussir si le token patient est valide');
    console.log('- Test 2: Doit réussir si le token professionnel est valide');
    console.log('- Test 3: Doit échouer avec 401 (pas de token)');
    console.log('- Test 4: Doit échouer avec 401 (token invalide)');
    console.log('- Test 5: Doit réussir avec des paramètres de requête');
    
    console.log('\n🚨 SI L\'ERREUR 400 PERSISTE:');
    console.log('1. Vérifiez que le serveur a été redémarré après la correction');
    console.log('2. Vérifiez les logs du serveur pour plus de détails');
    console.log('3. Vérifiez que la base de données est accessible');
    console.log('4. Vérifiez que les tokens contiennent les bonnes informations');
}

// Exécution
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    testDocumentsPatientWithPatientToken,
    testDocumentsPatientWithProfessionalToken,
    testDocumentsPatientWithoutToken,
    testDocumentsPatientWithInvalidToken,
    testDocumentsPatientWithQueryParams
};
