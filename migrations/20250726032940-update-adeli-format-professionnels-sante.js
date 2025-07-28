'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('ProfessionnelsSante', 'numero_adeli', {
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: 'Numéro ADELI alphanumérique (ex: ADL123456)'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('ProfessionnelsSante', 'numero_adeli', {
      type: Sequelize.STRING(9),
      allowNull: true,
      comment: 'Numéro ADELI numérique (9 chiffres)'
    });
  }
};
