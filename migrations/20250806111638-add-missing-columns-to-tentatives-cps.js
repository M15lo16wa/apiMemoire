'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('TentativesAuthentificationCPS', 'code_saisi', {
      type: Sequelize.STRING(10),
      allowNull: false,
      defaultValue: '',
      comment: 'Code CPS saisi par l\'utilisateur'
    });

    await queryInterface.addColumn('TentativesAuthentificationCPS', 'code_attendu', {
      type: Sequelize.STRING(10),
      allowNull: false,
      defaultValue: '',
      comment: 'Code CPS attendu (pour validation)'
    });

    await queryInterface.addColumn('TentativesAuthentificationCPS', 'tentative_numero', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Numéro de tentative dans la période'
    });

    await queryInterface.addColumn('TentativesAuthentificationCPS', 'date_tentative', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    });

    await queryInterface.addColumn('TentativesAuthentificationCPS', 'statut', {
      type: Sequelize.ENUM('reussie', 'echouee'),
      allowNull: false,
      defaultValue: 'echouee'
    });

    await queryInterface.addColumn('TentativesAuthentificationCPS', 'adresse_ip', {
      type: Sequelize.STRING(45),
      allowNull: false,
      defaultValue: '0.0.0.0'
    });

    await queryInterface.addColumn('TentativesAuthentificationCPS', 'user_agent', {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: ''
    });

    await queryInterface.addColumn('TentativesAuthentificationCPS', 'raison_echec', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Raison de l\'échec si applicable'
    });

    await queryInterface.addColumn('TentativesAuthentificationCPS', 'delai_attente', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Délai d\'attente imposé en minutes'
    });

    // Ajouter les index
    await queryInterface.addIndex('TentativesAuthentificationCPS', ['professionnel_id', 'date_tentative']);
    await queryInterface.addIndex('TentativesAuthentificationCPS', ['statut']);
    await queryInterface.addIndex('TentativesAuthentificationCPS', ['adresse_ip']);
  },

  async down(queryInterface, Sequelize) {
    // Supprimer les index
    await queryInterface.removeIndex('TentativesAuthentificationCPS', ['professionnel_id', 'date_tentative']);
    await queryInterface.removeIndex('TentativesAuthentificationCPS', ['statut']);
    await queryInterface.removeIndex('TentativesAuthentificationCPS', ['adresse_ip']);

    // Supprimer les colonnes
    await queryInterface.removeColumn('TentativesAuthentificationCPS', 'delai_attente');
    await queryInterface.removeColumn('TentativesAuthentificationCPS', 'raison_echec');
    await queryInterface.removeColumn('TentativesAuthentificationCPS', 'user_agent');
    await queryInterface.removeColumn('TentativesAuthentificationCPS', 'adresse_ip');
    await queryInterface.removeColumn('TentativesAuthentificationCPS', 'statut');
    await queryInterface.removeColumn('TentativesAuthentificationCPS', 'date_tentative');
    await queryInterface.removeColumn('TentativesAuthentificationCPS', 'tentative_numero');
    await queryInterface.removeColumn('TentativesAuthentificationCPS', 'code_attendu');
    await queryInterface.removeColumn('TentativesAuthentificationCPS', 'code_saisi');
  }
};
