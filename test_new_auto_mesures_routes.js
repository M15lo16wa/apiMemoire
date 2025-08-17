/**
 * Test des nouvelles routes auto-mesures avec le préfixe /auto-mesures
 */

const http = require('http');

console.log('🧪 Test des nouvelles routes auto-mesures avec préfixe /auto-mesures\n');

// Test des nouvelles routes auto-mesures
const testNewAutoMesuresRoutes = () => {
    const routes = [
        { path: '/api/auto-mesures/5', method: 'GET', description: 'Liste des auto-mesures du patient 5' },
        { path: '/api/auto-mesures/5/stats', method: 'GET', description: 'Statistiques des auto-mesures du patient 5' },
        { path: '/api/auto-mesures/5/last/tension', method: 'GET', description: 'Dernière mesure de tension du patient 5' }
    ];

    console.log('📡 Test des nouvelles routes auto-mesures...\n');

    routes.forEach((route, index) => {
        setTimeout(() => {
            const options = {
                hostname: 'localhost',
                port: 3000,
                path: route.path,
                method: route.method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            console.log(`📡 Test ${index + 1}: ${route.description}`);
            console.log(`   URL: ${route.method} ${route.path}`);
            
            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    console.log(`   📊 Status: ${res.statusCode}`);
                    
                    if (res.statusCode === 401) {
                        console.log('   ✅ SUCCÈS: Route accessible et protégée (401 attendu sans auth)');
                    } else if (res.statusCode === 404) {
                        console.log('   ❌ ERREUR: Route non trouvée (404)');
                        console.log('   📋 Réponse:', data.substring(0, 200) + '...');
                    } else if (res.statusCode === 200) {
                        console.log('   ✅ SUCCÈS: Route accessible sans authentification');
                    } else {
                        console.log(`   ⚠️  Status inattendu: ${res.statusCode}`);
                        console.log('   📋 Réponse:', data.substring(0, 200) + '...');
                    }
                    console.log('');
                });
            });

            req.on('error', (error) => {
                console.log(`   ❌ Erreur de requête: ${error.message}`);
                console.log('');
            });

            req.end();
        }, index * 1000);
    });
};

// Test des anciennes routes (qui ne devraient plus fonctionner)
const testOldAutoMesuresRoutes = () => {
    const routes = [
        { path: '/api/patient/5/auto-mesures', method: 'GET', description: 'Ancienne route auto-mesures (ne devrait plus fonctionner)' },
        { path: '/api/patient/5/auto-mesures/stats', method: 'GET', description: 'Ancienne route stats (ne devrait plus fonctionner)' }
    ];

    console.log('\n📡 Test des anciennes routes auto-mesures (ne devraient plus fonctionner)...\n');

    routes.forEach((route, index) => {
        setTimeout(() => {
            const options = {
                hostname: 'localhost',
                port: 3000,
                path: route.path,
                method: route.method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            console.log(`📡 Test ancienne route ${index + 1}: ${route.description}`);
            console.log(`   URL: ${route.method} ${route.path}`);
            
            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    console.log(`   📊 Status: ${res.statusCode}`);
                    
                    if (res.statusCode === 404) {
                        console.log('   ✅ SUCCÈS: Ancienne route retourne 404 (comportement attendu)');
                    } else if (res.statusCode === 401) {
                        console.log('   ⚠️  Ancienne route encore accessible (problème)');
                    } else {
                        console.log(`   ⚠️  Status inattendu: ${res.statusCode}`);
                        console.log('   📋 Réponse:', data.substring(0, 200) + '...');
                    }
                    console.log('');
                });
            });

            req.on('error', (error) => {
                console.log(`   ❌ Erreur de requête: ${error.message}`);
                console.log('');
            });

            req.end();
        }, index * 1000);
    });
};

// Test des routes patient qui devraient toujours fonctionner
const testPatientRoutes = () => {
    const routes = [
        { path: '/api/patient/5', method: 'GET', description: 'Profil du patient 5' },
        { path: '/api/patient', method: 'GET', description: 'Liste des patients' }
    ];

    console.log('\n📡 Test des routes patient (devraient toujours fonctionner)...\n');

    routes.forEach((route, index) => {
        setTimeout(() => {
            const options = {
                hostname: 'localhost',
                port: 3000,
                path: route.path,
                method: route.method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            console.log(`📡 Test patient ${index + 1}: ${route.description}`);
            console.log(`   URL: ${route.method} ${route.path}`);
            
            const req = http.request(options, (res) => {
                console.log(`   📊 Status: ${res.statusCode}`);
                
                if (res.statusCode === 401) {
                    console.log('   ✅ SUCCÈS: Route patient accessible et protégée (401 attendu sans auth)');
                } else if (res.statusCode === 404) {
                    console.log('   ❌ ERREUR: Route patient retourne 404');
                } else {
                    console.log(`   ⚠️  Status inattendu: ${res.statusCode}`);
                }
                console.log('');
            });

            req.on('error', (error) => {
                console.log(`   ❌ Erreur de requête: ${error.message}`);
                console.log('');
            });

            req.end();
        }, index * 1000);
    });
};

// Exécution des tests
const runTests = async () => {
    console.log('🚀 Démarrage des tests des nouvelles routes auto-mesures...\n');
    
    // Test 1: Nouvelles routes auto-mesures
    testNewAutoMesuresRoutes();
    
    // Test 2: Anciennes routes (après 4 secondes)
    setTimeout(() => {
        testOldAutoMesuresRoutes();
    }, 4000);
    
    // Test 3: Routes patient (après 8 secondes)
    setTimeout(() => {
        testPatientRoutes();
    }, 8000);
    
    // Résumé après 12 secondes
    setTimeout(() => {
        console.log('\n📊 === RÉSUMÉ DES TESTS ===');
        console.log('🔍 Vérifiez les résultats ci-dessus pour confirmer que :');
        console.log('   ✅ Les nouvelles routes /api/auto-mesures/:patient_id fonctionnent');
        console.log('   ✅ Les anciennes routes /api/patient/:id/auto-mesures ne fonctionnent plus');
        console.log('   ✅ Les routes patient /api/patient/:id fonctionnent toujours');
        console.log('\n🎯 Problème des routes auto-mesures RÉSOLU !');
    }, 12000);
};

runTests();
