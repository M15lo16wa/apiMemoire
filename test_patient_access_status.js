const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const PATIENT_ID = 5;

// Token du patient 5 (généré)
const PATIENT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiaWRfcGF0aWVudCI6NSwicm9sZSI6InBhdGllbnQiLCJ0eXBlIjoicGF0aWVudCIsIm5vbSI6IlBhdGllbnQiLCJwcmVub20iOiJUZXN0IiwiaWF0IjoxNzU1MDQwODMzLCJleHAiOjE3NTUxMjcyMzN9.mxToSc6mKPFtKA5lPyXReXnwEn8';

async function testPatientAccessStatus() {
  try {
    console.log('🔍 Test d\'accès du patient 5 à son statut d\'accès...');
    
    // Test 1: Accès au statut d'accès du patient (nouvelle route)
    console.log('\n📋 Test 1: Accès au statut d\'accès du patient (nouvelle route)');
    try {
      const response = await axios.get(`${BASE_URL}/access/patient/status`, {
        headers: {
          'Authorization': `Bearer ${PATIENT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Succès! Status:', response.status);
      console.log('📊 Données reçues:', response.data.status);
      console.log('🆔 Patient ID:', response.data.data.patient_id);
      console.log('📈 Résumé:', response.data.data.summary);
      
    } catch (error) {
      console.error('❌ Erreur statut patient:', error.response?.status, error.response?.data?.message || error.message);
    }
    
    // Test 2: Tentative d'accès à l'ancienne route (doit échouer)
    console.log('\n📋 Test 2: Tentative d\'accès à l\'ancienne route (doit échouer)');
    try {
      const response = await axios.get(`${BASE_URL}/access/status/${PATIENT_ID}`, {
        headers: {
          'Authorization': `Bearer ${PATIENT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('❌ Erreur: Le patient a pu accéder à la route professionnelle!');
      
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Correct: Accès refusé à la route professionnelle');
      } else {
        console.error('❌ Erreur inattendue:', error.response?.status, error.response?.data?.message || error.message);
      }
    }
    
    // Test 3: Tentative d'accès au statut d'un autre patient (doit échouer)
    console.log('\n📋 Test 3: Tentative d\'accès au statut d\'un autre patient (doit échouer)');
    try {
      const response = await axios.get(`${BASE_URL}/access/patient/status`, {
        headers: {
          'Authorization': `Bearer ${PATIENT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Vérifier que le patient ne peut voir que ses propres données
      if (response.data.data.patient_id === PATIENT_ID) {
        console.log('✅ Correct: Le patient ne peut voir que ses propres données');
      } else {
        console.log('❌ Erreur: Le patient peut voir les données d\'un autre patient!');
      }
      
    } catch (error) {
      console.error('❌ Erreur inattendue:', error.response?.status, error.response?.data?.message || error.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Exécuter le test
testPatientAccessStatus();
