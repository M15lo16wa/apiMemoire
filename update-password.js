const { Patient } = require('./src/models');
const bcrypt = require('bcryptjs');
const sequelize = require('./src/config/database');

async function updatePatientPassword() {
  try {
    // Connect to the database
    await sequelize.authenticate();
    console.log('Connection to database has been established successfully.');

    // Find the patient by numero_assure
    const patient = await Patient.findOne({
      where: { numero_assure: 'SN123456789' }
    });

    if (!patient) {
      console.error('Patient not found!');
      return;
    }

    console.log(`Found patient: ID: ${patient.id_patient}, Name: ${patient.nom} ${patient.prenom}`);
    
    // Hash the new password
    const newPassword = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the password
    await patient.update({ mot_de_passe: hashedPassword });
    
    console.log('Password updated successfully!');
    console.log(`New password for ${patient.nom} ${patient.prenom}: ${newPassword}`);
    console.log(`Hashed password: ${hashedPassword.substring(0, 20)}...`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await sequelize.close();
  }
}

updatePatientPassword();