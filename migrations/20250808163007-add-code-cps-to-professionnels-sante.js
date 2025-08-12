'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('ProfessionnelsSante', 'code_cps', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: "Code CPS à 4 chiffres, hashé pour l'authentification"
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('ProfessionnelsSante', 'code_cps');
  }
};
