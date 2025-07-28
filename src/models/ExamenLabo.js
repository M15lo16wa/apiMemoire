const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ExamenLabo = sequelize.define('ExamenLabo', {
    id_examen: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    code_examen: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    libelle: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type_examen: {
      type: DataTypes.ENUM(
        'biologie', 'hématologie', 'bactériologie', 'anatomopathologie',
        'génétique', 'immunologie', 'biochimie', 'toxicologie', 'autre'
      ),
      allowNull: false,
    },
    date_prescription: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    date_prelevement: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    date_reception: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    date_realisation: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    date_validation: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    statut: {
      type: DataTypes.ENUM('prescrit', 'en_attente', 'en_cours', 'termine', 'valide', 'annule', 'erreur'),
      defaultValue: 'prescrit',
      allowNull: false,
    },
    priorite: {
      type: DataTypes.ENUM('urgent', 'normal', 'differe'),
      defaultValue: 'normal',
      allowNull: false,
    },
    resultat: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    resultat_texte: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    interpretation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    observations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fichiers_resultats: {
      type: DataTypes.ARRAY(DataTypes.STRING(500)),
      allowNull: true,
      defaultValue: [],
    },
    code_nomenclature: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    code_loinc: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    prescripteur_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    validateur_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    dossier_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    consultation_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'ExamensLabo',
    timestamps: true,
    paranoid: true,
  });

  return ExamenLabo;
};