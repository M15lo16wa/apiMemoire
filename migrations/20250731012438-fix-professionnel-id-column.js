'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First check if id_medecin column exists
    const tableDescription = await queryInterface.describeTable('RendezVous');
    
    if (tableDescription.id_medecin) {
      // If id_medecin exists, rename it to professionnel_id
      await queryInterface.renameColumn('RendezVous', 'id_medecin', 'professionnel_id');
    } else if (!tableDescription.professionnel_id) {
      // If neither column exists, add professionnel_id
      await queryInterface.addColumn('RendezVous', 'professionnel_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'ProfessionnelsSante', // Make sure this matches your actual table name
          key: 'id_professionnel'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // This is a one-way migration, but we can implement a rollback if needed
    const tableDescription = await queryInterface.describeTable('RendezVous');
    
    if (tableDescription.professionnel_id) {
      await queryInterface.renameColumn('RendezVous', 'professionnel_id', 'id_medecin');
    }
  }
};
