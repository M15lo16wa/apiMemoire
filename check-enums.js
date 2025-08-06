const sequelize = require('./src/config/database');

async function checkEnums() {
  try {
    console.log('🔍 Vérification des enums disponibles...');
    
    const [results] = await sequelize.query(`
      SELECT t.typname as enum_name
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typtype = 'e'
      GROUP BY t.typname
      ORDER BY t.typname;
    `);
    
    console.log('\n📋 Enums disponibles:');
    results.forEach((row, index) => {
      console.log(`${index + 1}. ${row.enum_name}`);
    });
    
    // Vérifier les valeurs de chaque enum
    for (const row of results) {
      console.log(`\n🔍 Valeurs pour l'enum "${row.enum_name}":`);
      const [values] = await sequelize.query(`
        SELECT unnest(enum_range(NULL::"${row.enum_name}")) as enum_value;
      `);
      values.forEach((value, index) => {
        console.log(`  ${index + 1}. "${value.enum_value}"`);
      });
    }
    
    console.log('\n✅ Vérification terminée');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

checkEnums(); 