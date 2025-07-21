'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Hopitaux', 'code_postal', {
      type: Sequelize.STRING(10),
      allowNull: true
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Hopitaux', 'code_postal', {
      type: Sequelize.STRING(10),
      allowNull: false
    });
  }
};
