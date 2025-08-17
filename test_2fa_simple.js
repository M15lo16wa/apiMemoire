/**
 * Test simple de la 2FA avec un code fixe
 * Pour débloquer et vérifier le fonctionnement
 */

const http = require('http');

console.log('🧪 Test simple de la 2FA avec code fixe\n');

const TEST_CREDENTIALS = {
    numeroAssure: 'TEMP000005',
    password: 'passer123'
};

// Test avec un code 2FA fixe (123456)
const test2FAWithFixedCode = () => {
    return new Promise((resolve) => {
        const postData = JSON.stringify({
            numero_assure: TEST_CREDENTIALS.numeroAssure,
            mot_de_passe: TEST_CREDENTIALS.password,
            twoFactorToken: '123456' // Code fixe pour test
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

        console.log('📡 Test 2FA avec code fixe: 123456');
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`📊 Status: ${res.statusCode}`);
                console.log('📋 Réponse:', data);
                
                if (res.statusCode === 200) {
                    console.log('✅ SUCCÈS: Connexion 2FA réussie !');
                    resolve({ success: true, data: data });
                } else if (res.statusCode === 401) {
                    console.log('❌ ERREUR: Code 2FA invalide');
                    resolve({ success: false, status: res.statusCode, data: data });
                } else {
                    console.log(`⚠️  Status inattendu: ${res.statusCode}`);
                    resolve({ success: false, status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', (error) => {
            console.log(`❌ Erreur de requête: ${error.message}`);
            resolve({ success: false, error: error.message });
        });

        req.write(postData);
        req.end();
    });
};

// Test de connexion initiale (sans 2FA)
const testInitialLogin = () => {
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

        console.log('📡 Test connexion initiale (sans 2FA)...');
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`📊 Status: ${res.statusCode}`);
                
                if (res.statusCode === 200) {
                    try {
                        const response = JSON.parse(data);
                        if (response.status === 'requires2FA') {
                            console.log('✅ 2FA OBLIGATOIRE activée !');
                            console.log(`🔐 Secret 2FA: ${response.twoFactorSecret}`);
                            resolve({ success: true, requires2FA: true, secret: response.twoFactorSecret });
                        } else {
                            console.log('⚠️  Réponse inattendue:', response);
                            resolve({ success: false });
                        }
                    } catch (e) {
                        console.log('❌ Erreur parsing JSON:', e.message);
                        resolve({ success: false });
                    }
                } else {
                    console.log(`❌ Connexion échouée - Status: ${res.statusCode}`);
                    resolve({ success: false, status: res.statusCode });
                }
            });
        });

        req.on('error', (error) => {
            console.log(`❌ Erreur de connexion: ${error.message}`);
            resolve({ success: false, error: error.message });
        });

        req.write(postData);
        req.end();
    });
};

// Exécution des tests
const runTests = async () => {
    console.log('🚀 Démarrage des tests 2FA simples...\n');
    
    // Test 1: Connexion initiale
    console.log('=== TEST 1: Connexion initiale ===');
    const initialResult = await testInitialLogin();
    
    if (initialResult.success && initialResult.requires2FA) {
        console.log('\n=== TEST 2: 2FA avec code fixe ===');
        const twoFAResult = await test2FAWithFixedCode();
        
        console.log('\n📊 === RÉSUMÉ DES TESTS ===');
        console.log(`✅ Connexion initiale: ${initialResult.success ? 'RÉUSSIE' : 'ÉCHOUÉE'}`);
        console.log(`✅ 2FA avec code fixe: ${twoFAResult.success ? 'RÉUSSIE' : 'ÉCHOUÉE'}`);
        
        if (twoFAResult.success) {
            console.log('\n🎉 SUCCÈS: La 2FA fonctionne avec un code fixe !');
        } else {
            console.log('\n⚠️  La 2FA ne fonctionne pas même avec un code fixe');
            console.log('💡 Vérifiez la logique de vérification dans le service');
        }
    } else {
        console.log('❌ Impossible de tester la 2FA - Connexion initiale échouée');
    }
};

runTests();
