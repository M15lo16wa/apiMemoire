'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add professionnel_id foreign key to Prescriptions
    try {
      await queryInterface.addColumn('Prescriptions', 'professionnel_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ProfessionnelsSante',
          key: 'id_professionnel'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'ID du professionnel rédigeant la prescription'
      });
    } catch (error) {
      console.log('professionnel_id column may already exist in Prescriptions');
    }

    // Add service_id foreign key to Consultations
    try {
      await queryInterface.addColumn('Consultations', 'service_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'ServicesSante',
          key: 'id_service'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'ID du service de santé responsable de la consultation'
      });
    } catch (error) {
      console.log('service_id column may already exist in Consultations');
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove professionnel_id from Prescriptions
    try {
      await queryInterface.removeColumn('Prescriptions', 'professionnel_id');
    } catch (error) {
      console.log('Error removing professionnel_id from Prescriptions');
    }

    // Remove service_id from Consultations
    try {
      await queryInterface.removeColumn('Consultations', 'service_id');
    } catch (error) {
      console.log('Error removing service_id from Consultations');
    }
  }
};
