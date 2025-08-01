'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, add numero_assure column as nullable
    await queryInterface.addColumn('Patients', 'numero_assure', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'Numéro d\'assuré pour l\'authentification du patient',
      after: 'identifiantNational'
    });

    // Add nom_assurance column as nullable
    await queryInterface.addColumn('Patients', 'nom_assurance', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Nom de la compagnie d\'assurance du patient',
      after: 'numero_assure'
    });

    // Generate default values for existing patients
    const [patients] = await queryInterface.sequelize.query(
      'SELECT id_patient FROM "Patients" WHERE numero_assure IS NULL OR nom_assurance IS NULL OR mot_de_passe IS NULL'
    );

    for (const patient of patients) {
      const numeroAssure = `TEMP${patient.id_patient.toString().padStart(6, '0')}`;
      const nomAssurance = 'Assurance Temporaire';
      const defaultPassword = '$2a$12$defaultHashedPasswordForMigration';
      
      await queryInterface.sequelize.query(
        'UPDATE "Patients" SET numero_assure = COALESCE(numero_assure, ?), nom_assurance = COALESCE(nom_assurance, ?), mot_de_passe = COALESCE(mot_de_passe, ?) WHERE id_patient = ?',
        {
          replacements: [numeroAssure, nomAssurance, defaultPassword, patient.id_patient]
        }
      );
    }

    // Now make the columns NOT NULL
    await queryInterface.changeColumn('Patients', 'numero_assure', {
      type: Sequelize.STRING(50),
      allowNull: false,
      comment: 'Numéro d\'assuré pour l\'authentification du patient'
    });

    await queryInterface.changeColumn('Patients', 'nom_assurance', {
      type: Sequelize.STRING(100),
      allowNull: false,
      comment: 'Nom de la compagnie d\'assurance du patient'
    });

    // Add unique index on numero_assure for better performance
    await queryInterface.addIndex('Patients', ['numero_assure'], {
      name: 'idx_patients_numero_assure',
      unique: true
    });

    // Update mot_de_passe column to be NOT NULL
    await queryInterface.changeColumn('Patients', 'mot_de_passe', {
      type: Sequelize.STRING(255),
      allowNull: false,
      comment: 'Mot de passe hashé du patient pour l\'authentification'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the index first
    try {
      await queryInterface.removeIndex('Patients', 'idx_patients_numero_assure');
    } catch (error) {
      console.log('Index may not exist, continuing...');
    }

    // Remove the columns
    await queryInterface.removeColumn('Patients', 'numero_assure');
    await queryInterface.removeColumn('Patients', 'nom_assurance');

    // Revert mot_de_passe to nullable
    await queryInterface.changeColumn('Patients', 'mot_de_passe', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Mot de passe hashé du patient pour l\'authentification'
    });
  }
};
