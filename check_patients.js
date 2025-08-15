const { Patient } = require('./src/models');

async function checkPatients() {
  try {
    console.log('🔍 Vérification des patients existants...');
    
    // Récupérer tous les patients
    const patients = await Patient.findAll({
      attributes: ['id_patient', 'nom', 'prenom', 'numero_assure', 'email'],
      limit: 10
    });
    
    if (patients.length === 0) {
      console.log('❌ Aucun patient trouvé dans la base de données');
      return;
    }
    
    console.log(`✅ ${patients.length} patient(s) trouvé(s):`);
    patients.forEach((patient, index) => {
      console.log(`  ${index + 1}. ID: ${patient.id_patient}`);
      console.log(`     Nom: ${patient.nom} ${patient.prenom}`);
      console.log(`     Numéro d'assuré: ${patient.numero_assure}`);
      console.log(`     Email: ${patient.email}`);
      console.log('');
    });
    
    // Vérifier si un patient a un mot de passe
    const patientWithPassword = await Patient.scope('withPassword').findOne({
      attributes: ['id_patient', 'nom', 'prenom', 'numero_assure', 'mot_de_passe'],
      where: {
        mot_de_passe: { [require('sequelize').Op.ne]: null }
      }
    });
    
    if (patientWithPassword) {
      console.log('🔐 Patient avec mot de passe trouvé:');
      console.log(`  ID: ${patientWithPassword.id_patient}`);
      console.log(`  Nom: ${patientWithPassword.nom} ${patientWithPassword.prenom}`);
      console.log(`  Numéro d'assuré: ${patientWithPassword.numero_assure}`);
      console.log(`  Mot de passe présent: ${!!patientWithPassword.mot_de_passe}`);
      console.log(`  Longueur du mot de passe: ${patientWithPassword.mot_de_passe ? patientWithPassword.mot_de_passe.length : 0}`);
    } else {
      console.log('❌ Aucun patient avec mot de passe trouvé');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des patients:', error);
  }
}

// Exécuter la vérification
checkPatients().catch(console.error);
