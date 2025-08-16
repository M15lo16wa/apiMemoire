/**
 * Test de validation des paramètres pour les routes dossierMedical
 * Vérifie que les erreurs avec des valeurs null sont correctement gérées
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';
const TEST_TOKEN = 'your_test_token_here'; // Remplacez par un token valide

async function testDossierMedicalValidation() {
    console.log('🧪 Test de validation des paramètres dossierMedical\n');

    const headers = {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
    };

    try {
        // Test 1: Tentative d'accès avec ID null
        console.log('1️⃣ Test avec ID null...');
        try {
            await axios.put(`${BASE_URL}/dossierMedical/null`, {
                statut: 'actif'
            }, { headers });
            console.log('❌ Erreur: La requête aurait dû échouer avec ID null');
        } catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Erreur 400 correctement retournée pour ID null');
                console.log('📋 Détails:', error.response.data);
            } else {
                console.log('⚠️ Erreur inattendue:', error.message);
            }
        }

        // Test 2: Tentative d'accès avec ID undefined
        console.log('\n2️⃣ Test avec ID undefined...');
        try {
            await axios.put(`${BASE_URL}/dossierMedical/undefined`, {
                statut: 'actif'
            }, { headers });
            console.log('❌ Erreur: La requête aurait dû échouer avec ID undefined');
        } catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Erreur 400 correctement retournée pour ID undefined');
                console.log('📋 Détails:', error.response.data);
            } else {
                console.log('⚠️ Erreur inattendue:', error.message);
            }
        }

        // Test 3: Tentative d'accès avec ID vide
        console.log('\n3️⃣ Test avec ID vide...');
        try {
            await axios.put(`${BASE_URL}/dossierMedical/`, {
                statut: 'actif'
            }, { headers });
            console.log('❌ Erreur: La requête aurait dû échouer avec ID vide');
        } catch (error) {
            if (error.response?.status === 404) {
                console.log('✅ Erreur 404 correctement retournée pour route inexistante');
            } else {
                console.log('⚠️ Erreur inattendue:', error.message);
            }
        }

        // Test 4: Tentative d'accès avec ID invalide (texte)
        console.log('\n4️⃣ Test avec ID invalide (texte)...');
        try {
            await axios.put(`${BASE_URL}/dossierMedical/invalid`, {
                statut: 'actif'
            }, { headers });
            console.log('❌ Erreur: La requête aurait dû échouer avec ID invalide');
        } catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Erreur 400 correctement retournée pour ID invalide');
                console.log('📋 Détails:', error.response.data);
            } else {
                console.log('⚠️ Erreur inattendue:', error.message);
            }
        }

        // Test 5: Tentative d'accès avec ID négatif
        console.log('\n5️⃣ Test avec ID négatif...');
        try {
            await axios.put(`${BASE_URL}/dossierMedical/-1`, {
                statut: 'actif'
            }, { headers });
            console.log('❌ Erreur: La requête aurait dû échouer avec ID négatif');
        } catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Erreur 400 correctement retournée pour ID négatif');
                console.log('📋 Détails:', error.response.data);
            } else {
                console.log('⚠️ Erreur inattendue:', error.message);
            }
        }

        // Test 6: Tentative d'accès avec ID zéro
        console.log('\n6️⃣ Test avec ID zéro...');
        try {
            await axios.put(`${BASE_URL}/dossierMedical/0`, {
                statut: 'actif'
            }, { headers });
            console.log('❌ Erreur: La requête aurait dû échouer avec ID zéro');
        } catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Erreur 400 correctement retournée pour ID zéro');
                console.log('📋 Détails:', error.response.data);
            } else {
                console.log('⚠️ Erreur inattendue:', error.message);
            }
        }

        console.log('\n🎉 Tests de validation terminés !');
        console.log('📋 Vérifiez que toutes les erreurs 400 sont correctement retournées');

    } catch (error) {
        console.error('❌ Erreur lors des tests:', error.message);
    }
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
    testDossierMedicalValidation();
}

module.exports = { testDossierMedicalValidation };
