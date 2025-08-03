const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AutoMesure = sequelize.define('AutoMesure', {
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
    type_mesure: {
      type: DataTypes.ENUM('poids', 'taille', 'tension_arterielle', 'glycemie', 'temperature', 'saturation'),
      allowNull: false
    },
    valeur: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    valeur_secondaire: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    unite: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    unite_secondaire: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    date_mesure: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    heure_mesure: {
      type: DataTypes.TIME,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'auto_mesures',
    timestamps: true
  });

  AutoMesure.associate = (models) => {
    AutoMesure.belongsTo(models.Patient, {
      foreignKey: 'patient_id',
      as: 'patient'
    });
  };

  return AutoMesure;
}; 