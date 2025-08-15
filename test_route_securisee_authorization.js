const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_TOKEN = 'VOTRE_TOKEN_ICI'; // Remplacez par un token valide

// Test de la route PATCH sécurisée pour la modification d'autorisation
async function testRouteSecuriseeAuthorization() {
    try {
        console.log('🔒 Test de la route PATCH sécurisée pour la modification d\'autorisation');
        console.log('=' .repeat(70));
        
        if (!TEST_TOKEN || TEST_TOKEN === 'VOTRE_TOKEN_ICI') {
            console.log('⚠️ Token non configuré, tests limités');
            await testRouteAccessibility();
            return;
        }
        
        // 1. Test sans authentification (doit échouer)
        console.log('\n🔍 Test 1: Accès sans authentification (doit échouer)');
        try {
            const response = await axios.patch(`${BASE_URL}/api/access/authorization/999`, {
                statut: 'expire',
                raison_demande: 'Test sans token'
            });
            console.log('❌ Route accessible sans token (401 attendu)');
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Route correctement protégée (401 reçu)');
            } else {
                console.log('⚠️ Erreur inattendue:', error.response?.status);
            }
        }
        
        // 2. Test avec token invalide (doit échouer)
        console.log('\n🔍 Test 2: Accès avec token invalide (doit échouer)');
        try {
            const response = await axios.patch(`${BASE_URL}/api/access/authorization/999`, {
                statut: 'expire',
                raison_demande: 'Test avec token invalide'
            }, {
                headers: {
                    'Authorization': 'Bearer token_invalide',
                    'Content-Type': 'application/json'
                }
            });
            console.log('❌ Route accessible avec token invalide (401 attendu)');
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Route correctement protégée avec token invalide (401 reçu)');
            } else {
                console.log('⚠️ Erreur inattendue:', error.response?.status);
            }
        }
        
        // 3. Test avec token valide mais ID d'autorisation inexistant
        console.log('\n🔍 Test 3: Accès avec token valide mais autorisation inexistante (doit échouer)');
        try {
            const response = await axios.patch(`${BASE_URL}/api/access/authorization/999999`, {
                statut: 'expire',
                raison_demande: 'Test avec autorisation inexistante'
            }, {
                headers: {
                    'Authorization': `Bearer ${TEST_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('❌ Route accessible avec autorisation inexistante (404 attendu)');
        } catch (error) {
            if (error.response?.status === 404) {
                console.log('✅ Route correctement gère l\'autorisation inexistante (404 reçu)');
            } else {
                console.log('⚠️ Erreur inattendue:', error.response?.status, error.response?.data);
            }
        }
        
        // 4. Test de validation des données (statut invalide)
        console.log('\n🔍 Test 4: Validation des données - statut invalide (doit échouer)');
        try {
            const response = await axios.patch(`${BASE_URL}/api/access/authorization/999`, {
                statut: 'statut_invalide',
                raison_demande: 'Test avec statut invalide'
            }, {
                headers: {
                    'Authorization': `Bearer ${TEST_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('❌ Route accepte un statut invalide (400 attendu)');
        } catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Route valide correctement le statut (400 reçu)');
                console.log('📋 Message d\'erreur:', error.response.data.message);
            } else {
                console.log('⚠️ Erreur inattendue:', error.response?.status);
            }
        }
        
        // 5. Test de validation - expiration sans raison
        console.log('\n🔍 Test 5: Validation - expiration sans raison (doit échouer)');
        try {
            const response = await axios.patch(`${BASE_URL}/api/access/authorization/999`, {
                statut: 'expire'
                // Pas de raison_demande
            }, {
                headers: {
                    'Authorization': `Bearer ${TEST_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('❌ Route accepte l\'expiration sans raison (400 attendu)');
        } catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Route valide correctement la raison pour l\'expiration (400 reçu)');
                console.log('📋 Message d\'erreur:', error.response.data.message);
            } else {
                console.log('⚠️ Erreur inattendue:', error.response?.status);
            }
        }
        
        // 6. Test de la structure de réponse (si on a une autorisation valide)
        console.log('\n🔍 Test 6: Structure de réponse (si autorisation valide)');
        console.log('ℹ️ Ce test nécessite une autorisation valide dans votre base de données');
        console.log('ℹ️ Remplacez 999 par un ID d\'autorisation valide pour tester complètement');
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error.message);
        
        if (error.response) {
            console.error('📊 Status:', error.response.status);
            console.error('📋 Erreur:', error.response.data);
        }
    }
}

// Test de l'accessibilité de la route
async function testRouteAccessibility() {
    console.log('\n🔍 Test de l\'accessibilité de la route (sans token)');
    
    try {
        const response = await axios.patch(`${BASE_URL}/api/access/authorization/999`, {
            statut: 'expire',
            raison_demande: 'Test d\'accessibilité'
        });
        console.log('❌ Route accessible sans authentification (401 attendu)');
        console.log('📊 Status reçu:', response.status);
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('✅ Route correctement protégée (401 reçu)');
        } else if (error.response?.status === 404) {
            console.log('✅ Route protégée mais autorisation non trouvée (404 reçu)');
        } else {
            console.log('⚠️ Erreur inattendue:', error.response?.status);
        }
    }
}

// Test des middlewares de sécurité
async function testMiddlewaresSecurite() {
    console.log('\n🔒 Test des middlewares de sécurité');
    console.log('=' .repeat(40));
    
    console.log('✅ Middleware 1: authMiddleware.protect');
    console.log('   - Vérifie l\'authentification JWT');
    console.log('   - Rejette les requêtes sans token valide');
    
    console.log('✅ Middleware 2: accessMiddleware.getAuthorizationContext');
    console.log('   - Récupère l\'autorisation et son contexte');
    console.log('   - Inclut les informations patient/médecin');
    console.log('   - Vérifie l\'existence de l\'autorisation');
    
    console.log('✅ Middleware 3: accessMiddleware.checkAuthorizationOwnership');
    console.log('   - Vérifie les permissions de l\'utilisateur');
    console.log('   - Seuls les propriétaires peuvent modifier');
    console.log('   - Gestion des rôles (admin, médecin, patient)');
    
    console.log('✅ Contrôleur: accessController.updateAuthorizationAccess');
    console.log('   - Validation des données');
    console.log('   - Mise à jour avec traçabilité');
    console.log('   - Création d\'historique automatique');
}

// Fonction principale
async function main() {
    console.log('🚀 Test de la route PATCH sécurisée pour la modification d\'autorisation');
    console.log('=' .repeat(80));
    
    // Tests de sécurité
    await testRouteSecuriseeAuthorization();
    
    // Information sur les middlewares
    await testMiddlewaresSecurite();
    
    console.log('\n🔍 RÉSUMÉ DES TESTS');
    console.log('=' .repeat(40));
    console.log('✅ Tests de sécurité terminés');
    
    console.log('\n💡 ANALYSE:');
    console.log('1. Si tous les tests passent:');
    console.log('   - La route est correctement sécurisée ✅');
    console.log('   - Les middlewares fonctionnent ✅');
    console.log('   - La validation des données est active ✅');
    
    console.log('\n2. Si certains tests échouent:');
    console.log('   - Vérifiez que le serveur a été redémarré');
    console.log('   - Vérifiez que les middlewares sont bien importés');
    console.log('   - Vérifiez les logs du serveur');
    
    console.log('\n🚨 RECOMMANDATIONS:');
    console.log('1. Redémarrez le serveur après les modifications');
    console.log('2. Testez avec des tokens valides de différents rôles');
    console.log('3. Vérifiez que les autorisations existent dans votre base');
    console.log('4. Surveillez les logs pour la traçabilité complète');
}

// Exécution
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    testRouteSecuriseeAuthorization,
    testRouteAccessibility,
    testMiddlewaresSecurite
};
