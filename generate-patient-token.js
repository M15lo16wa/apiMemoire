require('dotenv').config();
const jwt = require('jsonwebtoken');

// Données du patient (ID 5)
const patientData = {
  patient_id: 5,
  utilisateur_id: null,
  role: 'patient'
};

// Générer le token
const token = jwt.sign(patientData, process.env.JWT_SECRET, {
  expiresIn: '30d'
});

console.log('🔑 Token patient généré:');
console.log(token);
console.log('\n📋 Données du token:');
console.log(JSON.stringify(patientData, null, 2)); 