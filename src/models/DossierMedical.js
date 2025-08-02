const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DossierMedical = sequelize.define('DossierMedical', {
    id_dossier: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: 'Identifiant unique du dossier médical'
    },
    numeroDossier: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Numéro unique du dossier (format défini par la politique de numérotation)'
    },
    dateCreation: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Date de création du dossier médical'
    },
    statut: {
      type: DataTypes.ENUM('actif', 'ferme', 'archive', 'fusionne'),
      defaultValue: 'actif',
      allowNull: false,
      comment: 'Statut actuel du dossier médical'
    },
    type_dossier: {
      type: DataTypes.ENUM('principal', 'specialite', 'urgence', 'suivi', 'consultation', 'autre'), // Valeurs de votre migration
      allowNull: false,
      defaultValue: 'principal',
      comment: 'Type de dossier médical (définit son usage principal)'
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // Les références seront définies dans src/models/index.js via les associations
      comment: 'ID du patient propriétaire du dossier'
    },
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID du service de santé responsable du dossier'
    },
    medecin_referent_id: { // Correspond à professionnel_sante_id dans ma proposition précédente
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID du médecin référent principal pour ce dossier'
    },
    resume: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Résumé clinique du patient et de sa situation médicale'
    },
    antecedent_medicaux: { // Correspond à antecedents_medicaux dans ma proposition
      type: DataTypes.JSON, // Votre migration utilise JSON
      allowNull: true,
      comment: 'Antécédents médicaux structurés (pathologies, chirurgies, etc.)'
    },
    allergies: {
      type: DataTypes.JSON, // Votre migration utilise JSON
      allowNull: true,
      comment: 'Allergies et intolérances médicamenteuses ou autres'
    },
    traitements_chroniques: { // Correspond à traitements_actuels dans ma proposition
      type: DataTypes.JSON, // Votre migration utilise JSON
      allowNull: true,
      comment: 'Traitements au long cours avec posologie et indications'
    },
    heart_rate: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Fréquence cardiaque (battements par minute)'
    },
    blood_pressure: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Tension artérielle (format: systolique/diastolique, ex: 120/80)'
    },
    temperature: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
      comment: 'Température corporelle (en degrés Celsius)'
    },
    respiratory_rate: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Fréquence respiratoire (respirations par minute)'
    },
    oxygen_saturation: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Saturation en oxygène (pourcentage)'
    },
    habitudes_vie: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Informations sur le mode de vie (tabac, alcool, activité physique, etc.)'
    },
    historique_familial: { // Correspond à antecedents_familiaux dans ma proposition
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Antécédents familiaux notables'
    },
    groupe_sanguin: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        isIn: [['A_POSITIF', 'A_NEGATIF', 'B_POSITIF', 'B_NEGATIF', 'AB_POSITIF', 'AB_NEGATIF', 'O_POSITIF', 'O_NEGATIF']]
      },
      comment: 'Groupe sanguin du patient (système ABO/Rhésus)'
    },
    directives_anticipées: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Directives anticipées et personnes de confiance'
    },
    observations: { // Correspond à notes_cliniques dans ma proposition
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notes et observations diverses'
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID de l\'utilisateur ayant créé le dossier'
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID du dernier utilisateur ayant modifié le dossier'
    },
    date_fermeture: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date de fermeture du dossier si applicable'
    },
    motif_fermeture: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Raison de la fermeture du dossier'
    },
    // createdAt et updatedAt sont gérés automatiquement par Sequelize avec timestamps: true
    // deletedAt est géré automatiquement par Sequelize avec paranoid: true
  }, {
    tableName: 'DossiersMedicaux',
    timestamps: true, // Gère createdAt et updatedAt
    paranoid: true,   // Gère deletedAt pour la suppression douce
    // Vous n'avez pas besoin de définir `createdAt`, `updatedAt`, `deletedAt` ici si `timestamps: true` et `paranoid: true` sont activés.
    // Sequelize gérera leur création, mise à jour et la logique de suppression douce automatiquement.
  });

  // UML Diagram Methods Implementation
  
  // ajouterObservation() method from UML diagram
  DossierMedical.prototype.ajouterObservation = async function(observationData) {
    const { Consultation } = this.sequelize.models;
    
    const consultation = await Consultation.create({
      dossier_id: this.id_dossier,
      professionnel_id: observationData.professionnel_id,
      date_consultation: observationData.date_consultation || new Date(),
      motif_consultation: observationData.motif_consultation,
      diagnostic: observationData.diagnostic,
      observations: observationData.observations,
      traitement_prescrit: observationData.traitement_prescrit,
      statut: 'terminee'
    });
    
    // Update the dossier's last modification info
    this.updatedBy = observationData.updatedBy;
    await this.save();
    
    return consultation;
    
  };
  
  // ajouterPrescription() method from UML diagram
  DossierMedical.prototype.ajouterPrescription = async function(prescriptionData) {
    const { Prescription } = this.sequelize.models;
    
    const prescription = await Prescription.create({
      dossier_id: this.id_dossier,
      professionnel_id: prescriptionData.professionnel_id,
      medicament: prescriptionData.medicament,
      dosage: prescriptionData.dosage,
      frequence: prescriptionData.frequence,
      duree: prescriptionData.duree,
      instructions: prescriptionData.instructions,
      prescrit_traitement: true,
      statut: 'active',
      renouvelable: prescriptionData.renouvelable || false,
      nb_renouvellements: prescriptionData.nb_renouvellements || 0
    });
    
    // Update the dossier's last modification info
    this.updatedBy = prescriptionData.updatedBy;
    await this.save();
    
    return prescription;
  };
  
  // ajouterDiagnostic() method from UML diagram
  DossierMedical.prototype.ajouterDiagnostic = async function(diagnosticData) {
    const { Consultation } = this.sequelize.models;
    
    // Create a consultation record with the diagnostic
    const consultation = await Consultation.create({
      dossier_id: this.id_dossier,
      professionnel_id: diagnosticData.professionnel_id,
      date_consultation: diagnosticData.date_consultation || new Date(),
      motif_consultation: diagnosticData.motif_consultation || 'Diagnostic',
      diagnostic: diagnosticData.diagnostic,
      observations: diagnosticData.observations,
      traitement_prescrit: diagnosticData.traitement_prescrit,
      statut: 'terminee'
    });
    
    // Update resume with new diagnostic if specified
    if (diagnosticData.updateResume) {
      const currentResume = this.resume || '';
      this.resume = `${currentResume}\n\n${new Date().toLocaleDateString()} - ${diagnosticData.diagnostic}`;
    }
    
    this.updatedBy = diagnosticData.updatedBy;
    await this.save();
    
    return consultation;
  };
  
  // obtenirHistorique() method from UML diagram
  DossierMedical.prototype.obtenirHistorique = async function() {
    const { Consultation, Prescription, ExamenLabo } = this.sequelize.models;
    
    // Get all consultations
    const consultations = await Consultation.findAll({
      where: { dossier_id: this.id_dossier },
      include: [
        {
          model: this.sequelize.models.ProfessionnelSante,
          as: 'professionnel',
          attributes: ['nom', 'prenom', 'role']
        }
      ],
      order: [['date_consultation', 'DESC']]
    });
    
    // Get all prescriptions
    const prescriptions = await Prescription.findAll({
      where: { dossier_id: this.id_dossier },
      include: [
        {
          model: this.sequelize.models.ProfessionnelSante,
          as: 'redacteur',
          attributes: ['nom', 'prenom', 'role']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Get all lab exams
    const examens = await ExamenLabo.findAll({
      where: { dossier_id: this.id_dossier },
      include: [
        {
          model: this.sequelize.models.ProfessionnelSante,
          as: 'prescripteur',
          attributes: ['nom', 'prenom', 'role']
        }
      ],
      order: [['date_examen', 'DESC']]
    });
    
    return {
      consultations,
      prescriptions,
      examens,
      dossier: {
        id_dossier: this.id_dossier,
        numeroDossier: this.numeroDossier,
        dateCreation: this.dateCreation,
        statut: this.statut,
        resume: this.resume
      }
    };
  };
  
  // autoriserPartage() method from UML diagram
  DossierMedical.prototype.autoriserPartage = async function(professionnelId, typeAcces = 'lecture', duree = null) {
    const { AutorisationAcces, HistoriqueAccess } = this.sequelize.models;
    
    // Create access history
    const historique = await HistoriqueAccess.create({
      professionnel_id: professionnelId,
      dateHeureAcces: new Date(),
      action: 'autorisation_partage',
      ressourceAccedee: 'DossierMedical',
      idRessource: this.id_dossier,
      details: `Autorisation de partage ${typeAcces} du dossier ${this.numeroDossier}`
    });
    
    // Create authorization
    const dateFin = duree ? new Date(Date.now() + duree * 24 * 60 * 60 * 1000) : null;
    
    const autorisation = await AutorisationAcces.create({
      historique_id: historique.id_historique,
      autorisateur_id: professionnelId,
      typeAcces: typeAcces,
      dateDebut: new Date(),
      dateFin: dateFin,
      statut: 'Actif',
      raison: `Partage autorisé pour le dossier ${this.numeroDossier}`
    });
    
    return { historique, autorisation };
  };
  
  // Class method to create a new medical record
  DossierMedical.creerDossier = async function(patientId, createdBy, dossierData = {}) {
    // Generate unique numeroDossier
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const numeroDossier = dossierData.numeroDossier || `DOS-${timestamp}-${random}`;
    
    const dossier = await this.create({
      numeroDossier: numeroDossier,
      patient_id: patientId,
      service_id: dossierData.service_id || null,
      medecin_referent_id: dossierData.medecin_referent_id || null,
      type_dossier: dossierData.type_dossier || 'principal',
      dateCreation: new Date(),
      statut: 'actif',
      resume: dossierData.resume || '',
      createdBy: createdBy,
      updatedBy: createdBy
    });
    
    return dossier;
  };

  return DossierMedical;
};
