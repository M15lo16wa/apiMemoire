const { sequelize } = require('./src/models');

async function checkTableStructure() {
    try {
        console.log('=== Vérification de la structure de la table NotificationsAccesDMP ===\n');
        
        // Vérifier si la table existe
        const tableExists = await sequelize.query(
            "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'NotificationsAccesDMP')",
            { type: sequelize.QueryTypes.SELECT }
        );
        
        if (!tableExists[0].exists) {
            console.log('❌ La table NotificationsAccesDMP n\'existe pas');
            return;
        }
        
        console.log('✅ La table NotificationsAccesDMP existe');
        
        // Obtenir la structure de la table
        const columns = await sequelize.query(
            `SELECT column_name, data_type, is_nullable, column_default 
             FROM information_schema.columns 
             WHERE table_name = 'NotificationsAccesDMP' 
             ORDER BY ordinal_position`,
            { type: sequelize.QueryTypes.SELECT }
        );
        
        console.log('\n📋 Structure de la table :');
        console.log('Colonne | Type | Nullable | Default');
        console.log('--------|------|---------|---------');
        
        columns.forEach(col => {
            console.log(`${col.column_name} | ${col.data_type} | ${col.is_nullable} | ${col.column_default || 'NULL'}`);
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la vérification:', error.message);
    } finally {
        await sequelize.close();
    }
}

checkTableStructure();