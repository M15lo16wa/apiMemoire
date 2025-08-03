'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('auto_mesures', {
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
      type_mesure: {
        type: Sequelize.ENUM('poids', 'taille', 'tension_arterielle', 'glycemie', 'temperature', 'saturation'),
        allowNull: false
      },
      valeur: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      valeur_secondaire: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      unite: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      unite_secondaire: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      date_mesure: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      heure_mesure: {
        type: Sequelize.TIME,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
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
    await queryInterface.dropTable('auto_mesures');
  }
};
