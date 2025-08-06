const { AutorisationAcces, Patient, ProfessionnelSante } = require('./src/models');

async function testCreateAutorisation() {
  try {
    console.log('🧪 Test de création d\'autorisation d\'accès...');
    
    // Vérifier que le patient existe
    const patient = await Patient.findByPk(5);
    if (!patient) {
      console.log('❌ Patient ID 5 non trouvé');
      return;
    }
    console.log('✅ Patient trouvé:', patient.nom, patient.prenom);
    
    // Vérifier qu'un professionnel existe
    const professionnel = await ProfessionnelSante.findOne();
    if (!professionnel) {
      console.log('❌ Aucun professionnel trouvé');
      return;
    }
    console.log('✅ Professionnel trouvé:', professionnel.nom, professionnel.prenom);
    
    // Créer une autorisation
    console.log('\n🔐 Création d\'une autorisation d\'accès...');
    
    const autorisationData = {
      type_acces: 'lecture',
      date_debut: new Date(),
      date_fin: null,
      statut: 'Actif',
      raison_demande: 'Test d\'autorisation d\'accès',
      conditions_acces: { lecture: true, ecriture: false },
      patient_id: 5,
      professionnel_id: professionnel.id_professionnel,
      accorde_par: 5,
      validateur_id: 5,
      createdBy: 5
    };
    
    console.log('📋 Données d\'autorisation:', autorisationData);
    
    const autorisation = await AutorisationAcces.creerAutorisation(autorisationData);
    
    console.log('✅ Autorisation créée avec succès !');
    console.log('ID:', autorisation.id_acces);
    console.log('Type:', autorisation.type_acces);
    console.log('Statut:', autorisation.statut);
    console.log('Patient ID:', autorisation.patient_id);
    console.log('Professionnel ID:', autorisation.professionnel_id);
    
    // Vérifier que l'autorisation est bien visible pour le patient
    console.log('\n🔍 Vérification de la visibilité pour le patient...');
    const autorisationsPatient = await AutorisationAcces.findAll({
      where: { patient_id: 5 },
      include: [
        {
          model: ProfessionnelSante,
          as: 'professionnelDemandeur',
          attributes: ['nom', 'prenom', 'specialite']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    console.log('📋 Autorisations trouvées pour le patient:', autorisationsPatient.length);
    autorisationsPatient.forEach((auth, index) => {
      console.log(`${index + 1}. ID: ${auth.id_acces}, Type: ${auth.type_acces}, Statut: ${auth.statut}`);
      if (auth.professionnelDemandeur) {
        console.log(`   Professionnel: ${auth.professionnelDemandeur.nom} ${auth.professionnelDemandeur.prenom}`);
      }
    });
    
    console.log('\n✅ Test terminé avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testCreateAutorisation(); 