'use strict';

const DataTypes = require('sequelize/lib/data-types');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Consultations', {
      id_consultation: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Identifiant unique de la consultation'
      },
      date_consultation: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Date et heure de la consultation',
        validate: {
          isDate: {
            msg: 'La date de consultation doit être une date valide'
          }
        }
      },
      motif: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Motif de la consultation (symptômes, raison de la visite)'
      },
      diagnostic: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Diagnostic établi par le professionnel de santé'
      },
      compte_rendu: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Compte-rendu détaillé de la consultation'
      },
      examen_clinique: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Résultats de l\'examen clinique (TA, fréquence cardiaque, etc.)'
      },
      statut: {
        type: DataTypes.ENUM('planifiee', 'en_cours', 'terminee', 'annulee', 'reportee'),
        defaultValue: 'planifiee',
        allowNull: false,
        comment: 'Statut actuel de la consultation'
      },
      duree: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30,
        comment: 'Durée prévue de la consultation en minutes',
        validate: {
          min: {
            args: [5],
            msg: 'La durée minimale est de 5 minutes'
          },
          max: {
            args: [240],
            msg: 'La durée maximale est de 4 heures (240 minutes)'
          }
        }
      },
      type_consultation: {
        type: DataTypes.ENUM('premiere', 'suivi', 'urgence', 'controle', 'autre'),
        allowNull: false,
        defaultValue: 'premiere',
        comment: 'Type de consultation'
      },
      confidentialite: {
        type: DataTypes.ENUM('normal', 'confidentiel', 'tres_confidentiel'),
        defaultValue: 'normal',
        allowNull: false,
        comment: 'Niveau de confidentialité de la consultation'
      },
      dossier_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID du dossier médical associé (géré dans index.js)'
      },
      professionnel_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID du professionnel de santé en charge de la consultation (géré dans index.js)'
      },
      service_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID du service de santé où a lieu la consultation (géré dans index.js)'
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID de l\'utilisateur ayant créé la consultation (géré dans index.js)'
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID du dernier utilisateur ayant modifié la consultation (géré dans index.js)'
      },
      date_annulation: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date d\'annulation si la consultation a été annulée'
      },
      motif_annulation: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Raison de l\'annulation de la consultation'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Date de création de la fiche consultation'
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Date de dernière mise à jour de la fiche consultation'
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Date de suppression douce (soft delete) de la consultation'
      }
    });

    // Ajout des index pour les champs fréquemment utilisés dans les requêtes
    await queryInterface.addIndex('Consultations', ['date_consultation']);
    await queryInterface.addIndex('Consultations', ['dossier_id']);
    await queryInterface.addIndex('Consultations', ['professionnel_id']);
    await queryInterface.addIndex('Consultations', ['service_id']);
    await queryInterface.addIndex('Consultations', ['statut']);
    await queryInterface.addIndex('Consultations', ['type_consultation']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Consultations');
  }
};