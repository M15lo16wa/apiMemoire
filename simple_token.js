const jwt = require('jsonwebtoken');

const secret = 'votre_secret_jwt_tres_securise_ici';
const payload = { id: 5, role: 'patient', type: 'patient' };

const token = jwt.sign(payload, secret, { expiresIn: '1h' });

console.log('Token:', token);
console.log('Payload:', JSON.stringify(payload));
