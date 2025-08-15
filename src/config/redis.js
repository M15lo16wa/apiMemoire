const Redis = require('ioredis');

// Configuration Redis
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || null,
  db: process.env.REDIS_DB || 0,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
};

// Créer l'instance Redis
const redis = new Redis(redisConfig);

// Gestion des événements de connexion
redis.on('connect', () => {
  console.log('✅ Redis connecté avec succès');
});

redis.on('error', (err) => {
  console.error('❌ Erreur Redis:', err);
});

redis.on('close', () => {
  console.log('🔌 Connexion Redis fermée');
});

redis.on('reconnecting', () => {
  console.log('🔄 Reconnexion Redis en cours...');
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
