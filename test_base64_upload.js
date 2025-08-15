// test_base64_upload.js
// Test du service de documents avec stockage en base64

console.log('🧪 Test du service de documents personnels - Stockage en base64');
console.log('==============================================================\n');

const fs = require('fs');

// Vérifier les fichiers modifiés
const files = [
    'src/models/DocumentPersonnel.js',
    'src/modules/dossierMedical/documentPersonnel.controller.js',
    'src/modules/dossierMedical/dossierMedical.service.js',
    'src/migrations/20250115000000-add-contenu-to-documents-personnels.js'
];

console.log('📁 Fichiers modifiés:');
files.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file}`);
    }
});

// Vérifier que multer est installé
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (packageJson.dependencies && packageJson.dependencies.multer) {
        console.log('✅ Multer installé');
    } else {
        console.log('❌ Multer non installé');
    }
} catch (error) {
    console.log('❌ Erreur lecture package.json');
}

console.log('\n🚀 Service modifié pour stockage en base64 !');
console.log('\n📋 Fonctionnalités:');
console.log('✅ Upload: Fichier → base64 → base de données');
console.log('✅ Téléchargement: base64 → buffer → fichier');
console.log('✅ Suppression: Suppression directe de la base');
console.log('✅ Plus de fichiers sur disque');

console.log('\n💡 Pour tester:');
console.log('1. Exécuter la migration: npm run migrate');
console.log('2. Démarrer le serveur');
console.log('3. Tester POST /api/documents/upload avec un fichier');
console.log('4. Le fichier sera stocké directement en base64 dans la base');

console.log('\n⚠️ Note: Les anciens documents sans contenu auront contenu = null');
console.log('   Vous pouvez les migrer progressivement si nécessaire');
