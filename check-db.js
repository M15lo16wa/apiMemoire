const { Patient } = require('./src/models');
const sequelize = require('./src/config/database');

async function checkDatabase() {
  try {
    // Connect to the database
    await sequelize.authenticate();
    console.log('Connection to database has been established successfully.');

    // Get all patients
    const patients = await Patient.findAll({
      attributes: ['id_patient', 'nom', 'prenom', 'numero_assure', 'mot_de_passe']
    });

    console.log('Number of patients:', patients.length);
    
    if (patients.length > 0) {
      console.log('Sample patient data:');
      patients.forEach(patient => {
        console.log(`ID: ${patient.id_patient}, Name: ${patient.nom} ${patient.prenom}, Numero Assure: ${patient.numero_assure}, Password Hash: ${patient.mot_de_passe ? patient.mot_de_passe.substring(0, 20) + '...' : 'null'}`);
      });
    } else {
      console.log('No patients found in the database.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await sequelize.close();
  }
}

checkDatabase();