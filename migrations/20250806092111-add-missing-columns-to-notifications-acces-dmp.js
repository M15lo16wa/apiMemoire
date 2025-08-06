'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ajouter la colonne destinataire
    await queryInterface.addColumn('NotificationsAccesDMP', 'destinataire', {
      type: Sequelize.STRING(255),
      allowNull: false,
      defaultValue: '',
      comment: 'Email ou numéro de téléphone du destinataire'
    });

    // Ajouter la colonne date_envoi
    await queryInterface.addColumn('NotificationsAccesDMP', 'date_envoi', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Ajouter la colonne date_livraison
    await queryInterface.addColumn('NotificationsAccesDMP', 'date_livraison', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Ajouter la colonne nombre_tentatives
    await queryInterface.addColumn('NotificationsAccesDMP', 'nombre_tentatives', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    // Ajouter la colonne erreur_envoi
    await queryInterface.addColumn('NotificationsAccesDMP', 'erreur_envoi', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Message d\'erreur en cas d\'échec'
    });

    // Ajouter la colonne delai_expiration
    await queryInterface.addColumn('NotificationsAccesDMP', 'delai_expiration', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Délai d\'expiration en minutes'
    });

    // Ajouter la colonne date_expiration
    await queryInterface.addColumn('NotificationsAccesDMP', 'date_expiration', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('NotificationsAccesDMP', 'destinataire');
    await queryInterface.removeColumn('NotificationsAccesDMP', 'date_envoi');
    await queryInterface.removeColumn('NotificationsAccesDMP', 'date_livraison');
    await queryInterface.removeColumn('NotificationsAccesDMP', 'nombre_tentatives');
    await queryInterface.removeColumn('NotificationsAccesDMP', 'erreur_envoi');
    await queryInterface.removeColumn('NotificationsAccesDMP', 'delai_expiration');
    await queryInterface.removeColumn('NotificationsAccesDMP', 'date_expiration');
  }
};
