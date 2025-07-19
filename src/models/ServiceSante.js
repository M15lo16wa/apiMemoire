const { DataTypes, Op } = require('sequelize');

/**
 * Modèle représentant un service de santé dans l'établissement
 * Un service est une unité organisationnelle (ex: Cardiologie, Pédiatrie, etc.)
 * qui gère des dossiers médicaux et des professionnels de santé.
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
        notEmpty: true,
        len: [2, 20],
        is: /^[A-Z0-9_]+$/
      },
      comment: 'Code unique identifiant le service de santé (format: lettres majuscules, chiffres et tirets bas)'
    },
    nom: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
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
        'medecine_generale',
        'pediatrie',
        'chirurgie',
        'urgences',
        'radiologie',
        'biologie',
        'pharmacie',
        'consultation',
        'hospitalisation',
        'autre'
      ),
      allowNull: false,
      defaultValue: 'medecine_generale',
      comment: 'Type de service de santé pour le filtrage et la catégorisation'
    },
    telephone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: /^[0-9+()\- ]+$/,
        len: [8, 20]
      },
      comment: 'Numéro de téléphone principal du service'
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: true,
        len: [0, 100]
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
    responsable_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'ProfessionnelsSante',
        key: 'id_professionnel'
      },
      onUpdate: 'SET NULL',
      onDelete: 'SET NULL',
      comment: 'Référence au professionnel de santé responsable du service (chef de service)'
    },
    statut: {
      type: DataTypes.ENUM('actif', 'inactif'),
      defaultValue: 'actif',
      allowNull: false,
      comment: 'Statut du service (actif/inactif) pour la gestion du cycle de vie'
    }
  }, {
    tableName: 'ServicesSante',
    timestamps: true,
    paranoid: true, // Active la suppression douce (soft delete)
    defaultScope: {
      where: { statut: 'actif' },
      attributes: { 
        exclude: ['createdAt', 'updatedAt', 'deletedAt']
      },
      include: [
        {
          model: sequelize.models.ProfessionnelSante,
          as: 'responsable',
          attributes: ['id_professionnel'],
          include: [
            {
              model: sequelize.models.Utilisateur,
              attributes: ['nom', 'prenom', 'email']
            }
          ]
        }
      ]
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
            }
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
    return await this.getDossiers({
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
    return await this.getProfessionnelsSante({
      include: [
        { 
          model: sequelize.models.Utilisateur,
          attributes: ['nom', 'prenom', 'email', 'telephone']
        },
        {
          model: sequelize.models.ServiceSante,
          as: 'servicesSecondaires',
          attributes: ['id_service', 'nom'],
          through: { attributes: [] } // Exclure la table de jointure
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