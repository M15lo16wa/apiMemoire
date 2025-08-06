const { Patient, DossierMedical, Prescription, Consultation, ExamenLabo, AutorisationAcces, HistoriqueAccess, ProfessionnelSante, RendezVous, AutoMesure, DocumentPersonnel, Message, Rappel } = require('../../models');
const { Op } = require('sequelize');
const AppError = require('../../utils/appError');
const QRCode = require('qrcode');

/**
 * Service pour les fonctionnalités DMP (Dossier Médical Partagé)
 */
class DMPService {
  
  /**
   * Récupère les informations générales du DMP du patient
   */
  static async getDMPOverview(patientId) {
    try {
      const patient = await Patient.findByPk(patientId, {
        include: [
          {
            model: DossierMedical,
            as: 'dossiers',
            attributes: ['groupe_sanguin', 'allergies', 'blood_pressure', 'heart_rate', 'temperature', 'oxygen_saturation']
          }
        ]
      });

      if (!patient) {
        throw new AppError('Patient non trouvé', 404);
      }

      // Compter les documents personnels
      const totalDocuments = await DocumentPersonnel.count({
        where: { patient_id: patientId }
      });

      // Compter les consultations
      const totalConsultations = await Consultation.count({
        where: { patient_id: patientId }
      });

      // Compter les prescriptions
      const totalPrescriptions = await Prescription.count({
        where: { patient_id: patientId }
      });

      // Récupérer la dernière activité
      const derniereActivite = await this.getDerniereActivite(patientId);

      return {
        patient_id: patient.id_patient,
        nom: patient.nom,
        prenom: patient.prenom,
        date_naissance: patient.date_naissance,
        groupe_sanguin: patient.dossiers?.[0]?.groupe_sanguin,
        derniere_activite: derniereActivite,
        total_documents: totalDocuments,
        total_consultations: totalConsultations,
        total_prescriptions: totalPrescriptions
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des informations DMP:', error);
      throw error;
    }
  }

  /**
   * Récupère le tableau de bord personnalisé du patient
   */
  static async getTableauDeBord(patientId) {
    try {
      const patient = await Patient.findByPk(patientId, {
        include: [
          {
            model: DossierMedical,
            as: 'dossiers',
            attributes: ['groupe_sanguin', 'allergies', 'blood_pressure', 'heart_rate', 'temperature', 'oxygen_saturation']
          }
        ]
      });

      if (!patient) {
        throw new AppError('Patient non trouvé', 404);
      }

      // Récupérer les dernières activités
      const dernieresActivites = await this.getDernieresActivites(patientId);
      
      // Récupérer les notifications récentes
      const notifications = await this.getNotificationsRecentes(patientId);

      return {
        patient: {
          id: patient.id_patient,
          nom: patient.nom,
          prenom: patient.prenom,
          date_naissance: patient.date_naissance,
          identifiant: patient.numero_assure,
          groupe_sanguin: patient.dossiers?.[0]?.groupe_sanguin,
          allergies: patient.dossiers?.[0]?.allergies,
          tension_arterielle: patient.dossiers?.[0]?.blood_pressure,
          frequence_cardiaque: patient.dossiers?.[0]?.heart_rate,
          temperature: patient.dossiers?.[0]?.temperature,
          saturation_oxygene: patient.dossiers?.[0]?.oxygen_saturation
        },
        prochains_rendez_vous: [], // TODO: Implémenter la récupération des rendez-vous via les infos patient
        dernieres_activites: dernieresActivites,
        notifications: notifications
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du tableau de bord:', error);
      throw error;
    }
  }

  /**
   * Récupère l'historique médical complet
   */
  static async getHistoriqueMedical(patientId, filters = {}) {
    try {
      const { type, date_debut, date_fin, limit = 20, offset = 0 } = filters;

      const whereClause = { patient_id: patientId };
      
      if (date_debut && date_fin) {
        whereClause.createdAt = {
          [Op.between]: [date_debut, date_fin]
        };
      }

      // Récupérer les consultations
      const consultations = await Consultation.findAll({
        where: whereClause,
        include: [
          {
            model: ProfessionnelSante,
            as: 'professionnel',
            attributes: ['nom', 'prenom', 'specialite', 'numero_adeli']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      // Récupérer les prescriptions
      const prescriptions = await Prescription.findAll({
        where: whereClause,
        include: [
          {
            model: ProfessionnelSante,
            as: 'redacteur',
            attributes: ['nom', 'prenom', 'specialite']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      // Récupérer les examens
      const examens = await ExamenLabo.findAll({
        where: whereClause,
        include: [
          {
            model: ProfessionnelSante,
            as: 'prescripteur',
            attributes: ['nom', 'prenom', 'specialite']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      return {
        consultations,
        prescriptions,
        examens
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique médical:', error);
      throw error;
    }
  }

  /**
   * Récupère le journal d'activité et de consentement
   */
  static async getJournalActivite(patientId, filters = {}) {
    try {
      const { type, date_debut, date_fin, limit = 50, offset = 0 } = filters;

      const whereClause = { patient_id: patientId };
      
      if (date_debut && date_fin) {
        whereClause.date_acces = {
          [Op.between]: [date_debut, date_fin]
        };
      }

      const journal = await HistoriqueAccess.findAll({
        where: whereClause,
        order: [['date_heure_acces', 'DESC']],
        limit,
        offset
      });

      return journal;
    } catch (error) {
      console.error('Erreur lors de la récupération du journal d\'activité:', error);
      throw error;
    }
  }

  /**
   * Récupère les droits d'accès du patient
   */
  static async getDroitsAcces(patientId) {
    try {
      const droitsAcces = await AutorisationAcces.findAll({
        where: { patient_id: patientId },
        include: [
          {
            model: ProfessionnelSante,
            as: 'professionnelDemandeur',
            attributes: ['nom', 'prenom', 'specialite', 'numero_adeli']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return droitsAcces;
    } catch (error) {
      console.error('Erreur lors de la récupération des droits d\'accès:', error);
      throw error;
    }
  }

  /**
   * Autorise un nouveau professionnel à accéder au dossier
   */
  static async autoriserAcces(patientId, professionnelId, permissions = {}) {
    try {
      // Vérifier que le professionnel existe
      const professionnel = await ProfessionnelSante.findByPk(professionnelId);
      if (!professionnel) {
        throw new AppError('Professionnel non trouvé', 404);
      }

      // Vérifier que l'autorisation n'existe pas déjà
      const autorisationExistante = await AutorisationAcces.findOne({
        where: {
          patient_id: patientId,
          professionnel_id: professionnelId
        }
      });

      if (autorisationExistante) {
        throw new AppError('Autorisation déjà accordée', 400);
      }

      // Créer l'autorisation avec les bons noms de colonnes
      const autorisation = await AutorisationAcces.creerAutorisation({
        type_acces: 'lecture',
        date_debut: new Date(),
        date_fin: null,
        statut: 'actif',
        raison_demande: 'Autorisation accordée par le patient',
        conditions_acces: permissions,
        patient_id: patientId,
        professionnel_id: professionnelId,
        accorde_par: patientId, // Le patient accorde l'autorisation
        validateur_id: patientId,
        createdBy: patientId
      });

      return autorisation;
    } catch (error) {
      console.error('Erreur lors de l\'autorisation d\'accès:', error);
      throw error;
    }
  }

  /**
   * Révoque l'accès d'un professionnel
   */
  static async revoquerAcces(patientId, professionnelId) {
    try {
      const autorisation = await AutorisationAcces.findOne({
        where: {
          patient_id: patientId,
          professionnel_id: professionnelId
        }
      });

      if (!autorisation) {
        throw new AppError('Autorisation non trouvée', 404);
      }

      await autorisation.update({
        statut: 'refuse',
        date_revocation: new Date(),
        motif_revocation: 'Révoqué par le patient'
      });

      return {
        message: 'Accès révoqué avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la révocation d\'accès:', error);
      throw error;
    }
  }

  /**
   * Met à jour les informations personnelles du patient
   */
  static async updateInformationsPersonnelles(patientId, informations) {
    try {
      const patient = await Patient.findByPk(patientId);
      if (!patient) {
        throw new AppError('Patient non trouvé', 404);
      }

      await patient.update(informations);

      return {
        message: 'Informations personnelles mises à jour avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour des informations personnelles:', error);
      throw error;
    }
  }

  /**
   * Ajoute une auto-mesure du patient
   */
  static async ajouterAutoMesure(patientId, mesure) {
    try {
      const autoMesure = await AutoMesure.create({
        patient_id: patientId,
        ...mesure,
        date_mesure: new Date()
      });

      return {
        message: 'Auto-mesure ajoutée avec succès',
        mesure: autoMesure
      };
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'auto-mesure:', error);
      throw error;
    }
  }

  /**
   * Récupère les auto-mesures du patient
   */
  static async getAutoMesures(patientId, filters = {}) {
    try {
      const { type_mesure, date_debut, date_fin, limit = 20, offset = 0 } = filters;

      const whereClause = { patient_id: patientId };
      
      if (type_mesure) {
        whereClause.type_mesure = type_mesure;
      }
      
      if (date_debut && date_fin) {
        whereClause.date_mesure = {
          [Op.between]: [date_debut, date_fin]
        };
      }

      const autoMesures = await AutoMesure.findAll({
        where: whereClause,
        order: [['date_mesure', 'DESC']],
        limit,
        offset,
        include: [
          {
            model: Patient,
            as: 'patient',
            attributes: ['nom', 'prenom']
          }
        ]
      });

      return autoMesures;
    } catch (error) {
      console.error('Erreur lors de la récupération des auto-mesures:', error);
      throw error;
    }
  }

  /**
   * Met à jour une auto-mesure
   */
  static async updateAutoMesure(patientId, mesureId, mesureData) {
    try {
      const mesure = await AutoMesure.findOne({
        where: { id: mesureId, patient_id: patientId }
      });

      if (!mesure) {
        throw new AppError('Auto-mesure non trouvée', 404);
      }

      await mesure.update(mesureData);

      return {
        message: 'Auto-mesure mise à jour avec succès',
        mesure
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'auto-mesure:', error);
      throw error;
    }
  }

  /**
   * Supprime une auto-mesure
   */
  static async deleteAutoMesure(patientId, mesureId) {
    try {
      const mesure = await AutoMesure.findOne({
        where: { id: mesureId, patient_id: patientId }
      });

      if (!mesure) {
        throw new AppError('Auto-mesure non trouvée', 404);
      }

      await mesure.destroy();

      return {
        message: 'Auto-mesure supprimée avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'auto-mesure:', error);
      throw error;
    }
  }

  /**
   * Récupère les documents personnels du patient
   */
  static async getDocumentsPersonnels(patientId) {
    try {
      const documents = await DocumentPersonnel.findAll({
        where: { patient_id: patientId },
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: Patient,
            as: 'patient',
            attributes: ['nom', 'prenom']
          }
        ]
      });

      return documents;
    } catch (error) {
      console.error('Erreur lors de la récupération des documents personnels:', error);
      throw error;
    }
  }

  /**
   * Upload un document personnel
   */
  static async uploadDocumentPersonnel(patientId, documentData) {
    try {
      const document = await DocumentPersonnel.create({
        patient_id: patientId,
        ...documentData
      });

      return {
        message: 'Document uploadé avec succès',
        document
      };
    } catch (error) {
      console.error('Erreur lors de l\'upload du document:', error);
      throw error;
    }
  }

  /**
   * Supprime un document personnel
   */
  static async deleteDocumentPersonnel(patientId, documentId) {
    try {
      const document = await DocumentPersonnel.findOne({
        where: { id: documentId, patient_id: patientId }
      });

      if (!document) {
        throw new AppError('Document non trouvé', 404);
      }

      await document.destroy();

      return {
        message: 'Document supprimé avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la suppression du document:', error);
      throw error;
    }
  }

  /**
   * Récupère les messages du patient
   */
  static async getMessages(patientId, filters = {}) {
    try {
      const { lu, limit = 20, offset = 0 } = filters;

      const whereClause = { patient_id: patientId };
      
      if (lu !== undefined) {
        whereClause.lu = lu;
      }

      const messages = await Message.findAll({
        where: whereClause,
        include: [
          {
            model: ProfessionnelSante,
            as: 'professionnel',
            attributes: ['nom', 'prenom', 'specialite']
          }
        ],
        order: [['date_envoi', 'DESC']],
        limit,
        offset
      });

      return messages;
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      throw error;
    }
  }

  /**
   * Envoie un message
   */
  static async envoyerMessage(patientId, messageData) {
    try {
      const message = await Message.create({
        patient_id: patientId,
        ...messageData,
        date_envoi: new Date()
      });

      return {
        message: 'Message envoyé avec succès',
        message: message
      };
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      throw error;
    }
  }

  /**
   * Supprime un message
   */
  static async deleteMessage(patientId, messageId) {
    try {
      const message = await Message.findOne({
        where: { id: messageId, patient_id: patientId }
      });

      if (!message) {
        throw new AppError('Message non trouvé', 404);
      }

      await message.destroy();

      return {
        message: 'Message supprimé avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la suppression du message:', error);
      throw error;
    }
  }

  /**
   * Récupère les rappels du patient
   */
  static async getRappels(patientId) {
    try {
      const rappels = await Rappel.findAll({
        where: { 
          patient_id: patientId,
          actif: true
        },
        order: [['date_rappel', 'ASC']],
        include: [
          {
            model: Patient,
            as: 'patient',
            attributes: ['nom', 'prenom']
          }
        ]
      });

      return rappels;
    } catch (error) {
      console.error('Erreur lors de la récupération des rappels:', error);
      throw error;
    }
  }

  /**
   * Crée un nouveau rappel
   */
  static async creerRappel(patientId, rappelData) {
    try {
      const rappel = await Rappel.create({
        patient_id: patientId,
        ...rappelData
      });

      return {
        message: 'Rappel créé avec succès',
        rappel
      };
    } catch (error) {
      console.error('Erreur lors de la création du rappel:', error);
      throw error;
    }
  }

  /**
   * Met à jour un rappel
   */
  static async updateRappel(patientId, rappelId, rappelData) {
    try {
      const rappel = await Rappel.findOne({
        where: { id: rappelId, patient_id: patientId }
      });

      if (!rappel) {
        throw new AppError('Rappel non trouvé', 404);
      }

      await rappel.update(rappelData);

      return {
        message: 'Rappel mis à jour avec succès',
        rappel
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rappel:', error);
      throw error;
    }
  }

  /**
   * Supprime un rappel
   */
  static async deleteRappel(patientId, rappelId) {
    try {
      const rappel = await Rappel.findOne({
        where: { id: rappelId, patient_id: patientId }
      });

      if (!rappel) {
        throw new AppError('Rappel non trouvé', 404);
      }

      await rappel.destroy();

      return {
        message: 'Rappel supprimé avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la suppression du rappel:', error);
      throw error;
    }
  }

  /**
   * Génère une fiche d'urgence avec QR Code
   */
  static async genererFicheUrgence(patientId) {
    try {
      const patient = await Patient.findByPk(patientId, {
        include: [
          {
            model: DossierMedical,
            as: 'dossiers'
          }
        ]
      });

      if (!patient) {
        throw new AppError('Patient non trouvé', 404);
      }

      const ficheUrgence = {
        nom: `${patient.nom} ${patient.prenom}`,
        date_naissance: patient.date_naissance,
        telephone: patient.telephone,
        personne_urgence: patient.personne_urgence,
        telephone_urgence: patient.telephone_urgence,
        groupe_sanguin: patient.dossiers?.[0]?.groupe_sanguin,
        allergies: patient.dossiers?.[0]?.allergies,
        tension_arterielle: patient.dossiers?.[0]?.blood_pressure,
        traitement_cours: patient.dossiers?.[0]?.traitements_chroniques,
        identifiant: patient.numero_assure
      };

      // Générer le QR Code
      const qrData = {
        patient_id: patientId,
        nom: patient.nom,
        prenom: patient.prenom,
        telephone: patient.telephone,
        groupe_sanguin: patient.dossiers?.[0]?.groupe_sanguin,
        allergies: patient.dossiers?.[0]?.allergies
      };

      const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));

      return {
        fiche_urgence: ficheUrgence,
        qr_code: qrCode,
        url_fiche: `${process.env.APP_URL}/dmp/urgence/${patientId}`
      };
    } catch (error) {
      console.error('Erreur lors de la génération de la fiche d\'urgence:', error);
      throw error;
    }
  }

  /**
   * Récupère les dernières activités du patient
   */
  static async getDernieresActivites(patientId, limit = 10) {
    try {
      const activites = await HistoriqueAccess.findAll({
        where: { id_patient: patientId },
        order: [['date_heure_acces', 'DESC']],
        limit
      });

      return activites;
    } catch (error) {
      console.error('Erreur lors de la récupération des dernières activités:', error);
      throw error;
    }
  }

  /**
   * Récupère les notifications récentes du patient
   */
  static async getNotificationsRecentes(patientId, limit = 5) {
    try {
      // Simuler des notifications récentes
      const notifications = [
        {
          id: 1,
          type: 'nouveau_document',
          message: 'Nouveau document ajouté à votre DMP',
          date: new Date(),
          lu: false
        },
        {
          id: 2,
          type: 'rappel_rendez_vous',
          message: 'Rappel: Rendez-vous demain à 14h',
          date: new Date(),
          lu: true
        }
      ];

      return notifications.slice(0, limit);
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      return [];
    }
  }

  /**
   * Récupère les notifications d'accès DMP pour le patient
   */
  static async getNotificationsAccesDMP(patientId, filters = {}) {
    try {
      const { limit = 20, offset = 0, type_notification, statut_envoi } = filters;

      const whereClause = { patient_id: patientId };
      
      if (type_notification) {
        whereClause.type_notification = type_notification;
      }
      
      if (statut_envoi) {
        whereClause.statut_envoi = statut_envoi;
      }

      const { NotificationAccesDMP, ProfessionnelSante } = require('../../models');
      
      const notifications = await NotificationAccesDMP.findAll({
        where: whereClause,
        include: [
          {
            model: ProfessionnelSante,
            as: 'professionnel',
            attributes: ['nom', 'prenom', 'specialite', 'numero_adeli']
          }
        ],
        order: [['date_creation', 'DESC']],
        limit,
        offset
      });

      return notifications;
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications d\'accès DMP:', error);
      throw error;
    }
  }

  /**
   * Récupère la dernière activité du patient
   */
  static async getDerniereActivite(patientId) {
    try {
      // Chercher la dernière activité parmi les consultations, prescriptions, etc.
      const derniereConsultation = await Consultation.findOne({
        where: { patient_id: patientId },
        order: [['createdAt', 'DESC']],
        attributes: ['createdAt']
      });

      const dernierePrescription = await Prescription.findOne({
        where: { patient_id: patientId },
        order: [['createdAt', 'DESC']],
        attributes: ['createdAt']
      });

      const dernierDocument = await DocumentPersonnel.findOne({
        where: { patient_id: patientId },
        order: [['createdAt', 'DESC']],
        attributes: ['createdAt']
      });

      // Trouver la date la plus récente
      const dates = [
        derniereConsultation?.createdAt,
        dernierePrescription?.createdAt,
        dernierDocument?.createdAt
      ].filter(date => date);

      if (dates.length === 0) {
        return null;
      }

      return new Date(Math.max(...dates.map(date => new Date(date))));
    } catch (error) {
      console.error('Erreur lors de la récupération de la dernière activité:', error);
      return null;
    }
  }
}

module.exports = DMPService; 