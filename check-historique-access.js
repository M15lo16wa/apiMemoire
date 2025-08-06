require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
  logging: false
});

async function checkHistoriqueAccess() {
  try {
    console.log('🔍 Vérification de la structure de la table HistoriquesAccess...\n');

    // Vérifier la structure de la table
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'HistoriquesAccess'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Colonnes de la table HistoriquesAccess:');
    results.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Vérifier s'il y a des données
    const [count] = await sequelize.query('SELECT COUNT(*) as count FROM "HistoriquesAccess"');
    console.log(`\n📊 Nombre d'historiques: ${count[0].count}`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkHistoriqueAccess(); 