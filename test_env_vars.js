require('dotenv').config();

console.log('🔍 Vérification des variables d\'environnement');
console.log('=' * 50);

console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Défini' : '❌ Non défini');
console.log('JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN || 'Non défini');
console.log('REDIS_HOST:', process.env.REDIS_HOST || 'localhost');
console.log('REDIS_PORT:', process.env.REDIS_PORT || 6379);

if (process.env.JWT_SECRET) {
  console.log('JWT_SECRET (longueur):', process.env.JWT_SECRET.length);
} else {
  console.log('❌ JWT_SECRET manquant - la gestion des tokens ne fonctionnera pas !');
}
