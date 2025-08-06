'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('NotificationsAccesDMP', 'contenu_notification', {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: ''
    });
    await queryInterface.addColumn('NotificationsAccesDMP', 'contenu_html', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('NotificationsAccesDMP', 'contenu_notification');
    await queryInterface.removeColumn('NotificationsAccesDMP', 'contenu_html');
  }
};
