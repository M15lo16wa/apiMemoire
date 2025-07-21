'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('Hopitaux');

    if (!tableInfo.telephone) {
      await queryInterface.addColumn('Hopitaux', 'telephone', {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'Numéro de téléphone principal de l\'hôpital'
      });
    }
    
    // Vous pouvez ajouter d'autres vérifications ici pour d'autres colonnes
    // Par exemple, pour s'assurer que `type_etablissement` existe :
    if (!tableInfo.type_etablissement) {
      await queryInterface.addColumn('Hopitaux', 'type_etablissement', {
        type: Sequelize.ENUM('Public', 'Privé', 'Spécialisé'),
        allowNull: true,
      });
    }
  },

  async down (queryInterface, Sequelize) {
    // La fonction down est optionnelle ici, mais bonne pratique
    // pour pouvoir annuler la migration si besoin.
    await queryInterface.removeColumn('Hopitaux', 'telephone');
    await queryInterface.removeColumn('Hopitaux', 'type_etablissement');
  }
}; 