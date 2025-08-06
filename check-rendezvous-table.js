require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
  logging: false
});

async function checkRendezVousTable() {
  try {
    console.log('🔍 Vérification de la structure de la table RendezVous...\n');

    // Vérifier la structure de la table
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'RendezVous'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Colonnes de la table RendezVous:');
    results.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Vérifier s'il y a des données
    const [count] = await sequelize.query('SELECT COUNT(*) as count FROM "RendezVous"');
    console.log(`\n📊 Nombre de rendez-vous: ${count[0].count}`);

    // Vérifier les colonnes de date
    console.log('\n🔍 Colonnes de date:');
    const dateColumns = results.filter(col => col.data_type.includes('timestamp') || col.data_type.includes('date'));
    dateColumns.forEach(col => {
      console.log(`  - ${col.column_name}`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkRendezVousTable(); 