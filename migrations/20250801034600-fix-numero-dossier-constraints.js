"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Generate numero_dossier for existing patients that have NULL values
    const [patients] = await queryInterface.sequelize.query(
      'SELECT id_patient FROM "Patients" WHERE numero_dossier IS NULL'
    );

    for (const patient of patients) {
      const numeroDossier = `PAT-${Date.now()}-${patient.id_patient.toString().padStart(3, '0')}`;
      await queryInterface.sequelize.query(
        'UPDATE "Patients" SET numero_dossier = ? WHERE id_patient = ?',
        {
          replacements: [numeroDossier, patient.id_patient]
        }
      );
    }

    // Now make the column NOT NULL
    await queryInterface.changeColumn('Patients', 'numero_dossier', {
      type: Sequelize.STRING(50),
      allowNull: false,
      comment: 'Numéro unique du dossier patient. Format recommandé: [ETABLISSEMENT]-[ANNEE]-[NUMERO] (ex: HOP-2023-0001)'
    });

    // Add unique index
    await queryInterface.addIndex('Patients', ['numero_dossier'], {
      name: 'idx_patients_numero_dossier',
      unique: true
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove unique index
    try {
      await queryInterface.removeIndex('Patients', 'idx_patients_numero_dossier');
    } catch (error) {
      console.log('Index may not exist, continuing...');
    }

    // Make the column nullable again
    await queryInterface.changeColumn('Patients', 'numero_dossier', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'Numéro unique du dossier patient. Format recommandé: [ETABLISSEMENT]-[ANNEE]-[NUMERO] (ex: HOP-2023-0001)'
    });
  }
};
