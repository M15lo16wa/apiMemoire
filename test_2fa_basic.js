const TwoFactorService = require('./src/services/twoFactorService');

console.log('🧪 Test du service 2FA de base...\n');

// Test 1: Génération de secret
console.log('1️⃣ Test de génération de secret...');
const secret = TwoFactorService.generateSecret('test@example.com');
console.log('✅ Secret généré:', secret);
console.log('✅ Secret valide:', TwoFactorService.isValidSecret(secret));
console.log('');

// Test 2: Génération de QR code
console.log('2️⃣ Test de génération de QR code...');
TwoFactorService.generateQRCode('test@example.com', secret, 'Test Platform')
  .then(qrCode => {
    console.log('✅ QR code généré (base64):', qrCode.substring(0, 50) + '...');
    console.log('');
    
    // Test 3: Génération de token TOTP
    console.log('3️⃣ Test de génération de token TOTP...');
    const { totp } = require('otplib');
    const token = totp.generate(secret);
    console.log('✅ Token TOTP généré:', token);
    console.log('');
    
    // Test 4: Vérification de token
    console.log('4️⃣ Test de vérification de token...');
    const isValid = TwoFactorService.verifyToken(token, secret);
    console.log('✅ Token valide:', isValid);
    console.log('');
    
    // Test 5: Génération de codes de récupération
    console.log('5️⃣ Test de génération de codes de récupération...');
    const recoveryCodes = TwoFactorService.generateRecoveryCodes(3);
    console.log('✅ Codes de récupération générés:', recoveryCodes);
    console.log('');
    
    // Test 6: Vérification de code de récupération
    console.log('6️⃣ Test de vérification de code de récupération...');
    const testCode = recoveryCodes[0];
    const verification = TwoFactorService.verifyRecoveryCode(testCode, recoveryCodes);
    console.log('✅ Code de récupération valide:', verification.isValid);
    console.log('✅ Code utilisé:', verification.usedCode);
    console.log('✅ Index:', verification.index);
    console.log('');
    
    console.log('🎉 Tous les tests 2FA de base sont passés avec succès !');
  })
  .catch(error => {
    console.error('❌ Erreur lors du test:', error.message);
  });
