'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Vérifier si les colonnes existent avant de les supprimer
    const tableDescription = await queryInterface.describeTable('Utilisateurs');
    
    const columnsToRemove = [
      'telephone',
      'date_naissance', 
      'sexe',
      'adresse',
      'code_postal',
      'ville',
      'pays'
    ];

    for (const column of columnsToRemove) {
      if (tableDescription[column]) {
        console.log(`Suppression de la colonne ${column}...`);
        await queryInterface.removeColumn('Utilisateurs', column);
      } else {
        console.log(`La colonne ${column} n'existe pas dans la table.`);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // Recréer les colonnes supprimées en cas de rollback
    await queryInterface.addColumn('Utilisateurs', 'telephone', {
      type: Sequelize.STRING(20),
      allowNull: true,
      validate: {
        is: /^[0-9+()\- ]+$/,
        len: [8, 20]
      }
    });

    await queryInterface.addColumn('Utilisateurs', 'date_naissance', {
      type: Sequelize.DATEONLY,
      allowNull: true,
      validate: {
        isDate: true,
        isBefore: new Date().toISOString().split('T')[0]
      }
    });

    await queryInterface.addColumn('Utilisateurs', 'sexe', {
      type: Sequelize.ENUM('M', 'F', 'Autre', 'Non précisé'),
      defaultValue: 'Non précisé',
      allowNull: false
    });

    await queryInterface.addColumn('Utilisateurs', 'adresse', {
      type: Sequelize.STRING(255),
      allowNull: true
    });

    await queryInterface.addColumn('Utilisateurs', 'code_postal', {
      type: Sequelize.STRING(10),
      allowNull: true
    });

    await queryInterface.addColumn('Utilisateurs', 'ville', {
      type: Sequelize.STRING(100),
      allowNull: true
    });

    await queryInterface.addColumn('Utilisateurs', 'pays', {
      type: Sequelize.STRING(100),
      allowNull: true,
      defaultValue: 'France'
    });
  }
};
