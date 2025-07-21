'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 1. Changer la colonne en VARCHAR temporairement pour détacher l'ENUM
    await queryInterface.changeColumn('Hopitaux', 'type_etablissement', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // 2. Supprimer l'ancien type ENUM (insensible à la casse)
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Hopitaux_type_etablissement";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_hopitaux_type_etablissement;');


    // 3. Créer le nouveau type ENUM avec les bonnes valeurs
    await queryInterface.sequelize.query("CREATE TYPE \"enum_Hopitaux_type_etablissement\" AS ENUM('Public', 'Privé', 'Spécialisé');");

    // 4. Reconvertir la colonne vers le nouveau type ENUM
    // Sequelize va gérer le cast correctement ici
    await queryInterface.changeColumn('Hopitaux', 'type_etablissement', {
      type: Sequelize.ENUM('Public', 'Privé', 'Spécialisé'),
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    // Annulation de la migration
    await queryInterface.changeColumn('Hopitaux', 'type_etablissement', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Hopitaux_type_etablissement";');
  }
}; 