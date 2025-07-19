'use strict';

const DataTypes = require('sequelize/lib/data-types');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Prescriptions', {
      id_prescription: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Identifiant unique de la prescription'
      },
      date_prescription: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Date et heure de la prescription',
        validate: {
          isDate: {
            msg: 'La date de prescription doit être une date valide'
          }
        }
      },
      date_debut: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Date de début du traitement',
        validate: {
          isDate: {
            msg: 'La date de début doit être une date valide'
          },
          isAfterOrEqualPrescription(value) {
            if (value && this.date_prescription && new Date(value) < new Date(this.date_prescription).setHours(0, 0, 0, 0)) {
              throw new Error('La date de début ne peut pas être antérieure à la date de prescription');
            }
          }
        }
      },
      date_fin: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Date de fin prévue du traitement',
        validate: {
          isDate: {
            msg: 'La date de fin doit être une date valide'
          },
          isAfterStart(value) {
            if (value && this.date_debut && new Date(value) < new Date(this.date_debut)) {
              throw new Error('La date de fin doit être postérieure à la date de début');
            }
          }
        }
      },
      medicament: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Dénomination commune internationale (DCI) du médicament',
        validate: {
          notEmpty: {
            msg: 'Le nom du médicament est obligatoire'
          },
          len: {
            args: [2, 255],
            msg: 'Le nom du médicament doit contenir entre 2 et 255 caractères'
          }
        }
      },
      nom_commercial: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Nom commercial du médicament (marque)'
      },
      code_cip: {
        type: DataTypes.STRING(13),
        allowNull: true,
        comment: 'Code CIP (Code Identifiant de Présentation) du médicament',
        validate: {
          len: {
            args: [7, 13],
            msg: 'Le code CIP doit contenir entre 7 et 13 chiffres'
          },
          isNumeric: {
            msg: 'Le code CIP ne doit contenir que des chiffres'
          }
        }
      },
      atc: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: 'Code ATC (Classification Anatomique, Thérapeutique et Chimique)'
      },
      dosage: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Dosage du médicament (ex: 500mg, 10mg/mL)',
        validate: {
          notEmpty: {
            msg: 'Le dosage est obligatoire'
          },
          len: {
            args: [1, 100],
            msg: 'Le dosage ne doit pas dépasser 100 caractères'
          }
        }
      },
      forme_pharmaceutique: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Forme galénique (comprimé, gélule, solution, etc.)'
      },
      quantite: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Quantité prescrite',
        validate: {
          min: {
            args: [1],
            msg: 'La quantité doit être supérieure à 0'
          },
          max: {
            args: [1000],
            msg: 'La quantité ne peut pas dépasser 1000'
          }
        }
      },
      unite: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Unité de la quantité (boîte, flacon, etc.)',
        defaultValue: 'boîte'
      },
      posologie: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Posologie détaillée (ex: 1 comprimé matin et soir)'
      },
      frequence: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Fréquence de prise (ex: 3 fois par jour)',
        validate: {
          notEmpty: {
            msg: 'La fréquence est obligatoire'
          },
          len: {
            args: [1, 100],
            msg: 'La fréquence ne doit pas dépasser 100 caractères'
          }
        }
      },
      duree: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Durée du traitement (ex: 7 jours, 1 mois)'
      },
      voie_administration: {
        type: DataTypes.ENUM('orale', 'cutanée', 'nasale', 'oculaire', 'auriculaire', 'vaginale', 'rectale', 'inhalée', 'injection', 'autre'),
        allowNull: true,
        comment: 'Voie d\'administration du médicament'
      },
      instructions: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Instructions particulières (à jeun, pendant le repas, etc.)'
      },
      contre_indications: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Contre-indications notables pour ce patient'
      },
      effets_indesirables: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Effets indésirables potentiels à surveiller'
      },
      statut: {
        type: DataTypes.ENUM('active', 'suspendue', 'terminee', 'annulee', 'en_attente'),
        defaultValue: 'active',
        allowNull: false,
        comment: 'Statut actuel de la prescription',
        validate: {
          notEmpty: {
            msg: 'Le statut est obligatoire'
          },
          isIn: {
            args: [['active', 'suspendue', 'terminee', 'annulee', 'en_attente']],
            msg: 'Statut de prescription non valide'
          }
        }
      },
      renouvelable: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'La prescription est-elle renouvelable ?'
      },
      nb_renouvellements: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Nombre de renouvellements autorisés',
        validate: {
          min: {
            args: [0],
            msg: 'Le nombre de renouvellements ne peut pas être négatif'
          },
          max: {
            args: [12],
            msg: 'Le nombre maximum de renouvellements est de 12'
          }
        }
      },
      renouvellements_effectues: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Nombre de renouvellements déjà effectués',
        validate: {
          min: {
            args: [0],
            msg: 'Le nombre de renouvellements effectués ne peut pas être négatif'
          },
          max: {
            args: [12],
            msg: 'Le nombre maximum de renouvellements est de 12'
          },
          lessThanOrEqualNbRenouvellements(value) {
            if (value > this.nb_renouvellements) {
              throw new Error('Le nombre de renouvellements effectués ne peut pas dépasser le nombre autorisé');
            }
          }
        }
      },
      date_dernier_renouvellement: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date du dernier renouvellement effectué'
      },
      date_arret: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Date effective d\'arrêt du traitement si différent de date_fin'
      },
      motif_arret: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Raison de l\'arrêt prématuré du traitement'
      },
      patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID du patient destinataire (géré dans index.js)'
      },
      professionnel_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID du médecin prescripteur (géré dans index.js)'
      },
      dossier_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID du dossier médical associé (géré dans index.js)'
      },
      consultation_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID de la consultation ayant donné lieu à cette prescription (géré dans index.js)'
      },
      service_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID du service prescripteur (géré dans index.js)'
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID de l\'utilisateur ayant créé la prescription (géré dans index.js)'
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID du dernier utilisateur ayant modifié la prescription (géré dans index.js)'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Date de création de la prescription'
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Date de dernière mise à jour de la prescription'
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Date de suppression douce (soft delete) de la prescription'
      }
    });

    // Ajout des index pour les champs fréquemment utilisés dans les requêtes
    await queryInterface.addIndex('Prescriptions', ['patient_id']);
    await queryInterface.addIndex('Prescriptions', ['professionnel_id']);
    await queryInterface.addIndex('Prescriptions', ['dossier_id']);
    await queryInterface.addIndex('Prescriptions', ['consultation_id']);
    await queryInterface.addIndex('Prescriptions', ['service_id']);
    await queryInterface.addIndex('Prescriptions', ['statut']);
    await queryInterface.addIndex('Prescriptions', ['date_prescription']);
    await queryInterface.addIndex('Prescriptions', ['date_debut']);
    await queryInterface.addIndex('Prescriptions', ['date_fin']);
    await queryInterface.addIndex('Prescriptions', ['medicament']);
    await queryInterface.addIndex('Prescriptions', ['code_cip']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Prescriptions');
  }
};
