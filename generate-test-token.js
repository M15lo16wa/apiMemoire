require('dotenv').config();
const jwt = require('jsonwebtoken');

// Données du médecin de test avec la bonne structure
const medecinData = {
  professionnel_id: 79,  // Changé de 'id' à 'professionnel_id'
  numero_adeli: 'AH23456780',
  nom: 'Sakura',
  prenom: 'Saza',
  role: 'medecin'
};

// Générer le token JWT
const token = jwt.sign(medecinData, process.env.JWT_SECRET, {
  expiresIn: '24h'
});

console.log('🔑 Token JWT généré pour les tests:');
console.log('📋 Token:', token);
console.log('\n📋 Données du médecin:');
console.log(JSON.stringify(medecinData, null, 2));

console.log('\n💡 Utilisation:');
console.log('Authorization: Bearer ' + token); 