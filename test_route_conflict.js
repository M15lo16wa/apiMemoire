/**
 * Test spécifique du conflit entre routes patient et auto-mesures
 */

const http = require('http');

console.log('🔍 Test du conflit entre routes patient et auto-mesures\n');

// Test 1: Route patient générique qui devrait fonctionner
const testPatientRoute = () => {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/patient/5',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        console.log('📡 Test 1: Route patient générique /api/patient/5');
        
        const req = http.request(options, (res) => {
            console.log(`   📊 Status: ${res.statusCode}`);
            
            if (res.statusCode === 401) {
                console.log('   ✅ SUCCÈS: Route patient accessible (401 attendu sans auth)');
                resolve(true);
            } else if (res.statusCode === 404) {
                console.log('   ❌ ERREUR: Route patient retourne 404');
                resolve(false);
            } else {
                console.log(`   ⚠️  Status inattendu: ${res.statusCode}`);
                resolve(false);
            }
        });

        req.on('error', (error) => {
            console.log(`   ❌ Erreur: ${error.message}`);
            resolve(false);
        });

        req.end();
    });
};

// Test 2: Route auto-mesures qui devrait fonctionner
const testAutoMesuresRoute = () => {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/patient/5/auto-mesures',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        console.log('\n📡 Test 2: Route auto-mesures /api/patient/5/auto-mesures');
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`   📊 Status: ${res.statusCode}`);
                
                if (res.statusCode === 401) {
                    console.log('   ✅ SUCCÈS: Route auto-mesures accessible (401 attendu sans auth)');
                    resolve(true);
                } else if (res.statusCode === 404) {
                    console.log('   ❌ ERREUR: Route auto-mesures retourne 404');
                    console.log('   📋 Réponse:', data.substring(0, 200) + '...');
                    resolve(false);
                } else {
                    console.log(`   ⚠️  Status inattendu: ${res.statusCode}`);
                    console.log('   📋 Réponse:', data.substring(0, 200) + '...');
                    resolve(false);
                }
            });
        });

        req.on('error', (error) => {
            console.log(`   ❌ Erreur: ${error.message}`);
            resolve(false);
        });

        req.end();
    });
};

// Test 3: Route auto-mesures avec un ID différent
const testAutoMesuresRouteDifferentId = () => {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/patient/999/auto-mesures',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        console.log('\n📡 Test 3: Route auto-mesures avec ID différent /api/patient/999/auto-mesures');
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`   📊 Status: ${res.statusCode}`);
                
                if (res.statusCode === 401) {
                    console.log('   ✅ SUCCÈS: Route auto-mesures accessible (401 attendu sans auth)');
                    resolve(true);
                } else if (res.statusCode === 404) {
                    console.log('   ❌ ERREUR: Route auto-mesures retourne 404');
                    console.log('   📋 Réponse:', data.substring(0, 200) + '...');
                    resolve(false);
                } else {
                    console.log(`   ⚠️  Status inattendu: ${res.statusCode}`);
                    console.log('   📋 Réponse:', data.substring(0, 200) + '...');
                    resolve(false);
                }
            });
        });

        req.on('error', (error) => {
            console.log(`   ❌ Erreur: ${error.message}`);
            resolve(false);
        });

        req.end();
    });
};

// Test 4: Route auto-mesures avec un chemin légèrement différent
const testAutoMesuresRouteDifferentPath = () => {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/patient/5/auto-mesures-test',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        console.log('\n📡 Test 4: Route auto-mesures avec chemin différent /api/patient/5/auto-mesures-test');
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`   📊 Status: ${res.statusCode}`);
                
                if (res.statusCode === 404) {
                    console.log('   ✅ SUCCÈS: Route inexistante retourne 404 (comportement normal)');
                    resolve(true);
                } else if (res.statusCode === 401) {
                    console.log('   ⚠️  Route existe mais protégée (401)');
                    resolve(true);
                } else {
                    console.log(`   ⚠️  Status inattendu: ${res.statusCode}`);
                    console.log('   📋 Réponse:', data.substring(0, 200) + '...');
                    resolve(false);
                }
            });
        });

        req.on('error', (error) => {
            console.log(`   ❌ Erreur: ${error.message}`);
            resolve(false);
        });

        req.end();
    });
};

// Exécution des tests
const runTests = async () => {
    console.log('🚀 Démarrage des tests de conflit de routes...\n');
    
    const results = [];
    
    // Test 1: Route patient générique
    results.push(await testPatientRoute());
    
    // Test 2: Route auto-mesures
    results.push(await testAutoMesuresRoute());
    
    // Test 3: Route auto-mesures avec ID différent
    results.push(await testAutoMesuresRouteDifferentId());
    
    // Test 4: Route auto-mesures avec chemin différent
    results.push(await testAutoMesuresRouteDifferentPath());
    
    // Résumé
    console.log('\n📊 === RÉSUMÉ DES TESTS ===');
    console.log(`✅ Route patient générique: ${results[0] ? 'FONCTIONNE' : 'ÉCHOUE'}`);
    console.log(`✅ Route auto-mesures: ${results[1] ? 'FONCTIONNE' : 'ÉCHOUE'}`);
    console.log(`✅ Route auto-mesures (ID diff): ${results[2] ? 'FONCTIONNE' : 'ÉCHOUE'}`);
    console.log(`✅ Route auto-mesures (chemin diff): ${results[3] ? 'FONCTIONNE' : 'ÉCHOUE'}`);
    
    if (results[0] && !results[1]) {
        console.log('\n🚨 PROBLÈME IDENTIFIÉ:');
        console.log('   - Les routes patient génériques fonctionnent');
        console.log('   - Les routes auto-mesures ne fonctionnent PAS');
        console.log('   - Le router patient capture toutes les requêtes /api/patient/:id');
        console.log('   - Les routes auto-mesures ne sont jamais atteintes');
    } else if (results[0] && results[1]) {
        console.log('\n🎉 SUCCÈS: Toutes les routes fonctionnent !');
    } else {
        console.log('\n⚠️  Problème général avec les routes patient');
    }
};

runTests();
