'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Migration: Ajout des champs 2FA aux modèles utilisateur, professionnel et patient...');

    // 1. Ajouter les champs 2FA à la table Utilisateurs
    console.log('📝 Ajout des champs 2FA à la table Utilisateurs...');
    await queryInterface.addColumn('Utilisateurs', 'two_factor_enabled', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indique si l\'authentification à double facteur est activée'
    });

    await queryInterface.addColumn('Utilisateurs', 'two_factor_secret', {
      type: Sequelize.STRING(32),
      allowNull: true,
      comment: 'Secret TOTP pour l\'authentification 2FA (chiffré)'
    });

    await queryInterface.addColumn('Utilisateurs', 'two_factor_recovery_codes', {
      type: Sequelize.JSONB,
      allowNull: true,
      comment: 'Codes de récupération 2FA (chiffrés)'
    });

    await queryInterface.addColumn('Utilisateurs', 'two_factor_backup_codes_used', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Codes de récupération 2FA déjà utilisés'
    });

    await queryInterface.addColumn('Utilisateurs', 'two_factor_last_used', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Date de dernière utilisation du 2FA'
    });

    // 2. Ajouter les champs 2FA à la table ProfessionnelsSante
    console.log('📝 Ajout des champs 2FA à la table ProfessionnelsSante...');
    await queryInterface.addColumn('ProfessionnelsSante', 'two_factor_enabled', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indique si l\'authentification à double facteur est activée'
    });

    await queryInterface.addColumn('ProfessionnelsSante', 'two_factor_secret', {
      type: Sequelize.STRING(32),
      allowNull: true,
      comment: 'Secret TOTP pour l\'authentification 2FA (chiffré)'
    });

    await queryInterface.addColumn('ProfessionnelsSante', 'two_factor_recovery_codes', {
      type: Sequelize.JSONB,
      allowNull: true,
      comment: 'Codes de récupération 2FA (chiffrés)'
    });

    await queryInterface.addColumn('ProfessionnelsSante', 'two_factor_backup_codes_used', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Codes de récupération 2FA déjà utilisés'
    });

    await queryInterface.addColumn('ProfessionnelsSante', 'two_factor_last_used', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Date de dernière utilisation du 2FA'
    });

    // 3. Ajouter les champs 2FA à la table Patients
    console.log('📝 Ajout des champs 2FA à la table Patients...');
    await queryInterface.addColumn('Patients', 'two_factor_enabled', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indique si l\'authentification à double facteur est activée'
    });

    await queryInterface.addColumn('Patients', 'two_factor_secret', {
      type: Sequelize.STRING(32),
      allowNull: true,
      comment: 'Secret TOTP pour l\'authentification 2FA (chiffré)'
    });

    await queryInterface.addColumn('Patients', 'two_factor_recovery_codes', {
      type: Sequelize.JSONB,
      allowNull: true,
      comment: 'Codes de récupération 2FA (chiffrés)'
    });

    await queryInterface.addColumn('Patients', 'two_factor_backup_codes_used', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Codes de récupération 2FA déjà utilisés'
    });

    await queryInterface.addColumn('Patients', 'two_factor_last_used', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Date de dernière utilisation du 2FA'
    });

    // 4. Créer une table pour l'historique des tentatives 2FA
    console.log('📝 Création de la table Historique2FA...');
    await queryInterface.createTable('Historique2FA', {
      id_historique_2fa: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Identifiant unique de l\'historique 2FA'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID de l\'utilisateur (peut être patient, professionnel ou utilisateur)'
      },
      user_type: {
        type: Sequelize.ENUM('patient', 'professionnel', 'utilisateur'),
        allowNull: false,
        comment: 'Type d\'utilisateur'
      },
      action: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Action effectuée (setup, verify, disable, failed_attempt)'
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true,
        comment: 'Adresse IP de la tentative'
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'User-Agent du navigateur/appareil'
      },
      success: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        comment: 'Indique si la tentative a réussi'
      },
      details: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Détails supplémentaires sur la tentative'
      },
              createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
          comment: 'Date de création de l\'enregistrement'
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
          comment: 'Date de mise à jour de l\'enregistrement'
        }
    });

    // 5. Ajouter des index pour améliorer les performances
    console.log('📝 Ajout des index pour les champs 2FA...');
    
    // Index sur la table Historique2FA
    await queryInterface.addIndex('Historique2FA', ['user_id', 'user_type'], {
      name: 'idx_historique_2fa_user'
    });
    
    await queryInterface.addIndex('Historique2FA', ['action'], {
      name: 'idx_historique_2fa_action'
    });
    
    await queryInterface.addIndex('Historique2FA', ['created_at'], {
      name: 'idx_historique_2fa_date'
    });

    // Index sur les champs 2FA des tables principales
    await queryInterface.addIndex('Utilisateurs', ['two_factor_enabled'], {
      name: 'idx_utilisateurs_2fa_enabled'
    });
    
    await queryInterface.addIndex('ProfessionnelsSante', ['two_factor_enabled'], {
      name: 'idx_professionnels_2fa_enabled'
    });
    
    await queryInterface.addIndex('Patients', ['two_factor_enabled'], {
      name: 'idx_patients_2fa_enabled'
    });

    console.log('✅ Migration 2FA terminée avec succès !');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Rollback: Suppression des champs 2FA...');

    // 1. Supprimer la table Historique2FA
    console.log('📝 Suppression de la table Historique2FA...');
    await queryInterface.dropTable('Historique2FA');

    // 2. Supprimer les champs 2FA de la table Patients
    console.log('📝 Suppression des champs 2FA de la table Patients...');
    await queryInterface.removeColumn('Patients', 'two_factor_enabled');
    await queryInterface.removeColumn('Patients', 'two_factor_secret');
    await queryInterface.removeColumn('Patients', 'two_factor_recovery_codes');
    await queryInterface.removeColumn('Patients', 'two_factor_backup_codes_used');
    await queryInterface.removeColumn('Patients', 'two_factor_last_used');

    // 3. Supprimer les champs 2FA de la table ProfessionnelsSante
    console.log('📝 Suppression des champs 2FA de la table ProfessionnelsSante...');
    await queryInterface.removeColumn('ProfessionnelsSante', 'two_factor_enabled');
    await queryInterface.removeColumn('ProfessionnelsSante', 'two_factor_secret');
    await queryInterface.removeColumn('ProfessionnelsSante', 'two_factor_recovery_codes');
    await queryInterface.removeColumn('ProfessionnelsSante', 'two_factor_backup_codes_used');
    await queryInterface.removeColumn('ProfessionnelsSante', 'two_factor_last_used');

    // 4. Supprimer les champs 2FA de la table Utilisateurs
    console.log('📝 Suppression des champs 2FA de la table Utilisateurs...');
    await queryInterface.removeColumn('Utilisateurs', 'two_factor_enabled');
    await queryInterface.removeColumn('Utilisateurs', 'two_factor_secret');
    await queryInterface.removeColumn('Utilisateurs', 'two_factor_recovery_codes');
    await queryInterface.removeColumn('Utilisateurs', 'two_factor_backup_codes_used');
    await queryInterface.removeColumn('Utilisateurs', 'two_factor_last_used');

    console.log('✅ Rollback 2FA terminé avec succès !');
  }
};
