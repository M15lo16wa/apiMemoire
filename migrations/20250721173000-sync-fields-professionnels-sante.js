module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Liste des colonnes à ajouter (nom, type, options)
    const columns = [
      ['numero_licence', { type: Sequelize.STRING(50), allowNull: true, unique: true, comment: 'Numéro de licence du professionnel de santé' }],
      ['telephone_portable', { type: Sequelize.STRING(20), allowNull: true, comment: 'Téléphone portable du professionnel de santé' }],
      ['adresse', { type: Sequelize.STRING(255), allowNull: true, comment: 'Adresse du professionnel de santé' }],
      ['code_postal', { type: Sequelize.STRING(10), allowNull: true, comment: 'Code postal du professionnel de santé' }],
      ['ville', { type: Sequelize.STRING(100), allowNull: true, comment: 'Ville du professionnel de santé' }],
      ['pays', { type: Sequelize.STRING(100), allowNull: true, comment: 'Pays du professionnel de santé' }],
      ['date_naissance', { type: Sequelize.DATEONLY, allowNull: true, comment: 'Date de naissance du professionnel de santé' }],
      ['sexe', { type: Sequelize.ENUM('M', 'F', 'Autre', 'Non précisé'), allowNull: false, defaultValue: 'Non précisé', comment: 'Sexe du professionnel de santé' }],
      ['date_obtention_licence', { type: Sequelize.DATEONLY, allowNull: true, comment: "Date d'obtention de la licence" }],
      ['date_embauche', { type: Sequelize.DATEONLY, allowNull: true, comment: "Date d'embauche du professionnel de santé" }],
      ['date_depart', { type: Sequelize.DATEONLY, allowNull: true, comment: "Date de départ du professionnel de santé" }],
      ['description', { type: Sequelize.TEXT, allowNull: true, comment: 'Description du professionnel de santé' }],
      ['photo_url', { type: Sequelize.STRING(500), allowNull: true, comment: 'URL de la photo du professionnel de santé' }],
    ];
    const table = 'ProfessionnelsSante';
    const tableDesc = await queryInterface.describeTable(table);
    for (const [col, opts] of columns) {
      if (!tableDesc[col]) {
        try {
          await queryInterface.addColumn(table, col, opts);
        } catch (e) {
          // Ignore si déjà existant ou autre erreur non bloquante
        }
      }
    }
  },
  down: async (queryInterface, Sequelize) => {
    // Supprimer les colonnes ajoutées
    const columns = [
      'numero_licence', 'telephone_portable', 'adresse', 'code_postal', 'ville', 'pays', 'date_naissance', 'sexe', 'date_obtention_licence', 'date_embauche', 'date_depart', 'description', 'photo_url'
    ];
    for (const col of columns) {
      try {
        await queryInterface.removeColumn('ProfessionnelsSante', col);
      } catch (e) {}
    }
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_ProfessionnelsSante_sexe";');
  }
}; 