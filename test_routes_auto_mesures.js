/**
 * Script de test pour vérifier la configuration des routes auto-mesures
 */

const express = require('express');
const { autoMesureRoutes } = require('./src/modules/patient');

// Créer une app Express de test
const app = express();

// Monter les routes auto-mesures sur /patient
app.use('/patient', autoMesureRoutes);

// Middleware pour logger les requêtes
app.use((req, res, next) => {
    console.log(`🔍 ${req.method} ${req.path}`);
    next();
});

// Tester les routes
console.log('🧪 Test de configuration des routes auto-mesures\n');

// Afficher toutes les routes montées
console.log('📋 Routes disponibles:');
app._router.stack.forEach(layer => {
    if (layer.route) {
        const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
        console.log(`  ${methods.padEnd(7)} ${layer.route.path}`);
    }
});

console.log('\n🔗 URLs de test:');
console.log('  GET  /patient/auto-mesures');
console.log('  POST /patient/auto-mesures');
console.log('  GET  /patient/auto-mesures/1');
console.log('  PUT  /patient/auto-mesures/1');
console.log('  DELETE /patient/auto-mesures/1');
console.log('  GET  /patient/5/auto-mesures');
console.log('  GET  /patient/5/auto-mesures/stats');
console.log('  GET  /patient/5/auto-mesures/last/glycemie');

console.log('\n✅ Configuration des routes terminée');
