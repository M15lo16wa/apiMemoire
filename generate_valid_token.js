require('dotenv').config();
const jwt = require('jsonwebtoken');

// Vérifier que JWT_SECRET est défini
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET non défini dans le fichier .env');
  process.exit(1);
}

// Créer un token de test pour un professionnel de santé existant (ID 2)
const payload = {
  id: 2,
  role: 'professionnel',
  id_professionnel: 2,
  numero_adeli: 'AH23456780' // Numéro ADELI fictif car null dans la base
};

// Générer le token
const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

console.log('🔑 Token de test valide généré:');
console.log('=====================================');
console.log(token);
console.log('\n📋 Payload décodé:');
console.log(JSON.stringify(payload, null, 2));
console.log('\n💡 Ce token correspond au professionnel ID 2 (Diop Mamadou)');
console.log('💡 Copiez ce token dans le fichier test_ordonnances_recentes.js');
