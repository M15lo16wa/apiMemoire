require('dotenv').config();

async function debugService() {
  try {
    console.log('🔍 Debug du service PrescriptionService');
    console.log('=====================================\n');

    // Test 1: Vérifier les imports
    console.log('1️⃣ Test des imports:');
    try {
      const { Prescription, Patient, ProfessionnelSante, DossierMedical, Utilisateur } = require('./src/models');
      console.log('✅ Modèles importés avec succès');
      console.log('   Prescription:', typeof Prescription);
      console.log('   Patient:', typeof Patient);
      console.log('   ProfessionnelSante:', typeof ProfessionnelSante);
      console.log('   DossierMedical:', typeof DossierMedical);
      console.log('   Utilisateur:', typeof Utilisateur);
    } catch (error) {
      console.log('❌ Erreur lors de l\'import des modèles:', error.message);
      return;
    }

    // Test 2: Vérifier la connexion à la base
    console.log('\n2️⃣ Test de la connexion à la base:');
    try {
      const { sequelize } = require('./src/config/database');
      await sequelize.authenticate();
      console.log('✅ Connexion à la base de données établie');
    } catch (error) {
      console.log('❌ Erreur de connexion à la base:', error.message);
      return;
    }

    // Test 3: Test simple de requête
    console.log('\n3️⃣ Test de requête simple:');
    try {
      const { Prescription } = require('./src/models');
      const count = await Prescription.count();
      console.log('✅ Nombre total de prescriptions:', count);
    } catch (error) {
      console.log('❌ Erreur lors du comptage des prescriptions:', error.message);
      console.log('   Stack:', error.stack);
    }

    // Test 4: Test avec associations
    console.log('\n4️⃣ Test avec associations:');
    try {
      const { Prescription, Patient } = require('./src/models');
      const prescription = await Prescription.findOne({
        include: [{
          model: Patient,
          as: 'patient',
          attributes: ['id_patient', 'nom', 'prenom']
        }]
      });
      
      if (prescription) {
        console.log('✅ Prescription trouvée avec patient:', prescription.patient ? '✅' : '❌');
        console.log('   ID Prescription:', prescription.id_prescription);
        console.log('   Patient associé:', prescription.patient ? prescription.patient.nom : 'Aucun');
      } else {
        console.log('⚠️ Aucune prescription trouvée');
      }
    } catch (error) {
      console.log('❌ Erreur lors du test des associations:', error.message);
      console.log('   Stack:', error.stack);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

debugService();
