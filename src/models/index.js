const sequelize = require('../config/database').sequelize;

// --- Importez tous vos modèles ici ---
const Utilisateur = require('./Utilisateur')(sequelize);
const Patient = require('./Patient')(sequelize);
const ProfessionnelSante = require('./ProfessionnelSante')(sequelize);
const DossierMedical = require('./DossierMedical')(sequelize);
const Consultation = require('./Consultation')(sequelize);
const ExamenLabo = require('./ExamenLabo')(sequelize);
const Prescription = require('./Prescription')(sequelize);
const RendezVous = require('./RendezVous')(sequelize);
const HistoriqueAccess = require('./HistoriqueAccess')(sequelize);
const AutorisationAcces = require('./AutorisationAcces')(sequelize);
const ServiceSante = require('./ServiceSante')(sequelize);
const Hopital = require('./Hopital')(sequelize);

// --- Nouveaux modèles ---
const AutoMesure = require('./AutoMesure')(sequelize);
const DocumentPersonnel = require('./DocumentPersonnel')(sequelize);
const Message = require('./Message')(sequelize);
const Rappel = require('./Rappel')(sequelize);

// --- Modèles Access ---
const SessionAccesDMP = require('./SessionAccesDMP')(sequelize);
const TentativeAuthentificationCPS = require('./TentativeAuthentificationCPS')(sequelize);
const NotificationAccesDMP = require('./NotificationAccesDMP')(sequelize);

// --- Modèle 2FA ---
const Historique2FA = require('./Historique2FA')(sequelize);

// 19. ExamenLabo et ProfessionnelSante (prescripteur et validateur)
ProfessionnelSante.hasMany(ExamenLabo, { foreignKey: 'prescripteur_id', as: 'examensPrescrits', onDelete: 'SET NULL' });
ExamenLabo.belongsTo(ProfessionnelSante, { foreignKey: 'prescripteur_id', as: 'prescripteur' });
ProfessionnelSante.hasMany(ExamenLabo, { foreignKey: 'validateur_id', as: 'examensValides', onDelete: 'SET NULL' });
ExamenLabo.belongsTo(ProfessionnelSante, { foreignKey: 'validateur_id', as: 'validateur' });

// 20. Patient et ExamenLabo (One-to-Many) - Direct relationship from UML
Patient.hasMany(ExamenLabo, { foreignKey: 'patient_id', as: 'examensLabo', onDelete: 'CASCADE' });
ExamenLabo.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// 21. Consultation et ExamenLabo (One-to-Many) - exams can be linked to consultations
Consultation.hasMany(ExamenLabo, { foreignKey: 'consultation_id', as: 'examensLabo', onDelete: 'SET NULL' });
ExamenLabo.belongsTo(Consultation, { foreignKey: 'consultation_id', as: 'consultation' });

// --- Définir les associations ---
// Utilisez les noms de modèles et les clés étrangères que nous avons analysées

// Associations pour RendezVous
RendezVous.belongsTo(Hopital, { foreignKey: 'id_hopital' });
RendezVous.belongsTo(ServiceSante, { foreignKey: 'id_service' });
RendezVous.belongsTo(ProfessionnelSante, { foreignKey: 'id_professionnel', as: 'professionnel', allowNull: true });

// 1. Utilisateur et Patient (One-to-One) - Based on UML diagram authentication relationship
Utilisateur.hasOne(Patient, { foreignKey: 'utilisateur_id', as: 'patientLie', onDelete: 'SET NULL' });
Patient.belongsTo(Utilisateur, { foreignKey: 'utilisateur_id', as: 'compteUtilisateur' });

// 2. Utilisateur et ProfessionnelSante (One-to-One)
Utilisateur.hasOne(ProfessionnelSante, { foreignKey: 'utilisateur_id', as: 'professionnelLie', onDelete: 'SET NULL' });
ProfessionnelSante.belongsTo(Utilisateur, { foreignKey: 'utilisateur_id', as: 'compteUtilisateur' });

// 3. Patient et DossierMedical (One-to-Many)
Patient.hasMany(DossierMedical, { foreignKey: 'patient_id', as: 'dossiers', onDelete: 'CASCADE' });
DossierMedical.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// 4. DossierMedical et Consultation (One-to-Many)
DossierMedical.hasMany(Consultation, { foreignKey: 'dossier_id', as: 'consultations', onDelete: 'CASCADE' });
Consultation.belongsTo(DossierMedical, { foreignKey: 'dossier_id', as: 'dossier' });

// 5. DossierMedical et ExamenLabo (One-to-Many)
DossierMedical.hasMany(ExamenLabo, { foreignKey: 'dossier_id', as: 'examensLabo', onDelete: 'CASCADE' });
ExamenLabo.belongsTo(DossierMedical, { foreignKey: 'dossier_id', as: 'dossier' });

// 6. DossierMedical et Prescription (One-to-Many)
DossierMedical.hasMany(Prescription, { foreignKey: 'dossier_id', as: 'prescriptions', onDelete: 'CASCADE' });
Prescription.belongsTo(DossierMedical, { foreignKey: 'dossier_id', as: 'dossier' });

// 6.1. DossierMedical et ProfessionnelSante (médecin référent) - One-to-Many
ProfessionnelSante.hasMany(DossierMedical, { foreignKey: 'medecin_referent_id', as: 'dossiersReferents', onDelete: 'SET NULL' });
DossierMedical.belongsTo(ProfessionnelSante, { foreignKey: 'medecin_referent_id', as: 'medecinReferent' });

// 6.2. DossierMedical et ServiceSante (service responsable) - One-to-Many
ServiceSante.hasMany(DossierMedical, { foreignKey: 'service_id', as: 'dossiersResponsables', onDelete: 'SET NULL' });
DossierMedical.belongsTo(ServiceSante, { foreignKey: 'service_id', as: 'serviceResponsable' });

// 6.3. Hopital et ServiceSante (One-to-Many) - Un hôpital peut avoir plusieurs services
Hopital.hasMany(ServiceSante, { foreignKey: 'hopital_id', as: 'services', onDelete: 'CASCADE' });
ServiceSante.belongsTo(Hopital, { foreignKey: 'hopital_id', as: 'hopital' });

// 7. ProfessionnelSante et Consultation (One-to-Many)
ProfessionnelSante.hasMany(Consultation, { foreignKey: 'professionnel_id', as: 'consultationsEffectuees', onDelete: 'SET NULL' });
Consultation.belongsTo(ProfessionnelSante, { foreignKey: 'professionnel_id', as: 'professionnel' });

// 7.1. ServiceSante et Consultation (One-to-Many)
ServiceSante.hasMany(Consultation, { foreignKey: 'service_id', as: 'consultationsDuService', onDelete: 'SET NULL' });
Consultation.belongsTo(ServiceSante, { foreignKey: 'service_id', as: 'service' });

// 8. ProfessionnelSante et Prescription (One-to-Many)
ProfessionnelSante.hasMany(Prescription, { foreignKey: 'professionnel_id', as: 'prescriptionsRedigees', onDelete: 'SET NULL' });
Prescription.belongsTo(ProfessionnelSante, { foreignKey: 'professionnel_id', as: 'redacteur' });

// 8.1. Patient et Prescription (One-to-Many) - Relation directe patient-prescription
Patient.hasMany(Prescription, { foreignKey: 'patient_id', as: 'prescriptions', onDelete: 'CASCADE' });
Prescription.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// 9. ProfessionnelSante et RendezVous (One-to-Many)
ProfessionnelSante.hasMany(RendezVous, { foreignKey: 'id_professionnel', as: 'rendezVousAffectes', onDelete: 'SET NULL' });
RendezVous.belongsTo(ProfessionnelSante, { foreignKey: 'id_professionnel', as: 'affecteA' });

// 10. Patient et RendezVous (One-to-Many) - COMMENTÉ car la table RendezVous contient directement les infos patient
// Patient.hasMany(RendezVous, { foreignKey: 'patient_id', as: 'rendezVous', onDelete: 'CASCADE' });
// RendezVous.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patientConcerne' });

// 11. ProfessionnelSante et HistoriqueAccess (One-to-Many) - COMMENTÉ car la table n'a pas professionnel_id
// ProfessionnelSante.hasMany(HistoriqueAccess, { foreignKey: 'professionnel_id', as: 'historiquesAcces', onDelete: 'SET NULL' });
// HistoriqueAccess.belongsTo(ProfessionnelSante, { foreignKey: 'professionnel_id', as: 'professionnel' });

// 11.1. Patient et AutorisationAcces (One-to-Many) - patients can have multiple access authorizations
Patient.hasMany(AutorisationAcces, { foreignKey: 'patient_id', as: 'autorisationsRecues', onDelete: 'CASCADE' });
AutorisationAcces.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patientConcerne' });

// 11.2. ProfessionnelSante et AutorisationAcces (One-to-Many) - professionnels can have multiple access authorizations
ProfessionnelSante.hasMany(AutorisationAcces, { foreignKey: 'professionnel_id', as: 'autorisationsAccordees', onDelete: 'CASCADE' });
AutorisationAcces.belongsTo(ProfessionnelSante, { foreignKey: 'professionnel_id', as: 'professionnelDemandeur' });

// 11.3. ProfessionnelSante (autorisateur) et AutorisationAcces (One-to-Many) - pour les accès accordés/validés
ProfessionnelSante.hasMany(AutorisationAcces, { foreignKey: 'autorisateur_id', as: 'autorisationsValidees', onDelete: 'SET NULL' });
AutorisationAcces.belongsTo(ProfessionnelSante, { foreignKey: 'autorisateur_id', as: 'autorisateur' });

// --- Associations Access ---

// 22. ProfessionnelSante et SessionAccesDMP (One-to-Many)
ProfessionnelSante.hasMany(SessionAccesDMP, { foreignKey: 'professionnel_id', as: 'sessionsAcces', onDelete: 'CASCADE' });
SessionAccesDMP.belongsTo(ProfessionnelSante, { foreignKey: 'professionnel_id', as: 'professionnel' });

// 23. Patient et SessionAccesDMP (One-to-Many)
Patient.hasMany(SessionAccesDMP, { foreignKey: 'patient_id', as: 'sessionsAcces', onDelete: 'CASCADE' });
SessionAccesDMP.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// 24. ProfessionnelSante et TentativeAuthentificationCPS (One-to-Many)
ProfessionnelSante.hasMany(TentativeAuthentificationCPS, { foreignKey: 'professionnel_id', as: 'tentativesCPS', onDelete: 'CASCADE' });
TentativeAuthentificationCPS.belongsTo(ProfessionnelSante, { foreignKey: 'professionnel_id', as: 'professionnel' });

// 25. Patient et NotificationAccesDMP (One-to-Many)
Patient.hasMany(NotificationAccesDMP, { foreignKey: 'patient_id', as: 'notificationsAcces', onDelete: 'CASCADE' });
NotificationAccesDMP.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// 26. ProfessionnelSante et NotificationAccesDMP (One-to-Many)
ProfessionnelSante.hasMany(NotificationAccesDMP, { foreignKey: 'professionnel_id', as: 'notificationsEnvoyees', onDelete: 'CASCADE' });
NotificationAccesDMP.belongsTo(ProfessionnelSante, { foreignKey: 'professionnel_id', as: 'professionnel' });

// 27. SessionAccesDMP et NotificationAccesDMP (One-to-Many)
SessionAccesDMP.hasMany(NotificationAccesDMP, { foreignKey: 'session_id', as: 'notifications', onDelete: 'CASCADE' });
NotificationAccesDMP.belongsTo(SessionAccesDMP, { foreignKey: 'session_id', as: 'session' });

// --- Associations pour les nouveaux modèles ---

// 28. Patient et AutoMesure (One-to-Many)
Patient.hasMany(AutoMesure, { foreignKey: 'patient_id', as: 'autoMesures', onDelete: 'CASCADE' });
AutoMesure.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// 29. Patient et DocumentPersonnel (One-to-Many)
Patient.hasMany(DocumentPersonnel, { foreignKey: 'patient_id', as: 'documentsPersonnels', onDelete: 'CASCADE' });
DocumentPersonnel.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// 30. Patient et Message (One-to-Many) - messages reçus
Patient.hasMany(Message, { foreignKey: 'destinataire_id', as: 'messagesRecus', onDelete: 'CASCADE' });
Message.belongsTo(Patient, { foreignKey: 'destinataire_id', as: 'destinataire' });

// 31. ProfessionnelSante et Message (One-to-Many) - messages envoyés
ProfessionnelSante.hasMany(Message, { foreignKey: 'expediteur_id', as: 'messagesEnvoyes', onDelete: 'CASCADE' });
Message.belongsTo(ProfessionnelSante, { foreignKey: 'expediteur_id', as: 'expediteur' });

// 32. Patient et Rappel (One-to-Many)
Patient.hasMany(Rappel, { foreignKey: 'patient_id', as: 'rappels', onDelete: 'CASCADE' });
Rappel.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// 33. ProfessionnelSante et Rappel (One-to-Many) - rappels créés par le professionnel
ProfessionnelSante.hasMany(Rappel, { foreignKey: 'createur_id', as: 'rappelsCrees', onDelete: 'SET NULL' });
Rappel.belongsTo(ProfessionnelSante, { foreignKey: 'createur_id', as: 'createur' });

// --- Exportez tous les modèles ---
module.exports = {
  sequelize,
  Utilisateur,
  Patient,
  ProfessionnelSante,
  DossierMedical,
  Consultation,
  ExamenLabo,
  Prescription,
  RendezVous,
  HistoriqueAccess,
  AutorisationAcces,
  ServiceSante,
  Hopital,
  AutoMesure,
  DocumentPersonnel,
  Message,
  Rappel,
  SessionAccesDMP,
  TentativeAuthentificationCPS,
  NotificationAccesDMP,
  Historique2FA
};