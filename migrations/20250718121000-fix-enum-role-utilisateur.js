'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Supprimer la contrainte par défaut
    await queryInterface.sequelize.query('ALTER TABLE "Utilisateurs" ALTER COLUMN "role" DROP DEFAULT;');
    // 2. Supprimer la colonne
    await queryInterface.removeColumn('Utilisateurs', 'role');
    // 3. Supprimer le type ENUM
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Utilisateurs_role";');
    // 4. Recréer le type ENUM
    await queryInterface.sequelize.query('CREATE TYPE "enum_Utilisateurs_role" AS ENUM (\'admin\', \'secretaire\', \'visiteur\');');
    // 5. Ajouter la colonne avec le bon type et la bonne valeur par défaut
    await queryInterface.addColumn('Utilisateurs', 'role', {
      type: Sequelize.ENUM('admin', 'secretaire', 'visiteur'),
      allowNull: false,
      defaultValue: 'visiteur',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Pour revenir en arrière, il faudrait supprimer la colonne et recréer l'ancien type ENUM
    await queryInterface.sequelize.query('ALTER TABLE "Utilisateurs" ALTER COLUMN "role" DROP DEFAULT;');
    await queryInterface.removeColumn('Utilisateurs', 'role');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Utilisateurs_role";');
    await queryInterface.sequelize.query('CREATE TYPE "enum_Utilisateurs_role" AS ENUM (\'admin\', \'secretaire\', \'visiteur\', \'patient\');');
    await queryInterface.addColumn('Utilisateurs', 'role', {
      type: Sequelize.ENUM('admin', 'secretaire', 'visiteur', 'patient'),
      allowNull: false,
      defaultValue: 'visiteur',
    });
  }
}; 