'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Hopitaux', 'departement', {
      type: Sequelize.STRING(100),
      allowNull: true
    });
    await queryInterface.changeColumn('Hopitaux', 'region', {
      type: Sequelize.STRING(100),
      allowNull: true
    });
    await queryInterface.changeColumn('Hopitaux', 'pays', {
      type: Sequelize.STRING(100),
      allowNull: true
    });
    await queryInterface.changeColumn('Hopitaux', 'fax', {
      type: Sequelize.STRING(20),
      allowNull: true
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Hopitaux', 'departement', {
      type: Sequelize.STRING(100),
      allowNull: false
    });
    await queryInterface.changeColumn('Hopitaux', 'region', {
      type: Sequelize.STRING(100),
      allowNull: false
    });
    await queryInterface.changeColumn('Hopitaux', 'pays', {
      type: Sequelize.STRING(100),
      allowNull: false
    });
    await queryInterface.changeColumn('Hopitaux', 'fax', {
      type: Sequelize.STRING(20),
      allowNull: false
    });
  }
};
