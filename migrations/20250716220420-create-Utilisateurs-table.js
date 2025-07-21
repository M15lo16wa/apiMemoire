'use strict';

const DataTypes = require('sequelize/lib/data-types');
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Utilisateurs', {
      id_utilisateur: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nom: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 50]
        }
      },
      prenom: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 50]
        }
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          notEmpty: true
        }
      },
      mot_de_passe: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [8, 255]
        },
        set(value) {
          const salt = bcrypt.genSaltSync(10);
          this.setDataValue('mot_de_passe', bcrypt.hashSync(value, salt));
        }
      },
      role: {
        type: DataTypes.ENUM(
          'admin',  
          'secretaire'
        ),
        defaultValue: 'secretaire',
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      statut: {
        type: DataTypes.ENUM('actif', 'inactif', 'en_attente_validation', 'suspendu'),
        defaultValue: 'en_attente_validation',
        allowNull: false
      },
      date_derniere_connexion: {
        type: DataTypes.DATE,
        allowNull: true
      },
      avatar_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
          isUrl: true
        }
      },
      reset_password_token: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      reset_password_expires: {
        type: DataTypes.DATE,
        allowNull: true
      },
      last_ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true
      },
      preferences: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    });

    // Ajout d'index pour améliorer les performances
    await queryInterface.addIndex('Utilisateurs', ['email'], { unique: true });
    await queryInterface.addIndex('Utilisateurs', ['role']);
    await queryInterface.addIndex('Utilisateurs', ['statut']);
    await queryInterface.addIndex('Utilisateurs', ['nom', 'prenom']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Utilisateurs');
  }
};