const fs = require('fs');
const path = require('path');

console.log('=== Configuration du fichier .env ===\n');

// Vérifier si le fichier .env existe déjà
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    console.log('⚠️  Le fichier .env existe déjà.');
    console.log('Voulez-vous le remplacer ? (y/n)');
    process.stdin.once('data', (data) => {
        const answer = data.toString().trim().toLowerCase();
        if (answer === 'y' || answer === 'yes') {
            createEnvFile();
        } else {
            console.log('Configuration annulée.');
            process.exit(0);
        }
    });
} else {
    createEnvFile();
}

function createEnvFile() {
    const envContent = `# Configuration Base de Données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=apiMemoire
DB_USER=postgres
DB_PASSWORD=postgres
DB_DIALECT=postgres

# Configuration Serveur
PORT=3001
NODE_ENV=development

# Configuration JWT
JWT_SECRET=votre_secret_jwt_tres_securise_ici
JWT_EXPIRES_IN=24h

# Configuration Mailtrap (Email)
MAILTRAP_HOST=smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=votre_username_mailtrap
MAILTRAP_PASS=votre_password_mailtrap
MAILTRAP_FROM=noreply@dmp-system.com

# Configuration Twilio (SMS)
TWILIO_ACCOUNT_SID=votre_account_sid_twilio
TWILIO_AUTH_TOKEN=votre_auth_token_twilio
TWILIO_PHONE_NUMBER=votre_numero_twilio

# Configuration Socket.io
SOCKET_PORT=3002

# Configuration Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=5

# Configuration CPS Authentication
CPS_CODE_EXPIRY_MINUTES=5
CPS_MAX_ATTEMPTS=3
CPS_BLOCK_DURATION_MINUTES=15

# Configuration Notifications
NOTIFICATION_EXPIRY_HOURS=24
NOTIFICATION_RETRY_ATTEMPTS=3

# Configuration DMP Access
DMP_SESSION_DURATION_MINUTES=60
DMP_URGENCY_ACCESS_DURATION_MINUTES=30
`;

    try {
        fs.writeFileSync(envPath, envContent);
        console.log('✅ Fichier .env créé avec succès !');
        console.log('\n📝 Instructions pour finaliser la configuration :');
        console.log('1. Ouvrez le fichier .env');
        console.log('2. Remplacez les valeurs suivantes :');
        console.log('   - MAILTRAP_USER et MAILTRAP_PASS avec vos identifiants Mailtrap');
        console.log('   - TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER avec vos identifiants Twilio');
        console.log('   - JWT_SECRET avec une clé secrète forte');
        console.log('3. Sauvegardez le fichier');
        console.log('\n🚀 Ensuite, vous pourrez démarrer l\'API avec : npm start');
    } catch (error) {
        console.error('❌ Erreur lors de la création du fichier .env:', error.message);
    }
} 