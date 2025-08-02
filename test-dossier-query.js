const config = require('./config/config.json');
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(config.development);

async function testQuery() {
  try {
    const [results] = await sequelize.query(`
      SELECT "DossierMedical"."id_dossier", "DossierMedical"."numeroDossier", 
             "patient"."id_patient" AS "patient.id_patient", 
             "patient"."numero_dossier" AS "patient.numero_dossier", 
             "patient"."nom" AS "patient.nom", 
             "patient"."prenom" AS "patient.prenom" 
      FROM "DossiersMedicaux" AS "DossierMedical" 
      LEFT OUTER JOIN "Patients" AS "patient" ON "DossierMedical"."patient_id" = "patient"."id_patient" 
      AND ("patient"."deletedAt" IS NULL) 
      WHERE "DossierMedical"."id_dossier" = '6'
      LIMIT 1;
    `);
    
    console.log('Query executed successfully!');
    console.log('Number of results:', results.length);
    if (results.length > 0) {
      console.log('First result:', results[0]);
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testQuery();
