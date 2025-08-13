const jwt = require('jsonwebtoken');

// Configuration
const JWT_SECRET = 'votre_secret_jwt_super_securise_2025';
const PATIENT_ID = 5;

// Données du patient
const patientData = {
  id: PATIENT_ID,
  id_patient: PATIENT_ID,
  role: 'patient',
  type: 'patient',
  nom: 'Patient',
  prenom: 'Test'
};

// Générer le token
const token = jwt.sign(patientData, JWT_SECRET, { expiresIn: '24h' });

console.log('🔑 Nouveau token généré pour le patient 5:');
console.log('📋 Données du token:');
console.log(JSON.stringify(patientData, null, 2));
console.log('\n🔐 Token JWT:');
console.log(token);

// Vérifier le token
try {
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('\n✅ Token vérifié avec succès:');
  console.log('📅 Expiration:', new Date(decoded.exp * 1000).toLocaleString());
  console.log('🆔 Patient ID:', decoded.id_patient);
  console.log('👤 Rôle:', decoded.role);
} catch (error) {
  console.error('❌ Erreur de vérification du token:', error.message);
}
