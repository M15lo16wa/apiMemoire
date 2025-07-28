const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// Test de création d'un professionnel de santé
async function testCreateProfessionnel() {
  try {
    console.log('🧪 Test de création d\'un professionnel de santé...');
    
    // Générer un numero_adeli unique et alphanumérique (ex: ADL + 6 chiffres)
    const timestamp = Date.now();
    const uniqueAdeli = `ADL${(timestamp % 1e6).toString().padStart(6, '0')}`;
    const professionnelData = {
      nom: "Martin",
      prenom: "Sophie",
      date_naissance: "1980-03-15",
      sexe: "F",
      specialite: "Cardiologie",
      email: `sophie.martin.${timestamp}@hopital.fr`,
      telephone: "+33123456789",
      telephone_portable: "+33612345678",
      adresse: "456 Avenue des Médecins",
      code_postal: "75002",
      ville: "Paris",
      pays: "France",
      role: "medecin",
      numero_licence: `LIC${timestamp % 1000000}`,
      numero_adeli: uniqueAdeli,
      mot_de_passe: "motdepasse123",
      date_obtention_licence: "2005-06-20",
      statut: "actif",
      date_embauche: "2010-09-01",
      description: "Spécialiste en cardiologie avec 15 ans d'expérience",
      photo_url: "https://example.com/photo.jpg"
    };

    const response = await axios.post(`${API_BASE_URL}/professionnelSante`, professionnelData);
    
    console.log('✅ Professionnel de santé créé avec succès:');
    console.log('ID:', response.data.data.professionnel.id_professionnel);
    console.log('Nom:', response.data.data.professionnel.nom);
    console.log('Prénom:', response.data.data.professionnel.prenom);
    console.log('Numéro ADELI:', response.data.data.professionnel.numero_adeli);
    
    return response.data.data.professionnel;
  } catch (error) {
    console.error('❌ Erreur lors de la création du professionnel:', error.response?.data || error.message);
    throw error;
  }
}

// Test de connexion d'un professionnel de santé
async function testLoginProfessionnel(numero_adeli, mot_de_passe) {
  try {
    console.log('\n🔐 Test de connexion du professionnel de santé...');
    
    const loginData = {
      numero_adeli: numero_adeli,
      mot_de_passe: mot_de_passe
    };

    const response = await axios.post(`${API_BASE_URL}/professionnelSante/auth/login`, loginData);
    
    console.log('✅ Connexion réussie!');
    console.log('Token JWT reçu');
    
    return response.data.token;
  } catch (error) {
    console.error('❌ Erreur lors de la connexion:', error.response?.data || error.message);
    throw error;
  }
}

// Test de création d'une ordonnance avec le token
async function testCreateOrdonnance(token) {
  try {
    console.log('\n💊 Test de création d\'une ordonnance...');
    
    const ordonnanceData = {
      patient_id: 1,
      medicament: "Paracétamol",
      dosage: "500mg",
      frequence: "3 fois par jour",
      duree: "7 jours",
      instructions: "À prendre après les repas",
      voie_administration: "orale",
      renouvelable: true,
      nb_renouvellements: 2
    };

    const response = await axios.post(`${API_BASE_URL}/prescription/ordonnance`, ordonnanceData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Ordonnance créée avec succès:');
    console.log('ID:', response.data.data.ordonnance.id_prescription);
    console.log('Médicament:', response.data.data.ordonnance.medicament);
    console.log('Dosage:', response.data.data.ordonnance.dosage);
    
    return response.data.data.ordonnance;
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'ordonnance:', error.response?.data || error.message);
    throw error;
  }
}

// Test de récupération des prescriptions d'un patient
async function testGetPrescriptions(token, patientId) {
  try {
    console.log('\n📋 Test de récupération des prescriptions...');
    
    const response = await axios.get(`${API_BASE_URL}/prescription/patient/${patientId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Prescriptions récupérées avec succès:');
    console.log('Nombre de prescriptions:', response.data.results);
    
    if (response.data.data.prescriptions && response.data.data.prescriptions.length > 0) {
      console.log('Première prescription:', response.data.data.prescriptions[0].medicament);
    }
    
    return response.data.data.prescriptions;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des prescriptions:', error.response?.data || error.message);
    throw error;
  }
}

// Test principal
async function runTests() {
  try {
    console.log('🚀 Démarrage des tests API...\n');
    
    // Test 1: Créer un professionnel de santé
    const professionnel = await testCreateProfessionnel();
    
    // Test 2: Se connecter
    const token = await testLoginProfessionnel(professionnel.numero_adeli, "motdepasse123");
    
    // Test 3: Créer une ordonnance
    const ordonnance = await testCreateOrdonnance(token);
    
    // Test 4: Récupérer les prescriptions
    await testGetPrescriptions(token, 1);
    
    console.log('\n🎉 Tous les tests sont passés avec succès!');
    console.log('\n📚 Documentation Swagger disponible sur: http://localhost:3000/api-docs');
    
  } catch (error) {
    console.error('\n💥 Erreur lors des tests:', error.message);
    process.exit(1);
  }
}

// Vérifier que l'API est démarrée
async function checkAPIAvailability() {
  try {
    await axios.get(`${API_BASE_URL}/service-sante`);
    console.log('✅ API accessible');
    return true;
  } catch (error) {
    console.error('❌ API non accessible. Assurez-vous que le serveur est démarré sur http://localhost:3000');
    return false;
  }
}

// Point d'entrée
async function main() {
  console.log('🔍 Vérification de la disponibilité de l\'API...');
  
  const isAPIAvailable = await checkAPIAvailability();
  if (!isAPIAvailable) {
    process.exit(1);
  }
  
  await runTests();
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  main();
}

module.exports = {
  testCreateProfessionnel,
  testLoginProfessionnel,
  testCreateOrdonnance,
  testGetPrescriptions
}; 