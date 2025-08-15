'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('documents_personnels', {
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
      nom: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('ordonnance', 'resultat', 'certificat', 'autre'),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      taille: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      format: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      contenu: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Contenu du fichier encodé en base64'
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

    // Ajouter des index pour améliorer les performances
    await queryInterface.addIndex('documents_personnels', ['patient_id']);
    await queryInterface.addIndex('documents_personnels', ['type']);
    await queryInterface.addIndex('documents_personnels', ['createdAt']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('documents_personnels');
  }
};
