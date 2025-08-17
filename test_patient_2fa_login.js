/**
 * Test de connexion du Patient 1 avec 2FA
 */

const http = require('http');

console.log('🧪 Test de connexion du Patient 1 avec 2FA\n');

const PATIENT_CREDENTIALS = {
    numeroAssure: 'TEMP000005',
    password: 'passer123',
    name: 'MOLOWA ESSONGA'
};

console.log('👤 Patient à tester:');
console.log(`  Numéro d'assuré: ${PATIENT_CREDENTIALS.numeroAssure}`);
console.log(`  Mot de passe: ${PATIENT_CREDENTIALS.password}`);
console.log(`  Nom: ${PATIENT_CREDENTIALS.name}\n`);

// Test de connexion initiale
const testLogin = () => {
    return new Promise((resolve) => {
        const postData = JSON.stringify({
            numero_assure: PATIENT_CREDENTIALS.numeroAssure,
            mot_de_passe: PATIENT_CREDENTIALS.password
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

        console.log('📡 Tentative de connexion...');
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`📊 Status de connexion: ${res.statusCode}`);
                
                if (res.statusCode === 200) {
                    try {
                        const response = JSON.parse(data);
                        console.log('✅ Connexion réussie !');
                        console.log('📋 Réponse:', response);
                        
                        if (response.token) {
                            console.log('🔑 Token reçu, test des routes protégées...');
                            resolve(response.token);
                        } else {
                            console.log('❌ Pas de token dans la réponse');
                            resolve(null);
                        }
                    } catch (e) {
                        console.log('❌ Erreur parsing JSON:', e.message);
                        resolve(null);
                    }
                } else if (res.statusCode === 401) {
                    console.log('❌ Connexion échouée - Identifiants invalides');
                    resolve(null);
                } else if (res.statusCode === 400) {
                    console.log('❌ Connexion échouée - Données invalides');
                    console.log('📋 Réponse:', data);
                    resolve(null);
                } else {
                    console.log(`❌ Connexion échouée - Status: ${res.statusCode}`);
                    console.log('📋 Réponse:', data);
                    resolve(null);
                }
            });
        });

        req.on('error', (error) => {
            console.log(`❌ Erreur de connexion: ${error.message}`);
            resolve(null);
        });

        req.write(postData);
        req.end();
    });
};

// Test des routes auto-mesures avec le token
const testAutoMesuresWithToken = (token) => {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/patient/5/auto-mesures',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        console.log('\n🔐 Test des routes auto-mesures avec authentification...');
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`📊 Status auto-mesures: ${res.statusCode}`);
                
                if (res.statusCode === 200) {
                    console.log('✅ Route auto-mesures accessible !');
                    try {
                        const response = JSON.parse(data);
                        console.log('📋 Données reçues:', response);
                    } catch (e) {
                        console.log('📋 Réponse brute:', data);
                    }
                } else if (res.statusCode === 401) {
                    console.log('❌ Route accessible mais authentification insuffisante');
                    console.log('📋 Réponse:', data);
                } else if (res.statusCode === 403) {
                    console.log('❌ Route accessible mais accès interdit');
                    console.log('📋 Réponse:', data);
                } else if (res.statusCode === 404) {
                    console.log('❌ Route auto-mesures toujours non trouvée');
                    console.log('📋 Réponse:', data);
                } else {
                    console.log(`⚠️  Route répond avec status: ${res.statusCode}`);
                    console.log('📋 Réponse:', data);
                }
                
                resolve(res.statusCode);
            });
        });

        req.on('error', (error) => {
            console.log(`❌ Erreur lors du test auto-mesures: ${error.message}`);
            resolve('ERROR');
        });

        req.end();
    });
};

// Test d'autres routes pour comparaison
const testOtherRoutes = (token) => {
    const routes = [
        '/api/patient',
        '/api/patient/5',
        '/api/auth/login'
    ];

    console.log('\n🔍 Test d\'autres routes pour comparaison...');
    
    routes.forEach(route => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: route,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            console.log(`📡 ${route} - Status: ${res.statusCode}`);
        });

        req.on('error', (error) => {
            console.log(`📡 ${route} - Erreur: ${error.message}`);
        });

        req.end();
    });
};

// Exécution des tests
const runTests = async () => {
    console.log('🚀 Démarrage des tests de connexion...\n');
    
    // Test 1: Connexion
    const token = await testLogin();
    
    if (token) {
        // Test 2: Routes auto-mesures avec token
        const autoMesuresStatus = await testAutoMesuresWithToken(token);
        
        // Test 3: Autres routes
        testOtherRoutes(token);
        
        console.log('\n📊 Résumé des tests:');
        if (autoMesuresStatus === 200) {
            console.log('🎉 SUCCÈS: Les routes auto-mesures fonctionnent après authentification !');
        } else if (autoMesuresStatus === 404) {
            console.log('❌ ÉCHEC: Les routes auto-mesures ne sont toujours pas trouvées');
            console.log('   Le problème n\'est pas lié à l\'authentification');
        } else {
            console.log(`⚠️  PARTIEL: Route accessible mais avec status ${autoMesuresStatus}`);
        }
    } else {
        console.log('\n❌ Impossible de tester les routes - Connexion échouée');
    }
};

runTests();
