require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
  logging: false
});

async function checkProfessionnelRole() {
  try {
    console.log('🔍 Vérification du rôle du professionnel de santé...\n');

    // Vérifier le professionnel avec l'ID 79
    const professionnel = await sequelize.query(`
      SELECT 
        id_professionnel,
        nom,
        prenom,
        numero_adeli,
        role,
        statut,
        specialite
      FROM "ProfessionnelsSante" 
      WHERE id_professionnel = 79
    `, { type: Sequelize.QueryTypes.SELECT });

    if (professionnel.length === 0) {
      console.log('❌ Aucun professionnel trouvé avec l\'ID 79');
      return;
    }

    const prof = professionnel[0];
    console.log('✅ Professionnel trouvé:');
    console.log('📋 ID:', prof.id_professionnel);
    console.log('📋 Nom:', prof.nom);
    console.log('📋 Prénom:', prof.prenom);
    console.log('📋 Numéro ADELI:', prof.numero_adeli);
    console.log('📋 Rôle:', prof.role);
    console.log('📋 Statut:', prof.statut);
    console.log('📋 Spécialité:', prof.specialite);

    // Vérifier tous les rôles disponibles
    const roles = await sequelize.query(`
      SELECT DISTINCT role 
      FROM "ProfessionnelsSante" 
      WHERE role IS NOT NULL
    `, { type: Sequelize.QueryTypes.SELECT });

    console.log('\n📊 Rôles disponibles dans la base:');
    roles.forEach(r => console.log('-', r.role));

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkProfessionnelRole(); 