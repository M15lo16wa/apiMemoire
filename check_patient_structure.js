const { sequelize } = require('./src/config/database');
const { Patient, Utilisateur } = require('./src/models');

async function checkPatientStructure() {
  try {
    // Vérifier la connexion à la base de données
    await sequelize.authenticate();
    console.log('Connexion à la base de données réussie.');

    // Récupérer le patient avec l'ID 5
    const patient = await Patient.findByPk(5);
    if (!patient) {
      console.log('Patient avec ID 5 non trouvé.');
      return;
    }

    console.log('Patient trouvé:', {
      id_patient: patient.id_patient,
      nom: patient.nom,
      prenom: patient.prenom,
      utilisateur_id: patient.utilisateur_id,
      numero_dossier: patient.numero_dossier,
      numero_assure: patient.numero_assure
    });

    // Vérifier tous les champs du patient
    console.log('\nTous les champs du patient:');
    console.log(JSON.stringify(patient.toJSON(), null, 2));

    // Vérifier s'il y a des utilisateurs dans la base
    const utilisateurs = await Utilisateur.findAll();
    console.log(`\nNombre d'utilisateurs dans la base: ${utilisateurs.length}`);
    
    if (utilisateurs.length > 0) {
      console.log('Premier utilisateur:', {
        id_utilisateur: utilisateurs[0].id_utilisateur,
        nom: utilisateurs[0].nom,
        prenom: utilisateurs[0].prenom,
        role: utilisateurs[0].role
      });
    }

    // Vérifier s'il y a des professionnels de santé
    const { ProfessionnelSante } = require('./src/models');
    const professionnels = await ProfessionnelSante.findAll();
    console.log(`\nNombre de professionnels de santé: ${professionnels.length}`);

    if (professionnels.length > 0) {
      console.log('Premier professionnel:', {
        id_professionnel: professionnels[0].id_professionnel,
        nom: professionnels[0].nom,
        prenom: professionnels[0].prenom,
        utilisateur_id: professionnels[0].utilisateur_id
      });
    }

  } catch (error) {
    console.error('Erreur:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

checkPatientStructure();
