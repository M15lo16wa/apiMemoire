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
    // Le diagramme mentionne 'AccessAutorised()' comme méthode, pas attribut.
    // Clé étrangère vers ProfessionnelSante (l'autorisateur) sera définie dans src/models/index.js
    // Clé étrangère vers HistoriqueAccess (si relation one-to-one) sera définie dans src/models/index.js
  }, {
    tableName: 'AutorisationsAcces',
    timestamps: true,
  });

  return AutorisationAcces;
};