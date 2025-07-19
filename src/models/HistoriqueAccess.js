// src/models/HistoriqueAccess.js

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const HistoriqueAccess = sequelize.define('HistoriqueAccess', {
    id_historique: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    dateHeureAcces: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    action: { 
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    ressourceAccedee: { 
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    idRessource: { 
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Clé étrangère vers ProfessionnelSante sera définie dans src/models/index.js
    // Clé étrangère vers AutorisationAcces (si c'est une relation one-to-one comme dans notre analyse)
  }, {
    tableName: 'HistoriquesAccess',
    timestamps: true,
  });

  return HistoriqueAccess;
};