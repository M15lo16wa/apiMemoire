// src/models/Hopital.js

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Hopital = sequelize.define('Hopital', {
    id_hopital: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    nom: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },
    adresse: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    telephone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    // Le diagramme mentionne 'method(type)' - si c'est un attribut, il peut être ici
    type_etablissement: { // Ex: 'Public', 'Privé', 'Spécialisé'
      type: DataTypes.ENUM('Public', 'Privé', 'Spécialisé'),
      allowNull: true,
    },
  }, {
    tableName: 'Hopitaux',
    timestamps: true,
  });

  return Hopital;
};