const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Consultation = sequelize.define('Consultation', {
    id_consultation: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    dateConsultation: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    motifConsultation: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    diagnostic: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    participation_consultation: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'Consultations',
    timestamps: true,
  });

  return Consultation;
};