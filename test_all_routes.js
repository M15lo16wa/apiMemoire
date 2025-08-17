/**
 * Test complet de toutes les routes du serveur
 */

const http = require('http');

console.log('🧪 Test complet de toutes les routes du serveur\n');

// Liste des endpoints à tester
const endpoints = [
    // Routes auto-mesures
    '/api/patient/5/auto-mesures',
    '/api/patient/5/auto-mesures/stats',
    '/api/patient/5/auto-mesures/last/glycemie',
    
    // Routes patient générales
    '/api/patient',
    '/api/patient/5',
    
    // Routes auth
    '/api/auth/login',
    '/api/auth/register',
    
    // Autres routes
    '/api/professionnelSante',
    '/api/hopital',
    '/api/service-sante',
    '/api/access',
    '/api/dossierMedical',
    '/api/consultation',
    '/api/rendez-vous',
    '/api/prescription',
    '/api/examen-labo',
    '/api/documents'
];

const testEndpoint = (endpoint) => {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: endpoint,
            method: 'GET'
        };
        
        const req = http.request(options, (res) => {
            let status = res.statusCode;
            let statusText = '';
            
            if (status === 404) {
                statusText = '❌ Route non trouvée';
            } else if (status === 401) {
                statusText = '✅ Route trouvée (auth requise)';
            } else if (status === 200) {
                statusText = '✅ Route trouvée et fonctionnelle';
            } else if (status === 405) {
                statusText = '✅ Route trouvée (méthode non autorisée)';
            } else {
                statusText = `✅ Route répond avec status: ${status}`;
            }
            
            resolve({ endpoint, status, statusText });
        });
        
        req.on('error', (error) => {
            resolve({ endpoint, status: 'ERROR', statusText: `❌ Erreur: ${error.message}` });
        });
        
        req.setTimeout(5000, () => {
            resolve({ endpoint, status: 'TIMEOUT', statusText: '⏰ Timeout' });
        });
        
        req.end();
    });
};

const runTests = async () => {
    console.log('📡 Test de tous les endpoints...\n');
    
    const results = [];
    
    for (const endpoint of endpoints) {
        const result = await testEndpoint(endpoint);
        results.push(result);
        
        console.log(`${result.statusText.padEnd(35)} ${endpoint}`);
        
        // Petite pause entre les tests
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n📊 Résumé des tests:');
    const working = results.filter(r => r.status !== 404 && r.status !== 'ERROR' && r.status !== 'TIMEOUT').length;
    const notFound = results.filter(r => r.status === 404).length;
    const errors = results.filter(r => r.status === 'ERROR' || r.status === 'TIMEOUT').length;
    
    console.log(`  ✅ Routes fonctionnelles: ${working}`);
    console.log(`  ❌ Routes non trouvées: ${notFound}`);
    console.log(`  ⚠️  Erreurs/Timeouts: ${errors}`);
    
    if (notFound > 0) {
        console.log('\n🔍 Routes non trouvées:');
        results.filter(r => r.status === 404).forEach(r => {
            console.log(`  - ${r.endpoint}`);
        });
    }
};

runTests();
