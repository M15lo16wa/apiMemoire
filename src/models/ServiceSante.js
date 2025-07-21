// src/models/ServiceSante.js

const { DataTypes, Op } = require('sequelize');

/**
 * Modèle représentant un service de santé dans l'établissement
 */
module.exports = (sequelize) => {
  const ServiceSante = sequelize.define('ServiceSante', {
    id_service: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: 'Identifiant unique du service de santé'
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'Le code du service est obligatoire' },
        len: { args: [2, 20], msg: 'Le code doit contenir entre 2 et 20 caractères' },
        is: { args: /^[A-Z0-9_]+$/, msg: 'Le code ne doit contenir que des lettres majuscules, chiffres, tirets et tirets bas' }
      },
      comment: 'Code unique identifiant le service de santé (format: lettres majuscules, chiffres et tirets bas)'
    },
    nom: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Le nom du service est obligatoire' },
        len: { args: [2, 100], msg: 'Le nom doit contenir entre 2 et 100 caractères' }
      },
      comment: 'Nom complet du service de santé'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Description détaillée des activités et spécialités du service'
    },
    type_service: {
      type: DataTypes.ENUM(
        'MEDECINE_GENERALE',
        'PEDIATRIE',
        'CHIRURGIE',
        'URGENCES',
        'CARDIOLOGIE',
        'NEUROLOGIE',
        'ONCOLOGIE',
        'GYNECOLOGIE',
        'RADIOLOGIE',
        'BIOLOGIE',
        'PHARMACIE',
        'CONSULTATION',
        'HOSPITALISATION',
        'REEDUCATION',
        'SOINS_INTENSIFS',
        'BLOC_OPERATOIRE',
        'AUTRE'
      ),
      allowNull: false,
      defaultValue: 'MEDECINE_GENERALE',
      validate: {
        notEmpty: { msg: 'Le type de service est obligatoire' }
      },
      comment: 'Type de service de santé pour le filtrage et la catégorisation'
    },
    telephone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: { args: /^[0-9+()\- ]+$/, msg: 'Numéro de téléphone invalide' },
        len: { args: [8, 20], msg: 'Le numéro de téléphone doit contenir entre 8 et 20 caractères' }
      },
      comment: 'Numéro de téléphone principal du service'
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      validate: {
        isEmail: { msg: 'Veuillez fournir une adresse email valide' }
      },
      comment: 'Adresse email de contact du service'
    },
    hopital_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Hopitaux',
        key: 'id_hopital'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      comment: 'Référence à l\'hôpital auquel ce service est rattaché'
    },
    statut: {
      type: DataTypes.ENUM('ACTIF', 'INACTIF', 'EN_MAINTENANCE', 'EN_CONSTRUCTION'),
      defaultValue: 'ACTIF',
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Le statut est obligatoire' }
      },
      comment: 'Statut du service pour la gestion du cycle de vie'
    },
    horaires_ouverture: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Horaires d\'ouverture du service (format JSON)'
    },
    informations_complementaires: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Informations complémentaires structurées'
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Utilisateurs',
        key: 'id_utilisateur',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Utilisateur ayant créé l\'enregistrement'
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Utilisateurs',
        key: 'id_utilisateur',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Dernier utilisateur ayant modifié l\'enregistrement'
    },
  }, {
    tableName: 'ServicesSante',
    timestamps: true,
    paranoid: true, // Active la suppression douce (soft delete)
    defaultScope: {
      where: { statut: 'ACTIF' },
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'deletedAt']
      },
    },
    scopes: {
      // Inclure les services inactifs
      avecInactifs: {
        where: {}
      },
      // Filtrer par hôpital
      parHopital: (hopitalId) => ({
        where: { hopital_id: hopitalId }
      }),
      // Filtrer par type de service
      parType: (type) => ({
        where: { type_service: type }
      }),
      // Charger les dossiers médicaux du service
      avecDossiers: {
        include: [
          {
            model: sequelize.models.DossierMedical,
            as: 'dossiers',
            include: [
              { model: sequelize.models.Patient, attributes: ['id_patient', 'nom', 'prenom', 'date_naissance'] },
              { model: sequelize.models.ProfessionnelSante, as: 'medecinReferent', attributes: ['id_professionnel'] }
            ]
          }
        ]
      }
    },
    hooks: {
      // Nettoyage du code avant validation
      beforeValidate: (service) => {
        if (service.code) {
          service.code = service.code.toUpperCase().replace(/\s+/g, '_');
        }
      },
      // Vérification de l'unicité du code dans l'hôpital
      beforeCreate: async (service) => {
        if (service.code && service.hopital_id) {
          const existingService = await sequelize.models.ServiceSante.findOne({
            where: {
              code: service.code,
              hopital_id: service.hopital_id,
              id_service: { [Op.ne]: service.id_service || null }
            },
            paranoid: false // Inclure les services supprimés logiquement dans la vérification d'unicité
          });

          if (existingService) {
            throw new Error('Un service avec ce code existe déjà dans cet hôpital');
          }
        }
      },
      beforeUpdate: async (service) => {
        if (service.code && service.hopital_id) {
          const existingService = await sequelize.models.ServiceSante.findOne({
            where: {
              code: service.code,
              hopital_id: service.hopital_id,
              id_service: { [Op.ne]: service.id_service }
            },
            paranoid: false
          });

          if (existingService) {
            throw new Error('Un service avec ce code existe déjà dans cet hôpital');
          }
        }
      }
    }
  });

  /**
   * Récupère tous les dossiers médicaux gérés par ce service
   * @param {Object} options - Options de requête Sequelize supplémentaires
   * @returns {Promise<Array>} Liste des dossiers médicaux
   */
  ServiceSante.prototype.getDossiersMedicaux = async function(options = {}) {
    return await this.getDossiersServices({
      include: [
        {
          model: sequelize.models.Patient,
          attributes: ['id_patient', 'nom', 'prenom', 'date_naissance', 'sexe']
        },
        {
          model: sequelize.models.ProfessionnelSante,
          as: 'medecinReferent',
          attributes: ['id_professionnel'],
          include: [
            {
              model: sequelize.models.Utilisateur,
              attributes: ['nom', 'prenom']
            }
          ]
        },
        {
          model: sequelize.models.Consultation,
          attributes: ['id_consultation', 'date_consultation', 'motif'],
          order: [['date_consultation', 'DESC']],
          limit: 1,
          separate: true
        }
      ],
      order: [['date_creation', 'DESC']],
      ...options
    });
  };

  /**
   * Récupère tous les professionnels de santé affectés à ce service
   * @param {Object} options - Options de requête Sequelize supplémentaires
   * @returns {Promise<Array>} Liste des professionnels du service
   */
  ServiceSante.prototype.getProfessionnels = async function(options = {}) {
    return await this.getProfessionnelsDuService({
       include: [
         {
           model: sequelize.models.Utilisateur,
           attributes: ['nom', 'prenom', 'email', 'telephone']
         }
       ],
       order: [
         [{ model: sequelize.models.Utilisateur }, 'nom', 'ASC'],
         [{ model: sequelize.models.Utilisateur }, 'prenom', 'ASC']
       ],
       ...options
    });
  };

  return ServiceSante;
};