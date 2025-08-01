'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove old associations from AutorisationAcces that don't exist in UML diagram
    const columnsToRemove = [
      'utilisateur_id',
      'dossier_id'
    ];

    for (const column of columnsToRemove) {
      try {
        await queryInterface.removeColumn('AutorisationsAcces', column);
      } catch (error) {
        console.log(`Column ${column} may not exist, skipping...`);
      }
    }

    // Add foreign keys based on UML
    await queryInterface.addColumn('AutorisationsAcces', 'patient_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Patients',
        key: 'id_patient'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'ID du patient concerné par l\'autorisation'
    });

    await queryInterface.addColumn('AutorisationsAcces', 'professionnel_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'ProfessionnelsSante',
        key: 'id_professionnel'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'ID du professionnel demandant l\'accès'
    });

    await queryInterface.addColumn('AutorisationsAcces', 'autorisateur_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'ProfessionnelsSante',
        key: 'id_professionnel'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'ID du professionnel autorisateur'
    });

    await queryInterface.addColumn('AutorisationsAcces', 'historique_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'HistoriquesAccess',
        key: 'id_historique'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'ID de l\'historique d\'accès lié'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove added foreign keys
    await queryInterface.removeColumn('AutorisationsAcces', 'patient_id');
    await queryInterface.removeColumn('AutorisationsAcces', 'professionnel_id');
    await queryInterface.removeColumn('AutorisationsAcces', 'autorisateur_id');
    await queryInterface.removeColumn('AutorisationsAcces', 'historique_id');

    // Add removed associations again for rollback (not fully reversible)
    await queryInterface.addColumn('AutorisationsAcces', 'utilisateur_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Utilisateurs',
        key: 'id_utilisateur',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      comment: 'Utilisateur qui reçoit l\'accès au dossier médical'
    });

    await queryInterface.addColumn('AutorisationsAcces', 'dossier_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'DossiersMedicaux',
        key: 'id_dossier',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      comment: 'Dossier médical auquel l\'accès est accordé'
    });
  }
};

