const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AutorisationAcces = sequelize.define('AutorisationAcces', {
    id_acces: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    typeAcces: { 
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    dateDebut: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    dateFin: {
      type: DataTypes.DATEONLY,
      allowNull: true, 
    },
    statut: { 
      type: DataTypes.ENUM('Actif', 'Révoqué', 'Expiré'),
      defaultValue: 'Actif',
      allowNull: false,
    },
    raison: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Foreign keys added based on UML diagram analysis
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID du patient concerné par l\'autorisation'
    },
    professionnel_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID du professionnel demandant l\'accès'
    },
    autorisateur_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID du professionnel qui autorise l\'accès'
    },
    historique_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID de l\'historique d\'accès associé'
    },
    // Le diagramme mentionne 'AccessAutorised()' comme méthode, pas attribut.
    // Clé étrangère vers ProfessionnelSante (l'autorisateur) sera définie dans src/models/index.js
    // Clé étrangère vers HistoriqueAccess (si relation one-to-one) sera définie dans src/models/index.js
  }, {
    tableName: 'AutorisationsAcces',
    timestamps: true,
  });

  // UML Diagram Methods Implementation
  
  // AccessAutorised() method from UML diagram
  AutorisationAcces.prototype.AccessAutorised = function() {
    const now = new Date();
    
    // Check if authorization is active
    if (this.statut !== 'Actif') {
      return false;
    }
    
    // Check if authorization has not expired
    if (this.dateFin && now > this.dateFin) {
      return false;
    }
    
    // Check if authorization has started
    if (this.dateDebut && now < this.dateDebut) {
      return false;
    }
    
    return true;
  };
  
  // donner() method from UML diagram
  AutorisationAcces.prototype.donner = async function(autorisateurId, duree = null) {
    this.autorisateur_id = autorisateurId;
    this.statut = 'Actif';
    this.dateDebut = new Date();
    
    if (duree) {
      this.dateFin = new Date(Date.now() + duree * 24 * 60 * 60 * 1000);
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
      typeAcces: autorisationData.typeAcces,
      dateDebut: autorisationData.dateDebut || new Date(),
      dateFin: autorisationData.dateFin || null,
      statut: autorisationData.statut || 'Actif',
      raison: autorisationData.raison,
      patient_id: autorisationData.patient_id,
      professionnel_id: autorisationData.professionnel_id,
      autorisateur_id: autorisationData.autorisateur_id,
      historique_id: autorisationData.historique_id
    });
    
    return autorisation;
  };

  return AutorisationAcces;
};
