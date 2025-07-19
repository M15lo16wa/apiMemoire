// src/models/DossierMedical.js

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DossierMedical = sequelize.define('DossierMedical', {
    id_dossier: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: 'Identifiant unique du dossier médical'
    },
    numeroDossier: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Numéro unique du dossier (format défini par la politique de numérotation)'
    },
    dateCreation: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Date de création du dossier médical'
    },
    statut: {
      type: DataTypes.ENUM('Ouvert', 'Fermé', 'Archivé'), // Correction des valeurs pour correspondre à votre migration si besoin, ou standardisez. Migration: 'actif', 'ferme', 'archive', 'fusionne'
      defaultValue: 'Ouvert', // Ajustez si vous préférez 'actif' comme défaut
      allowNull: false,
      comment: 'Statut actuel du dossier médical'
    },
    type_dossier: {
      type: DataTypes.ENUM('principal', 'specialite', 'urgence', 'suivi', 'consultation', 'autre'), // Valeurs de votre migration
      allowNull: false,
      defaultValue: 'principal',
      comment: 'Type de dossier médical (définit son usage principal)'
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // Les références seront définies dans src/models/index.js via les associations
      comment: 'ID du patient propriétaire du dossier'
    },
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID du service de santé responsable du dossier'
    },
    medecin_referent_id: { // Correspond à professionnel_sante_id dans ma proposition précédente
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID du médecin référent principal pour ce dossier'
    },
    resume: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Résumé clinique du patient et de sa situation médicale'
    },
    antecedent_medicaux: { // Correspond à antecedents_medicaux dans ma proposition
      type: DataTypes.JSON, // Votre migration utilise JSON
      allowNull: true,
      comment: 'Antécédents médicaux structurés (pathologies, chirurgies, etc.)'
    },
    allergies: {
      type: DataTypes.JSON, // Votre migration utilise JSON
      allowNull: true,
      comment: 'Allergies et intolérances médicamenteuses ou autres'
    },
    traitements_chroniques: { // Correspond à traitements_actuels dans ma proposition
      type: DataTypes.JSON, // Votre migration utilise JSON
      allowNull: true,
      comment: 'Traitements au long cours avec posologie et indications'
    },
    parametres_vitaux: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Derniers paramètres vitaux enregistrés (TA, poids, taille, IMC, etc.)'
    },
    habitudes_vie: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Informations sur le mode de vie (tabac, alcool, activité physique, etc.)'
    },
    historique_familial: { // Correspond à antecedents_familiaux dans ma proposition
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Antécédents familiaux notables'
    },
    directives_anticipées: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Directives anticipées et personnes de confiance'
    },
    observations: { // Correspond à notes_cliniques dans ma proposition
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notes et observations diverses'
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID de l\'utilisateur ayant créé le dossier'
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID du dernier utilisateur ayant modifié le dossier'
    },
    date_fermeture: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date de fermeture du dossier si applicable'
    },
    motif_fermeture: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Raison de la fermeture du dossier'
    },
    // createdAt et updatedAt sont gérés automatiquement par Sequelize avec timestamps: true
    // deletedAt est géré automatiquement par Sequelize avec paranoid: true
  }, {
    tableName: 'DossiersMedicaux',
    timestamps: true, // Gère createdAt et updatedAt
    paranoid: true,   // Gère deletedAt pour la suppression douce
    // Vous n'avez pas besoin de définir `createdAt`, `updatedAt`, `deletedAt` ici si `timestamps: true` et `paranoid: true` sont activés.
    // Sequelize gérera leur création, mise à jour et la logique de suppression douce automatiquement.
  });

  return DossierMedical;
};