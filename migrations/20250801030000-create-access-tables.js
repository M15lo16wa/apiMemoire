'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Migration for the AutorisationAcces table
    await queryInterface.createTable('AutorisationsAcces', {
      id_acces: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      typeAcces: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      dateDebut: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      dateFin: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      statut: {
        type: Sequelize.ENUM('Actif', 'Révoqué', 'Expiré'),
        defaultValue: 'Actif',
        allowNull: false,
      },
      raison: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      patient_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      professionnel_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      autorisateur_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      historique_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      }
    });

    // Migration for the HistoriqueAccess table
    await queryInterface.createTable('HistoriquesAccess', {
      id_historique: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      date_heure_acces: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      action: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      type_ressource: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      id_ressource: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      details: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      statut: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'SUCCES',
      },
      code_erreur: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      message_erreur: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      adresse_ip: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      device_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      professionnel_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      id_utilisateur: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      id_patient: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      id_dossier: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      id_service: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('AutorisationsAcces');
    await queryInterface.dropTable('HistoriquesAccess');
  }
};

