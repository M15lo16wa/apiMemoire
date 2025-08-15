const { redis } = require('./src/config/redis');
const tokenService = require('./src/services/tokenService');

console.log('🔍 Test direct du tokenService');
console.log('=' * 40);

async function testTokenServiceDirect() {
  try {
    // Test 1: Génération de token
    console.log('\n🔐 Test 1: Génération de token');
    const mockUser = {
      id_patient: 999,
      nom: 'Test',
      prenom: 'User',
      role: 'patient'
    };
    
    const token = await tokenService.generateAndStoreToken(mockUser, 'patient');
    console.log('✅ Token généré:', token.substring(0, 30) + '...');
    
    // Test 2: Validation du token
    console.log('\n🔍 Test 2: Validation du token');
    const validation = await tokenService.validateToken(token);
    console.log('✅ Token validé:', !!validation);
    if (validation) {
      console.log('  - ID:', validation.id);
      console.log('  - Role:', validation.role);
      console.log('  - Type:', validation.type);
    }
    
    // Test 3: Vérification des clés Redis
    console.log('\n🔍 Test 3: Vérification des clés Redis');
    const tokenKey = `token:${token}`;
    const sessionKey = `session:${mockUser.id_patient}`;
    const blacklistKey = `blacklist:${token}`;
    
    const tokenInRedis = await redis.get(tokenKey);
    const sessionInRedis = await redis.get(sessionKey);
    const blacklistInRedis = await redis.exists(blacklistKey);
    
    console.log('  - Token dans Redis:', !!tokenInRedis);
    console.log('  - Session dans Redis:', !!sessionInRedis);
    console.log('  - Token dans blacklist:', !!blacklistInRedis);
    
    // Test 4: Révocation du token
    console.log('\n🚫 Test 4: Révocation du token');
    const revokeResult = await tokenService.revokeToken(token, mockUser.id_patient);
    console.log('✅ Révocation:', revokeResult);
    
    // Test 5: Vérification après révocation
    console.log('\n🔍 Test 5: Vérification après révocation');
    
    // Attendre un peu
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const tokenAfterRevoke = await redis.get(tokenKey);
    const sessionAfterRevoke = await redis.get(sessionKey);
    const blacklistAfterRevoke = await redis.exists(blacklistKey);
    
    console.log('  - Token dans Redis après révocation:', !!tokenAfterRevoke);
    console.log('  - Session dans Redis après révocation:', !!sessionAfterRevoke);
    console.log('  - Token dans blacklist après révocation:', !!blacklistAfterRevoke);
    
    // Test 6: Validation après révocation
    console.log('\n🔍 Test 6: Validation après révocation');
    const validationAfterRevoke = await tokenService.validateToken(token);
    console.log('✅ Token validé après révocation:', !!validationAfterRevoke);
    
    if (validationAfterRevoke) {
      console.log('❌ ERREUR: Token toujours valide après révocation !');
    } else {
      console.log('✅ Token correctement invalidé');
    }
    
    // Nettoyage
    await redis.quit();
    console.log('\n🔌 Connexion Redis fermée');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Exécuter le test
testTokenServiceDirect().catch(console.error);
