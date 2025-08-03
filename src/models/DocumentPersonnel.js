const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DocumentPersonnel = sequelize.define('DocumentPersonnel', {
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
    nom: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('ordonnance', 'resultat', 'certificat', 'autre'),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    taille: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    format: {
      type: DataTypes.STRING(10),
      allowNull: true
    }
  }, {
    tableName: 'documents_personnels',
    timestamps: true
  });

  DocumentPersonnel.associate = (models) => {
    DocumentPersonnel.belongsTo(models.Patient, {
      foreignKey: 'patient_id',
      as: 'patient'
    });
  };

  return DocumentPersonnel;
}; 