/**
 * Test du flux de connexion avec 2FA en deux étapes
 */

const http = require('http');

console.log('🧪 Test du flux de connexion avec 2FA\n');

const PATIENT_CREDENTIALS = {
    numeroAssure: 'TEMP000005',
    password: 'passer123',
    name: 'MOLOWA ESSONGA'
};

console.log('👤 Patient à tester:');
console.log(`  Numéro d'assuré: ${PATIENT_CREDENTIALS.numeroAssure}`);
console.log(`  Mot de passe: ${PATIENT_CREDENTIALS.password}`);
console.log(`  Nom: ${PATIENT_CREDENTIALS.name}\n`);

// Test de connexion en deux étapes
const test2FALogin = () => {
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

        console.log('📡 Étape 1: Tentative de connexion initiale...');
        
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
                        console.log('📋 Réponse reçue:', response);
                        
                        if (response.status === 'requires2FA') {
                            console.log('✅ 2FA requise ! Le système fonctionne correctement.');
                            console.log('🔐 Le patient doit maintenant fournir son code 2FA.');
                            resolve({ requires2FA: true, patient: response.data.patient });
                        } else if (response.status === 'success') {
                            console.log('✅ Connexion réussie sans 2FA !');
                            console.log('🔑 Token reçu, connexion complète.');
                            resolve({ requires2FA: false, token: response.token });
                        } else {
                            console.log('⚠️  Réponse inattendue:', response);
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

// Test de connexion avec code 2FA (simulation)
const test2FAVerification = (patient) => {
    return new Promise((resolve) => {
        // Simuler un code 2FA (en réalité, l'utilisateur le saisirait)
        const twoFactorToken = '123456'; // Code fictif pour le test
        
        const postData = JSON.stringify({
            numero_assure: PATIENT_CREDENTIALS.numeroAssure,
            mot_de_passe: PATIENT_CREDENTIALS.password,
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

        console.log('\n📡 Étape 2: Tentative de connexion avec code 2FA...');
        console.log(`🔐 Code 2FA simulé: ${twoFactorToken}`);
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`📊 Status de vérification 2FA: ${res.statusCode}`);
                
                if (res.statusCode === 200) {
                    try {
                        const response = JSON.parse(data);
                        console.log('📋 Réponse 2FA:', response);
                        
                        if (response.status === 'success') {
                            console.log('✅ Connexion avec 2FA réussie !');
                            console.log('🔑 Token reçu après validation 2FA.');
                            resolve({ success: true, token: response.token });
                        } else if (response.status === 'requires2FA') {
                            console.log('⚠️  2FA toujours requise - code peut-être invalide');
                            resolve({ success: false, reason: '2FA still required' });
                        } else {
                            console.log('⚠️  Réponse inattendue:', response);
                            resolve({ success: false, reason: 'unexpected response' });
                        }
                    } catch (e) {
                        console.log('❌ Erreur parsing JSON:', e.message);
                        resolve({ success: false, reason: 'parse error' });
                    }
                } else if (res.statusCode === 401) {
                    console.log('❌ Vérification 2FA échouée - Code invalide');
                    console.log('📋 Réponse:', data);
                    resolve({ success: false, reason: 'invalid 2FA code' });
                } else {
                    console.log(`❌ Erreur lors de la vérification 2FA - Status: ${res.statusCode}`);
                    console.log('📋 Réponse:', data);
                    resolve({ success: false, reason: 'verification error' });
                }
            });
        });

        req.on('error', (error) => {
            console.log(`❌ Erreur lors de la vérification 2FA: ${error.message}`);
            resolve({ success: false, reason: 'request error' });
        });

        req.write(postData);
        req.end();
    });
};

// Exécution des tests
const runTests = async () => {
    console.log('🚀 Démarrage des tests de connexion avec 2FA...\n');
    
    // Test 1: Connexion initiale
    const loginResult = await test2FALogin();
    
    if (!loginResult) {
        console.log('\n❌ Impossible de tester la 2FA - Connexion échouée');
        return;
    }
    
    if (loginResult.requires2FA) {
        console.log('\n🔐 2FA requise, test de la vérification...');
        
        // Test 2: Vérification 2FA
        const twoFAResult = await test2FAVerification(loginResult.patient);
        
        console.log('\n📊 Résumé des tests 2FA:');
        if (twoFAResult.success) {
            console.log('🎉 SUCCÈS: Le flux de connexion avec 2FA fonctionne parfaitement !');
            console.log('✅ Étape 1: Identifiants vérifiés');
            console.log('✅ Étape 2: 2FA validée');
            console.log('✅ Connexion complète avec token');
        } else {
            console.log('⚠️  PARTIEL: 2FA configurée mais vérification échouée');
            console.log(`   Raison: ${twoFAResult.reason}`);
        }
    } else {
        console.log('\n📊 Résumé des tests:');
        console.log('✅ Connexion réussie sans 2FA');
        console.log('ℹ️  Le patient n\'a pas activé la 2FA');
        console.log('🔐 Pour tester la 2FA, activez-la d\'abord pour ce patient');
    }
};

runTests();
