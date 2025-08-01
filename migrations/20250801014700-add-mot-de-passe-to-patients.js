'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add mot_de_passe column to Patients table
    await queryInterface.addColumn('Patients', 'mot_de_passe', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Mot de passe hashé du patient pour l\'authentification',
      after: 'identifiantNational' // Place it after identifiantNational column
    });

    // Add index for performance if needed for authentication queries
    await queryInterface.addIndex('Patients', ['identifiantNational'], {
      name: 'idx_patients_identifiant_national'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the index first
    try {
      await queryInterface.removeIndex('Patients', 'idx_patients_identifiant_national');
    } catch (error) {
      console.log('Index may not exist, continuing...');
    }

    // Remove the mot_de_passe column
    await queryInterface.removeColumn('Patients', 'mot_de_passe');
  }
};
