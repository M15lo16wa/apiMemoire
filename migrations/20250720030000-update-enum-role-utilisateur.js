'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Supprimer la colonne "role" pour enlever les dépendances
    await queryInterface.removeColumn('Utilisateurs', 'role');
    
    // 2. Supprimer les anciens types ENUM s'ils existent
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Utilisateurs_role";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Utilisateurs_role_old";');

    // 3. Recréer la colonne avec le bon type ENUM et la bonne valeur par défaut
    await queryInterface.addColumn('Utilisateurs', 'role', {
      type: Sequelize.ENUM('admin', 'secretaire'),
      allowNull: false,
      defaultValue: 'secretaire'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Pour revenir en arrière, on recrée l'ancien état
    await queryInterface.removeColumn('Utilisateurs', 'role');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Utilisateurs_role";');

    await queryInterface.addColumn('Utilisateurs', 'role', {
      type: Sequelize.ENUM('admin', 'secretaire', 'visiteur'),
      allowNull: false,
      defaultValue: 'visiteur'
    });
  }
}; 