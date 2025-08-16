/**
 * Script de test pour le module des auto-mesures
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';
const TEST_TOKEN = process.env.TEST_TOKEN || 'your_test_token_here';

// Configuration des headers
const getHeaders = () => ({
    'Authorization': `Bearer ${TEST_TOKEN}`,
    'Content-Type': 'application/json'
});

// Test de création d'une auto-mesure
async function testCreateAutoMesure() {
    console.log('🧪 Test de création d\'auto-mesure...');
    
    try {
        const autoMesureData = {
            type_mesure: 'glycemie',
            valeur: 95.0,
            unite: 'mg/dL',
            notes: 'Test de création - mesure à jeun'
        };

        const response = await axios.post(
            `${BASE_URL}/patient/auto-mesures`,
            autoMesureData,
            { headers: getHeaders() }
        );

        console.log('✅ Auto-mesure créée avec succès');
        console.log('   ID:', response.data.data.id);
        console.log('   Type:', response.data.data.type_mesure);
        console.log('   Valeur:', response.data.data.valeur);
        
        return response.data.data.id;
    } catch (error) {
        console.error('❌ Erreur lors de la création:', error.response?.data || error.message);
        return null;
    }
}

// Test de récupération d'une auto-mesure par ID
async function testGetAutoMesureById(id) {
    if (!id) {
        console.log('⚠️ Impossible de tester la récupération sans ID');
        return;
    }

    console.log(`\n🧪 Test de récupération de l'auto-mesure ${id}...`);
    
    try {
        const response = await axios.get(
            `${BASE_URL}/patient/auto-mesures/${id}`,
            { headers: getHeaders() }
        );

        console.log('✅ Auto-mesure récupérée avec succès');
        console.log('   Type:', response.data.data.type_mesure);
        console.log('   Valeur:', response.data.data.valeur);
        console.log('   Patient ID:', response.data.data.patient_id);
    } catch (error) {
        console.error('❌ Erreur lors de la récupération:', error.response?.data || error.message);
    }
}

// Test de récupération de toutes les auto-mesures
async function testGetAllAutoMesures() {
    console.log('\n🧪 Test de récupération de toutes les auto-mesures...');
    
    try {
        const response = await axios.get(
            `${BASE_URL}/patient/auto-mesures`,
            { headers: getHeaders() }
        );

        console.log('✅ Auto-mesures récupérées avec succès');
        console.log('   Nombre total:', response.data.results);
        console.log('   Première mesure:', response.data.data[0]?.type_mesure || 'Aucune');
    } catch (error) {
        console.error('❌ Erreur lors de la récupération:', error.response?.data || error.message);
    }
}

// Test de mise à jour d'une auto-mesure
async function testUpdateAutoMesure(id) {
    if (!id) {
        console.log('⚠️ Impossible de tester la mise à jour sans ID');
        return;
    }

    console.log(`\n🧪 Test de mise à jour de l'auto-mesure ${id}...`);
    
    try {
        const updateData = {
            valeur: 98.0,
            notes: 'Test de mise à jour - valeur modifiée'
        };

        const response = await axios.put(
            `${BASE_URL}/patient/auto-mesures/${id}`,
            updateData,
            { headers: getHeaders() }
        );

        console.log('✅ Auto-mesure mise à jour avec succès');
        console.log('   Nouvelle valeur:', response.data.data.valeur);
        console.log('   Nouvelles notes:', response.data.data.notes);
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour:', error.response?.data || error.message);
    }
}

// Test de récupération des auto-mesures d'un patient spécifique
async function testGetAutoMesuresByPatient() {
    console.log('\n🧪 Test de récupération des auto-mesures par patient...');
    
    try {
        // Utiliser l'ID du patient connecté ou un ID de test
        const patientId = 1; // Remplacez par un ID valide
        
        const response = await axios.get(
            `${BASE_URL}/patient/${patientId}/auto-mesures`,
            { headers: getHeaders() }
        );

        console.log('✅ Auto-mesures du patient récupérées avec succès');
        console.log('   Patient ID:', patientId);
        console.log('   Nombre de mesures:', response.data.results);
    } catch (error) {
        console.error('❌ Erreur lors de la récupération par patient:', error.response?.data || error.message);
    }
}

// Test de récupération des statistiques
async function testGetAutoMesuresStats() {
    console.log('\n🧪 Test de récupération des statistiques...');
    
    try {
        const patientId = 1; // Remplacez par un ID valide
        
        const response = await axios.get(
            `${BASE_URL}/patient/${patientId}/auto-mesures/stats`,
            { headers: getHeaders() }
        );

        console.log('✅ Statistiques récupérées avec succès');
        console.log('   Patient ID:', patientId);
        console.log('   Données:', response.data.data);
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des statistiques:', error.response?.data || error.message);
    }
}

// Test de récupération de la dernière mesure par type
async function testGetLastAutoMesureByType() {
    console.log('\n🧪 Test de récupération de la dernière mesure par type...');
    
    try {
        const patientId = 1; // Remplacez par un ID valide
        const typeMesure = 'glycemie';
        
        const response = await axios.get(
            `${BASE_URL}/patient/${patientId}/auto-mesures/last/${typeMesure}`,
            { headers: getHeaders() }
        );

        console.log('✅ Dernière mesure récupérée avec succès');
        console.log('   Patient ID:', patientId);
        console.log('   Type:', typeMesure);
        console.log('   Valeur:', response.data.data.valeur);
    } catch (error) {
        console.error('❌ Erreur lors de la récupération de la dernière mesure:', error.response?.data || error.message);
    }
}

// Test de suppression d'une auto-mesure
async function testDeleteAutoMesure(id) {
    if (!id) {
        console.log('⚠️ Impossible de tester la suppression sans ID');
        return;
    }

    console.log(`\n🧪 Test de suppression de l'auto-mesure ${id}...`);
    
    try {
        const response = await axios.delete(
            `${BASE_URL}/patient/auto-mesures/${id}`,
            { headers: getHeaders() }
        );

        console.log('✅ Auto-mesure supprimée avec succès');
        console.log('   Message:', response.data.message);
    } catch (error) {
        console.error('❌ Erreur lors de la suppression:', error.response?.data || error.message);
    }
}

// Fonction principale de test
async function runAllTests() {
    console.log('🚀 Démarrage des tests du module auto-mesures\n');

    if (TEST_TOKEN === 'your_test_token_here') {
        console.log('⚠️ Définissez TEST_TOKEN dans vos variables d\'environnement');
        console.log('   Exemple: export TEST_TOKEN="your_actual_token"');
        return;
    }

    try {
        // Tests CRUD
        const autoMesureId = await testCreateAutoMesure();
        await testGetAutoMesureById(autoMesureId);
        await testGetAllAutoMesures();
        await testUpdateAutoMesure(autoMesureId);
        
        // Tests spécifiques
        await testGetAutoMesuresByPatient();
        await testGetAutoMesuresStats();
        await testGetLastAutoMesureByType();
        
        // Test de suppression
        await testDeleteAutoMesure(autoMesureId);

        console.log('\n🎉 Tous les tests sont terminés !');
        
    } catch (error) {
        console.error('\n❌ Erreur lors des tests:', error.message);
    }
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
    runAllTests();
}

module.exports = {
    runAllTests,
    testCreateAutoMesure,
    testGetAutoMesureById,
    testUpdateAutoMesure,
    testDeleteAutoMesure
};
