const sequelize = require('./src/config/database');

async function checkAutorisationsPatient() {
  try {
    console.log('🔍 Vérification des autorisations d\'accès pour le patient...');
    
    // Vérifier les autorisations pour le patient ID 5
    const [autorisations] = await sequelize.query(`
      SELECT 
        aa.id_acces,
        aa.type_acces,
        aa.date_debut,
        aa.date_fin,
        aa.statut,
        aa.raison_demande,
        aa.patient_id,
        aa.professionnel_id,
        ps.nom as professionnel_nom,
        ps.prenom as professionnel_prenom,
        ps.specialite as professionnel_specialite
      FROM "AutorisationsAcces" aa
      LEFT JOIN "ProfessionnelsSante" ps ON aa.professionnel_id = ps.id_professionnel
      WHERE aa.patient_id = 5
      ORDER BY aa."createdAt" DESC;
    `);
    
    console.log('\n📋 Autorisations d\'accès pour le patient ID 5:');
    if (autorisations.length === 0) {
      console.log('❌ Aucune autorisation trouvée pour ce patient');
    } else {
      autorisations.forEach((auth, index) => {
        console.log(`\n${index + 1}. Autorisation ID: ${auth.id_acces}`);
        console.log(`   - Type: ${auth.type_acces}`);
        console.log(`   - Statut: ${auth.statut}`);
        console.log(`   - Date début: ${auth.date_debut}`);
        console.log(`   - Date fin: ${auth.date_fin || 'Non définie'}`);
        console.log(`   - Raison: ${auth.raison_demande || 'Non spécifiée'}`);
        console.log(`   - Professionnel: ${auth.professionnel_nom} ${auth.professionnel_prenom} (${auth.professionnel_specialite})`);
      });
    }
    
    // Vérifier toutes les autorisations dans la table
    const [toutesAutorisations] = await sequelize.query(`
      SELECT 
        id_acces,
        type_acces,
        statut,
        patient_id,
        professionnel_id,
        "createdAt"
      FROM "AutorisationsAcces"
      ORDER BY "createdAt" DESC
      LIMIT 10;
    `);
    
    console.log('\n📋 Dernières autorisations dans la base de données:');
    toutesAutorisations.forEach((auth, index) => {
      console.log(`${index + 1}. ID: ${auth.id_acces}, Type: ${auth.type_acces}, Statut: ${auth.statut}, Patient: ${auth.patient_id}, Professionnel: ${auth.professionnel_id}, Date: ${auth.createdAt}`);
    });
    
    console.log('\n✅ Vérification terminée');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

checkAutorisationsPatient(); 