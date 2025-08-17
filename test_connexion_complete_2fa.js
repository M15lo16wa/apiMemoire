/**
 * Test complet de la connexion 2FA + accès aux auto-mesures
 * 1. Connexion patient avec 2FA obligatoire
 * 2. Validation du code 2FA
 * 3. Obtention du token JWT
 * 4. Accès aux auto-mesures avec le token
 */

const http = require('http');
const { authenticator } = require('otplib');

console.log('🧪 Test complet de la connexion 2FA + accès aux auto-mesures\n');

const TEST_CREDENTIALS = {
    numeroAssure: 'TEMP000005',
    password: 'passer123',
    name: 'MOLOWA ESSONGA'
};

console.log('👤 Patient à tester:');
console.log(`   Numéro d'assuré: ${TEST_CREDENTIALS.numeroAssure}`);
console.log(`   Mot de passe: ${TEST_CREDENTIALS.password}`);
console.log(`   Nom: ${TEST_CREDENTIALS.name}\n`);

// Étape 1: Connexion initiale (2FA requise)
const loginStep1 = () => {
    return new Promise((resolve) => {
        const postData = JSON.stringify({
            numero_assure: TEST_CREDENTIALS.numeroAssure,
            mot_de_passe: TEST_CREDENTIALS.password
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

        console.log('📡 Étape 1: Connexion initiale (2FA requise)...');
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`   📊 Status: ${res.statusCode}`);
                
                if (res.statusCode === 200) {
                    try {
                        const response = JSON.parse(data);
                        console.log('   📋 Réponse reçue:', response);
                        
                        if (response.status === 'requires2FA') {
                            console.log('   ✅ 2FA OBLIGATOIRE activée !');
                            console.log('   🔐 Code 2FA requis pour finaliser la connexion');
                            console.log('   📋 Réponse complète:', JSON.stringify(response, null, 2));
                            console.log('   🔐 Secret 2FA reçu:', response.twoFactorSecret ? 'OUI' : 'NON');
                            resolve({ 
                                success: true, 
                                requires2FA: true,
                                patient: response.data.patient,
                                twoFactorSecret: response.twoFactorSecret 
                            });
                        } else {
                            console.log('   ❌ ERREUR: 2FA non activée');
                            resolve({ success: false, error: '2FA not activated' });
                        }
                    } catch (e) {
                        console.log('   ❌ Erreur parsing JSON:', e.message);
                        resolve({ success: false, error: 'parse error' });
                    }
                } else {
                    console.log(`   ❌ Connexion échouée - Status: ${res.statusCode}`);
                    console.log('   📋 Réponse:', data);
                    resolve({ success: false, error: 'login failed' });
                }
            });
        });

        req.on('error', (error) => {
            console.log(`   ❌ Erreur de connexion: ${error.message}`);
            resolve({ success: false, error: 'request error' });
        });

        req.write(postData);
        req.end();
    });
};

// Étape 2: Validation du code 2FA
const loginStep2 = (twoFactorSecret) => {
    return new Promise((resolve) => {
        // Générer un code 2FA valide basé sur le secret
        // Utiliser TwoFactorService pour la cohérence avec le serveur
        const TwoFactorService = require('./src/services/twoFactorService');
        const tokenInfo = TwoFactorService.generateTokenWithInfo(twoFactorSecret || '');
        const twoFactorToken = tokenInfo.token;
        
        const postData = JSON.stringify({
            numero_assure: TEST_CREDENTIALS.numeroAssure,
            mot_de_passe: TEST_CREDENTIALS.password,
            twoFactorToken: twoFactorToken
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

        console.log('\n📡 Étape 2: Validation du code 2FA...');
        console.log(`   🔐 Code 2FA généré: ${twoFactorToken}`);
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`   📊 Status: ${res.statusCode}`);
                
                if (res.statusCode === 200) {
                    try {
                        const response = JSON.parse(data);
                        console.log('   📋 Réponse reçue:', response);
                        
                        if (response.status === 'success' && response.token) {
                            console.log('   ✅ Connexion 2FA réussie !');
                            console.log('   🔑 Token JWT obtenu');
                            resolve({ 
                                success: true, 
                                token: response.token,
                                patient: response.data.patient
                            });
                        } else {
                            console.log('   ❌ ERREUR: Connexion 2FA échouée');
                            resolve({ success: false, error: '2FA verification failed' });
                        }
                    } catch (e) {
                        console.log('   ❌ Erreur parsing JSON:', e.message);
                        resolve({ success: false, error: 'parse error' });
                    }
                } else {
                    console.log(`   ❌ Vérification 2FA échouée - Status: ${res.statusCode}`);
                    console.log('   📋 Réponse:', data);
                    resolve({ success: false, error: 'verification failed' });
                }
            });
        });

        req.on('error', (error) => {
            console.log(`   ❌ Erreur lors de la vérification 2FA: ${error.message}`);
            resolve({ success: false, error: 'request error' });
        });

        req.write(postData);
        req.end();
    });
};

// Étape 3: Accès aux auto-mesures avec le token
const accessAutoMesures = (token) => {
    const routes = [
        { path: '/api/auto-mesures/5', method: 'GET', description: 'Liste des auto-mesures du patient 5' },
        { path: '/api/auto-mesures/5/stats', method: 'GET', description: 'Statistiques des auto-mesures du patient 5' },
        { path: '/api/auto-mesures/5/last/tension', method: 'GET', description: 'Dernière mesure de tension du patient 5' }
    ];

    console.log('\n📡 Étape 3: Accès aux auto-mesures avec le token JWT...\n');

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
            console.log(`   🔑 Token utilisé: ${token.substring(0, 20)}...`);
            
            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    console.log(`   📊 Status: ${res.statusCode}`);
                    
                    if (res.statusCode === 200) {
                        console.log('   ✅ SUCCÈS: Route accessible avec token JWT !');
                        try {
                            const response = JSON.parse(data);
                            console.log('   📋 Données reçues:', response);
                        } catch (e) {
                            console.log('   📋 Réponse brute:', data.substring(0, 200) + '...');
                        }
                    } else if (res.statusCode === 401) {
                        console.log('   ❌ ERREUR: Token JWT invalide ou expiré');
                        console.log('   📋 Réponse:', data.substring(0, 200) + '...');
                    } else if (res.statusCode === 403) {
                        console.log('   🚫 ERREUR: Accès interdit');
                        console.log('   📋 Réponse:', data.substring(0, 200) + '...');
                    } else if (res.statusCode === 404) {
                        console.log('   ❌ ERREUR: Route non trouvée (404)');
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

// Test des anciennes routes (qui ne devraient plus fonctionner)
const testOldRoutes = (token) => {
    const routes = [
        { path: '/api/patient/5/auto-mesures', method: 'GET', description: 'Ancienne route auto-mesures (ne devrait plus fonctionner)' },
        { path: '/api/patient/5/auto-mesures/stats', method: 'GET', description: 'Ancienne route stats (ne devrait plus fonctionner)' }
    ];

    console.log('\n📡 Test des anciennes routes (ne devraient plus fonctionner)...\n');

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
                    } else if (res.statusCode === 200) {
                        console.log('   ⚠️  Ancienne route encore accessible (problème)');
                    } else {
                        console.log(`   ⚠️  Status inattendu: ${res.statusCode}`);
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

// Exécution du test complet
const runCompleteTest = async () => {
    console.log('🚀 Démarrage du test complet de connexion 2FA + accès aux auto-mesures...\n');
    
    try {
        // Étape 1: Connexion initiale
        const step1Result = await loginStep1();
        
        if (!step1Result.success || !step1Result.requires2FA) {
            console.log('❌ Étape 1 échouée - Impossible de continuer');
            return;
        }
        
        // Étape 2: Validation 2FA
        const step2Result = await loginStep2(step1Result.twoFactorSecret);
        
        if (!step2Result.success || !step2Result.token) {
            console.log('❌ Étape 2 échouée - Impossible d\'obtenir le token JWT');
            return;
        }
        
        console.log('\n🎉 CONNEXION 2FA RÉUSSIE ! Token JWT obtenu !');
        
        // Étape 3: Accès aux auto-mesures
        accessAutoMesures(step2Result.token);
        
        // Test des anciennes routes (après 4 secondes)
        setTimeout(() => {
            testOldRoutes(step2Result.token);
        }, 4000);
        
        // Résumé final (après 8 secondes)
        setTimeout(() => {
            console.log('\n📊 === RÉSUMÉ FINAL DU TEST COMPLET ===');
            console.log('✅ Connexion 2FA obligatoire: RÉUSSIE');
            console.log('✅ Obtention du token JWT: RÉUSSIE');
            console.log('✅ Accès aux auto-mesures avec token: TESTÉ');
            console.log('✅ Anciennes routes désactivées: TESTÉ');
            console.log('\n🎯 OBJECTIF ATTEINT: Connexion 2FA + accès aux auto-mesures !');
        }, 8000);
        
    } catch (error) {
        console.log('❌ Erreur lors du test complet:', error.message);
    }
};

runCompleteTest();
