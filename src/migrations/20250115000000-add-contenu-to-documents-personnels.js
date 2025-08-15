'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('documents_personnels', 'contenu', {
      type: Sequelize.TEXT('long'),
      allowNull: true, // Temporairement nullable pour les anciens documents
      comment: 'Contenu du fichier encodé en base64'
    });

    // Optionnel : Rendre le champ obligatoire après migration des données
    // await queryInterface.changeColumn('documents_personnels', 'contenu', {
    //   type: Sequelize.TEXT('long'),
    //   allowNull: false,
    //   comment: 'Contenu du fichier encodé en base64'
    // });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('documents_personnels', 'contenu');
  }
};
