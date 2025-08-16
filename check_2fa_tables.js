const { sequelize } = require('./src/config/database');

async function check2FATables() {
  try {
    console.log('🔍 Vérification de la structure des tables 2FA...\n');
    
    // Vérifier la table Historique2FA
    console.log('1️⃣ Vérification de la table Historique2FA...');
    const [historiqueColumns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'Historique2FA'
      ORDER BY ordinal_position;
    `);
    
    if (historiqueColumns.length === 0) {
      console.log('❌ Table Historique2FA n\'existe pas !');
    } else {
      console.log('✅ Table Historique2FA existe avec les colonnes:');
      historiqueColumns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }
    console.log('');

    // Vérifier les champs 2FA dans la table Utilisateurs
    console.log('2️⃣ Vérification des champs 2FA dans Utilisateurs...');
    const [utilisateurColumns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'Utilisateurs' 
      AND column_name LIKE 'two_factor%'
      ORDER BY ordinal_position;
    `);
    
    if (utilisateurColumns.length === 0) {
      console.log('❌ Aucun champ 2FA trouvé dans Utilisateurs !');
    } else {
      console.log('✅ Champs 2FA dans Utilisateurs:');
      utilisateurColumns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }
    console.log('');

    // Vérifier les champs 2FA dans la table Patients
    console.log('3️⃣ Vérification des champs 2FA dans Patients...');
    const [patientColumns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'Patients' 
      AND column_name LIKE 'two_factor%'
      ORDER BY ordinal_position;
    `);
    
    if (patientColumns.length === 0) {
      console.log('❌ Aucun champ 2FA trouvé dans Patients !');
    } else {
      console.log('✅ Champs 2FA dans Patients:');
      patientColumns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }
    console.log('');

    // Vérifier les champs 2FA dans la table ProfessionnelsSante
    console.log('4️⃣ Vérification des champs 2FA dans ProfessionnelsSante...');
    const [professionnelColumns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'ProfessionnelsSante' 
      AND column_name LIKE 'two_factor%'
      ORDER BY ordinal_position;
    `);
    
    if (professionnelColumns.length === 0) {
      console.log('❌ Aucun champ 2FA trouvé dans ProfessionnelsSante !');
    } else {
      console.log('✅ Champs 2FA dans ProfessionnelsSante:');
      professionnelColumns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }
    console.log('');

    // Vérifier l'état des migrations
    console.log('5️⃣ Vérification de l\'état des migrations...');
    const [migrations] = await sequelize.query(`
      SELECT name, executed_at 
      FROM SequelizeMeta 
      WHERE name LIKE '%2fa%' OR name LIKE '%add-2fa%'
      ORDER BY executed_at DESC;
    `);
    
    if (migrations.length === 0) {
      console.log('❌ Aucune migration 2FA trouvée dans SequelizeMeta !');
    } else {
      console.log('✅ Migrations 2FA trouvées:');
      migrations.forEach(mig => {
        console.log(`   - ${mig.name}: exécutée le ${mig.executed_at}`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Connexion fermée');
  }
}

check2FATables();
