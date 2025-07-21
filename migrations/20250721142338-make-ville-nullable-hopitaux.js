'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Hopitaux', 'ville', {
      type: Sequelize.STRING(100),
      allowNull: true
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Hopitaux', 'ville', {
      type: Sequelize.STRING(100),
      allowNull: false
    });
  }
}; 