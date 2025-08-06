const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AutorisationAcces = sequelize.define('AutorisationAcces', {
    id_acces: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    type_acces: { 
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    date_debut: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    date_fin: {
      type: DataTypes.DATE,
      allowNull: true, 
    },
    statut: { 
      type: DataTypes.ENUM('actif', 'inactif', 'attente_validation', 'refuse', 'expire'),
      defaultValue: 'actif',
      allowNull: false,
    },
    raison_demande: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    conditions_acces: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    date_validation: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    date_revocation: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    motif_revocation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    notifications_envoyees: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    accorde_par: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    validateur_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    historique_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // Colonnes pour la compatibilité avec l'ancien modèle
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    professionnel_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    autorisateur_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    tableName: 'AutorisationsAcces',
    timestamps: true,
  });

  // UML Diagram Methods Implementation
  
  // AccessAutorised() method from UML diagram
  AutorisationAcces.prototype.AccessAutorised = function() {
    const now = new Date();
    
    // Check if authorization is active
    if (this.statut !== 'actif') {
      return false;
    }
    
    // Check if authorization has not expired
    if (this.date_fin && now > this.date_fin) {
      return false;
    }
    
    // Check if authorization has started
    if (this.date_debut && now < this.date_debut) {
      return false;
    }
    
    return true;
  };
  
  // donner() method from UML diagram
  AutorisationAcces.prototype.donner = async function(autorisateurId, duree = null) {
    this.autorisateur_id = autorisateurId;
    this.statut = 'actif';
    this.date_debut = new Date();
    
    if (duree) {
      this.date_fin = new Date(Date.now() + duree * 24 * 60 * 60 * 1000);
    }
    
    await this.save();
    return this;
  };
  
  // lier() method from UML diagram
  AutorisationAcces.prototype.lier = async function(historique_id) {
    this.historique_id = historique_id;
    await this.save();
    return this;
  };
  
  // Class method to create authorization
  AutorisationAcces.creerAutorisation = async function(autorisationData) {
    const autorisation = await this.create({
      type_acces: autorisationData.type_acces,
      date_debut: autorisationData.date_debut || new Date(),
      date_fin: autorisationData.date_fin || null,
      statut: autorisationData.statut || 'actif',
      raison_demande: autorisationData.raison_demande,
      conditions_acces: autorisationData.conditions_acces,
      date_validation: autorisationData.date_validation,
      date_revocation: autorisationData.date_revocation,
      motif_revocation: autorisationData.motif_revocation,
      notifications_envoyees: autorisationData.notifications_envoyees,
      accorde_par: autorisationData.accorde_par,
      validateur_id: autorisationData.validateur_id,
      createdBy: autorisationData.createdBy,
      historique_id: autorisationData.historique_id,
      patient_id: autorisationData.patient_id,
      professionnel_id: autorisationData.professionnel_id,
      autorisateur_id: autorisationData.autorisateur_id
    });
    
    return autorisation;
  };

  return AutorisationAcces;
};
