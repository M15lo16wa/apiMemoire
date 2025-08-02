'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('DossiersMedicaux', 'groupe_sanguin', {
      type: Sequelize.STRING(20),
      allowNull: true
    });

    // Add index for better query performance
    await queryInterface.addIndex('DossiersMedicaux', ['groupe_sanguin']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('DossiersMedicaux', ['groupe_sanguin']);
    await queryInterface.removeColumn('DossiersMedicaux', 'groupe_sanguin');
  }
};
