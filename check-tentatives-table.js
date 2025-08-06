require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
  logging: false
});

async function checkTentativesTable() {
  try {
    console.log('=== Vérification de la structure de la table TentativesAuthentificationCPS ===\n');

    // Vérifier si la table existe
    const tableExists = await sequelize.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'TentativesAuthentificationCPS')",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!tableExists[0].exists) {
      console.log('❌ La table TentativesAuthentificationCPS n\'existe pas');
      return;
    }

    console.log('✅ La table TentativesAuthentificationCPS existe\n');

    // Obtenir la structure de la table
    const columns = await sequelize.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'TentativesAuthentificationCPS'
      ORDER BY ordinal_position
    `, { type: Sequelize.QueryTypes.SELECT });

    console.log('📋 Structure de la table :');
    console.log('Colonne | Type | Nullable | Default');
    console.log('--------|------|---------|---------');

    columns.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? 'YES' : 'NO';
      const defaultValue = col.column_default || 'NULL';
      console.log(`${col.column_name} | ${col.data_type} | ${nullable} | ${defaultValue}`);
    });

    // Vérifier les contraintes et index
    const constraints = await sequelize.query(`
      SELECT 
        constraint_name,
        constraint_type
      FROM information_schema.table_constraints 
      WHERE table_name = 'TentativesAuthentificationCPS'
    `, { type: Sequelize.QueryTypes.SELECT });

    if (constraints.length > 0) {
      console.log('\n🔒 Contraintes :');
      constraints.forEach(constraint => {
        console.log(`- ${constraint.constraint_name}: ${constraint.constraint_type}`);
      });
    }

    // Vérifier les index
    const indexes = await sequelize.query(`
      SELECT 
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE tablename = 'TentativesAuthentificationCPS'
    `, { type: Sequelize.QueryTypes.SELECT });

    if (indexes.length > 0) {
      console.log('\n📊 Index :');
      indexes.forEach(index => {
        console.log(`- ${index.indexname}`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkTentativesTable(); 