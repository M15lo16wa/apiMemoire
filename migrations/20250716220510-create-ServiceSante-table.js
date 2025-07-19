'use strict';

const DataTypes = require('sequelize/lib/data-types');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('ServicesSante', {
      id_service: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Identifiant unique du service de santé'
      },
      code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        comment: 'Code unique identifiant le service de santé',
        validate: {
          notEmpty: {
            msg: 'Le code du service est obligatoire'
          },
          len: {
            args: [2, 20],
            msg: 'Le code doit contenir entre 2 et 20 caractères'
          },
          is: {
            args: /^[A-Z0-9_-]+$/,
            msg: 'Le code ne doit contenir que des lettres majuscules, chiffres, tirets et tirets bas'
          }
        }
      },
      nom: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Nom complet du service de santé',
        validate: {
          notEmpty: {
            msg: 'Le nom du service est obligatoire'
          },
          len: {
            args: [3, 100],
            msg: 'Le nom doit contenir entre 3 et 100 caractères'
          }
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Description détaillée des activités et spécialités du service'
      },
      type_service: {
        type: DataTypes.ENUM(
          'MEDECINE_GENERALE',
          'PEDIATRIE',
          'CHIRURGIE',
          'URGENCES',
          'CARDIOLOGIE',
          'NEUROLOGIE',
          'ONCOLOGIE',
          'GYNECOLOGIE',
          'RADIOLOGIE',
          'BIOLOGIE',
          'PHARMACIE',
          'CONSULTATION',
          'HOSPITALISATION',
          'REEDUCATION',
          'SOINS_INTENSIFS',
          'BLOC_OPERATOIRE',
          'AUTRE'
        ),
        allowNull: false,
        defaultValue: 'MEDECINE_GENERALE',
        comment: 'Type de service de santé pour le filtrage et la catégorisation',
        validate: {
          notEmpty: {
            msg: 'Le type de service est obligatoire'
          }
        }
      },
      telephone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Numéro de téléphone principal du service',
        validate: {
          is: {
            args: /^[0-9 +()\-]+$/,
            msg: 'Numéro de téléphone invalide'
          }
        }
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Adresse email de contact du service',
        validate: {
          isEmail: {
            msg: 'Veuillez fournir une adresse email valide'
          }
        }
      },
      batiment: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Bâtiment où se situe le service'
      },
      etage: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Étage où se situe le service'
      },
      aile: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: 'Aile ou secteur du bâtiment'
      },
      capacite: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Capacité d\'accueil du service (nombre de lits ou de places)',
        validate: {
          min: {
            args: [0],
            msg: 'La capacité ne peut pas être négative'
          }
        }
      },
      hopital_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Hopitaux',
          key: 'id_hopital',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Référence à l\'hôpital auquel ce service est rattaché'
      },
      responsable_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID du professionnel de santé responsable (géré dans index.js)'
      },
      statut: {
        type: DataTypes.ENUM('ACTIF', 'INACTIF', 'EN_MAINTENANCE', 'EN_CONSTRUCTION'),
        defaultValue: 'ACTIF',
        allowNull: false,
        comment: 'Statut du service pour la gestion du cycle de vie',
        validate: {
          notEmpty: {
            msg: 'Le statut est obligatoire'
          }
        }
      },
      horaires_ouverture: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Horaires d\'ouverture du service (format JSON)',
        defaultValue: {}
      },
      informations_complementaires: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Informations complémentaires structurées',
        defaultValue: {}
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
        comment: 'Date de suppression douce de l\'enregistrement'
      }
    });

    // Ajout des index pour les champs fréquemment utilisés dans les requêtes
    await queryInterface.addIndex('ServicesSante', ['code'], { 
      name: 'idx_services_sante_code',
      unique: true 
    });
    
    await queryInterface.addIndex('ServicesSante', ['hopital_id'], {
      name: 'idx_services_sante_hopital'
    });
    
    await queryInterface.addIndex('ServicesSante', ['responsable_id'], {
      name: 'idx_services_sante_responsable'
    });
    
    await queryInterface.addIndex('ServicesSante', ['type_service'], {
      name: 'idx_services_sante_type'
    });
    
    await queryInterface.addIndex('ServicesSante', ['statut'], {
      name: 'idx_services_sante_statut'
    });
    
    // Index composite pour les recherches fréquentes
    await queryInterface.addIndex('ServicesSante', ['hopital_id', 'type_service', 'statut'], {
      name: 'idx_services_sante_composite'
    });
  },

  async down (queryInterface, Sequelize) {
    // Suppression des index personnalisés avant de supprimer la table
    await queryInterface.removeIndex('ServicesSante', 'idx_services_sante_code');
    await queryInterface.removeIndex('ServicesSante', 'idx_services_sante_hopital');
    await queryInterface.removeIndex('ServicesSante', 'idx_services_sante_responsable');
    await queryInterface.removeIndex('ServicesSante', 'idx_services_sante_type');
    await queryInterface.removeIndex('ServicesSante', 'idx_services_sante_statut');
    await queryInterface.removeIndex('ServicesSante', 'idx_services_sante_composite');
    
    // Suppression de la table
    await queryInterface.dropTable('ServicesSante');
  }
};