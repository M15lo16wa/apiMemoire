'use strict';

const DataTypes = require('sequelize/lib/data-types');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('RendezVous', {
      id_rendezvous: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Identifiant unique du rendez-vous'
      },
      date_heure: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Date et heure prévues du rendez-vous',
        validate: {
          isDate: {
            msg: 'La date et heure doivent être une valeur valide'
          },
          isAfter: {
            args: new Date().toISOString(),
            msg: 'La date du rendez-vous doit être dans le futur'
          }
        }
      },
      date_heure_fin: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date et heure de fin prévue du rendez-vous',
        validate: {
          isDate: {
            msg: 'La date et heure de fin doivent être une valeur valide'
          },
          isAfter: {
            args: [Sequelize.col('date_heure')],
            msg: 'La date de fin doit être postérieure à la date de début'
          }
        }
      },
      motif: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Motif de la consultation',
        validate: {
          notEmpty: {
            msg: 'Le motif de la consultation est obligatoire'
          },
          len: {
            args: [5, 255],
            msg: 'Le motif doit contenir entre 5 et 255 caractères'
          }
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Description détaillée des symptômes ou de la raison de la visite'
      },
      statut: {
        type: DataTypes.ENUM('planifie', 'confirme', 'en_attente', 'en_cours', 'termine', 'annule', 'reporte'),
        defaultValue: 'planifie',
        allowNull: false,
        comment: 'Statut actuel du rendez-vous'
      },
      type_rendezvous: {
        type: DataTypes.ENUM('consultation', 'controle', 'urgence', 'bilan', 'autre'),
        allowNull: false,
        defaultValue: 'consultation',
        comment: 'Type de rendez-vous'
      },
      duree: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30,
        comment: 'Durée prévue en minutes',
        validate: {
          min: {
            args: [5],
            msg: 'La durée minimale est de 5 minutes'
          },
          max: {
            args: [240],
            msg: 'La durée maximale est de 4 heures (240 minutes)'
          }
        }
      },
      rappel_envoye: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Indique si un rappel a été envoyé pour ce rendez-vous'
      },
      date_rappel: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date à laquelle le rappel a été envoyé'
      },
      patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID du patient concerné (géré dans index.js)'
      },
      professionnel_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID du professionnel de santé assigné (géré dans index.js)'
      },
      service_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID du service concerné (géré dans index.js)'
      },
      salle_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID de la salle affectée (géré dans index.js)'
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID de l\'utilisateur ayant créé le rendez-vous (géré dans index.js)'
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID du dernier utilisateur ayant modifié le rendez-vous (géré dans index.js)'
      },
      date_annulation: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date à laquelle le rendez-vous a été annulé'
      },
      motif_annulation: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Raison de l\'annulation du rendez-vous'
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Notes complémentaires sur le rendez-vous'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Date de création de la fiche rendez-vous'
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Date de dernière mise à jour de la fiche rendez-vous'
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Date de suppression douce (soft delete) du rendez-vous'
      }
    });

    // Ajout des index pour les champs fréquemment utilisés dans les requêtes
    await queryInterface.addIndex('RendezVous', ['date_heure']);
    await queryInterface.addIndex('RendezVous', ['patient_id']);
    await queryInterface.addIndex('RendezVous', ['professionnel_id']);
    await queryInterface.addIndex('RendezVous', ['service_id']);
    await queryInterface.addIndex('RendezVous', ['salle_id']);
    await queryInterface.addIndex('RendezVous', ['statut']);
    await queryInterface.addIndex('RendezVous', ['type_rendezvous']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('RendezVous');
  }
};
