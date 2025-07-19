const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ExamenLabo = sequelize.define('ExamenLabo', {
    id_examen: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    typeExamen: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    dateExamen: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    resultat_labo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fichierResultatUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  }, {
    tableName: 'ExamensLabo',
    timestamps: true,
  });

  return ExamenLabo;
};