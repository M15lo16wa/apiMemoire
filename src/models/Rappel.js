const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Rappel = sequelize.define('Rappel', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Patients',
        key: 'id_patient'
      }
    },
    type: {
      type: DataTypes.ENUM('medicament', 'vaccin', 'controle', 'rendez_vous', 'autre'),
      allowNull: false
    },
    titre: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date_rappel: {
      type: DataTypes.DATE,
      allowNull: false
    },
    priorite: {
      type: DataTypes.ENUM('basse', 'moyenne', 'haute'),
      defaultValue: 'moyenne'
    },
    actif: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'rappels',
    timestamps: true
  });

  Rappel.associate = (models) => {
    Rappel.belongsTo(models.Patient, {
      foreignKey: 'patient_id',
      as: 'patient'
    });
  };

  return Rappel;
}; 