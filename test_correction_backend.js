const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const PATIENT_ID = 5;

// Token du patient 5 (nouveau)
const PATIENT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiaWRfcGF0aWVudCI6NSwicm9sZSI6InBhdGllbnQiLCJ0eXBlIjoicGF0aWVudCIsImlhdCI6MTc1NTA0NTQwMywiZXhwIjoxNzU1MTMxODAzfQ.V9R5TPGN_yEnYWD46xJDeog7bUhAwDMM0POx5y6THcY';

async function testCorrectionBackend() {
  try {
    console.log('🔍 Test de la correction backend...');
    console.log('📋 Route testée: /api/access/patient/status');
    
    const response = await axios.get(`${BASE_URL}/access/patient/status`, {
      headers: {
        'Authorization': `Bearer ${PATIENT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Succès! Status:', response.status);
    
    const data = response.data.data;
    console.log('🆔 Patient ID connecté:', data.patient_id);
    console.log('📈 Résumé:', data.summary);
    
    if (data.allRequests && data.allRequests.length > 0) {
      console.log('\n📋 Demandes d\'accès trouvées:', data.allRequests.length);
      
      // Vérifier que toutes les demandes appartiennent au patient 5
      const unauthorizedRequests = data.allRequests.filter(req => req.patient_id !== PATIENT_ID);
      
      if (unauthorizedRequests.length === 0) {
        console.log('✅ SÉCURITÉ RESPECTÉE: Toutes les demandes appartiennent au patient 5');
      } else {
        console.log('❌ VIOLATION DE SÉCURITÉ: Demandes non autorisées détectées:');
        unauthorizedRequests.forEach(req => {
          console.log(`   - ID: ${req.id_acces}, Patient: ${req.patient_id}`);
        });
      }
      
      // Afficher les demandes autorisées
      const authorizedRequests = data.allRequests.filter(req => req.patient_id === PATIENT_ID);
      console.log('\n📋 Demandes autorisées (patient 5):', authorizedRequests.length);
      authorizedRequests.forEach(req => {
        console.log(`   - ID: ${req.id_acces}, Statut: ${req.statut}, Type: ${req.type_acces}`);
      });
      
    } else {
      console.log('📋 Aucune demande d\'accès trouvée');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.status, error.response?.data?.message || error.message);
    
    if (error.response?.data?.error) {
      console.error('📋 Détails de l\'erreur:', error.response.data.error);
    }
  }
}

// Exécuter le test
testCorrectionBackend();
