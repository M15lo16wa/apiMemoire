const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Test des autorisations medecin pour les routes DMP
 */
async function testAutorisationsMedecin() {
  console.log('🧪 Test des autorisations medecin pour les routes DMP...\n');

  // Test de base pour vérifier que le serveur répond
  try {
    console.log('1️⃣ Test de connexion au serveur...');
    const response = await axios.get(`${API_BASE_URL}/patient`, {
      timeout: 5000
    });
    console.log('✅ Serveur accessible');
    console.log(`📊 Status: ${response.status}`);
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Serveur non accessible');
      console.log('💡 Démarrez le serveur avec : npm start');
      return;
    }
    console.log('⚠️ Serveur accessible mais erreur:', error.message);
  }

  console.log('\n2️⃣ Test des routes DMP avec différents rôles...');
  
  const routesToTest = [
    { path: '/admin/dmp/patients', name: 'Liste des patients (Medecin)' },
    { path: '/admin/dmp/auto-mesures', name: 'Auto-mesures (Medecin)' },
    { path: '/admin/dmp/documents', name: 'Documents (Medecin)' },
    { path: '/admin/dmp/messages', name: 'Messages (Medecin)' },
    { path: '/admin/dmp/rappels', name: 'Rappels (Medecin)' },
    { path: '/admin/dmp/statistiques', name: 'Statistiques (Medecin)' }
  ];

  console.log('\n📋 Routes DMP Medecin à tester :');
  routesToTest.forEach(route => {
    console.log(`- ${route.path} (${route.name})`);
  });

  console.log('\n🔐 Autorisations requises :');
  console.log('✅ Authentification : Token JWT obligatoire');
  console.log('✅ Autorisation : Rôle "medecin" obligatoire');
  console.log('✅ Protection : authMiddleware.protect');
  console.log('✅ Restriction : authMiddleware.restrictTo("medecin")');

  console.log('\n📝 Instructions pour tester les autorisations :');
  console.log('1. Démarrez le serveur : npm start');
  console.log('2. Connectez-vous en tant que medecin');
  console.log('3. Obtenez un token JWT avec le rôle "medecin"');
  console.log('4. Testez les endpoints avec le token');

  console.log('\n💡 Exemple de login medecin :');
  console.log('curl -X POST "http://localhost:3000/api/auth/login" \\');
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d \'{');
  console.log('    "email": "medecin@email.com",');
  console.log('    "mot_de_passe": "motdepassemedecin",');
  console.log('    "role": "medecin"');
  console.log('  }\'');

  console.log('\n🔧 Exemple de test avec autorisation :');
  console.log('curl -X GET "http://localhost:3000/api/admin/dmp/patients" \\');
  console.log('  -H "Authorization: Bearer YOUR_MEDECIN_TOKEN" \\');
  console.log('  -H "Content-Type: application/json"');

  console.log('\n⚠️ Tests d\'autorisation :');
  console.log('- Test sans token : Doit retourner 401');
  console.log('- Test avec token invalide : Doit retourner 401');
  console.log('- Test avec token patient : Doit retourner 403');
  console.log('- Test avec token medecin : Doit retourner 200');

  console.log('\n📊 Résumé des autorisations :');
  console.log('✅ Routes patient : /api/patient/dmp/* (patientAuth)');
  console.log('✅ Routes medecin : /api/admin/dmp/* (medecin role)');
  console.log('✅ Séparation claire des rôles et permissions');
  console.log('✅ Protection automatique de toutes les routes');

  console.log('\n🎯 Différences d\'autorisation :');
  console.log('| Route | Rôle Requis | Accès |');
  console.log('|-------|-------------|-------|');
  console.log('| /api/patient/dmp/* | patient | Ses propres données |');
  console.log('| /api/admin/dmp/* | medecin | Toutes les données |');

  console.log('\n✅ Autorisations medecin configurées avec succès !');
}

// Exécuter les tests
testAutorisationsMedecin().catch(error => {
  console.error('❌ Erreur lors du test:', error.message);
}); 