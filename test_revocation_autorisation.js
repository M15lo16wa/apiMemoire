const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_TOKEN = 'VOTRE_TOKEN_ICI'; // Remplacez par un token valide

// Test de révocation d'autorisation
async function testRevocationAutorisation() {
    try {
        console.log('🔍 Test de révocation d\'autorisation');
        
        // 1. Vérifier le statut actuel
        const patientId = 1; // Remplacez par un ID patient valide
        const professionnelId = 1; // Remplacez par un ID professionnel valide
        
        console.log(`📋 Vérification du statut: Patient ${patientId} → Professionnel ${professionnelId}`);
        
        const statusResponse = await axios.get(`${BASE_URL}/api/access/status/${patientId}?professionnelId=${professionnelId}`, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Statut récupéré:', statusResponse.data);
        
        const autorisation = statusResponse.data.data.authorization;
        if (!autorisation || !autorisation.id_acces) {
            console.log('ℹ️ Aucune autorisation active trouvée');
            return;
        }
        
        console.log(`🔍 Autorisation trouvée: ID ${autorisation.id_acces}, Statut: ${autorisation.statut}`);
        
        // 2. Tester la révocation
        console.log('\n🔄 Test de révocation...');
        
        const revocationResponse = await axios.patch(`${BASE_URL}/api/access/authorization/${autorisation.id_acces}`, {
            statut: 'refuse',
            motif_revocation: 'Test de révocation automatique',
            date_revocation: new Date().toISOString(),
            date_fin: new Date().toISOString()
        }, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Autorisation révoquée:', revocationResponse.data);
        
        // 3. Vérifier le nouveau statut
        console.log('\n🔍 Vérification du nouveau statut...');
        
        const newStatusResponse = await axios.get(`${BASE_URL}/api/access/status/${patientId}?professionnelId=${professionnelId}`, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Nouveau statut:', newStatusResponse.data);
        
        // 4. Vérifier que l'accès est bien révoqué
        const newStatus = newStatusResponse.data.data.status;
        if (newStatus === 'denied_or_expired' || newStatus === 'not_requested') {
            console.log('✅ Révocation réussie: accès désactivé');
        } else {
            console.log('⚠️ Statut inattendu après révocation:', newStatus);
        }
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error.message);
        
        if (error.response) {
            console.error('📊 Status:', error.response.status);
            console.error('📋 Erreur:', error.response.data);
        }
    }
}

// Test de validation des statuts
async function testValidationStatuts() {
    console.log('\n🧪 Test de validation des statuts...');
    
    const statutsValides = ['actif', 'inactif', 'attente_validation', 'refuse', 'expire'];
    
    for (const statut of statutsValides) {
        try {
            console.log(`📋 Test avec statut: ${statut}`);
            
            // Créer une autorisation de test (si possible)
            // Note: Cette partie dépend de votre logique de création d'autorisations
            
        } catch (error) {
            console.error(`❌ Erreur avec statut ${statut}:`, error.message);
        }
    }
}

// Test de la route PATCH
async function testRoutePatch() {
    console.log('\n🔍 Test de la route PATCH...');
    
    try {
        // Test avec un ID d'autorisation fictif
        const testId = 999;
        
        const response = await axios.patch(`${BASE_URL}/api/access/authorization/${testId}`, {
            statut: 'refuse',
            motif_revocation: 'Test de route'
        }, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Route PATCH accessible:', response.status);
        
    } catch (error) {
        if (error.response?.status === 404) {
            console.log('✅ Route PATCH accessible (404 attendu pour ID fictif)');
        } else {
            console.error('❌ Problème avec la route PATCH:', error.response?.status);
        }
    }
}

// Fonction principale
async function main() {
    console.log('🚀 Test de révocation d\'autorisation');
    console.log('=' .repeat(50));
    
    if (!TEST_TOKEN || TEST_TOKEN === 'VOTRE_TOKEN_ICI') {
        console.log('⚠️ Token non configuré, tests limités');
        await testRoutePatch();
        return;
    }
    
    // Tests complets
    await testRevocationAutorisation();
    await testValidationStatuts();
    await testRoutePatch();
    
    console.log('\n🔍 RÉSUMÉ DES TESTS');
    console.log('=' .repeat(30));
    console.log('✅ Tests terminés');
    
    console.log('\n💡 RECOMMANDATIONS:');
    console.log('1. Utilisez statut: "refuse" au lieu de "inactif"');
    console.log('2. Ajoutez motif_revocation et date_revocation');
    console.log('3. Ajoutez date_fin pour expirer immédiatement l\'accès');
    console.log('4. Vérifiez que le serveur est démarré');
    console.log('5. Vérifiez que votre token est valide');
}

// Exécution
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    testRevocationAutorisation,
    testValidationStatuts,
    testRoutePatch
};
