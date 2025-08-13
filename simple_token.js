const jwt = require('jsonwebtoken');

const token = jwt.sign({
  id: 5,
  id_patient: 5,
  role: 'patient',
  type: 'patient'
}, 'votre_secret_jwt_super_securise_2025', { expiresIn: '24h' });

console.log('Token:', token);
