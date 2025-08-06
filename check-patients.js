require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
  logging: false
});

async function checkPatients() {
  try {
    console.log('🔍 Vérification des patients existants...\n');

    // Vérifier les patients
    const [patients] = await sequelize.query('SELECT id_patient, nom, prenom, numero_dossier FROM "Patients" ORDER BY id_patient;');

    console.log('📋 Patients existants:');
    patients.forEach(patient => {
      console.log(`  - ID: ${patient.id_patient}, Nom: ${patient.nom} ${patient.prenom}, Dossier: ${patient.numero_dossier}`);
    });

    if (patients.length === 0) {
      console.log('❌ Aucun patient trouvé dans la base de données');
    } else {
      console.log(`\n📊 Total: ${patients.length} patient(s)`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkPatients(); 