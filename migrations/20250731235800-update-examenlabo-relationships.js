'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add patient_id foreign key if it doesn't exist
    try {
      await queryInterface.addColumn('ExamensLabo', 'patient_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Patients',
          key: 'id_patient'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID du patient pour lequel l\'examen est prescrit'
      });
    } catch (error) {
      console.log('patient_id column may already exist in ExamensLabo');
    }

    // Add consultation_id foreign key if it doesn't exist
    try {
      await queryInterface.addColumn('ExamensLabo', 'consultation_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Consultations',
          key: 'id_consultation'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'ID de la consultation associée à l\'examen'
      });
    } catch (error) {
      console.log('consultation_id column may already exist in ExamensLabo');
    }

    // Add service_id foreign key if it doesn't exist
    try {
      await queryInterface.addColumn('ExamensLabo', 'service_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'ServicesSante',
          key: 'id_service'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'ID du service de santé responsable de l\'examen'
      });
    } catch (error) {
      console.log('service_id column may already exist in ExamensLabo');
    }

    // Add indexes for the new foreign keys
    try {
      await queryInterface.addIndex('ExamensLabo', ['patient_id']);
      await queryInterface.addIndex('ExamensLabo', ['consultation_id']);
      await queryInterface.addIndex('ExamensLabo', ['service_id']);
    } catch (error) {
      console.log('Some indexes may already exist');
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove the foreign keys and indexes
    try {
      await queryInterface.removeIndex('ExamensLabo', ['patient_id']);
      await queryInterface.removeIndex('ExamensLabo', ['consultation_id']);
      await queryInterface.removeIndex('ExamensLabo', ['service_id']);
    } catch (error) {
      console.log('Error removing indexes');
    }

    try {
      await queryInterface.removeColumn('ExamensLabo', 'patient_id');
      await queryInterface.removeColumn('ExamensLabo', 'consultation_id');
      await queryInterface.removeColumn('ExamensLabo', 'service_id');
    } catch (error) {
      console.log('Error removing columns');
    }
  }
};
