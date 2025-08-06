'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Supprimer les colonnes createdAt et updatedAt
    await queryInterface.removeColumn('NotificationsAccesDMP', 'createdAt');
    await queryInterface.removeColumn('NotificationsAccesDMP', 'updatedAt');
  },

  down: async (queryInterface, Sequelize) => {
    // Recréer les colonnes createdAt et updatedAt
    await queryInterface.addColumn('NotificationsAccesDMP', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    });
    await queryInterface.addColumn('NotificationsAccesDMP', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    });
  }
};
