require('dotenv').config();

// Configuration pour les tests d'intégration
const config = {
  // Configuration Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || null,
    db: process.env.REDIS_DB || 0
  },

  // Configuration API
  api: {
    baseURL: process.env.BASE_URL || 'http://localhost:3001',
    timeout: 10000
  },

  // Configuration JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'test-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h'
  },

  // Utilisateurs de test
  testUsers: {
    admin: {
      email: 'admin@example.com',
      mot_de_passe: 'admin123',
      role: 'admin'
    },
    secretaire: {
      email: 'secretaire@example.com',
      mot_de_passe: 'secretaire123',
      role: 'secretaire'
    },
    professionnel: {
      publicIdentifier: 'medecin@example.com',
      codeCPS: '1234'
    },
    patient: {
      numeroSecu: '1234567890123',
      dateNaissance: '1990-01-01'
    }
  },

  // Configuration des tests
  tests: {
    // Délai d'attente entre les tests (ms)
    delayBetweenTests: 1000,
    
    // Nombre de tentatives pour les tests de connexion
    maxRetries: 3,
    
    // Timeout pour les tests individuels (ms)
    testTimeout: 30000,
    
    // Nettoyer Redis après les tests
    cleanupAfterTests: true
  },

  // Logs
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    showRedisOperations: true,
    showTokenDetails: false // Ne pas afficher les tokens complets pour la sécurité
  }
};

// Fonction pour valider la configuration
function validateConfig() {
  const errors = [];

  if (!config.redis.host) {
    errors.push('REDIS_HOST non défini');
  }

  if (!config.api.baseURL) {
    errors.push('BASE_URL non défini');
  }

  if (!config.jwt.secret) {
    errors.push('JWT_SECRET non défini');
  }

  if (errors.length > 0) {
    console.error('❌ Erreurs de configuration:');
    errors.forEach(error => console.error(`   - ${error}`));
    return false;
  }

  return true;
}

// Fonction pour afficher la configuration (sans les secrets)
function displayConfig() {
  console.log('🔧 Configuration des tests:');
  console.log(`   - Redis: ${config.redis.host}:${config.redis.port}`);
  console.log(`   - API: ${config.api.baseURL}`);
  console.log(`   - JWT Expiration: ${config.jwt.expiresIn}`);
  console.log(`   - Log Level: ${config.logging.level}`);
  console.log(`   - Cleanup: ${config.tests.cleanupAfterTests ? 'Activé' : 'Désactivé'}`);
  console.log('');
}

// Fonction pour nettoyer Redis après les tests
async function cleanupRedis() {
  if (!config.tests.cleanupAfterTests) {
    return;
  }

  try {
    const { redis } = require('./src/config/redis');
    
    // Supprimer toutes les clés de test
    const keys = await redis.keys('*');
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`🧹 ${keys.length} clés Redis supprimées après les tests`);
    }
    
    await redis.quit();
  } catch (error) {
    console.warn('⚠️  Impossible de nettoyer Redis:', error.message);
  }
}

// Fonction pour attendre entre les tests
function delay(ms = config.tests.delayBetweenTests) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fonction pour masquer les informations sensibles dans les logs
function sanitizeLogData(data) {
  if (typeof data === 'string') {
    // Masquer les tokens JWT
    return data.replace(/eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g, '[JWT_TOKEN]');
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      if (key === 'token' || key === 'jwt') {
        sanitized[key] = '[JWT_TOKEN]';
      } else if (key === 'mot_de_passe' || key === 'password') {
        sanitized[key] = '[PASSWORD]';
      } else if (key === 'codeCPS') {
        sanitized[key] = '[CPS_CODE]';
      } else if (key === 'numeroSecu') {
        sanitized[key] = '[SECU_NUMBER]';
      } else {
        sanitized[key] = sanitizeLogData(value);
      }
    }
    return sanitized;
  }
  
  return data;
}

// Fonction pour logger les opérations Redis
function logRedisOperation(operation, details = {}) {
  if (!config.logging.showRedisOperations) {
    return;
  }

  const sanitizedDetails = sanitizeLogData(details);
  console.log(`🔴 Redis ${operation}:`, sanitizedDetails);
}

// Fonction pour logger les tokens (de manière sécurisée)
function logTokenOperation(operation, token, details = {}) {
  if (!config.logging.showTokenDetails) {
    console.log(`🔐 Token ${operation}: ${token.substring(0, 20)}...`);
  } else {
    const sanitizedDetails = sanitizeLogData(details);
    console.log(`🔐 Token ${operation}:`, sanitizedDetails);
  }
}

module.exports = {
  config,
  validateConfig,
  displayConfig,
  cleanupRedis,
  delay,
  sanitizeLogData,
  logRedisOperation,
  logTokenOperation
};
