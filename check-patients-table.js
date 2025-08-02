const config = require('./config/config.json');
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(config.development);

async function checkTable() {
  try {
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'Patients' 
      ORDER BY ordinal_position;
    `);
    
    console.log('Columns in Patients table:');
    results.forEach(col => {
      console.log(`${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkTable();
