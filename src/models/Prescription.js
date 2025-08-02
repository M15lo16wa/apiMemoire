const { DataTypes } = require('sequelize');
const PrescriptionUtils = require('../utils/prescriptionUtils');

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
    prescriptionNumber: {
      type: DataTypes.STRING(50),
      allowNull: true, // Sera généré automatiquement
      unique: true,
    },
    // Nouveau champ pour différencier ordonnances et examens
    type_prescription: {
      type: DataTypes.ENUM('ordonnance', 'examen'),
      allowNull: false,
      defaultValue: 'ordonnance',
      comment: 'Type de prescription: ordonnance médicamenteuse ou demande d\'examen'
    },
    // Champ modernisé pour principe actif (remplace medicament)
    principe_actif: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Principe actif (DCI) ou type d\'examen demandé'
    },
    nom_commercial: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Nom commercial du médicament'
    },
    code_cip: {
      type: DataTypes.STRING(13),
      allowNull: true,
      comment: 'Code CIP du médicament'
    },
    atc: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: 'Code ATC (Anatomical Therapeutic Chemical)'
    },
    dosage: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Dosage prescrit ou paramètres d\'examen'
    },
    forme_pharmaceutique: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Forme pharmaceutique (comprimé, gélule, etc.)'
    },
    quantite: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Quantité prescrite'
    },
    unite: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: 'boîte',
      comment: 'Unité de mesure'
    },
    posologie: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Instructions de posologie détaillées'
    },
    frequence: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Fréquence de prise ou urgence pour les examens'
    },
    voie_administration: {
      type: DataTypes.ENUM('orale', 'cutanée', 'nasale', 'oculaire', 'auriculaire', 'vaginale', 'rectale', 'inhalée', 'injection', 'autre'),
      allowNull: true,
      comment: 'Voie d\'administration du médicament'
    },
    contre_indications: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Contre-indications connues'
    },
    effets_indesirables: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Effets indésirables possibles'
    },
    statut: {
      type: DataTypes.ENUM('active', 'suspendue', 'terminee', 'annulee', 'en_attente'),
      defaultValue: 'active',
      allowNull: false,
      comment: 'Statut de la prescription'
    },
    pharmacieDelivrance: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Pharmacie où les médicaments ont été délivrés'
    },
    signatureElectronique: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Signature électronique du médecin prescripteur'
    },
    qrCode: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'QR Code pour vérification et traçabilité'
    },
    renouvelable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Indique si la prescription est renouvelable'
    },
    nb_renouvellements: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Nombre de renouvellements autorisés'
    },
    renouvellements_effectues: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Nombre de renouvellements déjà effectués'
    },
    date_dernier_renouvellement: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date du dernier renouvellement'
    },
    date_arret: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Date d\'arrêt de la prescription'
    },
    motif_arret: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Motif de l\'arrêt de la prescription'
    },
    // Instructions spéciales (nouveau champ)
    instructions_speciales: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Instructions particulières (à jeun, pendant le repas, etc.)'
    },
    // Durée du traitement (nouveau champ)
    duree_traitement: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Durée du traitement (ex: 7 jours, 1 mois)'
    },
    // Relations
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Patients',
        key: 'id_patient'
      },
      comment: 'ID du patient concerné'
    },
    professionnel_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ProfessionnelSantes',
        key: 'id_professionnel'
      },
      comment: 'ID du professionnel prescripteur'
    },
    dossier_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'DossiersMedicaux',
        key: 'id_dossier'
      },
      comment: 'ID du dossier médical associé'
    },
    // Champs d'audit
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID de l\'utilisateur créateur'
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID du dernier utilisateur modificateur'
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date de suppression logique'
    },
  }, {
    tableName: 'Prescriptions',
    timestamps: true,
    paranoid: true,
    
    // Hooks pour génération automatique
    hooks: {
      beforeValidate: async (prescription, options) => {
        // Génération automatique du numéro de prescription
        if (!prescription.prescriptionNumber) {
          try {
            prescription.prescriptionNumber = await PrescriptionUtils.generatePrescriptionNumber(
              prescription.type_prescription
            );
          } catch (error) {
            console.error('Erreur lors de la génération du numéro de prescription:', error);
            // Fallback avec timestamp
            const timestamp = Date.now().toString().slice(-6);
            const prefix = prescription.type_prescription === 'ordonnance' ? 'ORD' : 'EXA';
            const year = new Date().getFullYear();
            prescription.prescriptionNumber = `${prefix}-${year}-${timestamp}`;
          }
        }
      },
      
      beforeCreate: async (prescription, options) => {
        try {
          // Génération du QR Code si pas déjà présent
          if (!prescription.qrCode) {
            prescription.qrCode = await PrescriptionUtils.generateQRCode(prescription);
          }
          
          // Définir les dates par défaut si nécessaire
          if (!prescription.date_debut && prescription.type_prescription === 'ordonnance') {
            prescription.date_debut = new Date();
          }
          
          // Validation des renouvellements
          if (prescription.renouvelable && !prescription.nb_renouvellements) {
            prescription.nb_renouvellements = 1;
          }
          
        } catch (error) {
          console.error('Erreur dans le hook beforeCreate:', error);
        }
      },
      
      afterCreate: async (prescription, options) => {
        // Log de création pour audit
        console.log(`✅ Prescription créée: ${prescription.prescriptionNumber} (Type: ${prescription.type_prescription})`);
        
        // Ici on pourrait ajouter d'autres actions post-création
        // comme l'envoi de notifications, la mise à jour de caches, etc.
      },
      
      beforeUpdate: async (prescription, options) => {
        // Mise à jour du QR Code si des données importantes ont changé
        if (prescription.changed('statut') || prescription.changed('dosage') || prescription.changed('frequence')) {
          try {
            prescription.qrCode = await PrescriptionUtils.generateQRCode(prescription);
          } catch (error) {
            console.error('Erreur lors de la mise à jour du QR Code:', error);
          }
        }
        
        // Gestion des renouvellements
        if (prescription.changed('renouvellements_effectues')) {
          prescription.date_dernier_renouvellement = new Date();
        }
      },
      
      afterUpdate: async (prescription, options) => {
        console.log(` Prescription mise à jour: ${prescription.prescriptionNumber}`);
      }
    },
    
    // Index pour optimiser les performances
    indexes: [
      {
        fields: ['prescriptionNumber'],
        unique: true
      },
      {
        fields: ['patient_id', 'date_prescription']
      },
      {
        fields: ['professionnel_id', 'date_prescription']
      },
      {
        fields: ['type_prescription', 'statut']
      },
      {
        fields: ['date_prescription']
      }
    ]
  });

  return Prescription;
};
