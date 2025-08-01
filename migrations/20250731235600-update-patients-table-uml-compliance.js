'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove columns that don't exist in UML diagram
    const columnsToRemove = [
      'numero_dossier',
      'lieu_naissance', 
      'civilite',
      'numero_secu',
      'complement_adresse',
      'code_postal',
      'ville',
      'pays',
      'telephone_secondaire',
      'profession',
      'groupe_sanguin',
      'poids',
      'taille',
      'photo',
      'assure',
      'nom_assurance',
      'numero_assure',
      'date_premiere_consultation',
      'date_derniere_consultation',
      'personne_contact',
      'telephone_urgence',
      'lien_parente',
      'notes',
      'statut',
      'date_deces',
      'mot_de_passe'
    ];

    for (const column of columnsToRemove) {
      try {
        await queryInterface.removeColumn('Patients', column);
      } catch (error) {
        console.log(`Column ${column} may not exist, skipping...`);
      }
    }

    // Add identifiantNational column as per UML diagram
    await queryInterface.addColumn('Patients', 'identifiantNational', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'Identifiant national du patient (numéro sécurité sociale, etc.)'
    });

    // Add foreign key for utilisateur_id to link with Utilisateur table
    await queryInterface.addColumn('Patients', 'utilisateur_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Utilisateurs',
        key: 'id_utilisateur'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Référence vers le compte utilisateur du patient'
    });

    // Remove existing indexes that are no longer needed
    try {
      await queryInterface.removeIndex('Patients', ['numero_secu']);
      await queryInterface.removeIndex('Patients', ['mot_de_passe']);
    } catch (error) {
      console.log('Some indexes may not exist, continuing...');
    }

    // Add new indexes for UML compliance
    await queryInterface.addIndex('Patients', ['identifiantNational']);
    await queryInterface.addIndex('Patients', ['utilisateur_id']);
  },

  async down(queryInterface, Sequelize) {
    // This is a destructive migration, we can't easily revert all changes
    // In production, you would want a more careful rollback strategy
    
    // Remove the new columns
    await queryInterface.removeColumn('Patients', 'identifiantNational');
    await queryInterface.removeColumn('Patients', 'utilisateur_id');

    // Remove new indexes
    try {
      await queryInterface.removeIndex('Patients', ['identifiantNational']);
      await queryInterface.removeIndex('Patients', ['utilisateur_id']);
    } catch (error) {
      console.log('Error removing indexes during rollback');
    }

    // Note: We cannot easily restore all the removed columns and their data
    // In a real scenario, you'd want to backup data before running this migration
    console.log('WARNING: This rollback cannot restore all removed columns and data');
  }
};
