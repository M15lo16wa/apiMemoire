const DMPService = require('./dmp.service');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const { Patient, DocumentPersonnel, AutoMesure, Message, Rappel } = require('../../models');

/**
 * Contrôleur pour les fonctionnalités DMP (Dossier Médical Partagé)
 */
class DMPController {

  /**
   * Récupère les informations générales du DMP du patient
   */
  static getDMPOverview = catchAsync(async (req, res, next) => {
    const patientId = req.patient.id_patient;
    
    try {
      // Récupérer les informations de base du patient
      const patient = await Patient.findByPk(patientId, {
        attributes: ['id_patient', 'nom', 'prenom', 'date_naissance', 'sexe', 'email', 'telephone']
      });

      if (!patient) {
        throw new AppError('Patient non trouvé', 404);
      }

      // Compter les documents personnels
      const totalDocuments = await DocumentPersonnel.count({
        where: { patient_id: patientId }
      });

      // Compter les auto-mesures
      const totalAutoMesures = await AutoMesure.count({
        where: { patient_id: patientId }
      });

      // Compter les messages
      const totalMessages = await Message.count({
        where: { patient_id: patientId }
      });

      // Compter les rappels
      const totalRappels = await Rappel.count({
        where: { patient_id: patientId }
      });

      // Données de base pour l'overview
      const dmpOverview = {
        patient: {
          id: patient.id_patient,
          nom: patient.nom,
          prenom: patient.prenom,
          date_naissance: patient.date_naissance,
          sexe: patient.sexe,
          email: patient.email,
          telephone: patient.telephone
        },
        statistiques: {
          total_documents: totalDocuments,
          total_auto_mesures: totalAutoMesures,
          total_messages: totalMessages,
          total_rappels: totalRappels
        },
        derniere_activite: new Date(),
        notifications: [
          {
            id: 1,
            type: 'info',
            message: 'Bienvenue dans votre espace DMP',
            date: new Date(),
            lu: false
          }
        ]
      };
      
      res.status(200).json({
        status: 'success',
        data: {
          dmp: dmpOverview
        }
      });
    } catch (error) {
      console.error('Erreur dans getDMPOverview:', error);
      throw error;
    }
  });

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
   * Récupère les auto-mesures du patient
   */
  static getAutoMesures = catchAsync(async (req, res, next) => {
    const patientId = req.patient.id_patient;
    const filters = {
      type_mesure: req.query.type_mesure,
      date_debut: req.query.date_debut,
      date_fin: req.query.date_fin,
      limit: parseInt(req.query.limit) || 20,
      offset: parseInt(req.query.offset) || 0
    };

    const autoMesures = await DMPService.getAutoMesures(patientId, filters);
    
    res.status(200).json({
      status: 'success',
      data: {
        auto_mesures: autoMesures
      }
    });
  });

  /**
   * Met à jour une auto-mesure
   */
  static updateAutoMesure = catchAsync(async (req, res, next) => {
    const patientId = req.patient.id_patient;
    const mesureId = req.params.id;
    const mesureData = req.body;

    const result = await DMPService.updateAutoMesure(patientId, mesureId, mesureData);
    
    res.status(200).json({
      status: 'success',
      message: result.message,
      data: {
        mesure: result.mesure
      }
    });
  });

  /**
   * Supprime une auto-mesure
   */
  static deleteAutoMesure = catchAsync(async (req, res, next) => {
    const patientId = req.patient.id_patient;
    const mesureId = req.params.id;

    const result = await DMPService.deleteAutoMesure(patientId, mesureId);
    
    res.status(200).json({
      status: 'success',
      message: result.message
    });
  });

  /**
   * Récupère les documents personnels du patient
   */
  static getDocumentsPersonnels = catchAsync(async (req, res, next) => {
    const patientId = req.patient.id_patient;
    
    const documents = await DMPService.getDocumentsPersonnels(patientId);
    
    res.status(200).json({
      status: 'success',
      data: {
        documents_personnels: documents
      }
    });
  });

  /**
   * Upload de documents personnels
   */
  static uploadDocumentPersonnel = catchAsync(async (req, res, next) => {
    const patientId = req.patient.id_patient;
    const { nom, type, description, url, taille, format } = req.body;

    if (!nom || !type || !url) {
      return next(new AppError('Nom, type et URL du document sont requis', 400));
    }

    const documentData = {
      nom,
      type,
      description,
      url,
      taille,
      format
    };

    const result = await DMPService.uploadDocumentPersonnel(patientId, documentData);
    
    res.status(201).json({
      status: 'success',
      message: result.message,
      data: {
        document: result.document
      }
    });
  });

  /**
   * Supprime un document personnel
   */
  static deleteDocumentPersonnel = catchAsync(async (req, res, next) => {
    const patientId = req.patient.id_patient;
    const documentId = req.params.id;

    const result = await DMPService.deleteDocumentPersonnel(patientId, documentId);
    
    res.status(200).json({
      status: 'success',
      message: result.message
    });
  });

  /**
   * Récupère les messages du patient
   */
  static getMessages = catchAsync(async (req, res, next) => {
    const patientId = req.patient.id_patient;
    const filters = {
      lu: req.query.lu,
      limit: parseInt(req.query.limit) || 20,
      offset: parseInt(req.query.offset) || 0
    };

    const messages = await DMPService.getMessages(patientId, filters);
    
    res.status(200).json({
      status: 'success',
      data: {
        messages: messages
      }
    });
  });

  /**
   * Envoie un message sécurisé au médecin
   */
  static envoyerMessage = catchAsync(async (req, res, next) => {
    const patientId = req.patient.id_patient;
    const { professionnel_id, sujet, contenu } = req.body;

    if (!professionnel_id || !sujet || !contenu) {
      return next(new AppError('Professionnel, sujet et contenu sont requis', 400));
    }

    const messageData = {
      professionnel_id,
      sujet,
      contenu
    };

    const result = await DMPService.envoyerMessage(patientId, messageData);
    
    res.status(201).json({
      status: 'success',
      message: result.message,
      data: {
        message: result.message
      }
    });
  });

  /**
   * Supprime un message
   */
  static deleteMessage = catchAsync(async (req, res, next) => {
    const patientId = req.patient.id_patient;
    const messageId = req.params.id;

    const result = await DMPService.deleteMessage(patientId, messageId);
    
    res.status(200).json({
      status: 'success',
      message: result.message
    });
  });

  /**
   * Récupère les rappels du patient
   */
  static getRappels = catchAsync(async (req, res, next) => {
    const patientId = req.patient.id_patient;
    
    const rappels = await DMPService.getRappels(patientId);
    
    res.status(200).json({
      status: 'success',
      data: {
        rappels: rappels
      }
    });
  });

  /**
   * Crée un nouveau rappel
   */
  static creerRappel = catchAsync(async (req, res, next) => {
    const patientId = req.patient.id_patient;
    const { type, titre, description, date_rappel, priorite } = req.body;

    if (!type || !titre || !date_rappel) {
      return next(new AppError('Type, titre et date de rappel sont requis', 400));
    }

    const rappelData = {
      type,
      titre,
      description,
      date_rappel,
      priorite: priorite || 'moyenne'
    };

    const result = await DMPService.creerRappel(patientId, rappelData);
    
    res.status(201).json({
      status: 'success',
      message: result.message,
      data: {
        rappel: result.rappel
      }
    });
  });

  /**
   * Met à jour un rappel
   */
  static updateRappel = catchAsync(async (req, res, next) => {
    const patientId = req.patient.id_patient;
    const rappelId = req.params.id;
    const rappelData = req.body;

    const result = await DMPService.updateRappel(patientId, rappelId, rappelData);
    
    res.status(200).json({
      status: 'success',
      message: result.message,
      data: {
        rappel: result.rappel
      }
    });
  });

  /**
   * Supprime un rappel
   */
  static deleteRappel = catchAsync(async (req, res, next) => {
    const patientId = req.patient.id_patient;
    const rappelId = req.params.id;

    const result = await DMPService.deleteRappel(patientId, rappelId);
    
    res.status(200).json({
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

  /**
   * Récupère les notifications d'accès DMP pour le patient
   */
  static getNotificationsAccesDMP = catchAsync(async (req, res, next) => {
    const patientId = req.patient.id_patient;
    const filters = {
      limit: parseInt(req.query.limit) || 20,
      offset: parseInt(req.query.offset) || 0,
      type_notification: req.query.type_notification,
      statut_envoi: req.query.statut_envoi
    };

    const notifications = await DMPService.getNotificationsAccesDMP(patientId, filters);
    
    // Retourner la structure attendue par le frontend
    res.status(200).json({
      status: 'success',
      notifications: notifications // Structure simplifiée pour le frontend
    });
  });
}

module.exports = DMPController; 