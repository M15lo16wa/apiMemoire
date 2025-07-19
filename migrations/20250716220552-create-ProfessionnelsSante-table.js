'use strict';

const DataTypes = require('sequelize/lib/data-types');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('ProfessionnelsSante', {
      id_professionnel: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Identifiant unique du professionnel de santé'
      },
      civilite: {
        type: DataTypes.ENUM('M.', 'Mme', 'Dr', 'Pr'),
        allowNull: true,
        comment: 'Civilité du professionnel de santé'
      },
      nom: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Nom de famille du professionnel',
        validate: {
          notEmpty: {
            msg: 'Le nom est obligatoire'
          },
          len: {
            args: [2, 100],
            msg: 'Le nom doit contenir entre 2 et 100 caractères'
          }
        }
      },
      prenom: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Prénom du professionnel',
        validate: {
          notEmpty: {
            msg: 'Le prénom est obligatoire'
          },
          len: {
            args: [2, 100],
            msg: 'Le prénom doit contenir entre 2 et 100 caractères'
          }
        }
      },
      date_naissance: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Date de naissance du professionnel',
        validate: {
          isDate: {
            msg: 'La date de naissance doit être une date valide'
          },
          isBefore: {
            args: new Date().toISOString().split('T')[0],
            msg: 'La date de naissance doit être dans le passé'
          }
        }
      },
      lieu_naissance: {
        type: DataTypes.STRING(150),
        allowNull: true,
        comment: 'Lieu de naissance du professionnel'
      },
      sexe: {
        type: DataTypes.ENUM('M', 'F', 'Autre', 'Non précisé'),
        defaultValue: 'Non précisé',
        allowNull: false,
        comment: 'Sexe du professionnel'
      },
      adresse: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Adresse postale du professionnel'
      },
      code_postal: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: 'Code postal du professionnel',
        validate: {
          is: {
            args: /^[0-9]{5}$/,
            msg: 'Le code postal doit contenir 5 chiffres'
          }
        }
      },
      ville: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Ville de résidence du professionnel'
      },
      pays: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: 'France',
        comment: 'Pays de résidence du professionnel'
      },
      telephone_fixe: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Numéro de téléphone fixe professionnel',
        validate: {
          is: {
            args: /^[0-9 +()\-]+$/,
            msg: 'Le numéro de téléphone fixe contient des caractères non autorisés'
          },
          len: {
            args: [8, 20],
            msg: 'Le numéro de téléphone doit contenir entre 8 et 20 caractères'
          }
        }
      },
      telephone_portable: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Numéro de téléphone portable professionnel',
        validate: {
          is: {
            args: /^[0-9 +()\-]+$/,
            msg: 'Le numéro de téléphone portable contient des caractères non autorisés'
          },
          len: {
            args: [8, 20],
            msg: 'Le numéro de téléphone doit contenir entre 8 et 20 caractères'
          }
        }
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
        comment: 'Adresse email professionnelle',
        validate: {
          isEmail: {
            msg: 'Veuillez fournir une adresse email valide'
          },
          notEmpty: {
            msg: 'L\'email est obligatoire'
          }
        }
      },
      email_secondaire: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Adresse email secondaire du professionnel',
        validate: {
          isEmail: {
            msg: 'Veuillez fournir une adresse email secondaire valide'
          }
        }
      },
      numero_pp: {
        type: DataTypes.STRING(11),
        allowNull: true,
        unique: true,
        comment: 'Numéro RPPS (Répertoire Partagé des Professionnels de Santé)',
        validate: {
          len: {
            args: [11, 11],
            msg: 'Le numéro RPPS doit contenir exactement 11 chiffres'
          },
          isNumeric: {
            msg: 'Le numéro RPPS ne doit contenir que des chiffres'
          }
        }
      },
      numero_adeli: {
        type: DataTypes.STRING(9),
        allowNull: true,
        unique: true,
        comment: 'Numéro ADELI (Automatisation DEs Listes)',
        validate: {
          len: {
            args: [9, 9],
            msg: 'Le numéro ADELI doit contenir exactement 9 chiffres'
          },
          isNumeric: {
            msg: 'Le numéro ADELI ne doit contenir que des chiffres'
          }
        }
      },
      numero_finess: {
        type: DataTypes.STRING(9),
        allowNull: true,
        comment: 'Numéro FINESS (Fichier National des Établissements Sanitaires et Sociaux)'
      },
      specialite_principale: {
        type: DataTypes.STRING(150),
        allowNull: true,
        comment: 'Spécialité principale du professionnel (ex: Cardiologie, Pédiatrie, etc.)'
      },
      specialites_secondaires: {
        type: DataTypes.ARRAY(DataTypes.STRING(150)),
        allowNull: true,
        comment: 'Spécialités secondaires du professionnel',
        defaultValue: []
      },
      diplomes: {
        type: DataTypes.ARRAY(DataTypes.STRING(255)),
        allowNull: true,
        comment: 'Liste des diplômes obtenus',
        defaultValue: []
      },
      formations: {
        type: DataTypes.ARRAY(DataTypes.STRING(255)),
        allowNull: true,
        comment: 'Formations complémentaires suivies',
        defaultValue: []
      },
      competences: {
        type: DataTypes.ARRAY(DataTypes.STRING(100)),
        allowNull: true,
        comment: 'Compétences spécifiques du professionnel',
        defaultValue: []
      },
      langues_parlees: {
        type: DataTypes.ARRAY(DataTypes.STRING(50)),
        allowNull: true,
        comment: 'Langues parlées par le professionnel',
        defaultValue: ['Français']
      },
      statut: {
        type: DataTypes.ENUM('actif', 'inactif', 'en_conges', 'retraite', 'suspendu'),
        defaultValue: 'actif',
        allowNull: false,
        comment: 'Statut professionnel actuel'
      },
      date_embauche: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Date d\'embauche dans l\'établissement'
      },
      date_depart: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Date de départ de l\'établissement',
        validate: {
          isAfterHireDate(value) {
            if (value && this.date_embauche && new Date(value) < new Date(this.date_embauche)) {
              throw new Error('La date de départ ne peut pas être antérieure à la date d\'embauche');
            }
          }
        }
      },
      type_contrat: {
        type: DataTypes.ENUM('cdi', 'cdd', 'interim', 'liberal', 'autre'),
        allowNull: true,
        comment: 'Type de contrat de travail'
      },
      temps_travail: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Temps de travail en pourcentage (ex: 100 pour un temps plein)',
        validate: {
          min: {
            args: [10],
            msg: 'Le temps de travail minimum est de 10%'
          },
          max: {
            args: [200],
            msg: 'Le temps de travail maximum est de 200%'
          }
        }
      },
      fonction: {
        type: DataTypes.ENUM(
          'medecin', 
          'chirurgien', 
          'infirmier', 
          'aide_soignant', 
          'kinesitherapeute',
          'pharmacien',
          'biologiste',
          'radiologue',
          'anesthesiste',
          'sage_femme',
          'psychologue',
          'orthophoniste',
          'dieteticien',
          'secretaire_medicale',
          'autre'
        ),
        allowNull: false,
        comment: 'Fonction principale du professionnel dans l\'établissement'
      },
      role: {
        type: DataTypes.ENUM(
          'medecin', 
          'infirmier', 
          'secretaire_medicale', 
          'technicien_labo',
          'pharmacien',
          'administratif',
          'responsable_service',
          'directeur_etablissement',
          'autre'
        ),
        allowNull: false,
        comment: 'Rôle du professionnel dans le système',
        defaultValue: 'medecin'
      },
      rpps: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Données du RPPS (si disponible)'
      },
      signature_electronique: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Signature électronique du professionnel (chiffrée)'
      },
      photo_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'URL de la photo professionnelle',
        validate: {
          isUrl: {
            msg: 'L\'URL de la photo n\'est pas valide'
          }
        }
      },
      cv_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'URL du CV du professionnel',
        validate: {
          isUrl: {
            msg: 'L\'URL du CV n\'est pas valide'
          }
        }
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Notes complémentaires sur le professionnel'
      },
      preferences: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Préférences utilisateur (thème, notifications, etc.)',
        defaultValue: {}
      },
      service_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'ServicesSante',
          key: 'id_service',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Service auquel est rattaché le professionnel'
      },
      hopital_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Hopitaux',
          key: 'id_hopital',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Établissement de santé principal du professionnel'
      },
      utilisateur_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: true,
        references: {
          model: 'Utilisateurs',
          key: 'id_utilisateur',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Compte utilisateur associé (si applicable)'
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
        comment: 'Utilisateur ayant créé l\'enregistrement'
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
        comment: 'Dernier utilisateur ayant modifié l\'enregistrement'
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
        comment: 'Date de suppression douce (soft delete) de l\'enregistrement'
      }
    });

    // Ajout des index pour les champs fréquemment utilisés dans les requêtes
    await queryInterface.addIndex('ProfessionnelsSante', ['nom', 'prenom']);
    await queryInterface.addIndex('ProfessionnelsSante', ['email']);
    await queryInterface.addIndex('ProfessionnelsSante', ['numero_pp'], { unique: true });
    await queryInterface.addIndex('ProfessionnelsSante', ['numero_adeli'], { unique: true });
    await queryInterface.addIndex('ProfessionnelsSante', ['fonction']);
    await queryInterface.addIndex('ProfessionnelsSante', ['role']);
    await queryInterface.addIndex('ProfessionnelsSante', ['service_id']);
    await queryInterface.addIndex('ProfessionnelsSante', ['hopital_id']);
    await queryInterface.addIndex('ProfessionnelsSante', ['utilisateur_id'], { unique: true });
    await queryInterface.addIndex('ProfessionnelsSante', ['statut']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('ProfessionnelsSante');
  }
};
