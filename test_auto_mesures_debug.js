/**
 * Test de diagnostic des routes auto-mesures
 * Pour identifier pourquoi elles retournent 404
 */

const http = require('http');

console.log('🔍 Diagnostic des routes auto-mesures\n');

// Test de connexion patient d'abord pour obtenir un token
const loginPatient = () => {
    return new Promise((resolve) => {
        const postData = JSON.stringify({
            numero_assure: 'TEMP000005',
            mot_de_passe: 'passer123'
        });

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/patient/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        console.log('📡 Connexion patient pour obtenir un token...');
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const response = JSON.parse(data);
                        if (response.status === 'requires2FA') {
                            console.log('✅ Connexion patient réussie (2FA requise)');
                            resolve({ success: true, requires2FA: true });
                        } else if (response.status === 'success') {
                            console.log('✅ Connexion patient réussie avec token');
                            resolve({ success: true, token: response.token });
                        }
                    } catch (e) {
                        console.log('❌ Erreur parsing JSON:', e.message);
                        resolve({ success: false });
                    }
                } else {
                    console.log(`❌ Connexion patient échouée - Status: ${res.statusCode}`);
                    resolve({ success: false });
                }
            });
        });

        req.on('error', (error) => {
            console.log(`❌ Erreur de connexion: ${error.message}`);
            resolve({ success: false });
        });

        req.write(postData);
        req.end();
    });
};

// Test des routes auto-mesures avec token
const testAutoMesuresRoutes = (token) => {
    const routes = [
        { path: '/api/patient/5/auto-mesures', method: 'GET', description: 'Liste des auto-mesures du patient 5' },
        { path: '/api/patient/5/auto-mesures/stats', method: 'GET', description: 'Statistiques des auto-mesures du patient 5' },
        { path: '/api/patient/5/auto-mesures/last/tension', method: 'GET', description: 'Dernière mesure de tension du patient 5' }
    ];

    console.log('\n🔍 Test des routes auto-mesures avec authentification...\n');

    routes.forEach((route, index) => {
        setTimeout(() => {
            const options = {
                hostname: 'localhost',
                port: 3000,
                path: route.path,
                method: route.method,
                headers: {
                    'Authorization': `Bearer ${token}`,
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
                    
                    if (res.statusCode === 200) {
                        console.log('   ✅ SUCCÈS: Route accessible');
                    } else if (res.statusCode === 401) {
                        console.log('   🔐 ERREUR: Non autorisé (token invalide)');
                    } else if (res.statusCode === 403) {
                        console.log('   🚫 ERREUR: Accès interdit');
                    } else if (res.statusCode === 404) {
                        console.log('   ❌ ERREUR: Route non trouvée (404)');
                        console.log('   📋 Réponse:', data.substring(0, 200) + '...');
                    } else {
                        console.log(`   ⚠️  ERREUR: Status inattendu ${res.statusCode}`);
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
        }, index * 1000); // Délai de 1 seconde entre chaque test
    });
};

// Test des routes auto-mesures SANS token (pour voir si c'est un problème d'auth)
const testAutoMesuresRoutesWithoutAuth = () => {
    const routes = [
        { path: '/api/patient/5/auto-mesures', method: 'GET', description: 'Liste des auto-mesures du patient 5 (sans auth)' },
        { path: '/api/patient/5/auto-mesures/stats', method: 'GET', description: 'Statistiques des auto-mesures du patient 5 (sans auth)' }
    ];

    console.log('\n🔍 Test des routes auto-mesures SANS authentification...\n');

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

            console.log(`📡 Test sans auth ${index + 1}: ${route.description}`);
            console.log(`   URL: ${route.method} ${route.path}`);
            
            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    console.log(`   📊 Status: ${res.statusCode}`);
                    
                    if (res.statusCode === 401) {
                        console.log('   🔐 SUCCÈS: Route protégée (401 attendu)');
                    } else if (res.statusCode === 404) {
                        console.log('   ❌ PROBLÈME: Route non trouvée même sans auth');
                        console.log('   📋 Réponse:', data.substring(0, 200) + '...');
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

// Test de vérification des routes montées
const testRoutesMounted = () => {
    console.log('\n🔍 Vérification des routes montées dans l\'application...\n');
    
    // Test des routes qui devraient fonctionner
    const workingRoutes = [
        { path: '/api/patient/5', method: 'GET', description: 'Profil du patient 5' },
        { path: '/api/patient', method: 'GET', description: 'Liste des patients' },
        { path: '/api/professionnelSante', method: 'GET', description: 'Liste des professionnels' }
    ];

    workingRoutes.forEach((route, index) => {
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

            console.log(`📡 Test route fonctionnelle ${index + 1}: ${route.description}`);
            console.log(`   URL: ${route.method} ${route.path}`);
            
            const req = http.request(options, (res) => {
                console.log(`   📊 Status: ${res.statusCode}`);
                
                if (res.statusCode === 200 || res.statusCode === 401) {
                    console.log('   ✅ SUCCÈS: Route accessible (200 ou 401 attendu)');
                } else if (res.statusCode === 404) {
                    console.log('   ❌ PROBLÈME: Route fonctionnelle retourne 404');
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
const runDiagnostic = async () => {
    console.log('🚀 Démarrage du diagnostic des routes auto-mesures...\n');
    
    // Test 1: Connexion patient
    const loginResult = await loginPatient();
    
    if (loginResult.success && loginResult.token) {
        console.log('🔑 Token obtenu, test des routes avec authentification...');
        testAutoMesuresRoutes(loginResult.token);
    } else if (loginResult.success && loginResult.requires2FA) {
        console.log('🔐 2FA requise, test des routes sans authentification...');
        testAutoMesuresRoutesWithoutAuth();
    } else {
        console.log('❌ Impossible de se connecter, test des routes sans authentification...');
        testAutoMesuresRoutesWithoutAuth();
    }
    
    // Test 2: Vérification des routes montées
    setTimeout(() => {
        testRoutesMounted();
    }, 5000);
    
    // Résumé après 10 secondes
    setTimeout(() => {
        console.log('\n📊 === RÉSUMÉ DU DIAGNOSTIC ===');
        console.log('🔍 Vérifiez les résultats ci-dessus pour identifier le problème.');
        console.log('💡 Problèmes possibles:');
        console.log('   - Routes mal montées dans api.js');
        console.log('   - Middleware d\'authentification bloquant');
        console.log('   - Erreur dans le contrôleur auto-mesures');
        console.log('   - Problème de chargement des modules');
    }, 10000);
};

runDiagnostic();
