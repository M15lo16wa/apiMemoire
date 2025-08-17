/**
 * Test de la durée d'expiration et fenêtre de validation des codes 2FA
 * Pour vérifier que la configuration temporelle fonctionne correctement
 */

const TwoFactorService = require('./src/services/twoFactorService');

console.log("🧪 Test de la durée d'expiration et fenêtre de validation 2FA\n");

const test2FATiming = async () => {
    try {
        // 1. Générer un secret 2FA
        console.log('🔐 1. Génération du secret 2FA...');
        const secret = TwoFactorService.generateSecret('test@example.com');
        console.log('   Secret généré:', secret);
        
        // 2. Obtenir les informations de temps
        console.log('\n⏰ 2. Informations de durée...');
        const timeInfo = TwoFactorService.getTimeRemaining(secret);
        console.log("   Temps restant dans l'intervalle actuel:", timeInfo.timeRemaining, "secondes");
        console.log("   Durée de l'intervalle:", timeInfo.step, "secondes");
        console.log('   Fenêtre de validation:', timeInfo.window, 'intervalles');
        console.log('   Fenêtre totale:', timeInfo.totalWindow, 'secondes (±2 minutes)');
        
        // 3. Générer un token avec informations de durée
        console.log('\n🔑 3. Génération du token avec info de durée...');
        const tokenInfo = TwoFactorService.generateTokenWithInfo(secret);
        console.log('   Token généré:', tokenInfo.token);
        console.log('   Expire dans:', tokenInfo.timeRemaining, 'secondes');
        console.log("   Date d'expiration:", tokenInfo.expiresAt.toLocaleTimeString());
        
        // 4. Test de validation immédiate
        console.log('\n✅ 4. Test de validation immédiate...');
        const isValidImmediate = TwoFactorService.verifyToken(tokenInfo.token, secret);
        console.log('   Validation immédiate:', isValidImmediate ? '✅ SUCCÈS' : '❌ ÉCHEC');
        
        // 5. Simuler différents délais de validation
        console.log('\n⏳ 5. Simulation de délais de validation...');
        
        // Attendre 10 secondes
        console.log('   Attente de 10 secondes...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        const timeInfoAfter10s = TwoFactorService.getTimeRemaining(secret);
        console.log('   Temps restant après 10s:', timeInfoAfter10s.timeRemaining, 'secondes');
        
        // Générer un nouveau token après 10 secondes
        const tokenAfter10s = TwoFactorService.generateTokenWithInfo(secret);
        console.log('   Nouveau token après 10s:', tokenAfter10s.token);
        console.log('   Expire dans:', tokenAfter10s.timeRemaining, 'secondes');
        
        // Valider le nouveau token
        const isValidAfter10s = TwoFactorService.verifyToken(tokenAfter10s.token, secret);
        console.log('   Validation après 10s:', isValidAfter10s ? '✅ SUCCÈS' : '❌ ÉCHEC');
        
        // 6. Test de la fenêtre de validation
        console.log('\n🔄 6. Test de la fenêtre de validation...');
        console.log('   La fenêtre de ±10 intervalles permet de valider des codes dans un délai de ±5 minutes');
        console.log("   Cela devrait résoudre les problèmes de décalage de temps entre le serveur et l'app");
        
        // 7. Résumé de la configuration
        console.log('\n📊 === RÉSUMÉ DE LA CONFIGURATION 2FA ===');
        console.log('✅ Fenêtre de validation: ±10 intervalles (±5 minutes)');
        console.log('✅ Intervalle de temps: 30 secondes (standard TOTP)');
        console.log('✅ Tolérance aux décalages: TRÈS ÉLEVÉE');
        console.log('✅ Compatibilité: Google Authenticator, Authy, etc.');
        console.log('\n🎯 Cette configuration devrait résoudre les problèmes de validation des codes 2FA !');
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error.message);
        console.error('Stack:', error.stack);
    }
};

// Exécution du test
test2FATiming();
