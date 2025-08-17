/**
 * Test simple de génération de QR code
 * Pour vérifier que TwoFactorService.generateQRCode fonctionne
 */

const TwoFactorService = require('./src/services/twoFactorService');

console.log('🧪 Test simple de génération de QR code\n');

const testQRCodeGeneration = async () => {
    try {
        console.log('🔐 Test de génération de secret 2FA...');
        const secret = TwoFactorService.generateSecret('test@example.com');
        console.log('✅ Secret généré:', secret);
        
        console.log('\n📱 Test de génération de QR code...');
        const qrCode = await TwoFactorService.generateQRCode('test@example.com', secret, 'Test Service');
        console.log('✅ QR code généré (longueur):', qrCode.length);
        console.log('✅ QR code commence par:', qrCode.substring(0, 50) + '...');
        
        console.log('\n🔑 Test de génération de codes de récupération...');
        const recoveryCodes = TwoFactorService.generateRecoveryCodes(3);
        console.log('✅ Codes de récupération générés:', recoveryCodes);
        
        console.log('\n🎉 Tous les tests ont réussi !');
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error.message);
        console.error('Stack:', error.stack);
    }
};

testQRCodeGeneration();
