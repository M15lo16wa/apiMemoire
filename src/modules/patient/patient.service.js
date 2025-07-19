const { Patient, Utilisateur } = require('../../models');
const AppError = require('../../utils/appError');

exports.getAllPatients = async () => {
  const patients = await Patient.findAll({
    include: {
        model: Utilisateur,
        as: 'compteUtilisateur', // Assurez-vous que l'alias 'compteUtilisateur' est défini dans vos associations
        attributes: ['id_utilisateur', 'email', 'nom', 'prenom', 'role', 'statut'] // Inclut les détails pertinents du compte utilisateur
    }
  });
  return patients;
};

exports.getPatientById = async (id) => {
  const patient = await Patient.findByPk(id, {
    include: {
        model: Utilisateur,
        as: 'compteUtilisateur',
        attributes: ['id_utilisateur', 'email', 'nom', 'prenom', 'role', 'statut']
    }
  });
  if (!patient) {
    throw new AppError('Patient not found with that ID', 404);
  }
  return patient;
};

exports.createPatient = async (patientData) => {
  // Rejeter explicitement les champs inattendus
  if ('utilisateur_id' in patientData || 'role' in patientData) {
    throw new AppError("Les champs 'utilisateur_id' et 'role' ne sont pas autorisés lors de la création d'un patient.", 400);
  }
  // Validation des champs requis : nom, prénom, âge, sexe, email, téléphone, ville
  const requiredFields = ['nom', 'prenom', 'age', 'sexe', 'email', 'telephone', 'ville'];
  const missingFields = requiredFields.filter(field => !patientData[field]);
  
  if (missingFields.length > 0) {
    throw new AppError(`Les champs suivants sont requis : ${missingFields.join(', ')}`, 400);
  }

  // Vérifier si un patient avec le même email existe déjà
  if (patientData.email) {
      const existingPatientByEmail = await Patient.findOne({
        where: { email: patientData.email }
      });
      if (existingPatientByEmail) {
        throw new AppError('Un patient avec cet email existe déjà.', 400);
      }
  }

  // Préparer les données patient avec seulement les champs essentiels
  const simplifiedPatientData = {
    nom: patientData.nom,
    prenom: patientData.prenom,
    age: patientData.age,
    sexe: patientData.sexe,
    email: patientData.email,
    telephone: patientData.telephone,
    ville: patientData.ville,
    statut: 'actif'
  };

  // Créer le patient avec les champs simplifiés
  const newPatient = await Patient.create(simplifiedPatientData);
  return newPatient;
};

exports.updatePatient = async (id, patientData) => {
  const patient = await Patient.findByPk(id);
  if (!patient) {
    throw new AppError('Patient not found with that ID', 404);
  }

  // Empêcher la modification des champs d'authentification via update
  if (patientData.mot_de_passe) {
      delete patientData.mot_de_passe; // Le mot de passe doit être changé via une route dédiée
  }
  if (patientData.role) {
      delete patientData.role; // Le rôle ne peut pas être modifié
  }

  await patient.update(patientData);
  return patient;
};

exports.deletePatient = async (id) => {
  const patient = await Patient.findByPk(id);
  if (!patient) {
    throw new AppError('Patient not found with that ID', 404);
  }

  // Suppression directe du patient (plus de lien avec un utilisateur)

  await patient.destroy();
  return { message: 'Patient successfully deleted' };
};