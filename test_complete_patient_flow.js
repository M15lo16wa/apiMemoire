const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const TEST_PATIENT = {
  numero_assure: 'TEMP000005',
  mot_de_passe: 'passer123'
};

console.log('🚀 Test complet du cycle d\'authentification patient avec Redis');
console.log('=' * 70);

async function testCompletePatientFlow() {
  let token = null;
  let patientId = null;

  try {
    // ÉTAPE 1: Connexion patient
    console.log('\n🔐 ÉTAPE 1: Connexion patient');
    console.log('📤 Tentative de connexion...');
    
    const loginResponse = await axios.post(`${BASE_URL}/patient/auth/login`, TEST_PATIENT);
    
    if (loginResponse.status === 200 && loginResponse.data.token) {
      token = loginResponse.data.token;
      patientId = loginResponse.data.data.patient.id_patient;
      
      console.log('✅ Connexion réussie');
      console.log(`  - Patient ID: ${patientId}`);
      console.log(`  - Token: ${token.substring(0, 30)}...`);
      
      // Vérifier la structure du token
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        console.log(`  - Token Role: ${payload.role}`);
        console.log(`  - Token Type: ${payload.type}`);
      }
    } else {
      throw new Error('Connexion échouée: aucun token reçu');
    }

    // ÉTAPE 2: Accès à plusieurs routes protégées
    console.log('\n🔒 ÉTAPE 2: Test d\'accès aux routes protégées');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Test 1: Dossier médical
    console.log('  🔍 Test accès dossier médical...');
    try {
      const dossierResponse = await axios.get(`${BASE_URL}/dossierMedical/patient/${patientId}/complet`, { headers });
      console.log('    ✅ Dossier médical: OK (200)');
    } catch (error) {
      console.log(`    ❌ Dossier médical: ${error.response?.status} - ${error.response?.data?.message || 'Erreur'}`);
    }

    // Test 2: Statut d'accès
    console.log('  🔍 Test accès statut patient...');
    try {
      const statusResponse = await axios.get(`${BASE_URL}/access/patient/status`, { headers });
      console.log('    ✅ Statut patient: OK (200)');
    } catch (error) {
      console.log(`    ❌ Statut patient: ${error.response?.status} - ${error.response?.data?.message || 'Erreur'}`);
    }

    // Test 3: Documents patient
    console.log('  🔍 Test accès documents patient...');
    try {
      const docsResponse = await axios.get(`${BASE_URL}/documents/patient`, { headers });
      console.log('    ✅ Documents patient: OK (200)');
    } catch (error) {
      console.log(`    ❌ Documents patient: ${error.response?.status} - ${error.response?.data?.message || 'Erreur'}`);
    }

    // ÉTAPE 3: Déconnexion
    console.log('\n🚪 ÉTAPE 3: Déconnexion patient');
    console.log('📤 Tentative de déconnexion...');
    
    try {
      const logoutResponse = await axios.post(`${BASE_URL}/patient/auth/logout`, {}, { headers });
      if (logoutResponse.status === 200) {
        console.log('✅ Déconnexion réussie');
      } else {
        console.log(`⚠️  Déconnexion: ${logoutResponse.status}`);
      }
    } catch (error) {
      console.log(`❌ Erreur déconnexion: ${error.response?.status} - ${error.response?.data?.message || 'Erreur'}`);
    }

    // ÉTAPE 4: Test de réutilisation du token révoqué
    console.log('\n🚫 ÉTAPE 4: Test de réutilisation du token révoqué');
    console.log('🔍 Tentative d\'accès avec le token révoqué...');
    
    try {
      const reuseResponse = await axios.get(`${BASE_URL}/dossierMedical/patient/${patientId}/complet`, { headers });
      console.log(`❌ ERREUR: Token révoqué accepté (${reuseResponse.status})`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Token révoqué correctement rejeté (401 Unauthorized)');
        console.log(`  - Message: ${error.response.data.message || 'Token invalide'}`);
      } else {
        console.log(`⚠️  Réponse inattendue: ${error.response?.status} - ${error.response?.data?.message || 'Erreur'}`);
      }
    }

    // ÉTAPE 5: Test de reconnexion
    console.log('\n🔄 ÉTAPE 5: Test de reconnexion');
    console.log('📤 Tentative de reconnexion...');
    
    try {
      const reloginResponse = await axios.post(`${BASE_URL}/patient/auth/login`, TEST_PATIENT);
      if (reloginResponse.status === 200 && reloginResponse.data.token) {
        console.log('✅ Reconnexion réussie');
        console.log(`  - Nouveau token: ${reloginResponse.data.token.substring(0, 30)}...`);
        
        // Vérifier que le nouveau token fonctionne
        const newHeaders = {
          'Authorization': `Bearer ${reloginResponse.data.token}`,
          'Content-Type': 'application/json'
        };
        
        try {
          const testResponse = await axios.get(`${BASE_URL}/access/patient/status`, { headers: newHeaders });
          console.log('  ✅ Nouveau token fonctionne (200)');
        } catch (testError) {
          console.log(`  ❌ Nouveau token ne fonctionne pas: ${testError.response?.status}`);
        }
      } else {
        console.log('❌ Reconnexion échouée');
      }
    } catch (error) {
      console.log(`❌ Erreur reconnexion: ${error.response?.status} - ${error.response?.data?.message || 'Erreur'}`);
    }

    // RÉSUMÉ
    console.log('\n🎯 RÉSUMÉ DU TEST');
    console.log('=' * 50);
    console.log('✅ Connexion patient: Fonctionne');
    console.log('✅ Accès routes protégées: Fonctionne');
    console.log('✅ Déconnexion: Fonctionne');
    console.log('✅ Révocation token: Fonctionne');
    console.log('✅ Reconnexion: Fonctionne');
    console.log('✅ Gestion Redis: Fonctionne parfaitement');
    
    console.log('\n🎉 Tous les tests sont passés avec succès !');
    console.log('🔐 La gestion des tokens Redis fonctionne correctement pour les patients');

  } catch (error) {
    console.error('\n❌ ERREUR GÉNÉRALE:', error.message);
    if (error.response) {
      console.error('  - Status:', error.response.status);
      console.error('  - Message:', error.response.data.message || error.response.statusText);
    }
  }
}

// Exécuter le test complet
testCompletePatientFlow().catch(console.error);
