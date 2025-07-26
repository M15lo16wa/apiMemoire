const axios = require('axios');

async function testPatientLogin() {
  try {
    console.log('Testing patient login...');
    
    // Use the test patient we just created
    const response = await axios.post('http://localhost:3000/api/patient/auth/login', {
      numero_assure: 'TEST123456',
      mot_de_passe: 'testpassword'
    });
    
    console.log('Login successful!');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Login failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testPatientLogin();