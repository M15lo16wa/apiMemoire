const jwt = require('jsonwebtoken');
require('dotenv').config({ path: './.env' });

async function generatePatientToken() {
  try {
    // Générer un token JWT valide pour le patient 5
    const secret = process.env.JWT_SECRET;
    console.log('Clé secrète utilisée:', secret);
    
    // Structure du token selon le middleware d'authentification
    const tokenPayload = {
      id: 5,  // ID du patient (pas utilisateur_id)
      role: 'patient',
      type: 'patient'
    };
    
    const token = jwt.sign(tokenPayload, secret, { expiresIn: '1h' });

    console.log('Token JWT généré pour le patient 5:');
    console.log(token);
    console.log('\nPayload du token:');
    console.log(JSON.stringify(tokenPayload, null, 2));
    console.log('\nUtilisez ce token dans vos tests avec:');
    console.log(`Authorization: Bearer ${token}`);

  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

generatePatientToken();
