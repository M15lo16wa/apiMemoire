'use strict';

const DataTypes = require('sequelize/lib/data-types');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('ExamensLabo', {
      id_examen: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Identifiant unique de l\'examen de laboratoire'
      },
      code_examen: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Code unique de l\'examen (ex: HEMO, BIO, IONO, etc.)',
        validate: {
          notEmpty: {
            msg: 'Le code de l\'examen est obligatoire'
          },
          len: {
            args: [2, 50],
            msg: 'Le code doit contenir entre 2 et 50 caractères'
          }
        }
      },
      libelle: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Libellé complet de l\'examen',
        validate: {
          notEmpty: {
            msg: 'Le libellé de l\'examen est obligatoire'
          },
          len: {
            args: [5, 255],
            msg: 'Le libellé doit contenir entre 5 et 255 caractères'
          }
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Description détaillée de l\'examen et des conditions de prélèvement'
      },
      type_examen: {
        type: DataTypes.ENUM(
          'biologie', 
          'hématologie', 
          'bactériologie', 
          'anatomopathologie',
          'génétique',
          'immunologie',
          'biochimie',
          'toxicologie',
          'autre'
        ),
        allowNull: false,
        comment: 'Type d\'examen de laboratoire',
        validate: {
          notEmpty: {
            msg: 'Le type d\'examen est obligatoire'
          }
        }
      },
      date_prescription: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Date de prescription de l\'examen',
        validate: {
          isDate: {
            msg: 'La date de prescription doit être une date valide'
          }
        }
      },
      date_prelevement: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date et heure du prélèvement',
        validate: {
          isDate: {
            msg: 'La date de prélèvement doit être une date valide'
          },
          isAfterPrescription(value) {
            if (value && this.date_prescription && value < this.date_prescription) {
              throw new Error('La date de prélèvement ne peut pas être antérieure à la date de prescription');
            }
          }
        }
      },
      date_reception: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date de réception de l\'échantillon au laboratoire'
      },
      date_realisation: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date de réalisation de l\'examen en laboratoire'
      },
      date_validation: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date de validation des résultats par le biologiste'
      },
      statut: {
        type: DataTypes.ENUM('prescrit', 'en_attente', 'en_cours', 'termine', 'valide', 'annule', 'erreur'),
        defaultValue: 'prescrit',
        allowNull: false,
        comment: 'Statut actuel de l\'examen',
        validate: {
          notEmpty: {
            msg: 'Le statut est obligatoire'
          }
        }
      },
      priorite: {
        type: DataTypes.ENUM('urgent', 'normal', 'differe'),
        defaultValue: 'normal',
        allowNull: false,
        comment: 'Niveau de priorité de l\'examen'
      },
      resultat: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Résultats de l\'examen au format structuré (valeurs numériques, textuelles, etc.)'
      },
      resultat_texte: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Résultats de l\'examen en texte brut ou formaté'
      },
      interpretation: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Interprétation des résultats par le biologiste ou le médecin'
      },
      observations: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observations complémentaires sur le prélèvement ou l\'analyse'
      },
      fichiers_resultats: {
        type: DataTypes.ARRAY(DataTypes.STRING(500)),
        allowNull: true,
        comment: 'Tableau d\'URLs vers les fichiers de résultats (PDF, images, etc.)',
        defaultValue: []
      },
      code_nomenclature: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Code de nomenclature (NGAP, CCAM, etc.) pour la facturation'
      },
      code_loinc: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Code LOINC standard pour l\'examen de laboratoire'
      },
      patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID du patient concerné par l\'examen (géré dans index.js)'
      },
      prescripteur_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID du médecin prescripteur de l\'examen (géré dans index.js)'
      },
      validateur_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID du biologiste ou professionnel ayant validé les résultats (géré dans index.js)'
      },
      dossier_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID du dossier médical associé à cet examen (géré dans index.js)'
      },
      consultation_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID de la consultation ayant motivé la prescription de cet examen (géré dans index.js)'
      },
      service_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID du service demandeur de l\'examen (géré dans index.js)'
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID de l\'utilisateur ayant enregistré l\'examen (géré dans index.js)'
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID du dernier utilisateur ayant modifié l\'examen (géré dans index.js)'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Date de création de la fiche examen'
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Date de dernière mise à jour de la fiche examen'
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Date de suppression douce (soft delete) de la fiche examen'
      }
    });

    // Ajout des index pour les champs fréquemment utilisés dans les requêtes
    await queryInterface.addIndex('ExamensLabo', ['code_examen'], { unique: true });
    await queryInterface.addIndex('ExamensLabo', ['patient_id']);
    await queryInterface.addIndex('ExamensLabo', ['prescripteur_id']);
    await queryInterface.addIndex('ExamensLabo', ['dossier_id']);
    await queryInterface.addIndex('ExamensLabo', ['consultation_id']);
    await queryInterface.addIndex('ExamensLabo', ['service_id']);
    await queryInterface.addIndex('ExamensLabo', ['statut']);
    await queryInterface.addIndex('ExamensLabo', ['date_prescription']);
    await queryInterface.addIndex('ExamensLabo', ['date_prelevement']);
    await queryInterface.addIndex('ExamensLabo', ['date_validation']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('ExamensLabo');
  }
};
