const config = require('./config/config.json');
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(config.development);

async function checkIndexes() {
  try {
    const [results] = await sequelize.query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'Patients' AND indexname LIKE '%numero_dossier%';
    `);
    
    console.log('Indexes on numero_dossier:');
    if (results.length === 0) {
      console.log('No indexes found for numero_dossier');
    } else {
      results.forEach(idx => {
        console.log(`${idx.indexname}: ${idx.indexdef}`);
      });
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkIndexes();
