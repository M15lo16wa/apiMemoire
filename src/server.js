const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const app = require('./app');
const { sequelize } = require('./config/database');
const { testConnection: testRedisConnection } = require('./config/redis');

const PORT = process.env.PORT || 3000;

// Gérer les erreurs non capturées avant le démarrage du serveur
process.on('uncaughtException', err => {
    console.error('UNCAUGHT EXCEPTION! Shutting down...');
    console.error(err.name, err.message, err.stack);
    process.exit(1);
});

// Démarrage du serveur
const startServer = async () => {
    try {
        // Tester la connexion à la base de données
        await sequelize.authenticate();
        console.log('✅ Connexion à la base de données établie avec succès');

        // Tester la connexion Redis
        const redisResult = await testRedisConnection();
        if (redisResult) {
            console.log('✅ Redis connecté et opérationnel');
        } else {
            console.warn('⚠️  Redis non disponible - certaines fonctionnalités peuvent être limitées');
        }

        // Démarrer le serveur
        app.listen(PORT, () => {
            console.log(`🚀 Serveur démarré sur le port ${PORT}`);
            console.log(`📱 Mode: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔐 Authentification Redis: ${redisResult ? 'Activée' : 'Désactivée'}`);
        });
    } catch (error) {
        console.error('❌ Erreur lors du démarrage:', error);
        process.exit(1);
    }
};

startServer();

// Gérer les rejets de promesses non gérés
process.on('unhandledRejection', err => {
    console.error('UNHANDLED REJECTION! Shutting down...');
    console.error(err.name, err.message, err.stack);
    process.exit(1);
});