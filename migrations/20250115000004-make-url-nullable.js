'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('documents_personnels', 'url', {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: 'URL du fichier (optionnel, car le contenu est stocké en base64)'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('documents_personnels', 'url', {
      type: Sequelize.STRING(500),
      allowNull: false
    });
  }
};
