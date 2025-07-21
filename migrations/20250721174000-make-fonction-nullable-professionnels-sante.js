module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('ProfessionnelsSante', 'fonction', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Fonction descriptive du professionnel (ex: généraliste, spécialiste, etc.)'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('ProfessionnelsSante', 'fonction', {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
}; 