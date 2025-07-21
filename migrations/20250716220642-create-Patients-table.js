'use strict';

const DataTypes = require('sequelize/lib/data-types');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Patients', {
      id_patient: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Identifiant unique du patient dans le système',
        validate: {
          isInt: {
            msg: 'L\'identifiant du patient doit être un nombre entier'
          }
        }
      },
      numero_dossier: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: {
          name: 'unique_patient_dossier',
          msg: 'Ce numéro de dossier est déjà utilisé par un autre patient'
        },
        comment: 'Numéro unique du dossier patient. Format recommandé: [ETABLISSEMENT]-[ANNEE]-[NUMERO] (ex: HOP-2023-0001)',
        validate: {
          notEmpty: {
            msg: 'Le numéro de dossier est obligatoire'
          },
          len: {
            args: [3, 50],
            msg: 'Le numéro de dossier doit contenir entre 3 et 50 caractères'
          },
          isAlphanumericWithDashes(value) {
            if (!/^[a-zA-Z0-9-]+$/.test(value)) {
              throw new Error('Le numéro de dossier ne peut contenir que des lettres, chiffres et tirets');
            }
          }
        },
        set(value) {
          if (typeof value === 'string') {
            // Supprime les espaces et met en majuscules
            this.setDataValue('numero_dossier', value.trim().toUpperCase());
          }
        }
      },
      nom: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Nom de famille du patient',
        validate: {
          notEmpty: {
            msg: 'Le nom est obligatoire'
          },
          len: {
            args: [2, 100],
            msg: 'Le nom doit contenir entre 2 et 100 caractères'
          },
          is: {
            args: /^[\p{L}\s'-]+$/u,
            msg: 'Le nom contient des caractères non autorisés'
          }
        },
        set(value) {
          if (typeof value === 'string') {
            this.setDataValue('nom', value.trim().toUpperCase());
          }
        }
      },
      prenom: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Prénom(s) du patient',
        validate: {
          notEmpty: {
            msg: 'Le prénom est obligatoire'
          },
          len: {
            args: [2, 100],
            msg: 'Le prénom doit contenir entre 2 et 100 caractères'
          },
          is: {
            args: /^[\p{L}\s'-]+$/u,
            msg: 'Le prénom contient des caractères non autorisés'
          }
        },
        set(value) {
          if (typeof value === 'string') {
            // Met en majuscule la première lettre de chaque mot
            this.setDataValue('prenom', value.trim().toLowerCase()
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' '));
          }
        }
      },
      date_naissance: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Date de naissance du patient (format: AAAA-MM-JJ)',
        validate: {
          notEmpty: {
            msg: 'La date de naissance est obligatoire'
          },
          isDate: {
            msg: 'La date de naissance doit être une date valide (format: AAAA-MM-JJ)'
          },
          isBefore: {
            args: new Date().toISOString(),
            msg: 'La date de naissance doit être dans le passé'
          },
          isAfter: {
            args: '1900-01-01',
            msg: 'La date de naissance doit être postérieure au 01/01/1900'
          }
        }
      },
      lieu_naissance: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Lieu de naissance du patient',
        validate: {
          len: {
            args: [0, 255],
            msg: 'Le lieu de naissance ne peut pas dépasser 255 caractères'
          }
        },
        set(value) {
          if (typeof value === 'string') {
            // Met en majuscule la première lettre de chaque mot
            this.setDataValue('lieu_naissance', value.trim().toLowerCase()
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' '));
          }
        }
      },
      sexe: {
        type: DataTypes.ENUM('M', 'F', 'X', 'I'),
        allowNull: false,
        comment: 'Sexe du patient (M: Masculin, F: Féminin, X: Non binaire, I: Intersexe)',
        validate: {
          notEmpty: {
            msg: 'Le sexe est obligatoire'
          },
          isIn: {
            args: [['M', 'F', 'X', 'I']],
            msg: 'Le sexe doit être M, F, X ou I'
          }
        }
      },
      civilite: {
        type: DataTypes.ENUM('M.', 'Mme', 'Mlle', 'Dr', 'Pr'),
        allowNull: true,
        comment: 'Civilité du patient',
        validate: {
          isIn: {
            args: [['M.', 'Mme', 'Mlle', 'Dr', 'Pr', null]],
            msg: 'Civilité non valide'
          }
        }
      },
      numero_secu: {
        type: DataTypes.STRING(15),
        allowNull: true,
        unique: true,
        comment: 'Numéro de sécurité sociale (format: 1 23 45 67 890 123 45)',
        validate: {
          isValidSecuNumber(value) {
            if (value && !/^[12][0-9]{2}(0[1-9]|1[0-2])(2[AB]|[0-9]{2})[0-9]{3}[0-9]{3}[0-9]{2}$/.test(value.replace(/\s/g, ''))) {
              throw new Error('Format de numéro de sécurité sociale invalide');
            }
          }
        },
        set(value) {
          if (value) {
            // Supprime les espaces et met en majuscule pour le stockage
            this.setDataValue('numero_secu', value.replace(/\s/g, '').toUpperCase());
          }
        }
      },
      adresse: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Adresse postale complète',
        validate: {
          len: {
            args: [0, 255],
            msg: 'L\'adresse ne peut pas dépasser 255 caractères'
          }
        }
      },
      complement_adresse: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Complément d\'adresse (appartement, étage, etc.)',
        validate: {
          len: {
            args: [0, 100],
            msg: 'Le complément d\'adresse ne peut pas dépasser 100 caractères'
          }
        }
      },
      code_postal: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: 'Code postal de la commune de résidence',
        validate: {
          is: {
            args: /^[0-9]{5}$/,
            msg: 'Le code postal doit contenir 5 chiffres sans espace'
          }
        },
        set(value) {
          if (value) {
            // Supprime les espaces et met en majuscule
            this.setDataValue('code_postal', value.toString().replace(/\s+/g, '').trim());
          }
        }
      },
      ville: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Ville de résidence',
        validate: {
          len: {
            args: [0, 100],
            msg: 'Le nom de la ville ne peut pas dépasser 100 caractères'
          },
          is: {
            args: /^[\p{L}\s-]+$/u,
            msg: 'Le nom de la ville contient des caractères non autorisés'
          }
        },
        set(value) {
          if (typeof value === 'string') {
            // Met en majuscule la première lettre de chaque mot
            this.setDataValue('ville', value.trim().toLowerCase()
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' '));
          }
        }
      },
      pays: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: 'France',
        comment: 'Pays de résidence',
        validate: {
          notEmpty: {
            msg: 'Le pays est obligatoire'
          },
          len: {
            args: [2, 100],
            msg: 'Le nom du pays doit contenir entre 2 et 100 caractères'
          }
        },
        set(value) {
          if (typeof value === 'string') {
            // Met en majuscule la première lettre de chaque mot
            this.setDataValue('pays', value.trim().toLowerCase()
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' '));
          }
        }
      },
      telephone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Numéro de téléphone principal',
        validate: {
          is: {
            args: /^[0-9+()\- .]+$/,
            msg: 'Format de numéro de téléphone invalide'
          },
          len: {
            args: [8, 20],
            msg: 'Le numéro de téléphone doit contenir entre 8 et 20 caractères'
          }
        },
        set(value) {
          if (value) {
            // Supprime les espaces et les caractères spéciaux pour le stockage
            this.setDataValue('telephone', value.replace(/[^0-9+]/g, ''));
          }
        }
      },
      telephone_secondaire: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Numéro de téléphone secondaire',
        validate: {
          is: {
            args: /^[0-9+()\- .]+$/,
            msg: 'Format de numéro de téléphone secondaire invalide'
          },
          len: {
            args: [8, 20],
            msg: 'Le numéro de téléphone secondaire doit contenir entre 8 et 20 caractères'
          }
        },
        set(value) {
          if (value) {
            // Supprime les espaces et les caractères spéciaux pour le stockage
            this.setDataValue('telephone_secondaire', value.replace(/[^0-9+]/g, ''));
          }
        }
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
        comment: 'Adresse email de contact',
        validate: {
          isEmail: {
            msg: 'Format d\'email invalide'
          },
          len: {
            args: [0, 100],
            msg: 'L\'email ne peut pas dépasser 100 caractères'
          },
          isLowercase: {
            msg: 'L\'email doit être en minuscules'
          }
        },
        set(value) {
          if (value) {
            this.setDataValue('email', value.trim().toLowerCase());
          }
        }
      },
      mot_de_passe: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Mot de passe hashé pour l\'authentification du patient',
        validate: {
          notEmpty: {
            msg: 'Le mot de passe est obligatoire'
          },
          len: {
            args: [8, 255],
            msg: 'Le mot de passe doit contenir au moins 8 caractères'
          }
        }
      },
      profession: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Profession actuelle du patient'
      },
      groupe_sanguin: {
        type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Inconnu'),
        allowNull: false,
        comment: 'Groupe sanguin du patient',
        defaultValue: 'Inconnu',
        validate: {
          notEmpty: {
            msg: 'Le groupe sanguin est obligatoire (même si inconnu)'
          },
          isIn: {
            args: [['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Inconnu']],
            msg: 'Groupe sanguin non valide'
          }
        }
      },
      poids: {
        type: DataTypes.DECIMAL(5, 2), // Permet des poids jusqu'à 999.99 kg avec 2 décimales
        allowNull: true,
        comment: 'Poids du patient en kg',
        validate: {
          isDecimal: {
            msg: 'Le poids doit être un nombre décimal valide'
          },
          min: {
            args: [0.5],
            msg: 'Le poids doit être supérieur à 0.5 kg'
          },
          max: {
            args: [650],
            msg: 'Le poids doit être inférieur à 650 kg'
          },
          isPositive(value) {
            if (value !== null && value <= 0) {
              throw new Error('Le poids doit être un nombre positif');
            }
          }
        },
        get() {
          const rawValue = this.getDataValue('poids');
          return rawValue ? parseFloat(rawValue) : null;
        }
      },
      taille: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Taille du patient en cm',
        validate: {
          isInt: {
            msg: 'La taille doit être un nombre entier de centimètres'
          },
          min: {
            args: [20],
            msg: 'La taille doit être supérieure à 20 cm'
          },
          max: {
            args: [272],
            msg: 'La taille doit être inférieure à 272 cm (taille la plus grande enregistrée)'
          }
        },
        get() {
          const rawValue = this.getDataValue('taille');
          return rawValue ? parseInt(rawValue, 10) : null;
        }
      },
      photo: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'URL ou chemin vers la photo du patient'
      },
      assure: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Le patient est-il assuré ?'
      },
      nom_assurance: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Nom de la société d\'assurance'
      },
      numero_assure: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Numéro d\'assuré social ou de mutuelle'
      },
      date_premiere_consultation: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Date de première consultation dans l\'établissement',
        validate: {
          isDate: {
            msg: 'La date de première consultation doit être une date valide (format: AAAA-MM-JJ)'
          },
          isBeforeNow(value) {
            if (value && new Date(value) > new Date()) {
              throw new Error('La date de première consultation ne peut pas être dans le futur');
            }
          },
          isAfter1900(value) {
            if (value && new Date(value) < new Date('1900-01-01')) {
              throw new Error('La date de première consultation doit être postérieure au 01/01/1900');
            }
          },
          isBeforeLastConsultation(value) {
            const lastConsultation = this.getDataValue('date_derniere_consultation');
            if (value && lastConsultation && new Date(value) > new Date(lastConsultation)) {
              throw new Error('La date de première consultation doit être antérieure ou égale à la date de dernière consultation');
            }
          }
        },
        set(value) {
          if (value) {
            // S'assure que la date est bien au format YYYY-MM-DD
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              this.setDataValue('date_premiere_consultation', date.toISOString().split('T')[0]);
            }
          }
        }
      },
      date_derniere_consultation: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Date de dernière consultation dans l\'établissement',
        validate: {
          isDate: {
            msg: 'La date de dernière consultation doit être une date valide (format: AAAA-MM-JJ)'
          },
          isBeforeNow(value) {
            if (value && new Date(value) > new Date()) {
              throw new Error('La date de dernière consultation ne peut pas être dans le futur');
            }
          },
          isAfterFirstConsultation(value) {
            const firstConsultation = this.getDataValue('date_premiere_consultation');
            if (value && firstConsultation && new Date(value) < new Date(firstConsultation)) {
              throw new Error('La date de dernière consultation doit être postérieure ou égale à la date de première consultation');
            }
          },
          isAfter1900(value) {
            if (value && new Date(value) < new Date('1900-01-01')) {
              throw new Error('La date de dernière consultation doit être postérieure au 01/01/1900');
            }
          }
        },
        set(value) {
          if (value) {
            // S'assure que la date est bien au format YYYY-MM-DD
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              this.setDataValue('date_derniere_consultation', date.toISOString().split('T')[0]);
              // Met à jour la date de première consultation si elle n'est pas encore définie
              if (!this.getDataValue('date_premiere_consultation')) {
                this.setDataValue('date_premiere_consultation', date.toISOString().split('T')[0]);
              }
            }
          }
        }
      },
      personne_contact: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Nom de la personne à contacter en cas d\'urgence'
      },
      telephone_urgence: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Numéro de téléphone en cas d\'urgence'
      },
      lien_parente: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Lien de parenté avec la personne à contacter'
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Notes et informations complémentaires sur le patient'
      },
      statut: {
        type: DataTypes.ENUM('actif', 'inactif', 'décédé'),
        allowNull: false,
        defaultValue: 'actif',
        comment: 'Statut actuel du patient dans le système'
      },
      date_deces: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Date de décès du patient si applicable'
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Utilisateurs',
          key: 'id_utilisateur'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Utilisateur ayant créé la fiche patient'
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Utilisateurs',
          key: 'id_utilisateur'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Dernier utilisateur ayant modifié la fiche patient'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Date de création de la fiche patient'
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Date de dernière mise à jour de la fiche patient'
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Date de suppression douce (soft delete) de la fiche patient'
      }
    });

    // Ajout des index pour les champs fréquemment utilisés dans les requêtes
    await queryInterface.addIndex('Patients', ['nom', 'prenom']);
    await queryInterface.addIndex('Patients', ['date_naissance']);
    await queryInterface.addIndex('Patients', ['numero_secu'], { unique: true });
    await queryInterface.addIndex('Patients', ['email'], { unique: true });
    await queryInterface.addIndex('Patients', ['mot_de_passe']);
    await queryInterface.addIndex('Patients', ['telephone']);
    await queryInterface.addIndex('Patients', ['statut']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Patients');
  }
};
