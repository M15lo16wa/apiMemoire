/**
 * Test d'affichage des informations 2FA (secret et QR code)
 * Pour visualiser le secret 2FA et générer le QR code
 */

const http = require('http');
const fs = require('fs');

console.log('🧪 Test d\'affichage des informations 2FA\n');

const TEST_CREDENTIALS = {
    numeroAssure: 'TEMP000005'
};

// Test d'affichage des informations 2FA
const show2FAInfo = () => {
    return new Promise((resolve) => {
        const postData = JSON.stringify({
            numero_assure: TEST_CREDENTIALS.numeroAssure
        });

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/patient/auth/2fa-info',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        console.log('📡 Récupération des informations 2FA...');
        console.log(`   Numéro d'assuré: ${TEST_CREDENTIALS.numeroAssure}`);
        
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
                        console.log('✅ Informations 2FA récupérées avec succès !\n');
                        
                        // Afficher les informations du patient
                        console.log('👤 Informations du patient:');
                        console.log(`   ID: ${response.data.patient.id_patient}`);
                        console.log(`   Nom: ${response.data.patient.nom} ${response.data.patient.prenom}`);
                        console.log(`   Numéro d'assuré: ${response.data.patient.numero_assure}\n`);
                        
                        // Afficher le secret 2FA
                        console.log('🔐 Secret 2FA:');
                        console.log(`   ${response.data.twoFactor.secret}\n`);
                        
                        // Afficher les codes de récupération
                        console.log('🔑 Codes de récupération:');
                        response.data.twoFactor.recoveryCodes.forEach((code, index) => {
                            console.log(`   ${index + 1}. ${code}`);
                        });
                        console.log('');
                        
                        // Afficher les instructions
                        console.log('📋 Instructions:');
                        response.data.twoFactor.instructions.forEach((instruction, index) => {
                            console.log(`   ${index + 1}. ${instruction}`);
                        });
                        console.log('');
                        
                        // Sauvegarder le QR code en fichier HTML pour visualisation
                        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>QR Code 2FA - ${response.data.patient.nom} ${response.data.patient.prenom}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .qr-section { text-align: center; margin: 30px 0; }
        .qr-code { max-width: 300px; border: 2px solid #ddd; border-radius: 8px; }
        .secret { background: #f8f9fa; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 16px; margin: 20px 0; }
        .recovery-codes { background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; }
        .instructions { background: #d1ecf1; padding: 15px; border-radius: 5px; border-left: 4px solid #17a2b8; }
        .warning { background: #f8d7da; padding: 15px; border-radius: 5px; border-left: 4px solid #dc3545; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Authentification 2FA</h1>
            <h2>${response.data.patient.nom} ${response.data.patient.prenom}</h2>
            <p>Numéro d'assuré: <strong>${response.data.patient.numero_assure}</strong></p>
        </div>
        
        <div class="qr-section">
            <h3>📱 QR Code à scanner</h3>
            <img src="${response.data.twoFactor.qrCode}" alt="QR Code 2FA" class="qr-code">
            <p><em>Scannez ce QR code avec votre application authenticator</em></p>
        </div>
        
        <div>
            <h3>🔑 Secret 2FA</h3>
            <div class="secret">${response.data.twoFactor.secret}</div>
            <p><em>Entrez manuellement ce secret dans votre app si le scan ne fonctionne pas</em></p>
        </div>
        
        <div class="recovery-codes">
            <h3>🔑 Codes de récupération</h3>
            <p><strong>Conservez ces codes en lieu sûr !</strong></p>
            <ul>
                ${response.data.twoFactor.recoveryCodes.map(code => `<li><code>${code}</code></li>`).join('')}
            </ul>
        </div>
        
        <div class="instructions">
            <h3>📋 Instructions d'utilisation</h3>
            <ol>
                ${response.data.twoFactor.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
            </ol>
        </div>
        
        <div class="warning">
            <h3>⚠️ Important</h3>
            <p>• Ne partagez jamais votre secret 2FA ou vos codes de récupération</p>
            <p>• Utilisez une application authenticator sécurisée (Google Authenticator, Authy, etc.)</p>
            <p>• Conservez vos codes de récupération en lieu sûr</p>
        </div>
    </div>
</body>
</html>`;
                        
                        const filename = `qr_code_2fa_${response.data.patient.numero_assure}.html`;
                        fs.writeFileSync(filename, htmlContent);
                        console.log(`💾 QR code sauvegardé dans: ${filename}`);
                        console.log(`🌐 Ouvrez ce fichier dans votre navigateur pour voir le QR code !\n`);
                        
                        resolve({ 
                            success: true, 
                            secret: response.data.twoFactor.secret,
                            qrCode: response.data.twoFactor.qrCode,
                            recoveryCodes: response.data.twoFactor.recoveryCodes,
                            filename: filename
                        });
                        
                    } catch (e) {
                        console.log('❌ Erreur parsing JSON:', e.message);
                        resolve({ success: false, error: 'parse error' });
                    }
                } else {
                    console.log(`❌ Erreur - Status: ${res.statusCode}`);
                    console.log('📋 Réponse:', data);
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

// Exécution du test
const runTest = async () => {
    console.log('🚀 Démarrage du test d\'affichage des informations 2FA...\n');
    
    const result = await show2FAInfo();
    
    if (result.success) {
        console.log('🎉 SUCCÈS: Informations 2FA récupérées !');
        console.log(`🔐 Secret 2FA: ${result.secret}`);
        console.log(`💾 Fichier HTML créé: ${result.filename}`);
        console.log('\n📱 Prochaines étapes:');
        console.log('1. Ouvrez le fichier HTML dans votre navigateur');
        console.log('2. Scannez le QR code avec votre app authenticator');
        console.log('3. Utilisez le code 6 chiffres pour finaliser la connexion');
    } else {
        console.log('❌ Échec de la récupération des informations 2FA');
        console.log('💡 Vérifiez que le serveur est démarré et que le patient existe');
    }
};

runTest();
