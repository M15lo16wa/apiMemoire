'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Supprimer les anciennes tables
    await queryInterface.dropTable('AutorisationAcces');
    await queryInterface.dropTable('HistoriqueAccess');

    // Recréer la table AutorisationsAcces avec la structure correcte
    await queryInterface.createTable('AutorisationsAcces', {
      id_acces: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      type_acces: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      date_debut: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      date_fin: {
        type: Sequelize.DATE,
        allowNull: true
      },
      statut: {
        type: Sequelize.ENUM('actif', 'inactif', 'attente_validation', 'refuse', 'expire'),
        defaultValue: 'actif',
        allowNull: false
      },
      raison_demande: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      conditions_acces: {
        type: Sequelize.JSON,
        allowNull: true
      },
      date_validation: {
        type: Sequelize.DATE,
        allowNull: true
      },
      date_revocation: {
        type: Sequelize.DATE,
        allowNull: true
      },
      motif_revocation: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      notifications_envoyees: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      accorde_par: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      validateur_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      historique_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      patient_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Patients',
          key: 'id_patient'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      professionnel_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'ProfessionnelsSante',
          key: 'id_professionnel'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      autorisateur_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'ProfessionnelsSante',
          key: 'id_professionnel'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Recréer la table HistoriquesAccess avec la structure correcte
    await queryInterface.createTable('HistoriquesAccess', {
      id_historique: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      date_heure_acces: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      action: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      type_ressource: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      id_ressource: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      details: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      statut: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'SUCCES'
      },
      code_erreur: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      message_erreur: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      adresse_ip: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      device_id: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      id_utilisateur: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Utilisateurs',
          key: 'id_utilisateur'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      id_patient: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Patients',
          key: 'id_patient'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      id_dossier: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'DossiersMedicaux',
          key: 'id_dossier'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      id_service: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'ServicesSante',
          key: 'id_service'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      professionnel_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'ProfessionnelsSante',
          key: 'id_professionnel'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Utilisateurs',
          key: 'id_utilisateur'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },

  async down (queryInterface, Sequelize) {
    // Supprimer les nouvelles tables
    await queryInterface.dropTable('HistoriquesAccess');
    await queryInterface.dropTable('AutorisationsAcces');

    // Recréer les anciennes tables
    await queryInterface.createTable('AutorisationAcces', {
      id_autorisation: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      patient_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Patients',
          key: 'id_patient'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      professionnel_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ProfessionnelsSante',
          key: 'id_professionnel'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      date_demande: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      date_autorisation: {
        type: Sequelize.DATE,
        allowNull: true
      },
      date_expiration: {
        type: Sequelize.DATE,
        allowNull: true
      },
      statut: {
        type: Sequelize.ENUM('en_attente', 'accordee', 'refusee', 'expiree'),
        allowNull: false,
        defaultValue: 'en_attente'
      },
      motif_demande: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      motif_refus: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.createTable('HistoriqueAccess', {
      id_historique: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      date_acces: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      type_acces: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      details: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      ip_adresse: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  }
};
