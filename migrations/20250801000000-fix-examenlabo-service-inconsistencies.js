'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Fix any field name inconsistencies in ExamensLabo table
    // The service was referencing date_examen but model has date_prescription, date_prelevement etc.
    
    // Add missing fields that the service expects
    try {
      await queryInterface.addColumn('ExamensLabo', 'date_examen', {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Date générale de l\'examen (alias pour compatibilité service)'
      });
    } catch (error) {
      console.log('date_examen column may already exist');
    }

    // Update existing records to have date_examen = date_prescription by default
    await queryInterface.sequelize.query(`
      UPDATE "ExamensLabo" 
      SET date_examen = date_prescription 
      WHERE date_examen IS NULL AND date_prescription IS NOT NULL
    `);
  },

  async down(queryInterface, Sequelize) {
    // Remove the added field
    try {
      await queryInterface.removeColumn('ExamensLabo', 'date_examen');
    } catch (error) {
      console.log('Error removing date_examen column');
    }
  }
};
