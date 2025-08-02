const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config({ path: "./.env" });

async function checkPrescriptionTable() {
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
  
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie');
    
    // Vérifier la structure de la table
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'Prescriptions' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Structure actuelle de la table Prescriptions:');
    console.log('='.repeat(80));
    columns.forEach(col => {
      console.log(`${col.column_name.padEnd(25)} | ${col.data_type.padEnd(15)} | ${col.is_nullable.padEnd(8)} | ${col.column_default || 'NULL'}`);
    });
    
    // Vérifier les index
    const [indexes] = await sequelize.query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'Prescriptions'
    `);
    
    console.log('\n🔍 Index existants:');
    console.log('='.repeat(80));
    indexes.forEach(idx => {
      console.log(`${idx.indexname}: ${idx.indexdef}`);
    });
    
    // Vérifier les contraintes
    const [constraints] = await sequelize.query(`
      SELECT conname, contype, pg_get_constraintdef(oid) as definition
      FROM pg_constraint 
      WHERE conrelid = 'Prescriptions'::regclass
    `);
    
    console.log('\n🔒 Contraintes existantes:');
    console.log('='.repeat(80));
    constraints.forEach(con => {
      console.log(`${con.conname}: ${con.definition}`);
    });
    
    // Compter les enregistrements
    const [count] = await sequelize.query(`SELECT COUNT(*) as total FROM "Prescriptions"`);
    console.log(`\n📊 Nombre total d'enregistrements: ${count[0].total}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkPrescriptionTable(); 