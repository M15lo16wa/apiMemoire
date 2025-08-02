'use strict';

const DataTypes = require('sequelize/lib/data-types');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Check if patient_id column already exists
    const tableInfo = await queryInterface.describeTable('Consultations');
    
    if (!tableInfo.patient_id) {
      // Add patient_id column to Consultations table
      await queryInterface.addColumn('Consultations', 'patient_id', {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID du patient associé à la consultation',
        // Adding a default value temporarily to handle existing records
        defaultValue: 0
      });

      // Add index for patient_id for better query performance
      await queryInterface.addIndex('Consultations', ['patient_id']);

      // Update existing consultations with patient_id from their associated dossier
      // This assumes that each dossier has a patient_id
      await queryInterface.sequelize.query(`
        UPDATE Consultations 
        SET patient_id = (
          SELECT dm.patient_id 
          FROM DossiersMedicaux dm 
          WHERE dm.id_dossier = Consultations.dossier_id
        )
        WHERE patient_id = 0
      `);

      // Remove the default value after updating existing records
      await queryInterface.changeColumn('Consultations', 'patient_id', {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID du patient associé à la consultation'
      });
    } else {
      console.log('patient_id column already exists in Consultations table, skipping...');
    }
  },

  async down (queryInterface, Sequelize) {
    // Check if patient_id column exists before removing
    const tableInfo = await queryInterface.describeTable('Consultations');
    
    if (tableInfo.patient_id) {
      // Remove index
      try {
        await queryInterface.removeIndex('Consultations', ['patient_id']);
      } catch (error) {
        console.log('Index on patient_id may not exist, continuing...');
      }
      
      // Remove patient_id column
      await queryInterface.removeColumn('Consultations', 'patient_id');
    } else {
      console.log('patient_id column does not exist in Consultations table, skipping...');
    }
  }
};
