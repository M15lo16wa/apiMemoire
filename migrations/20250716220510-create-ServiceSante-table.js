'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('ServicesSante', {
      id_service: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Identifiant unique du service de santé'
      },
      code: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
        comment: 'Code unique identifiant le service de santé'
      },
      nom: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nom complet du service de santé'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Description détaillée des activités et spécialités du service'
      },
      type_service: {
        type: Sequelize.ENUM(
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
        comment: 'Type de service de santé pour le filtrage et la catégorisation'
      },
      telephone: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'Numéro de téléphone principal du service'
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
        comment: 'Adresse email de contact du service'
      },
      hopital_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Hopitaux', // Correction du nom de la table
          key: 'id_hopital',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Référence à l\'hôpital auquel ce service est rattaché'
      },
      statut: {
        type: Sequelize.ENUM('ACTIF', 'INACTIF', 'EN_MAINTENANCE', 'EN_CONSTRUCTION'),
        defaultValue: 'ACTIF',
        allowNull: false,
        comment: 'Statut du service pour la gestion du cycle de vie'
      },
      horaires_ouverture: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Horaires d\'ouverture du service (format JSON)',
        defaultValue: {}
      },
      informations_complementaires: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Informations complémentaires structurées',
        defaultValue: {}
      },
      createdBy: {
        type: Sequelize.INTEGER,
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
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Utilisateurs',
          key: 'id_utilisateur',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Dernier utilisateur ayant modifié l\'enregistrement'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Date de création de l\'enregistrement'
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Date de dernière mise à jour de l\'enregistrement'
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Date de suppression douce de l\'enregistrement'
      }
    });

    // Ajout des index pour les champs fréquemment utilisés dans les requêtes
    await queryInterface.addIndex('ServicesSante', ['code'], {
      name: 'idx_services_sante_code',
      unique: true
    });

    await queryInterface.addIndex('ServicesSante', ['hopital_id'], {
      name: 'idx_services_sante_hopital'
    });

    await queryInterface.addIndex('ServicesSante', ['type_service'], {
      name: 'idx_services_sante_type'
    });

    await queryInterface.addIndex('ServicesSante', ['statut'], {
      name: 'idx_services_sante_statut'
    });

    // Index composite pour les recherches fréquentes
    await queryInterface.addIndex('ServicesSante', ['hopital_id', 'type_service', 'statut'], {
      name: 'idx_services_sante_composite'
    });
  },

  async down (queryInterface, Sequelize) {
    // Suppression des index personnalisés avant de supprimer la table
    await queryInterface.removeIndex('ServicesSante', 'idx_services_sante_code');
    await queryInterface.removeIndex('ServicesSante', 'idx_services_sante_hopital');
    await queryInterface.removeIndex('ServicesSante', 'idx_services_sante_type');
    await queryInterface.removeIndex('ServicesSante', 'idx_services_sante_statut');
    await queryInterface.removeIndex('ServicesSante', 'idx_services_sante_composite');

    // Suppression de la table
    await queryInterface.dropTable('ServicesSante');
  }
};