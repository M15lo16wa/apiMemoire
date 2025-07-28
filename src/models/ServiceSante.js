// src/models/ServiceSante.js
'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ServiceSante = sequelize.define('ServiceSante', {
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
      validate: {
        notEmpty: { msg: 'Le code du service est obligatoire' },
        len: { args: [2, 20], msg: 'Le code doit contenir entre 2 et 20 caractères' },
        is: { args: /^[A-Z0-9_]+$/, msg: 'Le code ne doit contenir que des lettres majuscules, chiffres, tirets et tirets bas' }
      },
      comment: 'Code unique identifiant le service de santé (format: lettres majuscules, chiffres et tirets bas)'
    },
    nom: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Le nom du service est obligatoire' },
        len: { args: [2, 100], msg: 'Le nom doit contenir entre 2 et 100 caractères' }
      },
      comment: 'Nom complet du service de santé'
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
      validate: {
        notEmpty: { msg: 'Le type de service est obligatoire' }
      },
      comment: 'Type de service de santé pour le filtrage et la catégorisation'
    },
    telephone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: { args: /^[0-9+()\- ]+$/, msg: 'Numéro de téléphone invalide' },
        len: { args: [8, 20], msg: 'Le numéro de téléphone doit contenir entre 8 et 20 caractères' }
      },
      comment: 'Numéro de téléphone principal du service'
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      validate: {
        isEmail: { msg: 'Veuillez fournir une adresse email valide' }
      },
      comment: 'Adresse email de contact du service'
    },
    hopital_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Hopitaux',
        key: 'id_hopital'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      comment: 'Référence à l\'hôpital auquel ce service est rattaché'
    },
    statut: {
      type: DataTypes.ENUM('ACTIF', 'INACTIF', 'EN_MAINTENANCE', 'EN_CONSTRUCTION'),
      defaultValue: 'ACTIF',
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Le statut est obligatoire' }
      },
      comment: 'Statut d\'activité du service'
    },
    // capacite_accueil supprimé pour correspondre à la base
    horaires_ouverture: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'Horaires d\'ouverture du service (format libre)'
    },
  }, {
    tableName: 'ServicesSante',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['code']
      },
      {
        fields: ['type_service']
      },
      {
        fields: ['hopital_id']
      },
      {
        fields: ['statut']
      }
    ]
  });

  return ServiceSante;
};