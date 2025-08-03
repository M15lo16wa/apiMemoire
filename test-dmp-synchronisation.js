const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
let patientToken = null;
let patientId = null;

// Configuration Axios pour les tests
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
});

// Intercepteur pour l'authentification automatique
api.interceptors.request.use(
    (config) => {
        if (patientToken) {
            config.headers.Authorization = `Bearer ${patientToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Fonction pour se connecter en tant que patient
async function loginPatient() {
    try {
        console.log('🔐 Connexion patient...');
        
        const response = await api.post('/patient/auth/login', {
            numero_assure: 'IPRES123456789',
            mot_de_passe: 'motdepasse123'
        });
        
        patientToken = response.data.token;
        patientId = response.data.patient?.id_patient;
        
        console.log('✅ Connexion patient réussie');
        console.log(`📋 Patient ID: ${patientId}`);
        return true;
    } catch (error) {
        console.error('❌ Erreur de connexion patient:', error.response?.data || error.message);
        return false;
    }
}

// Fonction pour tester un endpoint
async function testEndpoint(method, endpoint, data = null, description = '') {
    try {
        const config = {
            method,
            url: endpoint,
            headers: {
                'Authorization': `Bearer ${patientToken}`,
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            config.data = data;
        }

        const response = await api(config);
        console.log(`✅ ${description} - Status: ${response.status}`);
        return { success: true, data: response.data };
    } catch (error) {
        console.error(`❌ ${description} - Erreur:`, error.response?.status, error.response?.data?.message || error.message);
        return { success: false, error: error.response?.data || error.message };
    }
}

// Test du tableau de bord DMP
async function testTableauDeBord() {
    console.log('\n📊 Test du tableau de bord DMP...');
    
    const result = await testEndpoint(
        'GET',
        '/patient/dmp/tableau-de-bord',
        null,
        'Récupération du tableau de bord'
    );
    
    if (result.success) {
        const tableau = result.data.data.tableau_de_bord;
        console.log('📈 Données du tableau de bord:');
        console.log(`   - Patient: ${tableau.patient?.prenom} ${tableau.patient?.nom}`);
        console.log(`   - Groupe sanguin: ${tableau.patient?.groupe_sanguin || 'Non renseigné'}`);
        console.log(`   - Rendez-vous: ${tableau.prochains_rendez_vous?.length || 0}`);
        console.log(`   - Activités récentes: ${tableau.dernieres_activites?.length || 0}`);
        console.log(`   - Notifications: ${tableau.notifications?.length || 0}`);
    }
    
    return result.success;
}

// Test de l'historique médical
async function testHistoriqueMedical() {
    console.log('\n📋 Test de l\'historique médical...');
    
    const result = await testEndpoint(
        'GET',
        '/patient/dmp/historique-medical?limit=5',
        null,
        'Récupération de l\'historique médical'
    );
    
    if (result.success) {
        const historique = result.data.data.historique_medical;
        console.log(`📊 Historique médical: ${historique.length} éléments`);
        
        historique.forEach((item, index) => {
            console.log(`   ${index + 1}. ${item.type} - ${item.date}`);
        });
    }
    
    return result.success;
}

// Test du journal d'activité
async function testJournalActivite() {
    console.log('\n📝 Test du journal d\'activité...');
    
    const result = await testEndpoint(
        'GET',
        '/patient/dmp/journal-activite?limit=5',
        null,
        'Récupération du journal d\'activité'
    );
    
    if (result.success) {
        const journal = result.data.data.journal_activite;
        console.log(`📊 Journal d'activité: ${journal.length} éléments`);
        
        journal.forEach((item, index) => {
            console.log(`   ${index + 1}. ${item.type} - ${item.date} - ${item.description}`);
        });
    }
    
    return result.success;
}

// Test des droits d'accès
async function testDroitsAcces() {
    console.log('\n🔐 Test des droits d\'accès...');
    
    const result = await testEndpoint(
        'GET',
        '/patient/dmp/droits-acces',
        null,
        'Récupération des droits d\'accès'
    );
    
    if (result.success) {
        const droits = result.data.data.droits_acces;
        console.log(`📊 Droits d'accès: ${droits.length} professionnels autorisés`);
        
        droits.forEach((droit, index) => {
            console.log(`   ${index + 1}. ${droit.professionnel?.nom} ${droit.professionnel?.prenom} - ${droit.permissions}`);
        });
    }
    
    return result.success;
}

// Test des auto-mesures
async function testAutoMesures() {
    console.log('\n📏 Test des auto-mesures...');
    
    // Récupérer les auto-mesures existantes
    const getResult = await testEndpoint(
        'GET',
        '/patient/dmp/auto-mesures',
        null,
        'Récupération des auto-mesures'
    );
    
    if (getResult.success) {
        const autoMesures = getResult.data.data.auto_mesures || [];
        console.log(`📊 Auto-mesures existantes: ${autoMesures.length}`);
        
        // Ajouter une nouvelle auto-mesure
        const newMesure = {
            type_mesure: 'poids',
            valeur: 70.5,
            unite: 'kg',
            commentaire: 'Test via API'
        };
        
        const postResult = await testEndpoint(
            'POST',
            '/patient/dmp/auto-mesures',
            newMesure,
            'Ajout d\'une auto-mesure'
        );
        
        if (postResult.success) {
            console.log('✅ Auto-mesure ajoutée avec succès');
        }
    }
    
    return getResult.success;
}

// Test des documents personnels
async function testDocumentsPersonnels() {
    console.log('\n📄 Test des documents personnels...');
    
    const result = await testEndpoint(
        'GET',
        '/patient/dmp/documents',
        null,
        'Récupération des documents personnels'
    );
    
    if (result.success) {
        const documents = result.data.data.documents_personnels || [];
        console.log(`📊 Documents personnels: ${documents.length}`);
        
        documents.forEach((doc, index) => {
            console.log(`   ${index + 1}. ${doc.nom} - ${doc.type} - ${doc.taille}`);
        });
    }
    
    return result.success;
}

// Test des rappels
async function testRappels() {
    console.log('\n⏰ Test des rappels...');
    
    const result = await testEndpoint(
        'GET',
        '/patient/dmp/rappels',
        null,
        'Récupération des rappels'
    );
    
    if (result.success) {
        const rappels = result.data.data.rappels || [];
        console.log(`📊 Rappels: ${rappels.length}`);
        
        rappels.forEach((rappel, index) => {
            console.log(`   ${index + 1}. ${rappel.titre} - ${rappel.type} - ${rappel.priorite}`);
        });
    }
    
    return result.success;
}

// Test des statistiques DMP
async function testStatistiquesDMP() {
    console.log('\n📈 Test des statistiques DMP...');
    
    const result = await testEndpoint(
        'GET',
        '/patient/dmp/statistiques',
        null,
        'Récupération des statistiques DMP'
    );
    
    if (result.success) {
        const stats = result.data.data.statistiques;
        console.log('📊 Statistiques DMP:');
        console.log(`   - Consultations: ${stats.total_consultations}`);
        console.log(`   - Prescriptions: ${stats.total_prescriptions}`);
        console.log(`   - Examens: ${stats.total_examens}`);
        console.log(`   - Professionnels autorisés: ${stats.professionnels_autorises}`);
        console.log(`   - Documents uploadés: ${stats.documents_uploades}`);
        console.log(`   - Dernière activité: ${stats.derniere_activite}`);
    }
    
    return result.success;
}

// Test de la fiche d'urgence
async function testFicheUrgence() {
    console.log('\n🚨 Test de la fiche d\'urgence...');
    
    const result = await testEndpoint(
        'GET',
        '/patient/dmp/fiche-urgence',
        null,
        'Génération de la fiche d\'urgence'
    );
    
    if (result.success) {
        const fiche = result.data.data.fiche_urgence;
        console.log('📋 Fiche d\'urgence générée:');
        console.log(`   - QR Code: ${fiche.qr_code ? 'Généré' : 'Non généré'}`);
        console.log(`   - URL: ${fiche.url}`);
        console.log(`   - Données: ${fiche.donnees ? 'Incluses' : 'Non incluses'}`);
    }
    
    return result.success;
}

// Test de l'upload de document (simulation)
async function testUploadDocument() {
    console.log('\n📤 Test de l\'upload de document (simulation)...');
    
    // Simuler un upload de document
    const documentData = {
        titre: 'Test Document API',
        description: 'Document de test via API',
        type_document: 'autre'
    };
    
    const result = await testEndpoint(
        'POST',
        '/patient/dmp/documents',
        documentData,
        'Upload de document (simulation)'
    );
    
    if (result.success) {
        console.log('✅ Upload de document simulé avec succès');
    }
    
    return result.success;
}

// Test de l'envoi de message
async function testEnvoiMessage() {
    console.log('\n💬 Test de l\'envoi de message...');
    
    const messageData = {
        professionnel_id: 1, // ID d'un professionnel existant
        sujet: 'Test Message API',
        message: 'Ceci est un message de test via l\'API DMP'
    };
    
    const result = await testEndpoint(
        'POST',
        '/patient/dmp/messages',
        messageData,
        'Envoi de message'
    );
    
    if (result.success) {
        console.log('✅ Message envoyé avec succès');
    }
    
    return result.success;
}

// Test de mise à jour des informations personnelles
async function testUpdateInformationsPersonnelles() {
    console.log('\n👤 Test de mise à jour des informations personnelles...');
    
    const informations = {
        personne_urgence: 'Jean Dupont',
        telephone_urgence: '0123456789',
        antecedents_familiaux: 'Diabète familial',
        habitudes_vie: 'Non fumeur, sport occasionnel'
    };
    
    const result = await testEndpoint(
        'PUT',
        '/patient/dmp/informations-personnelles',
        informations,
        'Mise à jour des informations personnelles'
    );
    
    if (result.success) {
        console.log('✅ Informations personnelles mises à jour');
    }
    
    return result.success;
}

// Test complet de tous les endpoints DMP
async function testAllDMPEndpoints() {
    console.log('🚀 Test complet de tous les endpoints DMP');
    console.log('=' .repeat(50));
    
    // Connexion
    const loginSuccess = await loginPatient();
    if (!loginSuccess) {
        console.error('❌ Impossible de se connecter. Arrêt des tests.');
        return;
    }
    
    // Tests des fonctionnalités principales
    const tests = [
        { name: 'Tableau de bord', fn: testTableauDeBord },
        { name: 'Historique médical', fn: testHistoriqueMedical },
        { name: 'Journal d\'activité', fn: testJournalActivite },
        { name: 'Droits d\'accès', fn: testDroitsAcces },
        { name: 'Auto-mesures', fn: testAutoMesures },
        { name: 'Documents personnels', fn: testDocumentsPersonnels },
        { name: 'Rappels', fn: testRappels },
        { name: 'Statistiques DMP', fn: testStatistiquesDMP },
        { name: 'Fiche d\'urgence', fn: testFicheUrgence },
        { name: 'Upload document', fn: testUploadDocument },
        { name: 'Envoi message', fn: testEnvoiMessage },
        { name: 'Mise à jour infos', fn: testUpdateInformationsPersonnelles }
    ];
    
    const results = {};
    
    for (const test of tests) {
        try {
            results[test.name] = await test.fn();
        } catch (error) {
            console.error(`❌ Erreur lors du test ${test.name}:`, error.message);
            results[test.name] = false;
        }
    }
    
    // Résumé des tests
    console.log('\n📊 Résumé des tests DMP');
    console.log('=' .repeat(50));
    
    const successfulTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    Object.entries(results).forEach(([testName, success]) => {
        const status = success ? '✅' : '❌';
        console.log(`${status} ${testName}`);
    });
    
    console.log('\n📈 Statistiques:');
    console.log(`   - Tests réussis: ${successfulTests}/${totalTests}`);
    console.log(`   - Taux de succès: ${((successfulTests / totalTests) * 100).toFixed(1)}%`);
    
    if (successfulTests === totalTests) {
        console.log('\n🎉 Tous les tests DMP sont passés avec succès !');
    } else {
        console.log('\n⚠️  Certains tests ont échoué. Vérifiez les implémentations manquantes.');
    }
}

// Test de synchronisation avec le service API frontend
async function testFrontendAPISynchronization() {
    console.log('\n🔄 Test de synchronisation avec le service API frontend');
    console.log('=' .repeat(60));
    
    // Simuler les appels du service API frontend
    const frontendAPICalls = [
        {
            name: 'getPatientTableauDeBord',
            endpoint: '/patient/dmp/tableau-de-bord',
            method: 'GET'
        },
        {
            name: 'getPatientHistoriqueMedical',
            endpoint: '/patient/dmp/historique-medical?limit=10',
            method: 'GET'
        },
        {
            name: 'getPatientJournalActivite',
            endpoint: '/patient/dmp/journal-activite?limit=10',
            method: 'GET'
        },
        {
            name: 'getPatientDroitsAcces',
            endpoint: '/patient/dmp/droits-acces',
            method: 'GET'
        },
        {
            name: 'getPatientAutoMesures',
            endpoint: '/patient/dmp/auto-mesures',
            method: 'GET'
        },
        {
            name: 'getPatientDocumentsPersonnels',
            endpoint: '/patient/dmp/documents',
            method: 'GET'
        },
        {
            name: 'getPatientRappels',
            endpoint: '/patient/dmp/rappels',
            method: 'GET'
        },
        {
            name: 'getPatientStatistiquesDMP',
            endpoint: '/patient/dmp/statistiques',
            method: 'GET'
        },
        {
            name: 'genererFicheUrgence',
            endpoint: '/patient/dmp/fiche-urgence',
            method: 'GET'
        }
    ];
    
    const results = {};
    
    for (const apiCall of frontendAPICalls) {
        try {
            const result = await testEndpoint(
                apiCall.method,
                apiCall.endpoint,
                null,
                `Frontend API: ${apiCall.name}`
            );
            results[apiCall.name] = result.success;
        } catch (error) {
            console.error(`❌ Erreur lors du test ${apiCall.name}:`, error.message);
            results[apiCall.name] = false;
        }
    }
    
    console.log('\n📊 Synchronisation Frontend-Backend:');
    console.log('=' .repeat(50));
    
    const successfulCalls = Object.values(results).filter(Boolean).length;
    const totalCalls = Object.keys(results).length;
    
    Object.entries(results).forEach(([apiName, success]) => {
        const status = success ? '✅' : '❌';
        console.log(`${status} ${apiName}`);
    });
    
    console.log(`\n📈 Synchronisation: ${successfulCalls}/${totalCalls} APIs synchronisées`);
    
    if (successfulCalls === totalCalls) {
        console.log('🎉 Parfaite synchronisation entre frontend et backend !');
    } else {
        console.log('⚠️  Certaines APIs ne sont pas encore implémentées côté backend.');
    }
}

// Point d'entrée principal
async function main() {
    console.log('🔍 Test de synchronisation DMP Frontend-Backend');
    console.log('=' .repeat(60));
    
    try {
        // Test complet des endpoints DMP
        await testAllDMPEndpoints();
        
        // Test de synchronisation frontend-backend
        await testFrontendAPISynchronization();
        
        console.log('\n✅ Tests terminés avec succès !');
    } catch (error) {
        console.error('\n💥 Erreur lors des tests:', error.message);
        process.exit(1);
    }
}

// Vérifier que l'API est démarrée
async function checkAPIAvailability() {
    try {
        await axios.get(`${BASE_URL}/service-sante`);
        console.log('✅ API accessible');
        return true;
    } catch (error) {
        console.error('❌ API non accessible. Assurez-vous que le serveur est démarré sur http://localhost:3000');
        return false;
    }
}

// Point d'entrée
async function runTests() {
    console.log('🔍 Vérification de la disponibilité de l\'API...');
    
    const apiAvailable = await checkAPIAvailability();
    if (!apiAvailable) {
        console.error('❌ Impossible de continuer sans API accessible');
        process.exit(1);
    }
    
    await main();
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
    runTests();
}

module.exports = {
    testAllDMPEndpoints,
    testFrontendAPISynchronization,
    loginPatient,
    testEndpoint
}; 