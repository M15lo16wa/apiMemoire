const { Patient, DossierMedical, Prescription, Consultation, ExamenLabo, AutorisationAcces, HistoriqueAccess, ProfessionnelSante, RendezVous } = require('../../models');
const { Op } = require('sequelize');
const AppError = require('../../utils/appError');
const QRCode = require('qrcode');

/**
 * Service pour les fonctionnalités DMP (Dossier Médical Partagé)
 */
class DMPService {
  
  /**
   * Récupère le tableau de bord personnalisé du patient
   */
  static async getTableauDeBord(patientId) {
    try {
      const patient = await Patient.findByPk(patientId, {
        include: [
          {
            model: DossierMedical,
            as: 'dossierMedical',
            attributes: ['groupe_sanguin', 'allergies', 'maladies_chroniques', 'poids', 'taille', 'tension_arterielle']
          },
          {
            model: RendezVous,
            as: 'rendezVous',
            where: {
              date_rdv: {
                [Op.gte]: new Date()
              }
            },
            order: [['date_rdv', 'ASC']],
            limit: 5,
            include: [
              {
                model: ProfessionnelSante,
                as: 'professionnel',
                attributes: ['nom', 'prenom', 'specialite']
              }
            ]
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
          groupe_sanguin: patient.dossierMedical?.groupe_sanguin,
          allergies: patient.dossierMedical?.allergies,
          maladies_chroniques: patient.dossierMedical?.maladies_chroniques
        },
        prochains_rendez_vous: patient.rendezVous || [],
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
        order: [['date_consultation', 'DESC']],
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
            attributes: ['nom', 'prenom', 'specialite', 'numero_adeli']
          }
        ],
        order: [['date_prescription', 'DESC']],
        limit,
        offset
      });

      // Récupérer les examens de laboratoire
      const examensLabo = await ExamenLabo.findAll({
        where: whereClause,
        include: [
          {
            model: ProfessionnelSante,
            as: 'prescripteur',
            attributes: ['nom', 'prenom', 'specialite']
          }
        ],
        order: [['date_examen', 'DESC']],
        limit,
        offset
      });

      return {
        consultations,
        prescriptions,
        examens_laboratoire: examensLabo
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

      if (type) {
        whereClause.type_acces = type;
      }

      const activites = await HistoriqueAccess.findAll({
        where: whereClause,
        include: [
          {
            model: ProfessionnelSante,
            as: 'professionnel',
            attributes: ['nom', 'prenom', 'specialite', 'numero_adeli']
          }
        ],
        order: [['date_acces', 'DESC']],
        limit,
        offset
      });

      return activites;
    } catch (error) {
      console.error('Erreur lors de la récupération du journal d\'activité:', error);
      throw error;
    }
  }

  /**
   * Gère les droits d'accès du patient
   */
  static async getDroitsAcces(patientId) {
    try {
      const autorisations = await AutorisationAcces.findAll({
        where: { patient_id: patientId },
        include: [
          {
            model: ProfessionnelSante,
            as: 'professionnel',
            attributes: ['id_professionnel', 'nom', 'prenom', 'specialite', 'numero_adeli', 'hopital_id']
          }
        ],
        order: [['date_autorisation', 'DESC']]
      });

      return autorisations;
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
        throw new AppError('Professionnel de santé non trouvé', 404);
      }

      // Vérifier si l'autorisation existe déjà
      const autorisationExistante = await AutorisationAcces.findOne({
        where: {
          patient_id: patientId,
          professionnel_id: professionnelId
        }
      });

      if (autorisationExistante) {
        throw new AppError('Ce professionnel a déjà accès à votre dossier', 409);
      }

      // Créer l'autorisation
      const nouvelleAutorisation = await AutorisationAcces.create({
        patient_id: patientId,
        professionnel_id: professionnelId,
        date_autorisation: new Date(),
        statut: 'active',
        permissions: JSON.stringify(permissions)
      });

      // Enregistrer l'activité
      await HistoriqueAccess.create({
        patient_id: patientId,
        professionnel_id: professionnelId,
        type_acces: 'autorisation',
        description: `Autorisation accordée à ${professionnel.nom} ${professionnel.prenom}`,
        date_acces: new Date()
      });

      return nouvelleAutorisation;
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
        throw new AppError('Aucune autorisation trouvée pour ce professionnel', 404);
      }

      // Récupérer les informations du professionnel pour le log
      const professionnel = await ProfessionnelSante.findByPk(professionnelId);

      // Supprimer l'autorisation
      await autorisation.destroy();

      // Enregistrer l'activité
      await HistoriqueAccess.create({
        patient_id: patientId,
        professionnel_id: professionnelId,
        type_acces: 'revocation',
        description: `Accès révoqué pour ${professionnel?.nom || 'Professionnel'} ${professionnel?.prenom || ''}`,
        date_acces: new Date()
      });

      return { message: 'Accès révoqué avec succès' };
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

      // Mettre à jour les informations personnelles
      const informationsPersonnelles = {
        personne_urgence: informations.personne_urgence,
        telephone_urgence: informations.telephone_urgence,
        antecedents_familiaux: informations.antecedents_familiaux,
        habitudes_vie: informations.habitudes_vie
      };

      await patient.update(informationsPersonnelles);

      return { message: 'Informations personnelles mises à jour avec succès' };
    } catch (error) {
      console.error('Erreur lors de la mise à jour des informations personnelles:', error);
      throw error;
    }
  }

  /**
   * Ajoute des auto-mesures du patient
   */
  static async ajouterAutoMesure(patientId, mesure) {
    try {
      const dossierMedical = await DossierMedical.findOne({
        where: { patient_id: patientId }
      });

      if (!dossierMedical) {
        throw new AppError('Dossier médical non trouvé', 404);
      }

      // Ajouter la mesure au dossier médical
      const autoMesures = dossierMedical.auto_mesures ? JSON.parse(dossierMedical.auto_mesures) : [];
      autoMesures.push({
        ...mesure,
        date_mesure: new Date().toISOString()
      });

      await dossierMedical.update({
        auto_mesures: JSON.stringify(autoMesures)
      });

      return { message: 'Auto-mesure ajoutée avec succès' };
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'auto-mesure:', error);
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
            as: 'dossierMedical'
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
        groupe_sanguin: patient.dossierMedical?.groupe_sanguin,
        allergies: patient.dossierMedical?.allergies,
        maladies_chroniques: patient.dossierMedical?.maladies_chroniques,
        traitement_cours: patient.dossierMedical?.traitement_cours,
        identifiant: patient.numero_assure
      };

      // Générer le QR Code
      const qrData = {
        patient_id: patientId,
        nom: patient.nom,
        prenom: patient.prenom,
        telephone: patient.telephone,
        groupe_sanguin: patient.dossierMedical?.groupe_sanguin,
        allergies: patient.dossierMedical?.allergies
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
        where: { patient_id: patientId },
        include: [
          {
            model: ProfessionnelSante,
            as: 'professionnel',
            attributes: ['nom', 'prenom', 'specialite']
          }
        ],
        order: [['date_acces', 'DESC']],
        limit
      });

      return activites;
    } catch (error) {
      console.error('Erreur lors de la récupération des dernières activités:', error);
      throw error;
    }
  }

  /**
   * Récupère les notifications récentes
   */
  static async getNotificationsRecentes(patientId, limit = 5) {
    try {
      // Simuler des notifications (à adapter selon vos besoins)
      const notifications = [
        {
          type: 'nouveau_document',
          message: 'Nouveau compte rendu disponible',
          date: new Date(),
          lu: false
        },
        {
          type: 'rendez_vous',
          message: 'Rappel: Rendez-vous demain à 14h00',
          date: new Date(),
          lu: false
        }
      ];

      return notifications;
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      throw error;
    }
  }
}

module.exports = DMPService; 