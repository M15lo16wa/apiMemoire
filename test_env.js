require('dotenv').config({ path: './.env' });

console.log('Variables d\'environnement chargées:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_DIALECT:', process.env.DB_DIALECT);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
