const axios = require('axios');
const bcrypt = require('bcryptjs');

const API_BASE_URL = 'http://localhost:3000/api';

// Créer un utilisateur admin directement en base de données
async function createAdminUser() {
  try {
    console.log('👤 Création d\'un utilisateur admin...');
    
    // Note: Cette approche nécessite d'avoir un endpoint pour créer des utilisateurs
    // ou d'utiliser directement la base de données
    
    const adminData = {
      nom: "Admin",
      prenom: "System",
      email: "admin@hopital.fr",
      mot_de_passe: "admin123",
      role: "admin",
      statut: "actif"
    };

    console.log('⚠️  Note: Pour créer un utilisateur admin, vous devez soit:');
    console.log('1. Avoir un endpoint /api/utilisateurs qui ne nécessite pas d\'authentification');
    console.log('2. Créer directement en base de données');
    console.log('3. Modifier temporairement la route professionnelSante pour les tests');
    
    return adminData;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    throw error;
  }
}

// Alternative: Modifier temporairement la route pour les tests
function suggestRouteModification() {
  console.log('\n🔧 Solution temporaire pour les tests:');
  console.log('Modifiez temporairement la route dans src/modules/professionnelSante/professionnelSante.route.js:');
  console.log('');
  console.log('// Remplacer cette ligne:');
  console.log('.post(authMiddleware.protect, authMiddleware.restrictTo(\'admin\'), professionnelSanteController.createProfessionnel);');
  console.log('');
  console.log('// Par celle-ci (temporairement):');
  console.log('.post(professionnelSanteController.createProfessionnel);');
  console.log('');
  console.log('⚠️  N\'oubliez pas de remettre la protection après les tests!');
}

// Test de connexion avec un utilisateur existant
async function testWithExistingUser() {
  try {
    console.log('\n🔍 Test avec un utilisateur existant...');
    
    // Essayer de se connecter avec des identifiants par défaut
    const loginData = {
      email: "admin@hopital.fr",
      mot_de_passe: "admin123"
    };

    const response = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
    
    console.log('✅ Connexion réussie avec utilisateur existant!');
    return response.data.token;
  } catch (error) {
    console.log('❌ Aucun utilisateur admin existant trouvé');
    return null;
  }
}

// Point d'entrée
async function main() {
  console.log('🔧 Script de création d\'utilisateur admin');
  console.log('==========================================\n');
  
  // Essayer d'abord avec un utilisateur existant
  const token = await testWithExistingUser();
  
  if (token) {
    console.log('✅ Token obtenu:', token.substring(0, 20) + '...');
    console.log('Vous pouvez maintenant utiliser ce token pour créer des professionnels de santé');
  } else {
    console.log('❌ Aucun utilisateur admin trouvé');
    suggestRouteModification();
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  createAdminUser,
  testWithExistingUser
}; 