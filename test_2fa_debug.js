/**
 * Test de debug 2FA étape par étape
 * Pour identifier exactement où le problème se situe
 */

const http = require('http');

console.log('🧪 Test de debug 2FA étape par étape\n');

const TEST_CREDENTIALS = {
    numeroAssure: 'TEMP000005',
    password: 'passer123'
};

// Test étape 1: Connexion initiale
const testStep1 = () => {
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

        console.log('📡 Étape 1: Connexion initiale...');
        
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
                        console.log('   ✅ Connexion initiale réussie !');
                        console.log('   📋 Réponse complète:');
                        console.log(JSON.stringify(response, null, 2));
                        
                        if (response.twoFactorSecret) {
                            console.log('   🔐 Secret 2FA reçu:', response.twoFactorSecret);
                            resolve({ 
                                success: true, 
                                twoFactorSecret: response.twoFactorSecret,
                                response: response
                            });
                        } else {
                            console.log('   ❌ Secret 2FA manquant dans la réponse');
                            resolve({ success: false, error: 'no 2fa secret' });
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

// Test étape 2: Validation 2FA
const testStep2 = (twoFactorSecret) => {
    return new Promise((resolve) => {
        // Utiliser TwoFactorService pour la cohérence
        const TwoFactorService = require('./src/services/twoFactorService');
        const tokenInfo = TwoFactorService.generateTokenWithInfo(twoFactorSecret);
        const twoFactorToken = tokenInfo.token;
        
        console.log('\n📡 Étape 2: Validation 2FA...');
        console.log(`   🔐 Secret utilisé: ${twoFactorSecret}`);
        console.log(`   🔑 Code généré: ${twoFactorToken}`);
        console.log(`   ⏰ Expire dans: ${tokenInfo.timeRemaining} secondes`);
        
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
                        console.log('   ✅ Validation 2FA réussie !');
                        console.log('   📋 Réponse:', JSON.stringify(response, null, 2));
                        resolve({ success: true, response: response });
                    } catch (e) {
                        console.log('   ❌ Erreur parsing JSON:', e.message);
                        resolve({ success: false, error: 'parse error' });
                    }
                } else {
                    console.log(`   ❌ Validation 2FA échouée - Status: ${res.statusCode}`);
                    console.log('   📋 Réponse:', data);
                    resolve({ success: false, error: 'verification failed' });
                }
            });
        });

        req.on('error', (error) => {
            console.log(`   ❌ Erreur lors de la validation 2FA: ${error.message}`);
            resolve({ success: false, error: 'request error' });
        });

        req.write(postData);
        req.end();
    });
};

// Test complet
const runDebugTest = async () => {
    console.log('🚀 Démarrage du test de debug 2FA...\n');
    
    try {
        // Étape 1
        const step1Result = await testStep1();
        
        if (!step1Result.success) {
            console.log('❌ Étape 1 échouée - Impossible de continuer');
            return;
        }
        
        console.log('\n✅ Étape 1 réussie ! Secret 2FA obtenu.');
        
        // Étape 2
        const step2Result = await testStep2(step1Result.twoFactorSecret);
        
        if (step2Result.success) {
            console.log('\n🎉 SUCCÈS COMPLET ! Connexion 2FA réussie !');
        } else {
            console.log('\n❌ Étape 2 échouée - Problème de validation 2FA');
        }
        
    } catch (error) {
        console.log('❌ Erreur lors du test:', error.message);
    }
};

runDebugTest();
