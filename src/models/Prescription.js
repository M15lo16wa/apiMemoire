const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Prescription = sequelize.define('Prescription', {
    id_prescription: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    datePrescription: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    medicament: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    dosage: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    frequence: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    duree: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    prescrit_traitement: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'Prescriptions',
    timestamps: true,
  });

  return Prescription;
};