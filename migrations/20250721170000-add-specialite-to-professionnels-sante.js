module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('ProfessionnelsSante', 'specialite', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Spécialité du professionnel de santé'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('ProfessionnelsSante', 'specialite');
  }
}; 