// test_upload_service.js
// Test du service d'upload de documents

const dossierMedicalService = require('./src/modules/dossierMedical/dossierMedical.service');

async function testUploadService() {
    try {
        console.log('🧪 Test du service d\'upload de documents');
        console.log('========================================\n');
        
        // Test 1: Vérifier que le service est accessible
        console.log('1️⃣ Test d\'accès au service...');
        if (dossierMedicalService.documentPersonnel) {
            console.log('✅ Service documentPersonnel accessible');
        } else {
            console.log('❌ Service documentPersonnel non accessible');
            return;
        }
        
        // Test 2: Vérifier les méthodes disponibles
        console.log('\n2️⃣ Méthodes disponibles:');
        const methods = Object.getOwnPropertyNames(dossierMedicalService.documentPersonnel);
        methods.forEach(method => {
            if (typeof dossierMedicalService.documentPersonnel[method] === 'function') {
                console.log(`  ✅ ${method}`);
            }
        });
        
        // Test 3: Vérifier la connexion à la base
        console.log('\n3️⃣ Test de connexion à la base...');
        try {
            const { sequelize } = require('./src/models');
            await sequelize.authenticate();
            console.log('✅ Connexion à la base réussie');
        } catch (error) {
            console.log('❌ Erreur de connexion:', error.message);
            return;
        }
        
        // Test 4: Vérifier que la table est accessible
        console.log('\n4️⃣ Test d\'accès à la table...');
        try {
            const { DocumentPersonnel } = require('./src/models');
            const count = await DocumentPersonnel.count();
            console.log(`✅ Table accessible, ${count} documents trouvés`);
        } catch (error) {
            console.log('❌ Erreur d\'accès à la table:', error.message);
            return;
        }
        
        console.log('\n🚀 Service prêt pour les tests !');
        console.log('\n💡 Pour tester l\'upload:');
        console.log('1. Démarrer votre serveur: npm start');
        console.log('2. Tester avec Postman ou curl:');
        console.log('   POST http://localhost:3000/api/documents/upload');
        console.log('   Headers: Authorization: Bearer YOUR_TOKEN');
        console.log('   Body: multipart/form-data avec:');
        console.log('   - document: fichier.pdf');
        console.log('   - patient_id: 1');
        console.log('   - nom: Test Document');
        console.log('   - type: ordonnance');
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error.message);
    }
}

testUploadService();
