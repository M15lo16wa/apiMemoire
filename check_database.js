require('dotenv').config();
const { Sequelize } = require('sequelize');

// Configuration de la base de données
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    logging: false
  }
);

async function checkDatabase() {
  try {
    console.log('🔍 Vérification de la base de données');
    console.log('=====================================\n');

    // Vérifier la connexion
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie\n');

    // Vérifier les professionnels de santé
    const [professionnels] = await sequelize.query(
      'SELECT id_professionnel, numero_adeli, nom, prenom FROM "ProfessionnelsSante" LIMIT 5'
    );
    
    console.log('👨‍⚕️ Professionnels de santé trouvés:');
    if (professionnels.length > 0) {
      professionnels.forEach(p => {
        console.log(`   ID: ${p.id_professionnel}, Numéro ADELI: ${p.numero_adeli}, Nom: ${p.nom} ${p.prenom}`);
      });
    } else {
      console.log('   Aucun professionnel trouvé');
    }

    // Vérifier les utilisateurs
    const [utilisateurs] = await sequelize.query(
      'SELECT id_utilisateur, nom, prenom, role FROM "Utilisateurs" LIMIT 5'
    );
    
    console.log('\n👤 Utilisateurs trouvés:');
    if (utilisateurs.length > 0) {
      utilisateurs.forEach(u => {
        console.log(`   ID: ${u.id_utilisateur}, Nom: ${u.nom} ${u.prenom}, Rôle: ${u.role}`);
      });
    } else {
      console.log('   Aucun utilisateur trouvé');
    }

    // Vérifier les prescriptions
    const [prescriptions] = await sequelize.query(
      'SELECT id_prescription, type_prescription, patient_id FROM "Prescriptions" LIMIT 5'
    );
    
    console.log('\n💊 Prescriptions trouvées:');
    if (prescriptions.length > 0) {
      prescriptions.forEach(p => {
        console.log(`   ID: ${p.id_prescription}, Type: ${p.type_prescription}, Patient ID: ${p.patient_id}`);
      });
    } else {
      console.log('   Aucune prescription trouvée');
    }

    // Vérifier les patients
    const [patients] = await sequelize.query(
      'SELECT id_patient, nom, prenom FROM "Patients" LIMIT 5'
    );
    
    console.log('\n🏥 Patients trouvés:');
    if (patients.length > 0) {
      patients.forEach(p => {
        console.log(`   ID: ${p.id_patient}, Nom: ${p.nom} ${p.prenom}`);
      });
    } else {
      console.log('   Aucun patient trouvé');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkDatabase();
