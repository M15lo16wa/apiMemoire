'use strict';

const DataTypes = require('sequelize/lib/data-types');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('DossiersMedicaux', {
      id_dossier: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Identifiant unique du dossier médical'
      },
      numeroDossier: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Numéro unique du dossier (format défini par la politique de numérotation)'
      },
      dateCreation: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Date de création du dossier médical'
      },
      statut: {
        type: DataTypes.ENUM('actif', 'ferme', 'archive', 'fusionne'),
        defaultValue: 'actif',
        allowNull: false,
        comment: 'Statut actuel du dossier médical'
      },
      type_dossier: {
        type: DataTypes.ENUM('principal', 'specialite', 'urgence', 'suivi', 'consultation', 'autre'),
        allowNull: false,
        defaultValue: 'principal',
        comment: 'Type de dossier médical (définit son usage principal)'
      },
      patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID du patient propriétaire du dossier (géré dans index.js)'
      },
      service_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID du service de santé responsable du dossier (géré dans index.js)'
      },
      medecin_referent_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID du médecin référent principal pour ce dossier (géré dans index.js)'
      },
      resume: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Résumé clinique du patient et de sa situation médicale'
      },
      antecedent_medicaux: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Antécédents médicaux structurés (pathologies, chirurgies, etc.)'
      },
      allergies: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Allergies et intolérances médicamenteuses ou autres'
      },
      traitements_chroniques: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Traitements au long cours avec posologie et indications'
      },
      parametres_vitaux: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Derniers paramètres vitaux enregistrés (TA, poids, taille, IMC, etc.)'
      },
      habitudes_vie: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Informations sur le mode de vie (tabac, alcool, activité physique, etc.)'
      },
      historique_familial: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Antécédents familiaux notables'
      },
      directives_anticipées: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Directives anticipées et personnes de confiance'
      },
      observations: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Notes et observations diverses'
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID de l\'utilisateur ayant créé le dossier (géré dans index.js)'
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID du dernier utilisateur ayant modifié le dossier (géré dans index.js)'
      },
      date_fermeture: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date de fermeture du dossier si applicable'
      },
      motif_fermeture: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Raison de la fermeture du dossier'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Date de création de l\'enregistrement'
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Date de dernière mise à jour de l\'enregistrement'
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Date de suppression douce (soft delete) du dossier'
      }
    });

    // Ajout des index pour les champs fréquemment utilisés dans les requêtes
    await queryInterface.addIndex('DossiersMedicaux', ['numeroDossier'], { unique: true });
    await queryInterface.addIndex('DossiersMedicaux', ['patient_id']);
    await queryInterface.addIndex('DossiersMedicaux', ['service_id']);
    await queryInterface.addIndex('DossiersMedicaux', ['medecin_referent_id']);
    await queryInterface.addIndex('DossiersMedicaux', ['statut']);
    await queryInterface.addIndex('DossiersMedicaux', ['type_dossier']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('DossiersMedicaux');
  }
};