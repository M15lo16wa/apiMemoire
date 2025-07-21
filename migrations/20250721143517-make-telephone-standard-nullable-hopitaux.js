'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Hopitaux', 'telephone_standard', {
      type: Sequelize.STRING(20),
      allowNull: true
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Hopitaux', 'telephone_standard', {
      type: Sequelize.STRING(20),
      allowNull: false
    });
  }
};
