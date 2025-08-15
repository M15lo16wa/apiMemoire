// test_table_created.js
// Vérifier que la table documents_personnels a été créée

const { sequelize } = require('./src/models');

async function testTable() {
    try {
        console.log('🔍 Vérification de la table documents_personnels...');
        
        // Vérifier que la table existe
        const [results] = await sequelize.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'documents_personnels'
        `);
        
        if (results.length > 0) {
            console.log('✅ Table documents_personnels créée avec succès !');
            
            // Vérifier la structure de la table
            const [columns] = await sequelize.query(`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_name = 'documents_personnels'
                ORDER BY ordinal_position
            `);
            
            console.log('\n📋 Structure de la table:');
            columns.forEach(col => {
                console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
            });
            
            // Vérifier les contraintes
            const [constraints] = await sequelize.query(`
                SELECT constraint_name, constraint_type
                FROM information_schema.table_constraints 
                WHERE table_name = 'documents_personnels'
            `);
            
            console.log('\n🔒 Contraintes:');
            constraints.forEach(constraint => {
                console.log(`  - ${constraint.constraint_name}: ${constraint.constraint_type}`);
            });
            
        } else {
            console.log('❌ Table documents_personnels non trouvée');
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await sequelize.close();
    }
}

testTable();
