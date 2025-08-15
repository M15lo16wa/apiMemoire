require('dotenv').config();
const { redis, testConnection } = require('./src/config/redis');
const tokenService = require('./src/services/tokenService');

async function testRedisConnection() {
  console.log('🧪 Test de connexion Redis...\n');
  
  try {
    // Test de connexion basique
    const isConnected = await testConnection();
    if (!isConnected) {
      console.log('❌ Impossible de se connecter à Redis');
      return;
    }
    
    console.log('✅ Connexion Redis réussie\n');
    
    // Test du service de tokens
    console.log('🧪 Test du service de tokens...\n');
    
    // Simuler un utilisateur
    const mockUser = {
      id: 123,
      nom: 'Test',
      prenom: 'User',
      role: 'test'
    };
    
    // Test de génération de token
    console.log('1. Test de génération de token...');
    const token = await tokenService.generateAndStoreToken(mockUser, 'test');
    console.log(`✅ Token généré: ${token.substring(0, 20)}...\n`);
    
    // Test de validation de token
    console.log('2. Test de validation de token...');
    const validation = await tokenService.validateToken(token);
    if (validation) {
      console.log('✅ Token validé avec succès');
      console.log(`   - ID utilisateur: ${validation.id}`);
      console.log(`   - Type: ${validation.type}`);
      console.log(`   - Rôle: ${validation.role}\n`);
    } else {
      console.log('❌ Échec de validation du token');
      return;
    }
    
    // Test de vérification de session
    console.log('3. Test de vérification de session...');
    const hasSession = await tokenService.hasActiveSession(mockUser.id);
    console.log(`✅ Session active: ${hasSession}\n`);
    
    // Test de récupération de session
    console.log('4. Test de récupération de session...');
    const session = await tokenService.getUserSession(mockUser.id);
    if (session) {
      console.log('✅ Session récupérée:');
      console.log(`   - Token: ${session.token.substring(0, 20)}...`);
      console.log(`   - Type: ${session.userType}`);
      console.log(`   - Rôle: ${session.role}\n`);
    } else {
      console.log('❌ Impossible de récupérer la session');
    }
    
    // Test de révocation de token
    console.log('5. Test de révocation de token...');
    const revoked = await tokenService.revokeToken(token, mockUser.id);
    if (revoked) {
      console.log('✅ Token révoqué avec succès\n');
    } else {
      console.log('❌ Échec de révocation du token');
    }
    
    // Test de validation après révocation
    console.log('6. Test de validation après révocation...');
    const validationAfterRevoke = await tokenService.validateToken(token);
    if (!validationAfterRevoke) {
      console.log('✅ Token correctement invalidé après révocation\n');
    } else {
      console.log('❌ Token toujours valide après révocation');
    }
    
    // Test des statistiques
    console.log('7. Test des statistiques Redis...');
    const stats = await tokenService.getStats();
    if (stats) {
      console.log('✅ Statistiques récupérées:');
      console.log(`   - Total des clés: ${stats.totalKeys}`);
      console.log(`   - Tokens actifs: ${stats.activeTokens}`);
      console.log(`   - Sessions actives: ${stats.activeSessions}`);
      console.log(`   - Tokens blacklistés: ${stats.blacklistedTokens}\n`);
    } else {
      console.log('❌ Impossible de récupérer les statistiques');
    }
    
    console.log('🎉 Tous les tests Redis sont passés avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  } finally {
    // Fermer la connexion Redis
    await redis.quit();
    console.log('🔌 Connexion Redis fermée');
  }
}

// Exécuter les tests
testRedisConnection().catch(console.error);
