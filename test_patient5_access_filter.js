const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const PATIENT_ID = 5;

// Token du patient 5 (nouveau)
const PATIENT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiaWRfcGF0aWVudCI6NSwicm9sZSI6InBhdGllbnQiLCJ0eXBlIjoicGF0aWVudCIsIm5vbSI6IlBhdGllbnQiLCJwcmVub20iOiJUZXN0IiwiaWF0IjoxNzU1MDQwODMzLCJleHAiOjE3NTUxMjcyMzN9.mxToSc6mKPFtKA5lPyXReXnwEn8';

async function testPatient5AccessFilter() {
  try {
    console.log('🔍 Test du filtrage des accès pour le patient 5...');
    
    // Test : Accès au statut d'accès du patient (nouvelle route)
    console.log('\n📋 Test: Accès au statut d\'accès du patient 5');
    try {
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
      
      // Vérification critique : s'assurer que seules les données du patient 5 sont retournées
      console.log('\n🔒 VÉRIFICATION DE SÉCURITÉ:');
      
      if (data.allRequests && data.allRequests.length > 0) {
        console.log('📋 Nombre total de demandes d\'accès:', data.allRequests.length);
        
        // Vérifier que toutes les demandes appartiennent au patient 5
        const unauthorizedRequests = data.allRequests.filter(req => req.patient_id !== PATIENT_ID);
        
        if (unauthorizedRequests.length === 0) {
          console.log('✅ SÉCURITÉ RESPECTÉE: Toutes les demandes appartiennent au patient 5');
        } else {
          console.log('❌ VIOLATION DE SÉCURITÉ: Demandes non autorisées détectées:');
          unauthorizedRequests.forEach(req => {
            console.log(`   - ID: ${req.id_acces}, Patient: ${req.patient_id} (${req.patient?.nom} ${req.patient?.prenom})`);
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
      console.error('❌ Erreur statut patient:', error.response?.status, error.response?.data?.message || error.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Exécuter le test
testPatient5AccessFilter();
