'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Renommer l'ancien type
    await queryInterface.sequelize.query('ALTER TYPE "enum_Utilisateurs_role" RENAME TO "enum_Utilisateurs_role_old";');
    // Créer le nouveau type sans patient
    await queryInterface.sequelize.query("CREATE TYPE \"enum_Utilisateurs_role\" AS ENUM ('admin', 'secretaire', 'visiteur');");
    // Changer la colonne pour utiliser le nouveau type
    await queryInterface.sequelize.query('ALTER TABLE "Utilisateurs" ALTER COLUMN "role" TYPE "enum_Utilisateurs_role" USING "role"::text::"enum_Utilisateurs_role";');
    // Supprimer l'ancien type
    await queryInterface.sequelize.query('DROP TYPE "enum_Utilisateurs_role_old";');
  },

  down: async (queryInterface, Sequelize) => {
    // Pour revenir en arrière, il faudrait recréer l'ENUM avec patient
    await queryInterface.sequelize.query('ALTER TYPE "enum_Utilisateurs_role" RENAME TO "enum_Utilisateurs_role_old";');
    await queryInterface.sequelize.query("CREATE TYPE \"enum_Utilisateurs_role\" AS ENUM ('admin', 'secretaire', 'visiteur', 'patient');");
    await queryInterface.sequelize.query('ALTER TABLE "Utilisateurs" ALTER COLUMN "role" TYPE "enum_Utilisateurs_role" USING "role"::text::"enum_Utilisateurs_role";');
    await queryInterface.sequelize.query('DROP TYPE "enum_Utilisateurs_role_old";');
  }
}; 