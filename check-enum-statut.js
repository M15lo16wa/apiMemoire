const sequelize = require('./src/config/database');

async function checkEnumStatut() {
  try {
    console.log('🔍 Vérification des valeurs de l\'enum statut...');
    
    const [results] = await sequelize.query(`
      SELECT unnest(enum_range(NULL::enum_AutorisationsAcces_statut)) as statut_value;
    `);
    
    console.log('\n📋 Valeurs acceptées pour l\'enum statut:');
    results.forEach((row, index) => {
      console.log(`${index + 1}. "${row.statut_value}"`);
    });
    
    console.log('\n✅ Vérification terminée');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

checkEnumStatut(); 