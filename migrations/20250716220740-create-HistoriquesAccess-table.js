'use strict';

const DataTypes = require('sequelize/lib/data-types');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('HistoriquesAccess', {
      id_historique: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Identifiant unique de l\'entrée d\'historique'
      },
      date_heure_acces: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Date et heure de l\'accès'
      },
      action: { 
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'Type d\'action effectuée'
      },
      type_ressource: { 
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Type de ressource concernée par l\'action'
      },
      id_ressource: { 
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID de la ressource concernée'
      },
      details: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Détails supplémentaires sur l\'action au format JSON'
      },
      statut: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'SUCCES',
        comment: 'Statut de l\'action (SUCCES, ECHEC, AVERTISSEMENT)'
      },
      code_erreur: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Code d\'erreur en cas d\'échec de l\'action'
      },
      message_erreur: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Message d\'erreur détaillé en cas d\'échec'
      },
      adresse_ip: {
        type: DataTypes.STRING(45),
        allowNull: true,
        comment: 'Adresse IP de l\'utilisateur'
      },
      user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'User-Agent du navigateur ou de l\'application client'
      },
      device_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Identifiant unique du périphérique'
      },
      id_utilisateur: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID de l\'utilisateur concerné (géré dans index.js)'
      },
      id_patient: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID du patient concerné (géré dans index.js)'
      },
      id_dossier: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID du dossier médical concerné (géré dans index.js)'
      },
      id_service: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID du service de santé concerné (géré dans index.js)'
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID de l\'utilisateur ayant effectué l\'action (géré dans index.js)'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Date et heure de création'
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Date et heure de mise à jour'
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Date et heure de suppression douce'
      }
    });
  },

  async down (queryInterface, Sequelize) {
    // Suppression des index personnalisés avant de supprimer la table
    await queryInterface.removeIndex('HistoriquesAccess', 'idx_historique_date_utilisateur_action');
    await queryInterface.removeIndex('HistoriquesAccess', 'idx_historique_ressource');
    await queryInterface.removeIndex('HistoriquesAccess', 'idx_historique_ip');
    
    // Suppression de la table
    await queryInterface.dropTable('HistoriquesAccess');
  }
};
