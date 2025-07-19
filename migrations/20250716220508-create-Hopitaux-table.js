'use strict';

const DataTypes = require('sequelize/lib/data-types');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Hopitaux', {
      id_hopital: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Identifiant unique de l\'hôpital'
      },
      nom: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Nom officiel de l\'hôpital',
        validate: {
          notEmpty: {
            msg: 'Le nom de l\'hôpital est obligatoire'
          }
        }
      },
      type_etablissement: {
        type: DataTypes.ENUM(
          'CHU',
          'HOPITAL_REGIONAL',
          'HOPITAL_DISTRICT',
          'CENTRE_DE_SANTE',
          'POSTE_DE_SANTE',
          'AUTRE'
        ),
        allowNull: false,
        comment: 'Type d\'établissement de santé',
        defaultValue: 'AUTRE'
      },
      adresse: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Adresse complète'
      },
      telephone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Numéro de téléphone principal'
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Adresse email de contact',
        validate: {
          isEmail: {
            msg: 'Format d\'email invalide'
          }
        }
      },
      actif: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indique si l\'hôpital est actif dans le système'
      },
      config_auth: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Configuration spécifique pour l\'authentification',
        defaultValue: {}
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Date de création de l\'enregistrement'
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Date de dernière mise à jour de l\'enregistrement'
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date de suppression (soft delete)'
      }
    }, {
      // Options de table
      comment: 'Table des établissements de santé pour la gestion des accès et authentification',
      // Activation du soft delete
      paranoid: true,
      // Configuration des noms de colonnes de timestamp
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      // Configuration des indexes
      indexes: [
        {
          name: 'idx_hopitaux_code',
          fields: ['code_hopital'],
          unique: true
        },
        {
          name: 'idx_hopitaux_actif',
          fields: ['actif']
        },
        {
          name: 'idx_hopitaux_type',
          fields: ['type_etablissement']
        }
      ]
    });

    // Ajout des index pour optimiser les requêtes
    await queryInterface.addIndex('Hopitaux', ['code_hopital'], { unique: true });
    await queryInterface.addIndex('Hopitaux', ['actif']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Hopitaux');
  }
};
