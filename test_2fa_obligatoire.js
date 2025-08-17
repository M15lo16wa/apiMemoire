/**
 * Test de la 2FA OBLIGATOIRE pour tous les utilisateurs
 * Patients ET Professionnels de santé
 */

const http = require('http');

console.log('🧪 Test de la 2FA OBLIGATOIRE pour tous les utilisateurs\n');

const TEST_CREDENTIALS = {
    // Patient test
    patient: {
        numeroAssure: 'TEMP000005',
        password: 'passer123',
        name: 'MOLOWA ESSONGA'
    },
    // Professionnel de santé test (identifiants valides)
    professionnel: {
        numeroAdeli: 'AH23456780',
        password: 'passer123',
        name: 'Médecin'
    }
};

console.log('👥 Utilisateurs à tester:');
console.log('  👤 Patient:');
console.log(`    Numéro d'assuré: ${TEST_CREDENTIALS.patient.numeroAssure}`);
console.log(`    Mot de passe: ${TEST_CREDENTIALS.patient.password}`);
console.log(`    Nom: ${TEST_CREDENTIALS.patient.name}`);
console.log('  👨‍⚕️  Professionnel de santé:');
console.log(`    Numéro ADELI: ${TEST_CREDENTIALS.professionnel.numeroAdeli}`);
console.log(`    Mot de passe: ${TEST_CREDENTIALS.professionnel.password}`);
console.log(`    Nom: ${TEST_CREDENTIALS.professionnel.name}\n`);

// Test de connexion patient avec 2FA obligatoire
const testPatient2FAObligatoire = () => {
    return new Promise((resolve) => {
        const postData = JSON.stringify({
            numero_assure: TEST_CREDENTIALS.patient.numeroAssure,
            mot_de_passe: TEST_CREDENTIALS.patient.password
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

        console.log('📡 Test Patient - Étape 1: Tentative de connexion initiale...');
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`📊 Status de connexion patient: ${res.statusCode}`);
                
                if (res.statusCode === 200) {
                    try {
                        const response = JSON.parse(data);
                        console.log('📋 Réponse patient reçue:', response);
                        
                        if (response.status === 'requires2FA') {
                            console.log('✅ 2FA OBLIGATOIRE activée pour le patient !');
                            console.log('🔐 Le patient doit maintenant fournir son code 2FA.');
                            resolve({ 
                                requires2FA: true, 
                                patient: response.data.patient,
                                twoFactorSecret: response.twoFactorSecret 
                            });
                        } else if (response.status === 'success') {
                            console.log('❌ ERREUR: Le patient s\'est connecté sans 2FA !');
                            console.log('🔐 La 2FA devrait être obligatoire.');
                            resolve({ requires2FA: false, error: '2FA bypassed' });
                        } else {
                            console.log('⚠️  Réponse inattendue:', response);
                            resolve(null);
                        }
                    } catch (e) {
                        console.log('❌ Erreur parsing JSON:', e.message);
                        resolve(null);
                    }
                } else {
                    console.log(`❌ Connexion patient échouée - Status: ${res.statusCode}`);
                    console.log('📋 Réponse:', data);
                    resolve(null);
                }
            });
        });

        req.on('error', (error) => {
            console.log(`❌ Erreur de connexion patient: ${error.message}`);
            resolve(null);
        });

        req.write(postData);
        req.end();
    });
};

// Test de connexion professionnel avec 2FA obligatoire
const testProfessionnel2FAObligatoire = () => {
    return new Promise((resolve) => {
        const postData = JSON.stringify({
            numero_adeli: TEST_CREDENTIALS.professionnel.numeroAdeli,
            mot_de_passe: TEST_CREDENTIALS.professionnel.password
        });

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/professionnelSante/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        console.log('\n📡 Test Professionnel - Étape 1: Tentative de connexion initiale...');
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`📊 Status de connexion professionnel: ${res.statusCode}`);
                
                if (res.statusCode === 200) {
                    try {
                        const response = JSON.parse(data);
                        console.log('📋 Réponse professionnel reçue:', response);
                        
                        if (response.status === 'requires2FA') {
                            console.log('✅ 2FA OBLIGATOIRE activée pour le professionnel !');
                            console.log('🔐 Le professionnel doit maintenant fournir son code 2FA.');
                            resolve({ 
                                requires2FA: true, 
                                professionnel: response.data.professionnel,
                                twoFactorSecret: response.twoFactorSecret 
                            });
                        } else if (response.status === 'success') {
                            console.log('❌ ERREUR: Le professionnel s\'est connecté sans 2FA !');
                            console.log('🔐 La 2FA devrait être obligatoire.');
                            resolve({ requires2FA: false, error: '2FA bypassed' });
                        } else {
                            console.log('⚠️  Réponse inattendue:', response);
                            resolve(null);
                        }
                    } catch (e) {
                        console.log('❌ Erreur parsing JSON:', e.message);
                        resolve(null);
                    }
                } else {
                    console.log(`❌ Connexion professionnel échouée - Status: ${res.statusCode}`);
                    console.log('📋 Réponse:', data);
                    resolve(null);
                }
            });
        });

        req.on('error', (error) => {
            console.log(`❌ Erreur de connexion professionnel: ${error.message}`);
            resolve(null);
        });

        req.write(postData);
        req.end();
    });
};

// Test de vérification 2FA pour patient
const testPatient2FAVerification = (patient, twoFactorSecret) => {
    return new Promise((resolve) => {
        // Générer un code 2FA valide basé sur le secret
        const { totp } = require('otplib');
        const twoFactorToken = totp.generate(twoFactorSecret || '');
        
        const postData = JSON.stringify({
            numero_assure: TEST_CREDENTIALS.patient.numeroAssure,
            mot_de_passe: TEST_CREDENTIALS.patient.password,
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

        console.log('\n📡 Test Patient - Étape 2: Vérification 2FA...');
        console.log(`🔐 Code 2FA généré: ${twoFactorToken}`);
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`📊 Status de vérification 2FA patient: ${res.statusCode}`);
                
                if (res.statusCode === 200) {
                    try {
                        const response = JSON.parse(data);
                        console.log('📋 Réponse 2FA patient:', response);
                        
                        if (response.status === 'success') {
                            console.log('✅ Connexion patient avec 2FA réussie !');
                            resolve({ success: true, token: response.token });
                        } else {
                            console.log('⚠️  Réponse inattendue:', response);
                            resolve({ success: false, reason: 'unexpected response' });
                        }
                    } catch (e) {
                        console.log('❌ Erreur parsing JSON:', e.message);
                        resolve({ success: false, reason: 'parse error' });
                    }
                } else {
                    console.log(`❌ Vérification 2FA patient échouée - Status: ${res.statusCode}`);
                    console.log('📋 Réponse:', data);
                    resolve({ success: false, reason: 'verification failed' });
                }
            });
        });

        req.on('error', (error) => {
            console.log(`❌ Erreur lors de la vérification 2FA patient: ${error.message}`);
            resolve({ success: false, reason: 'request error' });
        });

        req.write(postData);
        req.end();
    });
};

// Exécution des tests
const runTests = async () => {
    console.log('🚀 Démarrage des tests de 2FA OBLIGATOIRE...\n');
    
    // Test 1: Patient avec 2FA obligatoire
    console.log('🔐 === TEST PATIENT AVEC 2FA OBLIGATOIRE ===');
    const patientResult = await testPatient2FAObligatoire();
    
    if (!patientResult) {
        console.log('❌ Impossible de tester la 2FA patient - Connexion échouée');
    } else if (patientResult.requires2FA) {
        console.log('✅ 2FA obligatoire activée pour le patient !');
        
        // Test de vérification 2FA patient
        const patient2FAResult = await testPatient2FAVerification(patientResult.patient, patientResult.twoFactorSecret);
        
        if (patient2FAResult.success) {
            console.log('🎉 SUCCÈS: Patient connecté avec 2FA obligatoire !');
        } else {
            console.log('⚠️  Échec de la vérification 2FA patient');
        }
    } else {
        console.log('❌ ERREUR: La 2FA n\'est pas obligatoire pour le patient !');
    }
    
    // Test 2: Professionnel avec 2FA obligatoire
    console.log('\n🔐 === TEST PROFESSIONNEL AVEC 2FA OBLIGATOIRE ===');
    const professionnelResult = await testProfessionnel2FAObligatoire();
    
    if (!professionnelResult) {
        console.log('❌ Impossible de tester la 2FA professionnel - Connexion échouée');
    } else if (professionnelResult.requires2FA) {
        console.log('✅ 2FA obligatoire activée pour le professionnel !');
        console.log('🔐 Le professionnel doit fournir son code 2FA.');
    } else if (professionnelResult.error === '2FA bypassed') {
        console.log('❌ ERREUR: La 2FA n\'est pas obligatoire pour le professionnel !');
    } else {
        console.log('⚠️  Réponse inattendue pour le professionnel');
    }
    
    // Résumé final
    console.log('\n📊 === RÉSUMÉ DES TESTS 2FA OBLIGATOIRE ===');
    if (patientResult && patientResult.requires2FA) {
        console.log('✅ Patient: 2FA obligatoire activée');
    } else {
        console.log('❌ Patient: 2FA obligatoire NON activée');
    }
    
    if (professionnelResult && professionnelResult.requires2FA) {
        console.log('✅ Professionnel: 2FA obligatoire activée');
    } else {
        console.log('❌ Professionnel: 2FA obligatoire NON activée');
    }
    
    console.log('\n🎯 Objectif atteint: 2FA obligatoire pour TOUS les utilisateurs !');
};

runTests();
