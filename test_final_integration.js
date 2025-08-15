require('dotenv').config();
const { config, validateConfig, displayConfig, cleanupRedis, delay, logRedisOperation, logTokenOperation } = require('./test_integration_config');
const axios = require('axios');

// Configuration axios avec gestion des erreurs
const api = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  validateStatus: () => true
});

// Variables globales pour les tests
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

// Fonction utilitaire pour les tests
function assert(condition, message) {
  testResults.total++;
  if (condition) {
    testResults.passed++;
    console.log(`✅ ${message}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${message}`);
    testResults.errors.push(message);
  }
}

// Fonction pour afficher les résultats
function displayResults() {
  console.log('\n📊 Résultats des tests:');
  console.log(`   - Total: ${testResults.total}`);
  console.log(`   - Réussis: ${testResults.passed}`);
  console.log(`   - Échoués: ${testResults.failed}`);
  console.log(`   - Taux de réussite: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ Erreurs détectées:');
    testResults.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
  }
}

// Test 1: Connexion Redis
async function testRedisConnection() {
  console.log('\n🔴 Test 1: Connexion Redis');
  
  try {
    const { testConnection } = require('./src/config/redis');
    const isConnected = await testConnection();
    
    assert(isConnected, 'Connexion Redis établie');
    
    if (isConnected) {
      logRedisOperation('connexion', { status: 'success' });
    }
  } catch (error) {
    assert(false, `Connexion Redis échouée: ${error.message}`);
  }
}

// Test 2: Service de tokens Redis
async function testTokenService() {
  console.log('\n🔐 Test 2: Service de tokens Redis');
  
  try {
    const tokenService = require('./src/services/tokenService');
    
    // Test de génération de token
    const mockUser = { id: 999, nom: 'Test', prenom: 'User', role: 'test' };
    const token = await tokenService.generateAndStoreToken(mockUser, 'test');
    
    assert(!!token, 'Token généré avec succès');
    logTokenOperation('génération', token, { userId: mockUser.id });
    
    // Test de validation de token
    const validation = await tokenService.validateToken(token);
    assert(!!validation, 'Token validé avec succès');
    
    // Test de révocation de token
    const revoked = await tokenService.revokeToken(token, mockUser.id);
    assert(revoked, 'Token révoqué avec succès');
    
    // Test de validation après révocation
    const validationAfterRevoke = await tokenService.validateToken(token);
    assert(!validationAfterRevoke, 'Token correctement invalidé après révocation');
    
    logRedisOperation('tests_tokens', { 
      generated: !!token, 
      validated: !!validation, 
      revoked: revoked, 
      invalidAfterRevoke: !validationAfterRevoke 
    });
    
  } catch (error) {
    assert(false, `Service de tokens échoué: ${error.message}`);
  }
}

// Test 3: API d'authentification
async function testAuthAPI() {
  console.log('\n🌐 Test 3: API d\'authentification');
  
  try {
    // Test de connexion
    const loginResponse = await api.post('/auth/login', {
      email: config.testUsers.admin.email,
      mot_de_passe: config.testUsers.admin.mot_de_passe
    });
    
    assert(loginResponse.status === 200, 'Connexion API réussie');
    
    if (loginResponse.status === 200 && loginResponse.data.token) {
      const token = loginResponse.data.token;
      logTokenOperation('connexion_api', token, { 
        userId: loginResponse.data.data.user.id_utilisateur 
      });
      
      // Test d'accès à une route protégée
      const sessionResponse = await api.get('/auth/session', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      assert(sessionResponse.status === 200, 'Accès à la route protégée réussi');
      
      // Test de déconnexion
      const logoutResponse = await api.post('/auth/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      assert(logoutResponse.status === 200, 'Déconnexion API réussie');
      
      // Test de réutilisation du token révoqué
      const reusedTokenResponse = await api.get('/auth/session', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      assert(reusedTokenResponse.status === 401, 'Token correctement invalidé après déconnexion');
      
      logRedisOperation('tests_api', { 
        login: loginResponse.status === 200,
        session: sessionResponse.status === 200,
        logout: logoutResponse.status === 200,
        tokenInvalidated: reusedTokenResponse.status === 401
      });
      
    } else {
      assert(false, 'Token non reçu lors de la connexion');
    }
    
  } catch (error) {
    assert(false, `Tests API échoués: ${error.message}`);
  }
}

// Test 4: Gestion des sessions multiples
async function testMultipleSessions() {
  console.log('\n🔄 Test 4: Gestion des sessions multiples');
  
  try {
    // Première connexion
    const login1Response = await api.post('/auth/login', {
      email: config.testUsers.admin.email,
      mot_de_passe: config.testUsers.admin.mot_de_passe
    });
    
    assert(login1Response.status === 200, 'Première connexion réussie');
    
    if (login1Response.status === 200 && login1Response.data.token) {
      const token1 = login1Response.data.token;
      
      // Deuxième connexion (même utilisateur)
      const login2Response = await api.post('/auth/login', {
        email: config.testUsers.admin.email,
        mot_de_passe: config.testUsers.admin.mot_de_passe
      });
      
      assert(login2Response.status === 200, 'Deuxième connexion réussie');
      
      if (login2Response.status === 200 && login2Response.data.token) {
        const token2 = login2Response.data.token;
        
        // Vérifier que les tokens sont différents
        assert(token1 !== token2, 'Tokens différents générés pour la même session');
        
        // Test de déconnexion de tous les appareils
        const logoutAllResponse = await api.post('/auth/logout-all-devices', {}, {
          headers: { Authorization: `Bearer ${token1}` }
        });
        
        assert(logoutAllResponse.status === 200, 'Déconnexion de tous les appareils réussie');
        
        // Vérifier que les deux tokens sont invalidés
        const token1Response = await api.get('/auth/session', {
          headers: { Authorization: `Bearer ${token1}` }
        });
        
        const token2Response = await api.get('/auth/session', {
          headers: { Authorization: `Bearer ${token2}` }
        });
        
        assert(token1Response.status === 401, 'Premier token invalidé après déconnexion globale');
        assert(token2Response.status === 401, 'Deuxième token invalidé après déconnexion globale');
        
        logRedisOperation('tests_sessions_multiples', { 
          token1Valid: token1Response.status === 401,
          token2Valid: token2Response.status === 401,
          logoutAllSuccess: logoutAllResponse.status === 200
        });
      }
    }
    
  } catch (error) {
    assert(false, `Tests sessions multiples échoués: ${error.message}`);
  }
}

// Test 5: Statistiques Redis
async function testRedisStats() {
  console.log('\n📊 Test 5: Statistiques Redis');
  
  try {
    // Se reconnecter pour obtenir les statistiques
    const loginResponse = await api.post('/auth/login', {
      email: config.testUsers.admin.email,
      mot_de_passe: config.testUsers.admin.mot_de_passe
    });
    
    if (loginResponse.status === 200 && loginResponse.data.token) {
      const token = loginResponse.data.token;
      
      const statsResponse = await api.get('/auth/redis-stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      assert(statsResponse.status === 200, 'Statistiques Redis récupérées');
      
      if (statsResponse.status === 200) {
        const stats = statsResponse.data.data.stats;
        
        assert(typeof stats.totalKeys === 'number', 'Total des clés est un nombre');
        assert(typeof stats.activeTokens === 'number', 'Tokens actifs est un nombre');
        assert(typeof stats.activeSessions === 'number', 'Sessions actives est un nombre');
        assert(typeof stats.blacklistedTokens === 'number', 'Tokens blacklistés est un nombre');
        
        console.log(`   📈 Statistiques Redis:`);
        console.log(`      - Total des clés: ${stats.totalKeys}`);
        console.log(`      - Tokens actifs: ${stats.activeTokens}`);
        console.log(`      - Sessions actives: ${stats.activeSessions}`);
        console.log(`      - Tokens blacklistés: ${stats.blacklistedTokens}`);
        
        logRedisOperation('statistiques', stats);
      }
      
      // Déconnexion finale
      await api.post('/auth/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    
  } catch (error) {
    assert(false, `Tests statistiques Redis échoués: ${error.message}`);
  }
}

// Test 6: Performance et robustesse
async function testPerformanceAndRobustness() {
  console.log('\n⚡ Test 6: Performance et robustesse');
  
  try {
    const tokenService = require('./src/services/tokenService');
    
    // Test de génération de plusieurs tokens rapidement
    const startTime = Date.now();
    const promises = [];
    
    for (let i = 0; i < 10; i++) {
      const mockUser = { id: 1000 + i, nom: `Test${i}`, prenom: 'User', role: 'test' };
      promises.push(tokenService.generateAndStoreToken(mockUser, 'test'));
    }
    
    const tokens = await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    assert(tokens.length === 10, 'Génération de 10 tokens réussie');
    assert(duration < 5000, `Génération rapide (${duration}ms < 5000ms)`);
    
    // Test de validation en parallèle
    const validationPromises = tokens.map(token => tokenService.validateToken(token));
    const validations = await Promise.all(validationPromises);
    
    assert(validations.every(v => !!v), 'Validation en parallèle réussie');
    
    // Nettoyage des tokens de test
    for (let i = 0; i < tokens.length; i++) {
      await tokenService.revokeToken(tokens[i], 1000 + i);
    }
    
    logRedisOperation('tests_performance', { 
      tokensGenerated: tokens.length,
      duration: duration,
      parallelValidation: validations.every(v => !!v)
    });
    
  } catch (error) {
    assert(false, `Tests performance échoués: ${error.message}`);
  }
}

// Fonction principale de test
async function runAllTests() {
  console.log('🚀 Démarrage des tests d\'intégration Redis\n');
  
  // Afficher la configuration
  displayConfig();
  
  // Valider la configuration
  if (!validateConfig()) {
    console.error('❌ Configuration invalide. Arrêt des tests.');
    process.exit(1);
  }
  
  try {
    // Exécuter tous les tests
    await testRedisConnection();
    await delay();
    
    await testTokenService();
    await delay();
    
    await testAuthAPI();
    await delay();
    
    await testMultipleSessions();
    await delay();
    
    await testRedisStats();
    await delay();
    
    await testPerformanceAndRobustness();
    
    // Afficher les résultats
    displayResults();
    
    // Nettoyer Redis
    console.log('\n🧹 Nettoyage Redis...');
    await cleanupRedis();
    
    // Conclusion
    if (testResults.failed === 0) {
      console.log('\n🎉 Tous les tests sont passés avec succès !');
      console.log('✅ L\'intégration Redis est opérationnelle.');
      console.log('🔐 Les tokens sont maintenant gérés de manière sécurisée.');
      console.log('🚫 Les tokens révoqués ne peuvent plus être réutilisés.');
    } else {
      console.log('\n⚠️  Certains tests ont échoué.');
      console.log('🔧 Vérifiez la configuration et les logs d\'erreur.');
    }
    
  } catch (error) {
    console.error('\n❌ Erreur critique lors des tests:', error);
    process.exit(1);
  }
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse rejetée non gérée:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Exception non capturée:', error);
  process.exit(1);
});

// Vérifier si axios est installé
try {
  require('axios');
  runAllTests();
} catch (error) {
  console.log('📦 Installation d\'axios...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install axios', { stdio: 'inherit' });
    console.log('✅ Axios installé avec succès\n');
    runAllTests();
  } catch (installError) {
    console.error('❌ Erreur lors de l\'installation d\'axios:', installError.message);
    console.log('💡 Installez manuellement avec: npm install axios');
  }
}
