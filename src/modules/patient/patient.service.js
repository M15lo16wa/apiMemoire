const { Patient } = require('../../models');
const AppError = require('../../utils/appError');
const bcrypt = require('bcryptjs');


// Fonction de génération du numéro de dossier
const generateNumeroDossier = async () => {
  const count = await Patient.count();
  const date = new Date();
  const year = date.getFullYear();
  return `PAT${year}${String(count + 1).padStart(4, '0')}`; 
};

exports.getAllPatients = async () => {
  // const Patients = await Patient.findAll();
  // return Patients;
  return await Patient.findAll();
};

exports.getPatientById = async (id) => {
  const Patients = await Patient.findByPk(id);
  if (!Patients) {
    throw new AppError('Patient not found with that ID', 404);
  }
  return Patients;
};

exports.createPatient = async (patientData) => {

  // Rejeter explicitement les champs inattendus
  if ('role' in patientData) {
    throw new AppError("Le champ 'role' n'est pas autorisé lors de la création d'un patient.", 400);
  }

  // Validation des champs requis selon le schéma actuel de la base
  const requiredFields = ['nom', 'prenom', 'date_naissance', 'sexe', 'email', 'telephone', 'numero_assure', 'nom_assurance', 'mot_de_passe'];
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

  // Vérifier si un patient avec le même numéro d'assuré existe déjà
  if (patientData.numero_assure) {
    const existingPatientByNumeroAssure = await Patient.findOne({
      where: { numero_assure: patientData.numero_assure }
    });
    if (existingPatientByNumeroAssure) {
      throw new AppError('Un patient avec ce numéro d\'assuré existe déjà.', 400);
    }
  }

  // Vérifier si un patient avec le même identifiant national existe déjà (optionnel)
  if (patientData.identifiantNational) {
    const existingPatientByIdentifiant = await Patient.findOne({
      where: { identifiantNational: patientData.identifiantNational }
    });
    if (existingPatientByIdentifiant) {
      throw new AppError('Un patient avec cet identifiant national existe déjà.', 400);
    }
  }

  // Préparer les données patient avec les champs actuels
  const completePatientData = {
    nom: patientData.nom,
    prenom: patientData.prenom,
    date_naissance: patientData.date_naissance,
    sexe: patientData.sexe,
    adresse: patientData.adresse || null,
    telephone: patientData.telephone,
    email: patientData.email,
    identifiantNational: patientData.identifiantNational || null,
    numero_assure: patientData.numero_assure,
    nom_assurance: patientData.nom_assurance,
    mot_de_passe: patientData.mot_de_passe || patientData.password // Support both field names
  };

  // Créer le patient
  const newPatient = await Patient.create(completePatientData);
  
  return newPatient;
};

exports.updatePatient = async (id, patientData) => {
  const Patients = await Patient.findByPk(id);
  if (!Patients) {
    throw new AppError('Patient not found with that ID', 404);
  }

  // Empêcher la modification des champs sensibles
  const forbiddenFields = ['role', 'id_patient'];
  forbiddenFields.forEach(field => {
    if (patientData[field]) {
      delete patientData[field];
    }
  });

  // Vérifier l'unicité de l'email si modifié
  if (patientData.email && patientData.email !== Patients.email) {
    const existingPatient = await Patient.findOne({
      where: { email: patientData.email }
    });
    if (existingPatient) {
      throw new AppError('Un patient avec cet email existe déjà.', 400);
    }
  }

  await Patients.update(patientData);
  return Patients;
};

exports.deletePatient = async (id) => {
  const Patients = await Patient.findByPk(id);
  if (!Patients) {
    throw new AppError('Patient not found with that ID', 404);
  }

  // Suppression du patient
  await Patients.destroy();
  return { message: 'Patient successfully deleted' };
};
