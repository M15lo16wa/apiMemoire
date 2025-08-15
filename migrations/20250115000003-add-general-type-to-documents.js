'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      console.log('🔄 Ajout du type "general" à l\'ENUM documents_personnels.type...');
      
      // Ajouter le type 'general' à l'ENUM existant
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_documents_personnels_type" ADD VALUE 'general';
      `);
      
      console.log('✅ Type "general" ajouté avec succès à l\'ENUM');
      
    } catch (error) {
      console.log('⚠️ Erreur lors de l\'ajout du type "general":', error.message);
      
      // Si le type existe déjà, on continue
      if (error.message.includes('already exists') || error.message.includes('duplicate key')) {
        console.log('ℹ️ Type "general" existe déjà dans l\'ENUM');
      } else {
        // Si c'est une autre erreur, on la relance
        throw error;
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('⚠️ Migration irréversible: le type "general" ne peut pas être supprimé de l\'ENUM');
    console.log('ℹ️ Pour revenir en arrière, il faudrait recréer la table complète');
  }
};
