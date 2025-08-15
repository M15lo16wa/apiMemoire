const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const TEST_PATIENT = {
  numero_assure: 'TEMP000005',
  mot_de_passe: 'passer123'
};

console.log('🚀 Test de connexion patient avec logs détaillés');
console.log('=' * 60);

async function testPatientLoginWithLogs() {
  try {
    console.log('🔍 Tentative de connexion patient...');
    console.log('📤 Données envoyées:', TEST_PATIENT);
    
    const response = await axios.post(`${BASE_URL}/patient/auth/login`, TEST_PATIENT);
    
    console.log('📥 Réponse reçue:');
    console.log('  - Status:', response.status);
    console.log('  - Token présent:', !!response.data.token);
    console.log('  - Token (début):', response.data.token ? response.data.token.substring(0, 30) + '...' : 'Aucun token');
    console.log('  - Patient ID:', response.data.data?.patient?.id_patient);
    
    if (response.data.token) {
      console.log('✅ Connexion réussie avec token');
      
      // Décoder le token pour voir sa structure
      const token = response.data.token;
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        try {
          const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
          console.log('🔍 Structure du token décodé:');
          console.log('  - ID:', payload.id);
          console.log('  - Role:', payload.role);
          console.log('  - Type:', payload.type);
          console.log('  - IAT:', payload.iat);
          console.log('  - EXP:', payload.exp);
        } catch (e) {
          console.log('❌ Impossible de décoder le payload du token');
        }
      }
      
      // Test d'accès à une route protégée
      console.log('\n🔍 Test d\'accès à une route protégée...');
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      try {
        const accessResponse = await axios.get(`${BASE_URL}/dossierMedical/patient/${response.data.data.patient.id_patient}/complet`, { headers });
        console.log('✅ Accès réussi:', accessResponse.status);
      } catch (accessError) {
        if (accessError.response) {
          console.log('❌ Accès échoué:', accessError.response.status, accessError.response.data.message || accessError.response.statusText);
        } else {
          console.log('❌ Erreur d\'accès:', accessError.message);
        }
      }
    } else {
      console.log('❌ Connexion échouée: aucun token reçu');
    }
    
  } catch (error) {
    console.log('❌ Erreur de connexion:');
    if (error.response) {
      console.log('  - Status:', error.response.status);
      console.log('  - Message:', error.response.data.message || error.response.statusText);
      console.log('  - Données:', error.response.data);
    } else {
      console.log('  - Message:', error.message);
    }
  }
}

// Exécuter le test
testPatientLoginWithLogs().catch(console.error);
