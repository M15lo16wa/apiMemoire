'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('messages', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      patient_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Patients',
          key: 'id_patient'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      professionnel_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ProfessionnelsSante',
          key: 'id_professionnel'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      sujet: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      contenu: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      lu: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      date_envoi: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('messages');
  }
};
