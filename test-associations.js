const { Prescription, Patient, ProfessionnelSante, DossierMedical, Utilisateur } = require('./src/models');

async function testAssociations() {
  try {
    console.log('🧪 Test des associations du modèle Prescription...\n');

    // Test 1: Vérifier si les associations sont définies
    console.log('📋 Associations disponibles:');
    console.log('Prescription.associations:', Object.keys(Prescription.associations));
    
    // Test 2: Créer une prescription simple
    console.log('\n📝 Test 2: Création d\'une prescription simple');
    const prescription = await Prescription.create({
      type_prescription: 'ordonnance',
      principe_actif: 'Test Médicament',
      dosage: '100mg',
      frequence: '2 fois par jour',
      patient_id: 1,
      professionnel_id: 1,
      statut: 'active'
    });

    console.log('✅ Prescription créée:', {
      id: prescription.id_prescription,
      numero: prescription.prescriptionNumber,
      type: prescription.type_prescription
    });

    // Test 3: Récupérer avec associations
    console.log('\n🔍 Test 3: Récupération avec associations');
    const prescriptionWithAssociations = await Prescription.findByPk(prescription.id_prescription, {
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['id_patient', 'nom', 'prenom']
        },
        {
          model: ProfessionnelSante,
          as: 'redacteur',
          attributes: ['id_professionnel', 'numero_adeli', 'specialite'],
          include: [{
            model: Utilisateur,
            as: 'compteUtilisateur',
            attributes: ['nom', 'prenom']
          }]
        },
        {
          model: DossierMedical,
          as: 'dossier',
          attributes: ['id_dossier', 'numeroDossier']
        }
      ]
    });

    if (prescriptionWithAssociations) {
      console.log('✅ Prescription avec associations récupérée:');
      console.log('  - Patient:', prescriptionWithAssociations.patient ? 'OK' : 'NON TROUVÉ');
      console.log('  - Rédacteur:', prescriptionWithAssociations.redacteur ? 'OK' : 'NON TROUVÉ');
      console.log('  - Dossier:', prescriptionWithAssociations.dossier ? 'OK' : 'NON TROUVÉ');
    } else {
      console.log('❌ Prescription non trouvée');
    }

    // Test 4: Vérifier les erreurs spécifiques
    console.log('\n🔧 Test 4: Vérification des erreurs');
    try {
      const prescriptionError = await Prescription.findByPk(999999, {
        include: [
          {
            model: Patient,
            as: 'patient'
          }
        ]
      });
      console.log('✅ Pas d\'erreur avec ID inexistant');
    } catch (error) {
      console.log('❌ Erreur avec ID inexistant:', error.message);
    }

    console.log('\n🎉 Tests terminés!');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testAssociations(); 