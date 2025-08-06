const fs = require('fs');
const path = require('path');

console.log('=== Test de Configuration .env ===\n');

// Vérifier si le fichier .env existe
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.log('❌ Fichier .env non trouvé !');
    console.log('Exécutez : node configurer-env.js');
    process.exit(1);
}

// Charger les variables d'environnement
require('dotenv').config();

console.log('✅ Fichier .env trouvé');
console.log('\n📋 Configuration actuelle :');
console.log(`- PORT: ${process.env.PORT || 'non défini'}`);
console.log(`- DB_HOST: ${process.env.DB_HOST || 'non défini'}`);
console.log(`- DB_NAME: ${process.env.DB_NAME || 'non défini'}`);
console.log(`- JWT_SECRET: ${process.env.JWT_SECRET ? 'défini' : 'non défini'}`);
console.log(`- MAILTRAP_USER: ${process.env.MAILTRAP_USER ? 'défini' : 'non défini'}`);
console.log(`- TWILIO_ACCOUNT_SID: ${process.env.TWILIO_ACCOUNT_SID ? 'défini' : 'non défini'}`);

console.log('\n🔍 Vérification des dépendances...');

// Vérifier les modules nécessaires
const modules = ['speakeasy', 'nodemailer', 'twilio'];
let allModulesOk = true;

modules.forEach(module => {
    try {
        require(module);
        console.log(`✅ ${module} - OK`);
    } catch (error) {
        console.log(`❌ ${module} - MANQUANT`);
        allModulesOk = false;
    }
});

if (!allModulesOk) {
    console.log('\n⚠️  Certains modules sont manquants.');
    console.log('Exécutez : npm install speakeasy nodemailer twilio');
    process.exit(1);
}

console.log('\n✅ Toutes les dépendances sont installées');
console.log('\n🚀 Démarrage de l\'API...\n');

// Démarrer l'API
const { spawn } = require('child_process');
const apiProcess = spawn('node', ['src/server.js'], {
    stdio: 'inherit',
    shell: true
});

apiProcess.on('error', (error) => {
    console.error('❌ Erreur lors du démarrage de l\'API:', error.message);
});

apiProcess.on('exit', (code) => {
    if (code !== 0) {
        console.error(`❌ L'API s'est arrêtée avec le code: ${code}`);
    }
}); 