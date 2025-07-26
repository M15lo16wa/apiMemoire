'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Vérifier si la colonne mot_de_passe existe déjà
    const tableDescription = await queryInterface.describeTable('ProfessionnelsSante');
    
    if (!tableDescription.mot_de_passe) {
      await queryInterface.addColumn('ProfessionnelsSante', 'mot_de_passe', {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Mot de passe hashé pour l\'authentification directe'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('ProfessionnelsSante', 'mot_de_passe');
  }
};
