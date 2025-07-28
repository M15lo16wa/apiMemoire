const sequelize = require('../config/database');

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
// 19. ExamenLabo et ProfessionnelSante (prescripteur et validateur)
ProfessionnelSante.hasMany(ExamenLabo, { foreignKey: 'prescripteur_id', as: 'examensPrescrits', onDelete: 'SET NULL' });
ExamenLabo.belongsTo(ProfessionnelSante, { foreignKey: 'prescripteur_id', as: 'prescripteur' });
ProfessionnelSante.hasMany(ExamenLabo, { foreignKey: 'validateur_id', as: 'examensValides', onDelete: 'SET NULL' });
ExamenLabo.belongsTo(ProfessionnelSante, { foreignKey: 'validateur_id', as: 'validateur' });


// --- Définir les associations ---
// Utilisez les noms de modèles et les clés étrangères que nous avons analysées

// Associations pour RendezVous
RendezVous.belongsTo(Hopital, { foreignKey: 'id_hopital' });
RendezVous.belongsTo(ServiceSante, { foreignKey: 'id_service' });
RendezVous.belongsTo(ProfessionnelSante, { foreignKey: 'id_medecin', allowNull: true });

// 1. Aucune relation directe entre Utilisateur et Patient selon le diagramme

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

// 7. ProfessionnelSante et Consultation (One-to-Many)
ProfessionnelSante.hasMany(Consultation, { foreignKey: 'professionnel_id', as: 'consultationsEffectuees', onDelete: 'SET NULL' });
Consultation.belongsTo(ProfessionnelSante, { foreignKey: 'professionnel_id', as: 'professionnel' });

// 7.1. ServiceSante et Consultation (One-to-Many)
ServiceSante.hasMany(Consultation, { foreignKey: 'service_id', as: 'consultationsDuService', onDelete: 'SET NULL' });
Consultation.belongsTo(ServiceSante, { foreignKey: 'service_id', as: 'service' });

// 8. ProfessionnelSante et Prescription (One-to-Many)
ProfessionnelSante.hasMany(Prescription, { foreignKey: 'professionnel_id', as: 'prescriptionsRedigees', onDelete: 'SET NULL' });
Prescription.belongsTo(ProfessionnelSante, { foreignKey: 'professionnel_id', as: 'redacteur' });

// 9. ProfessionnelSante et RendezVous (One-to-Many)
ProfessionnelSante.hasMany(RendezVous, { foreignKey: 'professionnel_id', as: 'rendezVousAffectes', onDelete: 'SET NULL' });
RendezVous.belongsTo(ProfessionnelSante, { foreignKey: 'professionnel_id', as: 'affecteA' });

// 10. Patient et RendezVous (One-to-Many)
Patient.hasMany(RendezVous, { foreignKey: 'patient_id', as: 'rendezVous', onDelete: 'CASCADE' });
RendezVous.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patientConcerne' });

// 11. ProfessionnelSante et HistoriqueAccess (One-to-Many)
ProfessionnelSante.hasMany(HistoriqueAccess, { foreignKey: 'professionnel_id', as: 'historiquesAcces', onDelete: 'SET NULL' });
HistoriqueAccess.belongsTo(ProfessionnelSante, { foreignKey: 'professionnel_id', as: 'professionnelAccedant' });

// 12. HistoriqueAccess et AutorisationAcces (One-to-One) - si une auto. a 1 historique et vice-versa
HistoriqueAccess.hasOne(AutorisationAcces, { foreignKey: 'historique_id', as: 'autorisationLiee', onDelete: 'CASCADE' });
AutorisationAcces.belongsTo(HistoriqueAccess, { foreignKey: 'historique_id', as: 'historique' });

// 13. ProfessionnelSante et AutorisationAcces (One-to-Many - l'autorisateur)
ProfessionnelSante.hasMany(AutorisationAcces, { foreignKey: 'autorisateur_id', as: 'autorisationsDonnees', onDelete: 'SET NULL' });
AutorisationAcces.belongsTo(ProfessionnelSante, { foreignKey: 'autorisateur_id', as: 'autorisateur' });


// 14. Hopital et ServiceSante (One-to-Many)
Hopital.hasMany(ServiceSante, { foreignKey: 'hopital_id', as: 'services', onDelete: 'CASCADE' });
ServiceSante.belongsTo(Hopital, { foreignKey: 'hopital_id', as: 'hopital' });

// 15. ServiceSante et ProfessionnelSante (One-to-Many) - Confirmé valide avec service_id sur ProfessionnelSante
ServiceSante.hasMany(ProfessionnelSante, { foreignKey: 'service_id', as: 'professionnelsDuService', onDelete: 'SET NULL' });
ProfessionnelSante.belongsTo(ServiceSante, { foreignKey: 'service_id', as: 'serviceSante' });


// 16. DossierMedical et ProfessionnelSante (pour le médecin référent)
ProfessionnelSante.hasMany(DossierMedical, { foreignKey: 'medecin_referent_id', as: 'dossiersSuivis', onDelete: 'SET NULL' });
DossierMedical.belongsTo(ProfessionnelSante, { foreignKey: 'medecin_referent_id', as: 'medecinReferent' });

// 17. DossierMedical et ServiceSante (pour le service responsable)
ServiceSante.hasMany(DossierMedical, { foreignKey: 'service_id', as: 'dossiersServices', onDelete: 'SET NULL' });
DossierMedical.belongsTo(ServiceSante, { foreignKey: 'service_id', as: 'serviceResponsable' });

// 18. DossierMedical et Utilisateur (pour le créateur et le dernier modificateur)
Utilisateur.hasMany(DossierMedical, { foreignKey: 'createdBy', as: 'dossiersCrees', onDelete: 'SET NULL' });
DossierMedical.belongsTo(Utilisateur, { foreignKey: 'createdBy', as: 'createur' });

Utilisateur.hasMany(DossierMedical, { foreignKey: 'updatedBy', as: 'dossiersModifies', onDelete: 'SET NULL' });
DossierMedical.belongsTo(Utilisateur, { foreignKey: 'updatedBy', as: 'dernierModificateur' });

// NOUVELLES ASSOCIATIONS pour ServiceSante (createdBy, updatedBy)
// Un utilisateur peut créer ou modifier plusieurs services.
Utilisateur.hasMany(ServiceSante, { foreignKey: 'createdBy', as: 'servicesCrees', onDelete: 'SET NULL' });
ServiceSante.belongsTo(Utilisateur, { foreignKey: 'createdBy', as: 'createurService' });

Utilisateur.hasMany(ServiceSante, { foreignKey: 'updatedBy', as: 'servicesModifies', onDelete: 'SET NULL' });
ServiceSante.belongsTo(Utilisateur, { foreignKey: 'updatedBy', as: 'dernierModificateurService' });


// --- Exportez sequelize et tous les modèles ---
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
};