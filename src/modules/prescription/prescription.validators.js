const { body, query, param } = require('express-validator');

/**
 * Validateurs modernes pour les prescriptions
 */

// Validation rules pour les ordonnances
const ordonnanceValidationRules = [
  body('patient_id')
    .notEmpty()
    .withMessage('L\'ID du patient est requis')
    .isInt({ min: 1 })
    .withMessage('L\'ID du patient doit être un entier positif'),
    
  body('dossier_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('L\'ID du dossier doit être un entier positif'),
    
  body('principe_actif')
    .notEmpty()
    .withMessage('Le principe actif est requis')
    .isLength({ min: 2, max: 255 })
    .withMessage('Le principe actif doit contenir entre 2 et 255 caractères')
    .matches(/^[a-zA-ZÀ-ÿ0-9\s\-\(\)\/\,\.]+$/)
    .withMessage('Le principe actif contient des caractères non autorisés'),
    
  body('nom_commercial')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Le nom commercial ne peut pas dépasser 255 caractères')
    .matches(/^[a-zA-ZÀ-ÿ0-9\s\-\(\)\/\,\.]*$/)
    .withMessage('Le nom commercial contient des caractères non autorisés'),
    
  body('code_cip')
    .optional()
    .matches(/^\d{13}$/)
    .withMessage('Le code CIP doit contenir exactement 13 chiffres'),
    
  body('atc')
    .optional()
    .matches(/^[A-Z]\d{2}[A-Z]{2}\d{2}$/)
    .withMessage('Le code ATC doit respecter le format: 1 lettre, 2 chiffres, 2 lettres, 2 chiffres'),
    
  body('dosage')
    .notEmpty()
    .withMessage('Le dosage est requis')
    .isLength({ min: 1, max: 100 })
    .withMessage('Le dosage doit contenir entre 1 et 100 caractères'),
    
  body('forme_pharmaceutique')
    .optional()
    .isLength({ max: 100 })
    .withMessage('La forme pharmaceutique ne peut pas dépasser 100 caractères')
    .isIn(['comprimé', 'gélule', 'sirop', 'solution', 'pommade', 'crème', 'gel', 'suppositoire', 'injection', 'autre'])
    .withMessage('Forme pharmaceutique non reconnue'),
    
  body('quantite')
    .optional()
    .isInt({ min: 1, max: 9999 })
    .withMessage('La quantité doit être un entier entre 1 et 9999'),
    
  body('unite')
    .optional()
    .isLength({ max: 20 })
    .withMessage('L\'unité ne peut pas dépasser 20 caractères')
    .isIn(['boîte', 'flacon', 'tube', 'ampoule', 'sachet', 'comprimé', 'gélule', 'ml', 'g', 'mg', 'autre'])
    .withMessage('Unité non reconnue'),
    
  body('posologie')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La posologie ne peut pas dépasser 1000 caractères'),
    
  body('frequence')
    .notEmpty()
    .withMessage('La fréquence est requise')
    .isLength({ min: 1, max: 100 })
    .withMessage('La fréquence doit contenir entre 1 et 100 caractères'),
    
  body('voie_administration')
    .optional()
    .isIn(['orale', 'cutanée', 'nasale', 'oculaire', 'auriculaire', 'vaginale', 'rectale', 'inhalée', 'injection', 'autre'])
    .withMessage('Voie d\'administration invalide'),
    
  body('contre_indications')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Les contre-indications ne peuvent pas dépasser 2000 caractères'),
    
  body('effets_indesirables')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Les effets indésirables ne peuvent pas dépasser 2000 caractères'),
    
  body('instructions_speciales')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Les instructions spéciales ne peuvent pas dépasser 1000 caractères'),
    
  body('duree_traitement')
    .optional()
    .isLength({ max: 100 })
    .withMessage('La durée du traitement ne peut pas dépasser 100 caractères')
    .matches(/^(\d+\s*(jour|jours|semaine|semaines|mois|an|ans|heure|heures)|\d+\s*-\s*\d+\s*(jour|jours|semaine|semaines|mois))$/i)
    .withMessage('Format de durée invalide (ex: "7 jours", "2 semaines", "1 mois")'),
    
  body('date_debut')
    .optional()
    .isISO8601()
    .withMessage('Format de date de début invalide (ISO 8601 requis)')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        throw new Error('La date de début ne peut pas être antérieure à aujourd\'hui');
      }
      return true;
    }),
    
  body('date_fin')
    .optional()
    .isISO8601()
    .withMessage('Format de date de fin invalide (ISO 8601 requis)')
    .custom((value, { req }) => {
      if (req.body.date_debut) {
        const dateDebut = new Date(req.body.date_debut);
        const dateFin = new Date(value);
        if (dateFin <= dateDebut) {
          throw new Error('La date de fin doit être postérieure à la date de début');
        }
      }
      return true;
    }),
    
  body('renouvelable')
    .optional()
    .isBoolean()
    .withMessage('Le champ renouvelable doit être un booléen'),
    
  body('nb_renouvellements')
    .optional()
    .isInt({ min: 0, max: 12 })
    .withMessage('Le nombre de renouvellements doit être entre 0 et 12')
    .custom((value, { req }) => {
      if (value > 0 && !req.body.renouvelable) {
        throw new Error('Le nombre de renouvellements ne peut être défini que si la prescription est renouvelable');
      }
      return true;
    }),
    
  body('pharmacieDelivrance')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Le nom de la pharmacie ne peut pas dépasser 255 caractères')
];

// Validation rules pour les demandes d'examen
const demandeExamenValidationRules = [
  body('patient_id')
    .notEmpty()
    .withMessage('L\'ID du patient est requis')
    .isInt({ min: 1 })
    .withMessage('L\'ID du patient doit être un entier positif'),
    
  body('dossier_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('L\'ID du dossier doit être un entier positif'),
    
  body('type_examen')
    .notEmpty()
    .withMessage('Le type d\'examen est requis')
    .isLength({ min: 2, max: 255 })
    .withMessage('Le type d\'examen doit contenir entre 2 et 255 caractères')
    .isIn([
      'Radiographie', 'Scanner', 'IRM', 'Échographie', 'Endoscopie',
      'Prise de sang', 'Analyse d\'urine', 'ECG', 'EEG', 'Spirométrie',
      'Biopsie', 'Mammographie', 'Coloscopie', 'Gastroscopie',
      'Test allergologique', 'Bilan cardiologique', 'Bilan neurologique',
      'Autre'
    ])
    .withMessage('Type d\'examen non reconnu'),
    
  body('parametres')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Les paramètres ne peuvent pas dépasser 500 caractères'),
    
  body('urgence')
    .optional()
    .isIn(['urgent', 'semi-urgent', 'normal', 'programmé'])
    .withMessage('Niveau d\'urgence invalide'),
    
  body('instructions_speciales')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Les instructions spéciales ne peuvent pas dépasser 1000 caractères'),
    
  body('date_souhaitee')
    .optional()
    .isISO8601()
    .withMessage('Format de date souhaitée invalide (ISO 8601 requis)')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      if (date < today) {
        throw new Error('La date souhaitée ne peut pas être antérieure à aujourd\'hui');
      }
      return true;
    })
];

// Validation rules pour les mises à jour
const updateValidationRules = [
  body('principe_actif')
    .optional()
    .isLength({ min: 2, max: 255 })
    .withMessage('Le principe actif doit contenir entre 2 et 255 caractères'),
    
  body('nom_commercial')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Le nom commercial ne peut pas dépasser 255 caractères'),
    
  body('dosage')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Le dosage doit contenir entre 1 et 100 caractères'),
    
  body('frequence')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('La fréquence doit contenir entre 1 et 100 caractères'),
    
  body('duree_traitement')
    .optional()
    .isLength({ max: 100 })
    .withMessage('La durée du traitement ne peut pas dépasser 100 caractères'),
    
  body('instructions_speciales')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Les instructions spéciales ne peuvent pas dépasser 1000 caractères'),
    
  body('voie_administration')
    .optional()
    .isIn(['orale', 'cutanée', 'nasale', 'oculaire', 'auriculaire', 'vaginale', 'rectale', 'inhalée', 'injection', 'autre'])
    .withMessage('Voie d\'administration invalide'),
    
  body('statut')
    .optional()
    .isIn(['active', 'suspendue', 'terminee', 'annulee', 'en_attente'])
    .withMessage('Statut invalide'),
    
  body('pharmacieDelivrance')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Le nom de la pharmacie ne peut pas dépasser 255 caractères')
];

// Validation rules pour la recherche
const searchValidationRules = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Le numéro de page doit être un entier positif'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être entre 1 et 100'),
    
  query('patient_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('L\'ID du patient doit être un entier positif'),
    
  query('professionnel_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('L\'ID du professionnel doit être un entier positif'),
    
  query('type_prescription')
    .optional()
    .isIn(['ordonnance', 'examen'])
    .withMessage('Type de prescription invalide'),
    
  query('statut')
    .optional()
    .isIn(['active', 'suspendue', 'terminee', 'annulee', 'en_attente'])
    .withMessage('Statut invalide'),
    
  query('date_debut')
    .optional()
    .isISO8601()
    .withMessage('Format de date de début invalide (ISO 8601 requis)'),
    
  query('date_fin')
    .optional()
    .isISO8601()
    .withMessage('Format de date de fin invalide (ISO 8601 requis)')
    .custom((value, { req }) => {
      if (req.query.date_debut) {
        const dateDebut = new Date(req.query.date_debut);
        const dateFin = new Date(value);
        if (dateFin <= dateDebut) {
          throw new Error('La date de fin doit être postérieure à la date de début');
        }
      }
      return true;
    }),
    
  query('search_term')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le terme de recherche doit contenir entre 2 et 100 caractères')
    .matches(/^[a-zA-ZÀ-ÿ0-9\s\-\(\)\/\,\.]+$/)
    .withMessage('Le terme de recherche contient des caractères non autorisés'),
    
  query('principe_actif')
    .optional()
    .isLength({ min: 2, max: 255 })
    .withMessage('Le principe actif doit contenir entre 2 et 255 caractères'),
    
  query('nom_commercial')
    .optional()
    .isLength({ min: 2, max: 255 })
    .withMessage('Le nom commercial doit contenir entre 2 et 255 caractères')
];

// Validation rules pour les paramètres d'URL
const paramValidationRules = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('L\'ID de la prescription doit être un entier positif'),
    
  param('patient_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('L\'ID du patient doit être un entier positif')
];

// Validation rules pour le renouvellement
const renouvellementValidationRules = [
  body('motif_renouvellement')
    .optional()
    .isLength({ min: 5, max: 500 })
    .withMessage('Le motif de renouvellement doit contenir entre 5 et 500 caractères'),
    
  body('nouvelle_duree')
    .optional()
    .matches(/^(\d+\s*(jour|jours|semaine|semaines|mois|an|ans))$/i)
    .withMessage('Format de durée invalide (ex: "7 jours", "2 semaines", "1 mois")'),
    
  body('nouveau_dosage')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Le nouveau dosage doit contenir entre 1 et 100 caractères')
];

// Validation rules pour la suspension
const suspensionValidationRules = [
  body('motif_arret')
    .notEmpty()
    .withMessage('Le motif d\'arrêt est requis')
    .isLength({ min: 5, max: 500 })
    .withMessage('Le motif d\'arrêt doit contenir entre 5 et 500 caractères'),
    
  body('date_arret')
    .optional()
    .isISO8601()
    .withMessage('Format de date d\'arrêt invalide (ISO 8601 requis)')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      if (date > today) {
        throw new Error('La date d\'arrêt ne peut pas être future');
      }
      return true;
    })
];

// Validation rules pour le transfert
const transfertValidationRules = [
  body('patient_id')
    .notEmpty()
    .withMessage('L\'ID du patient destinataire est requis')
    .isInt({ min: 1 })
    .withMessage('L\'ID du patient destinataire doit être un entier positif'),
    
  body('motif_transfert')
    .optional()
    .isLength({ min: 5, max: 500 })
    .withMessage('Le motif de transfert doit contenir entre 5 et 500 caractères')
];

// Validation rules pour les statistiques
const statsValidationRules = [
  query('professionnel_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('L\'ID du professionnel doit être un entier positif'),
    
  query('date_debut')
    .optional()
    .isISO8601()
    .withMessage('Format de date de début invalide (ISO 8601 requis)'),
    
  query('date_fin')
    .optional()
    .isISO8601()
    .withMessage('Format de date de fin invalide (ISO 8601 requis)')
    .custom((value, { req }) => {
      if (req.query.date_debut) {
        const dateDebut = new Date(req.query.date_debut);
        const dateFin = new Date(value);
        if (dateFin <= dateDebut) {
          throw new Error('La date de fin doit être postérieure à la date de début');
        }
      }
      return true;
    })
];

// Validation rules pour les ordonnances récentes
const ordonnancesRecentesValidationRules = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Le numéro de page doit être un entier positif'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('La limite doit être entre 1 et 50'),
    
  query('jours')
    .optional()
    .isInt({ min: 1, max: 30 })
    .withMessage('Le nombre de jours doit être entre 1 et 30')
];

// Validation rules pour l'ajout au dossier patient
const ajouterDossierValidationRules = [
  body('dossier_id')
    .notEmpty()
    .withMessage('L\'ID du dossier médical est requis')
    .isInt({ min: 1 })
    .withMessage('L\'ID du dossier médical doit être un entier positif')
];

// Validation rules pour les notifications
const notificationValidationRules = [
  body('type')
    .optional()
    .isIn(['nouvelle_prescription', 'renouvellement', 'suspension', 'modification'])
    .withMessage('Type de notification invalide'),
    
  body('priorite')
    .optional()
    .isIn(['basse', 'normale', 'haute', 'urgente'])
    .withMessage('Priorité invalide'),
    
  body('canal')
    .optional()
    .isIn(['application', 'email', 'sms', 'push'])
    .withMessage('Canal de notification invalide')
];

// Validation rules pour les notifications patient
const notificationsPatientValidationRules = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Le numéro de page doit être un entier positif'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('La limite doit être entre 1 et 50'),
    
  query('statut')
    .optional()
    .isIn(['non_lue', 'lue', 'toutes'])
    .withMessage('Statut de notification invalide')
];

// Validation rules pour l'ordonnance complète
const ordonnanceCompleteValidationRules = [
  // Inclure toutes les règles d'ordonnance
  ...ordonnanceValidationRules,
  
  // Ajouter les règles spécifiques
  body('dossier_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('L\'ID du dossier médical doit être un entier positif'),
    
  body('priorite')
    .optional()
    .isIn(['basse', 'normale', 'haute', 'urgente'])
    .withMessage('Priorité invalide'),
    
  body('canal')
    .optional()
    .isIn(['application', 'email', 'sms', 'push'])
    .withMessage('Canal de notification invalide')
];

module.exports = {
  ordonnanceValidationRules,
  demandeExamenValidationRules,
  updateValidationRules,
  searchValidationRules,
  paramValidationRules,
  renouvellementValidationRules,
  suspensionValidationRules,
  transfertValidationRules,
  statsValidationRules,
  ordonnancesRecentesValidationRules,
  ajouterDossierValidationRules,
  notificationValidationRules,
  notificationsPatientValidationRules,
  ordonnanceCompleteValidationRules
};