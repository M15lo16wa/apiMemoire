const { Patient } = require('./src/models');
const bcrypt = require('bcryptjs');
const sequelize = require('./src/config/database');

async function createTestPatient() {
  try {
    // Connect to the database
    await sequelize.authenticate();
    console.log('Connection to database has been established successfully.');

    // Generate a unique numero_dossier
    const count = await Patient.count();
    const date = new Date();
    const year = date.getFullYear();
    const numeroDossier = `PAT${year}${String(count + 1).padStart(4, '0')}`;

    // Hash the password
    const password = 'testpassword';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new patient
    const newPatient = await Patient.create({
      numero_dossier: numeroDossier,
      nom: 'Test',
      prenom: 'Patient',
      date_naissance: '1990-01-01',
      lieu_naissance: 'Test City',
      civilite: 'M.',
      sexe: 'M',
      numero_assure: 'TEST123456',
      nom_assurance: 'Test Insurance',
      adresse: 'Test Address',
      ville: 'Test City',
      pays: 'Test Country',
      email: 'test.patient@example.com',
      telephone: '+1234567890',
      mot_de_passe: hashedPassword,
      statut: 'actif'
    });

    console.log('Test patient created successfully!');
    console.log(`ID: ${newPatient.id_patient}, Name: ${newPatient.nom} ${newPatient.prenom}`);
    console.log(`Numero Assure: ${newPatient.numero_assure}`);
    console.log(`Password: ${password}`);
    console.log(`Hashed Password: ${hashedPassword.substring(0, 20)}...`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await sequelize.close();
  }
}

createTestPatient();