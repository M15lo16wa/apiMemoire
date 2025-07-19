'use strict';

const DataTypes = require('sequelize/lib/data-types');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('AutorisationsAcces', {
      id_acces: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Identifiant unique de l\'autorisation d\'accès'
      },
      type_acces: { 
        type: DataTypes.ENUM('lecture', 'ecriture', 'administration'),
        allowNull: false,
        comment: 'Type d\'accès accordé',
        validate: {
          notEmpty: {
            msg: 'Le type d\'accès est obligatoire'
          },
          isIn: {
            args: [['lecture', 'ecriture', 'administration']],
            msg: 'Le type d\'accès doit être l\'un des suivants: lecture, ecriture, administration'
          }
        }
      },
      date_debut: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Date de début de validité de l\'autorisation',
        validate: {
          isDate: {
            msg: 'La date de début doit être une date valide'
          }
        }
      },
      date_fin: {
        type: DataTypes.DATE,
        allowNull: true, 
        comment: 'Date de fin de validité de l\'autorisation (null = pas de date d\'expiration)',
        validate: {
          isAfterStartDate(value) {
            if (value && value <= this.date_debut) {
              throw new Error('La date de fin doit être postérieure à la date de début');
            }
          }
        }
      },
      statut: { 
        type: DataTypes.ENUM('actif', 'inactif', 'attente_validation', 'refuse', 'expire'),
        defaultValue: 'attente_validation',
        allowNull: false,
        comment: 'Statut actuel de l\'autorisation',
        validate: {
          notEmpty: {
            msg: 'Le statut est obligatoire'
          },
          isIn: {
            args: [['actif', 'inactif', 'attente_validation', 'refuse', 'expire']],
            msg: 'Statut non valide'
          }
        }
      },
      raison_demande: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Raison de la demande d\'accès',
        validate: {
          len: {
            args: [0, 1000],
            msg: 'La raison ne peut pas dépasser 1000 caractères'
          }
        }
      },
      conditions_acces: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Conditions spécifiques d\'accès (horaires, restrictions, etc.)'
      },
      date_validation: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date de validation de la demande d\'accès'
      },
      date_revocation: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date de révocation de l\'autorisation si elle a été révoquée'
      },
      motif_revocation: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Raison de la révocation de l\'autorisation'
      },
      notifications_envoyees: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Indique si les notifications ont été envoyées pour cette autorisation'
      },
      utilisateur_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Utilisateurs',
          key: 'id_utilisateur',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Utilisateur qui reçoit l\'accès au dossier médical'
      },
      dossier_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'DossiersMedicaux',
          key: 'id_dossier',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Dossier médical auquel l\'accès est accordé'
      },
      accorde_par: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Utilisateurs',
          key: 'id_utilisateur',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Utilisateur qui a accordé l\'accès (généralement un administrateur ou le propriétaire du dossier)'
      },
      validateur_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Utilisateurs',
          key: 'id_utilisateur',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Utilisateur qui a validé la demande d\'accès'
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Utilisateurs',
          key: 'id_utilisateur',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Utilisateur ayant créé l\'autorisation d\'accès'
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Utilisateurs',
          key: 'id_utilisateur',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Dernier utilisateur ayant modifié l\'autorisation d\'accès'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Date de création de l\'autorisation d\'accès'
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Date de dernière mise à jour de l\'autorisation d\'accès'
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Date de suppression douce (soft delete) de l\'autorisation d\'accès'
      }
    });

    // Ajout d'un index composite pour éviter les doublons
    await queryInterface.addIndex('AutorisationsAcces', 
      ['utilisateur_id', 'dossier_id'], 
      {
        unique: true,
        name: 'unique_acces_utilisateur_dossier',
        where: {
          deletedAt: null
        }
      }
    );

    // Ajout d'index pour les recherches fréquentes
    await queryInterface.addIndex('AutorisationsAcces', ['statut']);
    await queryInterface.addIndex('AutorisationsAcces', ['type_acces']);
    await queryInterface.addIndex('AutorisationsAcces', ['date_debut']);
    await queryInterface.addIndex('AutorisationsAcces', ['date_fin']);
    await queryInterface.addIndex('AutorisationsAcces', ['dossier_id']);
    await queryInterface.addIndex('AutorisationsAcces', ['utilisateur_id']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('AutorisationsAcces');
  }
};
