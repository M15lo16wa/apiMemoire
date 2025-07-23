const { Patient } = require('../../models');
const AppError = require('../../utils/appError');
const bcrypt = require('bcryptjs');

exports.getAllPatients = async () => {
  const Patients = await Patient.findAll();
  return Patients;
};

exports.getPatientById = async (id) => {
  const Patients = await Patient.findByPk(id);
  if (!Patients) {
    throw new AppError('Patient not found with that ID', 404);
  }
  return Patients;
};

const generateNumeroDossier = async () => {
  const count = await Patient.count();
  const date = new Date();
  const year = date.getFullYear();
  return `PAT${year}${String(count + 1).padStart(4, '0')}`;
};

exports.createPatient = async (patientData) => {

  // Rejeter explicitement les champs inattendus
  if ('role' in patientData) {
    throw new AppError("Le champ 'role' n'est pas autorisé lors de la création d'un patient.", 400);
  }

  // Validation des champs requis selon le contrôleur
  const requiredFields = ['nom', 'prenom', 'date_naissance', 'lieu_naissance', 'civilite', 'sexe', 'numero_assure', 'nom_assurance', 'adresse', 'ville', 'pays', 'email', 'telephone', 'mot_de_passe'];
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
      const existingPatientByNumero = await Patient.findOne({
        where: { numero_assure: patientData.numero_assure }
      });
      if (existingPatientByNumero) {
        throw new AppError('Un patient avec ce numéro d\'assuré existe déjà.', 400);
      }
  }

  // Hasher le mot de passe
  const hashedPassword = await bcrypt.hash(patientData.mot_de_passe, 12);

  // Préparer les données patient avec tous les champs requis
  const completePatientData = {
    nom: patientData.nom,
    prenom: patientData.prenom,
    date_naissance: patientData.date_naissance,
    lieu_naissance: patientData.lieu_naissance,
    civilite: patientData.civilite,
    sexe: patientData.sexe,
    numero_assure: patientData.numero_assure,
    nom_assurance: patientData.nom_assurance,
    adresse: patientData.adresse,
    ville: patientData.ville,
    pays: patientData.pays,
    email: patientData.email,
    telephone: patientData.telephone,
    mot_de_passe: hashedPassword,
    statut: 'actif',
    // Champs optionnels
    code_postal: patientData.code_postal || null,
    groupe_sanguin: patientData.groupe_sanguin || null,
    personne_urgence_nom: patientData.personne_urgence_nom || null,
    personne_urgence_telephone: patientData.personne_urgence_telephone || null,
    personne_urgence_lien: patientData.personne_urgence_lien || null,
    profession: patientData.profession || null,
    situation_familiale: patientData.situation_familiale || null,
    nombre_enfants: patientData.nombre_enfants || 0,
    commentaires: patientData.commentaires || null
  };

  // Créer le patient
  const newPatient = await Patient.create(completePatientData);
  
  // Retourner le patient sans le mot de passe
  const { mot_de_passe, ...patientWithoutPassword } = newPatient.toJSON();
  return patientWithoutPassword;
};

exports.updatePatient = async (id, patientData) => {
  const Patients = await Patient.findByPk(id);
  if (!Patients) {
    throw new AppError('Patient not found with that ID', 404);
  }

  // Empêcher la modification des champs sensibles
  const forbiddenFields = ['mot_de_passe', 'role', 'numero_assure', 'id_patient'];
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