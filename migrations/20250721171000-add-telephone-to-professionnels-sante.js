module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('ProfessionnelsSante', 'telephone', {
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: 'Numéro de téléphone du professionnel de santé'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('ProfessionnelsSante', 'telephone');
  }
}; 