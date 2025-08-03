const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Message = sequelize.define('Message', {
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
    professionnel_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ProfessionnelsSante',
        key: 'id_professionnel'
      }
    },
    sujet: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    contenu: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    lu: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    date_envoi: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'messages',
    timestamps: true
  });

  Message.associate = (models) => {
    Message.belongsTo(models.Patient, {
      foreignKey: 'patient_id',
      as: 'patient'
    });
    Message.belongsTo(models.ProfessionnelSante, {
      foreignKey: 'professionnel_id',
      as: 'professionnel'
    });
  };

  return Message;
}; 