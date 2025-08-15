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
        type: DataTypes.ENUM('ordonnance', 'resultat', 'certificat', 'general', 'autre'),
        allowNull: false,
        comment: 'Type de document (ordonnance, resultat, certificat, general, autre)'
      },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'URL du fichier (optionnel, car le contenu est stocké en base64)'
    },
    taille: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    format: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    contenu: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
      comment: 'Contenu du fichier encodé en base64'
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