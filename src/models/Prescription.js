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
    date_debut: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    date_fin: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    medicament: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    nom_commercial: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    code_cip: {
      type: DataTypes.STRING(13),
      allowNull: true,
    },
    atc: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    dosage: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    forme_pharmaceutique: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    quantite: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    unite: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: 'boîte',
    },
    posologie: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    frequence: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    duree: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    voie_administration: {
      type: DataTypes.ENUM('orale', 'cutanée', 'nasale', 'oculaire', 'auriculaire', 'vaginale', 'rectale', 'inhalée', 'injection', 'autre'),
      allowNull: true,
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    contre_indications: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    effets_indesirables: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    statut: {
      type: DataTypes.ENUM('active', 'suspendue', 'terminee', 'annulee', 'en_attente'),
      defaultValue: 'active',
      allowNull: false,
    },
    renouvelable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    nb_renouvellements: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    renouvellements_effectues: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    date_dernier_renouvellement: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    date_arret: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    motif_arret: {
      type: DataTypes.TEXT,
      allowNull: true,
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
        model: 'ProfessionnelSantes',
        key: 'id_professionnel'
      }
    },
    dossier_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'DossiersMedicaux',
        key: 'id_dossier'
      }
    },
    consultation_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Consultations',
        key: 'id_consultation'
      }
    },
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'ServiceSantes',
        key: 'id_service'
      }
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
    tableName: 'Prescriptions',
    timestamps: true,
    paranoid: true,
  });

  return Prescription;
};