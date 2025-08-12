const axios = require('axios');

async function testEndpoint() {
  try {
    console.log('Test de l\'endpoint GET /api/prescription/patient/5...');
    
    const response = await axios.get('http://localhost:3001/api/prescription/patient/5', {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwicm9sZSI6InBhdGllbnQiLCJ0eXBlIjoicGF0aWVudCIsImlhdCI6MTc1NDk5ODk4NywiZXhwIjoxNzU1MDAyNTg3fQ.xx6jSG7xc5YLOHO0mIvsXda-m42wWiIr4r_dysio57E'
      }
    });
    
    console.log('Succès:', response.status, response.data);
  } catch (error) {
    console.log('Erreur:', error.response?.status, error.response?.data);
    console.log('Message d\'erreur complet:', error.message);
    
    if (error.response?.data?.error) {
      console.log('Détails de l\'erreur:', error.response.data.error);
    }
    
    if (error.response?.data?.stack) {
      console.log('Stack trace:', error.response.data.stack);
    }
  }
}

testEndpoint();
