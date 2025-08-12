require('dotenv').config();
const jwt = require('jsonwebtoken');

// Vérifier que JWT_SECRET est défini
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET non défini dans le fichier .env');
  process.exit(1);
}

// Créer un token de test pour un professionnel de santé
const payload = {
  id: 1,
  role: 'professionnel',
  id_professionnel: 1,
  numero_adeli: 'AH23456780'
};

// Générer le token
const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

console.log('🔑 Token de test généré:');
console.log('=====================================');
console.log(token);
console.log('\n📋 Payload décodé:');
console.log(JSON.stringify(payload, null, 2));
console.log('\n💡 Copiez ce token dans le fichier test_ordonnances_recentes.js');
