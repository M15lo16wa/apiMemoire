/**
 * Diagnostic en temps réel du serveur en cours d'exécution
 */

const http = require('http');

console.log('🔍 Diagnostic en temps réel du serveur\n');

// Test de l'endpoint auto-mesures
const testAutoMesures = () => {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/patient/5/auto-mesures',
        method: 'GET'
    };
    
    const req = http.request(options, (res) => {
        console.log(`📡 Auto-mesures - Status: ${res.statusCode}`);
        if (res.statusCode === 404) {
            console.log('  ❌ Route non trouvée');
        } else if (res.statusCode === 401) {
            console.log('  ✅ Route trouvée ! (401 = authentification requise)');
        } else {
            console.log(`  ✅ Route répond avec status: ${res.statusCode}`);
        }
    });
    
    req.on('error', (error) => {
        console.log(`  ❌ Erreur: ${error.message}`);
    });
    
    req.end();
};

// Test d'autres endpoints pour comparaison
const testOtherEndpoints = () => {
    const endpoints = [
        '/api/auth/login',
        '/api/patient',
        '/api/professionnelSante'
    ];
    
    endpoints.forEach(endpoint => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: endpoint,
            method: 'GET'
        };
        
        const req = http.request(options, (res) => {
            console.log(`📡 ${endpoint} - Status: ${res.statusCode}`);
        });
        
        req.on('error', (error) => {
            console.log(`📡 ${endpoint} - Erreur: ${error.message}`);
        });
        
        req.end();
    });
};

console.log('🧪 Test de l\'endpoint auto-mesures...');
testAutoMesures();

setTimeout(() => {
    console.log('\n🧪 Test d\'autres endpoints pour comparaison...');
    testOtherEndpoints();
}, 1000);
