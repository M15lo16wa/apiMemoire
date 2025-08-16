/**
 * Script de débogage pour identifier la source des requêtes avec ID null
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

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

    console.log('\n🎯 Analyse terminée');
}

if (require.main === module) {
    debugNullIdScenarios();
}
