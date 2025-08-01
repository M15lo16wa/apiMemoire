const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Consultation = sequelize.define('Consultation', {
    id_consultation: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    date_consultation: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    motif: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    diagnostic: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    compte_rendu: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    examen_clinique: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    statut: {
      type: DataTypes.ENUM('planifiee', 'en_cours', 'terminee', 'annulee', 'reportee'),
      defaultValue: 'planifiee',
      allowNull: false,
    },
    duree: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
    },
    type_consultation: {
      type: DataTypes.ENUM('premiere', 'suivi', 'urgence', 'controle', 'autre'),
      allowNull: false,
      defaultValue: 'premiere',
    },
    confidentialite: {
      type: DataTypes.ENUM('normal', 'confidentiel', 'tres_confidentiel'),
      defaultValue: 'normal',
      allowNull: false,
    },
    dossier_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    professionnel_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    date_annulation: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    motif_annulation: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  }, {
    tableName: 'Consultations',
    timestamps: true,
    paranoid: true, // Active la suppression douce
  });

  // UML Diagram Methods Implementation
  
  // valider() method from UML diagram
  Consultation.prototype.valider = async function(validateurId) {
    this.statut = 'terminee';
    this.updatedBy = validateurId;
    await this.save();
    return this;
  };
  
  // modifier() method from UML diagram
  Consultation.prototype.modifier = async function(donnees, modifiateurId) {
    Object.keys(donnees).forEach(key => {
      if (this.hasOwnProperty(key) && key !== 'id_consultation') {
        this[key] = donnees[key];
      }
    });
    
    this.updatedBy = modifiateurId;
    await this.save();
    return this;
  };
  
  // annuler() method from UML diagram
  Consultation.prototype.annuler = async function(motif, annulateurId) {
    this.statut = 'annulee';
    this.date_annulation = new Date();
    this.motif_annulation = motif;
    this.updatedBy = annulateurId;
    await this.save();
    return this;
  };
  
  // planifier() method from UML diagram
  Consultation.prototype.planifier = async function(dateConsultation, planificateurId) {
    this.date_consultation = dateConsultation;
    this.statut = 'planifiee';
    this.updatedBy = planificateurId;
    await this.save();
    return this;
  };
  
  // Class method to create consultation
  Consultation.creerConsultation = async function(consultationData) {
    const consultation = await this.create({
      date_consultation: consultationData.date_consultation,
      motif: consultationData.motif,
      diagnostic: consultationData.diagnostic || null,
      compte_rendu: consultationData.compte_rendu || null,
      examen_clinique: consultationData.examen_clinique || null,
      statut: consultationData.statut || 'planifiee',
      duree: consultationData.duree || 30,
      type_consultation: consultationData.type_consultation || 'premiere',
      confidentialite: consultationData.confidentialite || 'normal',
      dossier_id: consultationData.dossier_id,
      professionnel_id: consultationData.professionnel_id,
      service_id: consultationData.service_id,
      createdBy: consultationData.createdBy
    });
    
    return consultation;
  };

  return Consultation;
};
