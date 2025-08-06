const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RendezVous = sequelize.define('RendezVous', {
    id_rendezvous: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: 'Identifiant unique du rendez-vous'
    },
    DateHeure: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Date et heure du rendez-vous'
    },
    motif_consultation: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Motif de la consultation'
    },
    statut: {
      type: DataTypes.ENUM('planifie', 'confirme', 'en_attente', 'en_cours', 'termine', 'annule', 'reporte'),
      defaultValue: 'planifie',
      allowNull: false,
      comment: 'Statut du rendez-vous'
    },
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID du service concerné'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notes complémentaires sur le rendez-vous'
    },
    nom: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Nom du patient'
    },
    prenom: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Prénom du patient'
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Email du patient'
    },
    dateNaissance: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Date de naissance du patient'
    },
    sexe: {
      type: DataTypes.ENUM('M', 'F'),
      allowNull: false,
      comment: 'Sexe du patient'
    },
    telephone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Téléphone du patient'
    },
    id_hopital: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID de l\'hôpital'
    },
    id_service: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID du service'
    },
    id_professionnel: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID du professionnel de santé assigné'
    },
    numero_assure: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Numéro d\'assuré'
    },
    assureur: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Nom de l\'assureur'
    },
    professionnel_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID du professionnel (alias)'
    }
  }, {
    tableName: 'RendezVous',
    timestamps: true,
  });

  return RendezVous;
}; 
