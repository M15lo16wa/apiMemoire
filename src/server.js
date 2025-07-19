const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const app = require('./app');
const sequelize = require('./config/database');

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
        await sequelize.authenticate();
    console.log('Connection to database has been established successfully.');

    app.listen(PORT, () => {
        console.log(`Server running on port: http://localhost:${PORT} in ${process.env.NODE_ENV} mode`);
    });
    }catch (error) {
        console.error('Unable to connect to the database:', error);
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