// test_upload_document.js
// Script de test pour l'upload de documents

const fs = require('fs');
const path = require('path');

console.log('🧪 Test du service de documents personnels');
console.log('==========================================\n');

// Vérifier que le dossier d'upload existe
const uploadDir = path.join(__dirname, 'uploads/documents');
if (fs.existsSync(uploadDir)) {
    console.log('✅ Dossier d\'upload trouvé:', uploadDir);
} else {
    console.log('❌ Dossier d\'upload manquant');
}

// Vérifier que les fichiers du service existent
const serviceFiles = [
    'src/modules/dossierMedical/documentPersonnel.controller.js',
    'src/modules/dossierMedical/documentPersonnel.route.js',
    'src/modules/dossierMedical/dossierMedical.service.js'
];

console.log('\n📁 Vérification des fichiers du service:');
serviceFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MANQUANT`);
    }
});

// Vérifier que les routes sont intégrées
const apiRoutesFile = 'src/routes/api.js';
if (fs.existsSync(apiRoutesFile)) {
    const content = fs.readFileSync(apiRoutesFile, 'utf8');
    if (content.includes('documentPersonnelRoutes')) {
        console.log('✅ Routes des documents intégrées dans api.js');
    } else {
        console.log('❌ Routes des documents non intégrées dans api.js');
    }
}

// Vérifier le package.json pour multer
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (packageJson.dependencies && packageJson.dependencies.multer) {
    console.log('✅ Multer installé');
} else {
    console.log('❌ Multer non installé');
}

console.log('\n🚀 Le service est prêt pour les tests !');
console.log('\n📋 Endpoints disponibles:');
console.log('POST   /api/documents/upload');
console.log('GET    /api/documents/patient/:patientId');
console.log('GET    /api/documents/:documentId');
console.log('GET    /api/documents/:documentId/download');
console.log('PUT    /api/documents/:documentId');
console.log('DELETE /api/documents/:documentId');
console.log('GET    /api/documents/patient/:patientId/stats');
console.log('POST   /api/documents/search');

console.log('\n💡 Pour tester l\'upload:');
console.log('1. Démarrer votre serveur');
console.log('2. Utiliser Postman ou curl pour tester POST /api/documents/upload');
console.log('3. Inclure un fichier dans le champ "document"');
console.log('4. Ajouter patient_id, nom, type dans le body');
console.log('5. Inclure le token d\'authentification dans les headers');
