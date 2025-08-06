const sequelize = require('./src/config/database');

async function checkAutorisationTable() {
  try {
    console.log('🔍 Vérification de la structure de la table AutorisationsAcces...');
    
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'AutorisationsAcces' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Colonnes de la table AutorisationsAcces:');
    results.forEach(row => {
      console.log(`- ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`);
    });
    
    console.log('\n✅ Vérification terminée');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

checkAutorisationTable(); 