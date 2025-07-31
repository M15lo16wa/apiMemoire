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
    date_heure: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Date et heure du rendez-vous'
    },
    date_heure_fin: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date et heure de fin du rendez-vous'
    },
    motif: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Motif de la consultation'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Description détaillée de la consultation'
    },
    statut: {
      type: DataTypes.ENUM('planifie', 'confirme', 'en_attente', 'en_cours', 'termine', 'annule', 'reporte'),
      defaultValue: 'planifie',
      allowNull: false,
      comment: 'Statut du rendez-vous'
    },
    type_rendezvous: {
      type: DataTypes.ENUM('consultation', 'controle', 'urgence', 'bilan', 'autre'),
      defaultValue: 'consultation',
      allowNull: false,
      comment: 'Type de rendez-vous'
    },
    duree: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
      comment: 'Durée prévue en minutes'
    },
    rappel_envoye: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Indique si un rappel a été envoyé'
    },
    date_rappel: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date à laquelle le rappel a été envoyé'
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID du patient concerné'
    },
    id_professionnel: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID du professionnel de santé assigné'
    },
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID du service concerné'
    },
    salle_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID de la salle affectée'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notes complémentaires sur le rendez-vous'
    },
    date_annulation: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date à laquelle le rendez-vous a été annulé'
    },
    motif_annulation: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Raison de l\'annulation du rendez-vous'
    },
  }, {
    tableName: 'RendezVous',
    timestamps: true,
  });

  return RendezVous;
}; 
