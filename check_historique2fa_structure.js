const { sequelize } = require('./src/config/database');

async function checkHistorique2FAStructure() {
  try {
    console.log('🔍 Vérification détaillée de la structure Historique2FA...\n');
    
    // Vérifier toutes les colonnes de la table Historique2FA
    const [columns] = await sequelize.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'Historique2FA'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Colonnes de la table Historique2FA:');
    columns.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const maxLength = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
      console.log(`   - ${col.column_name}: ${col.data_type}${maxLength} ${nullable}`);
      if (col.column_default) {
        console.log(`     Default: ${col.column_default}`);
      }
    });
    console.log('');

    // Vérifier les contraintes
    const [constraints] = await sequelize.query(`
      SELECT 
        constraint_name,
        constraint_type,
        table_name
      FROM information_schema.table_constraints 
      WHERE table_name = 'Historique2FA';
    `);
    
    console.log('🔒 Contraintes de la table Historique2FA:');
    constraints.forEach(constraint => {
      console.log(`   - ${constraint.constraint_name}: ${constraint.constraint_type}`);
    });
    console.log('');

    // Vérifier les index
    const [indexes] = await sequelize.query(`
      SELECT 
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE tablename = 'Historique2FA';
    `);
    
    console.log('📊 Index de la table Historique2FA:');
    indexes.forEach(index => {
      console.log(`   - ${index.indexname}: ${index.indexdef}`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Connexion fermée');
  }
}

checkHistorique2FAStructure();
