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

  return Consultation;
};
