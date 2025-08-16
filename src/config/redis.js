const Redis = require('ioredis');

// Configuration Redis simplifiée et robuste
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || null,
  db: process.env.REDIS_DB || 0,
  // Options de base uniquement
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000
};

// Créer l'instance Redis
const redis = new Redis(redisConfig);

// Gestion des événements de connexion
redis.on('connect', () => {
  console.log('✅ Redis connecté avec succès');
});

redis.on('error', (err) => {
  console.error('❌ Erreur Redis:', err);
  
  // Si c'est une erreur de persistance RDB, essayer de la résoudre
  if (err.message.includes('MISCONF') && err.message.includes('RDB')) {
    console.log('🔄 Tentative de résolution de l\'erreur RDB...');
    
    // Attendre que la connexion soit stable avant de réessayer
    setTimeout(async () => {
      try {
        await redis.config('SET', 'stop-writes-on-bgsave-error', 'no');
        console.log('✅ Erreur RDB résolue');
      } catch (resolveErr) {
        console.error('❌ Impossible de résoudre l\'erreur RDB:', resolveErr.message);
      }
    }, 2000);
  }
});

redis.on('close', () => {
  console.log('🔌 Connexion Redis fermée');
});

redis.on('reconnecting', () => {
  console.log('🔄 Reconnexion Redis en cours...');
});

redis.on('ready', () => {
  console.log('🚀 Redis prêt à recevoir des commandes');
  
  // Configurer Redis de manière sécurisée une fois prêt
  setTimeout(async () => {
    try {
      // Désactiver les erreurs de sauvegarde RDB
      await redis.config('SET', 'stop-writes-on-bgsave-error', 'no');
      console.log('✅ Configuration RDB mise à jour');
      
      // Désactiver la persistance pour le développement
      await redis.config('SET', 'save', '');
      console.log('✅ Persistance RDB désactivée');
      
    } catch (err) {
      console.warn('⚠️ Impossible de configurer Redis (peut être normal):', err.message);
    }
  }, 1000);
});

// Test de connexion
const testConnection = async () => {
  try {
    await redis.ping();
    console.log('✅ Test de connexion Redis réussi');
    return true;
  } catch (error) {
    console.error('❌ Test de connexion Redis échoué:', error);
    return false;
  }
};

module.exports = { redis, testConnection };
