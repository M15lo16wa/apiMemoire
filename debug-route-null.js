/**
 * Script de débogage pour identifier la source des requêtes avec ID null
 * Ce script simule le problème et aide à le localiser
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Simuler différents scénarios qui pourraient causer l'ID null
async function debugNullIdScenarios() {
    console.log('🔍 Débogage des requêtes avec ID null\n');

    // Scénario 1: Variable JavaScript null
    console.log('1️⃣ Scénario: Variable JavaScript null');
    let dossierId = null;
    try {
        await axios.put(`${BASE_URL}/dossierMedical/${dossierId}`, {
            autoMesures: [{ type: 'test', valeur: 120 }]
        });
    } catch (error) {
        console.log('✅ Erreur 400 attendue pour ID null');
        console.log(`   Message: ${error.response?.data?.message}`);
        console.log(`   Code: ${error.response?.data?.errorCode}`);
    }

    // Scénario 2: Variable undefined
    console.log('\n2️⃣ Scénario: Variable undefined');
    let dossierId2 = undefined;
    try {
        await axios.put(`${BASE_URL}/dossierMedical/${dossierId2}`, {
            autoMesures: [{ type: 'test', valeur: 120 }]
        });
    } catch (error) {
        console.log('✅ Erreur 400 attendue pour ID undefined');
        console.log(`   Message: ${error.response?.data?.message}`);
    }

    // Scénario 3: Variable vide
    console.log('\n3️⃣ Scénario: Variable vide');
    let dossierId3 = '';
    try {
        await axios.put(`${BASE_URL}/dossierMedical/${dossierId3}`, {
            autoMesures: [{ type: 'test', valeur: 120 }]
        });
    } catch (error) {
        console.log('✅ Erreur 400 attendue pour ID vide');
        console.log(`   Message: ${error.response?.data?.message}`);
    }

    // Scénario 4: Variable non définie
    console.log('\n4️⃣ Scénario: Variable non définie');
    try {
        await axios.put(`${BASE_URL}/dossierMedical/${dossierIdNonDefinie}`, {
            autoMesures: [{ type: 'test', valeur: 120 }]
        });
    } catch (error) {
        if (error.code === 'ReferenceError') {
            console.log('✅ Erreur JavaScript: Variable non définie');
        } else {
            console.log('✅ Erreur 400 attendue');
            console.log(`   Message: ${error.response?.data?.message}`);
        }
    }

    console.log('\n🎯 Analyse des scénarios terminée');
    console.log('📋 Vérifiez dans votre code si vous avez des variables:');
    console.log('   - Qui peuvent être null/undefined');
    console.log('   - Qui ne sont pas initialisées');
    console.log('   - Qui viennent d\'une API externe');
    console.log('   - Qui sont dans un état d\'erreur');
}

// Fonction pour tester avec un token valide
async function testWithValidToken() {
    console.log('\n🔐 Test avec authentification (si vous avez un token)');
    
    // Remplacez par votre token valide
    const token = process.env.TEST_TOKEN || 'your_token_here';
    
    if (token === 'your_token_here') {
        console.log('⚠️ Définissez TEST_TOKEN dans vos variables d\'environnement');
        return;
    }

    try {
        const response = await axios.put(`${BASE_URL}/dossierMedical/1`, {
            autoMesures: [{ type: 'test', valeur: 120 }]
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ Requête valide réussie');
    } catch (error) {
        console.log('❌ Erreur avec ID valide:', error.response?.status);
        console.log('   Message:', error.response?.data?.message);
    }
}

// Exécuter les tests
async function main() {
    try {
        await debugNullIdScenarios();
        await testWithValidToken();
    } catch (error) {
        console.error('❌ Erreur lors des tests:', error.message);
    }
}

if (require.main === module) {
    main();
}

module.exports = { debugNullIdScenarios, testWithValidToken };
