/**
 * Test des routes auto-mesures après redémarrage du serveur
 */

const http = require('http');

console.log('🧪 Test des routes auto-mesures après redémarrage\n');

// Configuration de la requête
const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/patient/5/auto-mesures',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
};

console.log(`📡 Test de l'endpoint: ${options.method} ${options.hostname}:${options.port}${options.path}`);

// Effectuer la requête
const req = http.request(options, (res) => {
    console.log(`📊 Status: ${res.statusCode}`);
    console.log(`📋 Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log(`📦 Response:`, data);
        
        if (res.statusCode === 404) {
            console.log('\n❌ L\'endpoint retourne toujours 404');
            console.log('   Le serveur n\'a peut-être pas pris en compte les modifications');
        } else if (res.statusCode === 401) {
            console.log('\n✅ L\'endpoint est trouvé ! (401 = authentification requise)');
            console.log('   Les routes auto-mesures fonctionnent maintenant !');
        } else {
            console.log('\n✅ L\'endpoint répond avec le status:', res.statusCode);
        }
    });
});

req.on('error', (error) => {
    console.log(`❌ Erreur de connexion: ${error.message}`);
    console.log('   Vérifiez que le serveur est bien démarré sur le port 3000');
});

req.end();
