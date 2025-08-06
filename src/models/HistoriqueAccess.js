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
    date_heure_acces: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    action: { 
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    type_ressource: { 
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    id_ressource: { 
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    statut: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'SUCCES',
    },
    code_erreur: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    message_erreur: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    adresse_ip: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    device_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    // Foreign keys
    // professionnel_id: {
    //   type: DataTypes.INTEGER,
    //   allowNull: true,
    // },
    id_utilisateur: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_patient: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_dossier: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_service: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    tableName: 'HistoriquesAccess',
    timestamps: true,
    paranoid: true,
  });

  return HistoriqueAccess;
};