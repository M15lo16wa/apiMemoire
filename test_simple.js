console.log('✅ Service de documents personnels - Test de vérification');
console.log('=======================================================');

// Vérifier les fichiers
const fs = require('fs');

const files = [
    'src/modules/dossierMedical/documentPersonnel.controller.js',
    'src/modules/dossierMedical/documentPersonnel.route.js',
    'src/modules/dossierMedical/dossierMedical.service.js'
];

console.log('\n📁 Fichiers du service:');
files.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file}`);
    }
});

// Vérifier le dossier d'upload
const uploadDir = 'uploads/documents';
if (fs.existsSync(uploadDir)) {
    console.log(`✅ Dossier d'upload: ${uploadDir}`);
} else {
    console.log(`❌ Dossier d'upload: ${uploadDir}`);
}

// Vérifier package.json
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

console.log('\n🚀 Service prêt !');
console.log('📋 Endpoints: /api/documents/*');
console.log('💡 Testez avec: POST /api/documents/upload');
