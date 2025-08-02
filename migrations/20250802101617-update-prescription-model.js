'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove consultation_id column
    try {
      await queryInterface.removeColumn('Prescriptions', 'consultation_id');
      console.log('consultation_id column removed successfully');
    } catch (error) {
      console.log('consultation_id column may not exist or already removed');
    }

    // Remove service_id column
    try {
      await queryInterface.removeColumn('Prescriptions', 'service_id');
      console.log('service_id column removed successfully');
    } catch (error) {
      console.log('service_id column may not exist or already removed');
    }

    // Remove medicament column
    try {
      await queryInterface.removeColumn('Prescriptions', 'medicament');
      console.log('medicament column removed successfully');
    } catch (error) {
      console.log('medicament column may not exist or already removed');
    }

    // Remove instructions column
    try {
      await queryInterface.removeColumn('Prescriptions', 'instructions');
      console.log('instructions column removed successfully');
    } catch (error) {
      console.log('instructions column may not exist or already removed');
    }

    // Remove duree column
    try {
      await queryInterface.removeColumn('Prescriptions', 'duree');
      console.log('duree column removed successfully');
    } catch (error) {
      console.log('duree column may not exist or already removed');
    }

    // Add prescriptionNumber column
    try {
      await queryInterface.addColumn('Prescriptions', 'prescriptionNumber', {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Unique prescription number identifier'
      });
      console.log('prescriptionNumber column added successfully');
    } catch (error) {
      console.log('prescriptionNumber column may already exist');
    }

    // Remove indexes that were associated with removed columns
    try {
      await queryInterface.removeIndex('Prescriptions', ['consultation_id']);
    } catch (error) {
      console.log('consultation_id index may not exist');
    }

    try {
      await queryInterface.removeIndex('Prescriptions', ['service_id']);
    } catch (error) {
      console.log('service_id index may not exist');
    }

    try {
      await queryInterface.removeIndex('Prescriptions', ['medicament']);
    } catch (error) {
      console.log('medicament index may not exist');
    }

    // Add index for prescriptionNumber
    try {
      await queryInterface.addIndex('Prescriptions', ['prescriptionNumber']);
      console.log('prescriptionNumber index added successfully');
    } catch (error) {
      console.log('prescriptionNumber index may already exist');
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove prescriptionNumber column
    try {
      await queryInterface.removeColumn('Prescriptions', 'prescriptionNumber');
    } catch (error) {
      console.log('Error removing prescriptionNumber column');
    }

    // Add back the removed columns
    try {
      await queryInterface.addColumn('Prescriptions', 'medicament', {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Dénomination commune internationale (DCI) du médicament'
      });
    } catch (error) {
      console.log('Error adding back medicament column');
    }

    try {
      await queryInterface.addColumn('Prescriptions', 'instructions', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Instructions particulières (à jeun, pendant le repas, etc.)'
      });
    } catch (error) {
      console.log('Error adding back instructions column');
    }

    try {
      await queryInterface.addColumn('Prescriptions', 'duree', {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Durée du traitement (ex: 7 jours, 1 mois)'
      });
    } catch (error) {
      console.log('Error adding back duree column');
    }

    try {
      await queryInterface.addColumn('Prescriptions', 'consultation_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Consultations',
          key: 'id_consultation'
        },
        comment: 'ID de la consultation ayant donné lieu à cette prescription'
      });
    } catch (error) {
      console.log('Error adding back consultation_id column');
    }

    try {
      await queryInterface.addColumn('Prescriptions', 'service_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'ServicesSante',
          key: 'id_service'
        },
        comment: 'ID du service prescripteur'
      });
    } catch (error) {
      console.log('Error adding back service_id column');
    }

    // Add back indexes
    try {
      await queryInterface.addIndex('Prescriptions', ['consultation_id']);
      await queryInterface.addIndex('Prescriptions', ['service_id']);
      await queryInterface.addIndex('Prescriptions', ['medicament']);
    } catch (error) {
      console.log('Error adding back indexes');
    }

    // Remove prescriptionNumber index
    try {
      await queryInterface.removeIndex('Prescriptions', ['prescriptionNumber']);
    } catch (error) {
      console.log('Error removing prescriptionNumber index');
    }
  }
};
