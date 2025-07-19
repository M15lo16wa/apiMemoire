'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add authentication fields to Patient table
    await queryInterface.addColumn('Patients', 'mot_de_passe', {
      type: Sequelize.STRING(255),
      allowNull: false,
      defaultValue: 'temp_password' // Temporary default, will be updated
    });

    await queryInterface.addColumn('Patients', 'role', {
      type: Sequelize.ENUM('patient'),
      allowNull: false,
      defaultValue: 'patient'
    });

    await queryInterface.addColumn('Patients', 'statut_compte', {
      type: Sequelize.ENUM('actif', 'inactif', 'suspendu', 'en_attente_validation'),
      allowNull: false,
      defaultValue: 'actif'
    });

    await queryInterface.addColumn('Patients', 'date_derniere_connexion', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Make email required and unique
    await queryInterface.changeColumn('Patients', 'email', {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true
    });

    // Remove the foreign key constraint and utilisateur_id column
    try {
      // First, try to drop the foreign key constraint
      await queryInterface.removeConstraint('Patients', 'Patients_utilisateur_id_fkey');
    } catch (error) {
      console.log('Foreign key constraint may not exist or has different name:', error.message);
    }

    // Remove the utilisateur_id column
    await queryInterface.removeColumn('Patients', 'utilisateur_id');
  },

  down: async (queryInterface, Sequelize) => {
    // Add back the utilisateur_id column
    await queryInterface.addColumn('Patients', 'utilisateur_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Utilisateurs',
        key: 'id_utilisateur'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Make email nullable again
    await queryInterface.changeColumn('Patients', 'email', {
      type: Sequelize.STRING(100),
      allowNull: true,
      unique: true
    });

    // Remove authentication fields
    await queryInterface.removeColumn('Patients', 'date_derniere_connexion');
    await queryInterface.removeColumn('Patients', 'statut_compte');
    await queryInterface.removeColumn('Patients', 'role');
    await queryInterface.removeColumn('Patients', 'mot_de_passe');
  }
};
