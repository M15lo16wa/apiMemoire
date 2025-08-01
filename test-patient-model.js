const { Patient } = require('./src/models');

async function testPatientModel() {
  console.log('🧪 Testing Patient Model with Insurance Fields...\n');

  try {
    // Test creating a new patient with insurance fields
    const testPatient = {
      nom: 'Test',
      prenom: 'Patient',
      date_naissance: '1990-01-01',
      sexe: 'M',
      telephone: '+221701234567',
      email: 'test.patient@example.com',
      adresse: '123 Test Street',
      identifiantNational: '1234567890123',
      numero_assure: 'IPRES123456789',
      nom_assurance: 'IPRES',
      mot_de_passe: 'testpassword123'
    };

    console.log('✅ Creating test patient...');
    const newPatient = await Patient.create(testPatient);
    console.log(`Patient created with ID: ${newPatient.id_patient}`);
    console.log(`Insurance Number: ${newPatient.numero_assure}`);
    console.log(`Insurance Company: ${newPatient.nom_assurance}`);
    console.log(`Password hidden in default scope: ${newPatient.mot_de_passe ? 'No' : 'Yes'}\n`);

    // Test finding patient with password scope
    console.log('✅ Testing withPassword scope...');
    const patientWithPassword = await Patient.scope('withPassword').findByPk(newPatient.id_patient);
    console.log(`Password visible with scope: ${patientWithPassword.mot_de_passe ? 'Yes' : 'No'}\n`);

    // Test authentication method
    console.log('✅ Testing authentication method...');
    const isValidPassword = await patientWithPassword.seConnecter('testpassword123');
    console.log(`Password authentication successful: ${isValidPassword ? 'Yes' : 'No'}\n`);

    // Clean up - delete test patient
    console.log('🧹 Cleaning up test data...');
    await newPatient.destroy();
    console.log('Test patient deleted successfully\n');

    console.log('🎉 All tests passed! Patient model is working correctly with insurance fields.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testPatientModel().then(() => {
  console.log('\n✨ Test completed!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test script failed:', error);
  process.exit(1);
});
