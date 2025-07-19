const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RendezVous = sequelize.define('RendezVous', {
    id_rendezvous: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    nom: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    prenom: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dateNaissance: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    sexe: {
      type: DataTypes.ENUM('Masculin', 'Feminin', 'Autre','Inconnu'),
      allowNull: false,
    },
    telephone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    DateHeure: { 
      type: DataTypes.DATE,
      allowNull: false,
    },
    motif_consultation: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    statut: { 
      type: DataTypes.ENUM('Planifié', 'Confirmé', 'Annulé', 'Terminé'),
      defaultValue: 'Planifié',
      allowNull: false,
    },
    id_hopital: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_service: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_medecin: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    numero_assure: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    assureur: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'RendezVous',
    timestamps: true,
  });

  return RendezVous;
};  