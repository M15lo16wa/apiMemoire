const DMPService = require('./dmp.service');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');

/**
 * Contrôleur pour les fonctionnalités DMP (Dossier Médical Partagé)
 */
class DMPController {

  /**
   * Récupère le tableau de bord personnalisé du patient
   */
  static getTableauDeBord = catchAsync(async (req, res, next) => {
    const patientId = req.patient.id_patient;
    
    const tableauDeBord = await DMPService.getTableauDeBord(patientId);
    
    res.status(200).json({
      status: 'success',
      data: {
        tableau_de_bord: tableauDeBord
      }
    });
  });

  /**
   * Récupère l'historique médical complet
   */
  static getHistoriqueMedical = catchAsync(async (req, res, next) => {
    const patientId = req.patient.id_patient;
    const filters = {
      type: req.query.type,
      date_debut: req.query.date_debut,
      date_fin: req.query.date_fin,
      limit: parseInt(req.query.limit) || 20,
      offset: parseInt(req.query.offset) || 0
    };

    const historique = await DMPService.getHistoriqueMedical(patientId, filters);
    
    res.status(200).json({
      status: 'success',
      data: {
        historique_medical: historique
      }
    });
  });

  /**
   * Récupère le journal d'activité et de consentement
   */
  static getJournalActivite = catchAsync(async (req, res, next) => {
    const patientId = req.patient.id_patient;
    const filters = {
      type: req.query.type,
      date_debut: req.query.date_debut,
      date_fin: req.query.date_fin,
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0
    };

    const journal = await DMPService.getJournalActivite(patientId, filters);
    
    res.status(200).json({
      status: 'success',
      data: {
        journal_activite: journal
      }
    });
  });

  /**
   * Récupère les droits d'accès du patient
   */
  static getDroitsAcces = catchAsync(async (req, res, next) => {
    const patientId = req.patient.id_patient;
    
    const droitsAcces = await DMPService.getDroitsAcces(patientId);
    
    res.status(200).json({
      status: 'success',
      data: {
        droits_acces: droitsAcces
      }
    });
  });

  /**
   * Autorise un nouveau professionnel à accéder au dossier
   */
  static autoriserAcces = catchAsync(async (req, res, next) => {
    const patientId = req.patient.id_patient;
    const { professionnel_id, permissions } = req.body;

    if (!professionnel_id) {
      return next(new AppError('ID du professionnel requis', 400));
    }

    const autorisation = await DMPService.autoriserAcces(patientId, professionnel_id, permissions);
    
    res.status(201).json({
      status: 'success',
      message: 'Autorisation accordée avec succès',
      data: {
        autorisation
      }
    });
  });

  /**
   * Révoque l'accès d'un professionnel
   */
  static revoquerAcces = catchAsync(async (req, res, next) => {
    const patientId = req.patient.id_patient;
    const { professionnel_id } = req.params;

    if (!professionnel_id) {
      return next(new AppError('ID du professionnel requis', 400));
    }

    const result = await DMPService.revoquerAcces(patientId, professionnel_id);
    
    res.status(200).json({
      status: 'success',
      message: result.message
    });
  });

  /**
   * Met à jour les informations personnelles du patient
   */
  static updateInformationsPersonnelles = catchAsync(async (req, res, next) => {
    const patientId = req.patient.id_patient;
    const informations = req.body;

    // Validation des champs
    const champsAutorises = ['personne_urgence', 'telephone_urgence', 'antecedents_familiaux', 'habitudes_vie'];
    const champsInvalides = Object.keys(informations).filter(champ => !champsAutorises.includes(champ));
    
    if (champsInvalides.length > 0) {
      return next(new AppError(`Champs non autorisés: ${champsInvalides.join(', ')}`, 400));
    }

    const result = await DMPService.updateInformationsPersonnelles(patientId, informations);
    
    res.status(200).json({
      status: 'success',
      message: result.message
    });
  });

  /**
   * Ajoute une auto-mesure du patient
   */
  static ajouterAutoMesure = catchAsync(async (req, res, next) => {
    const patientId = req.patient.id_patient;
    const { type_mesure, valeur, unite, commentaire } = req.body;

    if (!type_mesure || !valeur) {
      return next(new AppError('Type de mesure et valeur sont requis', 400));
    }

    const mesure = {
      type_mesure,
      valeur,
      unite,
      commentaire
    };

    const result = await DMPService.ajouterAutoMesure(patientId, mesure);
    
    res.status(201).json({
      status: 'success',
      message: result.message
    });
  });

  /**
   * Génère une fiche d'urgence avec QR Code
   */
  static genererFicheUrgence = catchAsync(async (req, res, next) => {
    const patientId = req.patient.id_patient;
    
    const ficheUrgence = await DMPService.genererFicheUrgence(patientId);
    
    res.status(200).json({
      status: 'success',
      data: {
        fiche_urgence: ficheUrgence
      }
    });
  });

  /**
   * Récupère les rendez-vous du patient
   */
  static getRendezVous = catchAsync(async (req, res, next) => {
    const patientId = req.patient.id_patient;
    const { statut, date_debut, date_fin } = req.query;

    // Cette fonctionnalité sera implémentée dans le service RendezVous
    // Pour l'instant, retourner un message d'information
    res.status(200).json({
      status: 'success',
      message: 'Fonctionnalité de gestion des rendez-vous en cours de développement',
      data: {
        rendez_vous: []
      }
    });
  });

  /**
   * Envoie un message sécurisé au médecin
   */
  static envoyerMessage = catchAsync(async (req, res, next) => {
    const patientId = req.patient.id_patient;
    const { professionnel_id, sujet, message } = req.body;

    if (!professionnel_id || !sujet || !message) {
      return next(new AppError('Professionnel, sujet et message sont requis', 400));
    }

    // Cette fonctionnalité sera implémentée dans un service de messagerie
    // Pour l'instant, retourner un message d'information
    res.status(201).json({
      status: 'success',
      message: 'Fonctionnalité de messagerie sécurisée en cours de développement'
    });
  });

  /**
   * Récupère les rappels et plan de soins personnalisé
   */
  static getRappels = catchAsync(async (req, res, next) => {
    const patientId = req.patient.id_patient;

    // Simuler des rappels (à adapter selon vos besoins)
    const rappels = [
      {
        type: 'medicament',
        message: 'N\'oubliez pas de prendre votre médicament X',
        date: new Date(),
        priorite: 'haute'
      },
      {
        type: 'vaccin',
        message: 'Il est temps de faire votre vaccin de rappel',
        date: new Date(),
        priorite: 'moyenne'
      },
      {
        type: 'controle',
        message: 'Votre prochain contrôle pour le diabète est recommandé dans 3 mois',
        date: new Date(),
        priorite: 'basse'
      }
    ];

    res.status(200).json({
      status: 'success',
      data: {
        rappels
      }
    });
  });

  /**
   * Récupère la bibliothèque de santé
   */
  static getBibliothequeSante = catchAsync(async (req, res, next) => {
    const { categorie, recherche } = req.query;

    // Simuler une bibliothèque de santé (à adapter selon vos besoins)
    const bibliotheque = [
      {
        id: 1,
        titre: 'Guide du diabète',
        categorie: 'maladies_chroniques',
        description: 'Informations sur la gestion du diabète',
        url: '/guides/diabete',
        date_publication: new Date()
      },
      {
        id: 2,
        titre: 'Prévention cardiovasculaire',
        categorie: 'prevention',
        description: 'Conseils pour prévenir les maladies cardiovasculaires',
        url: '/guides/prevention-cardiovasculaire',
        date_publication: new Date()
      }
    ];

    res.status(200).json({
      status: 'success',
      data: {
        bibliotheque_sante: bibliotheque
      }
    });
  });

  /**
   * Upload de documents personnels
   */
  static uploadDocumentPersonnel = catchAsync(async (req, res, next) => {
    const patientId = req.patient.id_patient;
    const { titre, description, type_document } = req.body;

    if (!req.file) {
      return next(new AppError('Aucun fichier uploadé', 400));
    }

    if (!titre || !type_document) {
      return next(new AppError('Titre et type de document sont requis', 400));
    }

    // Cette fonctionnalité sera implémentée avec multer pour l'upload
    // Pour l'instant, retourner un message d'information
    res.status(201).json({
      status: 'success',
      message: 'Fonctionnalité d\'upload de documents en cours de développement'
    });
  });

  /**
   * Récupère les documents personnels du patient
   */
  static getDocumentsPersonnels = catchAsync(async (req, res, next) => {
    const patientId = req.patient.id_patient;

    // Simuler des documents personnels (à adapter selon vos besoins)
    const documents = [
      {
        id: 1,
        titre: 'Résultats analyse étranger',
        type: 'analyse',
        date_upload: new Date(),
        taille: '2.5 MB',
        url: '/documents/1'
      }
    ];

    res.status(200).json({
      status: 'success',
      data: {
        documents_personnels: documents
      }
    });
  });

  /**
   * Récupère les statistiques du DMP
   */
  static getStatistiquesDMP = catchAsync(async (req, res, next) => {
    const patientId = req.patient.id_patient;

    // Simuler des statistiques (à adapter selon vos besoins)
    const statistiques = {
      total_consultations: 15,
      total_prescriptions: 8,
      total_examens: 12,
      derniere_activite: new Date(),
      professionnels_autorises: 3,
      documents_uploades: 2
    };

    res.status(200).json({
      status: 'success',
      data: {
        statistiques
      }
    });
  });
}

module.exports = DMPController; 