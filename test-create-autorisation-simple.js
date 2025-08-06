const { AutorisationAcces, Patient, ProfessionnelSante } = require('./src/models');

async function testCreateAutorisationSimple() {
  try {
    console.log('🧪 Test de création d\'autorisation simple...');
    
    // Vérifier qu'un professionnel existe
    const professionnel = await ProfessionnelSante.findOne();
    if (!professionnel) {
      console.log('❌ Aucun professionnel trouvé');
      return;
    }
    console.log('✅ Professionnel trouvé:', professionnel.nom, professionnel.prenom);
    
    // Créer une autorisation avec seulement les champs obligatoires
    console.log('\n🔐 Création d\'une autorisation simple...');
    
    const autorisationData = {
      type_acces: 'lecture',
      date_debut: new Date(),
      statut: 'actif',
      patient_id: 5,
      professionnel_id: professionnel.id_professionnel
    };
    
    console.log('📋 Données d\'autorisation:', autorisationData);
    
    // Utiliser create directement pour voir l'erreur exacte
    const autorisation = await AutorisationAcces.create(autorisationData);
    
    console.log('✅ Autorisation créée avec succès !');
    console.log('ID:', autorisation.id_acces);
    console.log('Type:', autorisation.type_acces);
    console.log('Statut:', autorisation.statut);
    
    console.log('\n✅ Test terminé avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.errors) {
      error.errors.forEach(err => {
        console.error('  -', err.message, '(', err.path, ')');
      });
    }
    process.exit(1);
  }
}

testCreateAutorisationSimple(); 