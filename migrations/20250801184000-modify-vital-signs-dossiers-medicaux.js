'use strict';

const DataTypes = require('sequelize/lib/data-types');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Remove the old parametres_vitaux JSON column
    await queryInterface.removeColumn('DossiersMedicaux', 'parametres_vitaux');
    
    // Add specific vital signs columns
    await queryInterface.addColumn('DossiersMedicaux', 'heart_rate', {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Fréquence cardiaque (battements par minute)'
    });
    
    await queryInterface.addColumn('DossiersMedicaux', 'blood_pressure', {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Tension artérielle (format: systolique/diastolique, ex: 120/80)'
    });
    
    await queryInterface.addColumn('DossiersMedicaux', 'temperature', {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
      comment: 'Température corporelle (en degrés Celsius)'
    });
    
    await queryInterface.addColumn('DossiersMedicaux', 'respiratory_rate', {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Fréquence respiratoire (respirations par minute)'
    });
    
    await queryInterface.addColumn('DossiersMedicaux', 'oxygen_saturation', {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Saturation en oxygène (pourcentage)'
    });
    
    // Add indexes for performance
    await queryInterface.addIndex('DossiersMedicaux', ['heart_rate']);
    await queryInterface.addIndex('DossiersMedicaux', ['temperature']);
    await queryInterface.addIndex('DossiersMedicaux', ['oxygen_saturation']);
  },

  async down (queryInterface, Sequelize) {
    // Remove the new vital signs columns
    await queryInterface.removeColumn('DossiersMedicaux', 'heart_rate');
    await queryInterface.removeColumn('DossiersMedicaux', 'blood_pressure');
    await queryInterface.removeColumn('DossiersMedicaux', 'temperature');
    await queryInterface.removeColumn('DossiersMedicaux', 'respiratory_rate');
    await queryInterface.removeColumn('DossiersMedicaux', 'oxygen_saturation');
    
    // Restore the old parametres_vitaux JSON column
    await queryInterface.addColumn('DossiersMedicaux', 'parametres_vitaux', {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Derniers paramètres vitaux enregistrés (TA, poids, taille, IMC, etc.)'
    });
  }
};
