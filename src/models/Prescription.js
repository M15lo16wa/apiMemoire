const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Prescription = sequelize.define('Prescription', {
    id_prescription: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    date_prescription: {
      type: DataTypes.DATE,
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
  }, {
    tableName: 'Prescriptions',
    timestamps: true,
  });

  return Prescription;
};