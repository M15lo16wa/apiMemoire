const { Prescription, Patient, ProfessionnelSante, DossierMedical, Utilisateur } = require('../../models');
const { Op } = require('sequelize');
const AppError = require('../../utils/appError');
const PrescriptionUtils = require('../../utils/prescriptionUtils');

/**
 * Service modernisé pour la gestion des prescriptions
 */
class PrescriptionService {
  /**
   * Créer une nouvelle ordonnance avec génération automatique
   * @param {Object} prescriptionData - Données de la prescription
   * @param {Object} professionnelData - Données du professionnel prescripteur
   * @returns {Promise<Object>} Ordonnance créée avec toutes ses relations
   */
  static async createOrdonnance(prescriptionData, professionnelData) {
    try {
      // Validation des données requises
      const { patient_id, professionnel_id, principe_actif, dosage, frequence } = prescriptionData;
      
      if (!patient_id || !professionnel_id || !principe_actif || !dosage || !frequence) {
        throw new AppError('Données manquantes pour créer l\'ordonnance', 400);
      }

      // Vérifications d'existence en parallèle pour optimiser les performances
      const [patient, professionnel] = await Promise.all([
        Patient.findByPk(patient_id, {
          attributes: ['id_patient', 'nom', 'prenom', 'date_naissance']
        }),
        ProfessionnelSante.findByPk(professionnel_id, {
          attributes: ['id_professionnel', 'numero_adeli', 'specialite'],
          include: [{
            model: Utilisateur,
            as: 'compteUtilisateur',
            attributes: ['nom', 'prenom']
          }]
        })
      ]);

      if (!patient) {
        throw new AppError('Patient non trouvé', 404);
      }
      if (!professionnel) {
        throw new AppError('Professionnel de santé non trouvé', 404);
      }

      // Vérifier le dossier médical si fourni
      let dossierMedical = null;
      if (prescriptionData.dossier_id) {
        dossierMedical = await DossierMedical.findOne({
          where: {
            id_dossier: prescriptionData.dossier_id,
            patient_id: patient_id
          }
        });
        
        if (!dossierMedical) {
          throw new AppError('Dossier médical non trouvé ou non associé à ce patient', 404);
        }
      }

      // Génération de la signature électronique
      const signatureElectronique = PrescriptionUtils.generateElectronicSignature(
        prescriptionData, 
        professionnel
      );

      // Préparation des données pour la création
      const ordonnanceData = {
        ...prescriptionData,
        type_prescription: 'ordonnance',
        statut: prescriptionData.statut || 'active',
        signatureElectronique,
        date_prescription: prescriptionData.date_prescription || new Date(),
        // Les hooks du modèle se chargeront de générer prescriptionNumber et qrCode
      };

      // Création avec hooks automatiques
      const nouvelleOrdonnance = await Prescription.create(ordonnanceData);

      // Retourner l'ordonnance avec toutes ses relations
      return await this.getPrescriptionById(nouvelleOrdonnance.id_prescription);

    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'ordonnance:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Impossible de créer l\'ordonnance', 500);
    }
  }

  /**
   * Créer une demande d'examen avec génération automatique
   * @param {Object} demandeData - Données de la demande d'examen
   * @param {Object} professionnelData - Données du professionnel prescripteur
   * @returns {Promise<Object>} Demande d'examen créée avec toutes ses relations
   */
  static async createDemandeExamen(demandeData, professionnelData) {
    try {
      const { patient_id, professionnel_id, type_examen, parametres } = demandeData;
      
      if (!patient_id || !professionnel_id || !type_examen) {
        throw new AppError('Données manquantes pour créer la demande d\'examen', 400);
      }

      // Vérifications d'existence
      const [patient, professionnel] = await Promise.all([
        Patient.findByPk(patient_id, {
          attributes: ['id_patient', 'nom', 'prenom', 'date_naissance']
        }),
        ProfessionnelSante.findByPk(professionnel_id, {
          attributes: ['id_professionnel', 'numero_adeli', 'specialite'],
          include: [{
            model: Utilisateur,
            as: 'compteUtilisateur',
            attributes: ['nom', 'prenom']
          }]
        })
      ]);

      if (!patient) {
        throw new AppError('Patient non trouvé', 404);
      }
      if (!professionnel) {
        throw new AppError('Professionnel de santé non trouvé', 404);
      }

      // Vérifier le dossier médical si fourni
      if (demandeData.dossier_id) {
        const dossierMedical = await DossierMedical.findOne({
          where: {
            id_dossier: demandeData.dossier_id,
            patient_id: patient_id
          }
        });
        
        if (!dossierMedical) {
          throw new AppError('Dossier médical non trouvé ou non associé à ce patient', 404);
        }
      }

      // Génération de la signature électronique
      const signatureElectronique = PrescriptionUtils.generateElectronicSignature(
        demandeData, 
        professionnel
      );

      // Préparation des données pour la création
      const examenData = {
        ...demandeData,
        type_prescription: 'examen',
        principe_actif: type_examen, // Utiliser ce champ pour le type d'examen
        dosage: parametres || 'Standard',
        frequence: demandeData.urgence || demandeData.frequence || 'Normal',
        statut: 'en_attente',
        signatureElectronique,
        date_prescription: demandeData.date_prescription || new Date(),
      };

      // Création avec hooks automatiques
      const nouvelleDemande = await Prescription.create(examenData);

      // Retourner la demande avec toutes ses relations
      return await this.getPrescriptionById(nouvelleDemande.id_prescription);

    } catch (error) {
      console.error('❌ Erreur lors de la création de la demande d\'examen:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Impossible de créer la demande d\'examen', 500);
    }
  }

  /**
   * Récupérer une prescription par son ID avec toutes ses relations
   * @param {number} id - ID de la prescription
   * @returns {Promise<Object>} Prescription avec relations
   */
  static async getPrescriptionById(id) {
    try {
      const prescription = await Prescription.findByPk(id, {
        include: [
          {
            model: Patient,
            as: 'patient',
            attributes: ['id_patient', 'nom', 'prenom', 'date_naissance', 'telephone', 'email']
          },
          {
            model: ProfessionnelSante,
            as: 'redacteur',
            attributes: ['id_professionnel', 'numero_adeli', 'specialite', 'telephone'],
            include: [{
              model: Utilisateur,
              as: 'compteUtilisateur',
              attributes: ['nom', 'prenom', 'email']
            }]
          },
          {
            model: DossierMedical,
            as: 'dossier',
            attributes: ['id_dossier', 'numero_dossier', 'date_creation']
          }
        ]
      });

      if (!prescription) {
        throw new AppError('Prescription non trouvée', 404);
      }

      return prescription;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la prescription:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Impossible de récupérer la prescription', 500);
    }
  }

  /**
   * Récupérer les prescriptions d'un patient avec filtres et pagination
   * @param {number} patientId - ID du patient
   * @param {Object} filters - Filtres de recherche
   * @param {Object} pagination - Options de pagination
   * @returns {Promise<Object>} Prescriptions avec métadonnées
   */
  static async getPrescriptionsByPatient(patientId, filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 10 } = pagination;
      const offset = (page - 1) * limit;

      const whereClause = { patient_id: patientId };
      
      // Application des filtres
      if (filters.statut) whereClause.statut = filters.statut;
      if (filters.type_prescription) whereClause.type_prescription = filters.type_prescription;
      if (filters.date_debut && filters.date_fin) {
        whereClause.date_prescription = {
          [Op.between]: [filters.date_debut, filters.date_fin]
        };
      }

      const includeOptions = [
        {
          model: ProfessionnelSante,
          as: 'redacteur',
          attributes: ['id_professionnel', 'numero_adeli', 'specialite'],
          include: [{
            model: Utilisateur,
            as: 'compteUtilisateur',
            attributes: ['nom', 'prenom']
          }]
        }
      ];

      const { count, rows } = await Prescription.findAndCountAll({
        where: whereClause,
        include: includeOptions,
        order: [['date_prescription', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return {
        prescriptions: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
          hasNext: page * limit < count,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des prescriptions du patient:', error);
      throw new AppError('Impossible de récupérer les prescriptions du patient', 500);
    }
  }

  /**
   * Recherche avancée de prescriptions
   * @param {Object} filters - Filtres de recherche
   * @param {Object} pagination - Options de pagination
   * @returns {Promise<Object>} Résultats de recherche avec métadonnées
   */
  static async searchPrescriptions(filters = {}, pagination = {}) {
    try {
      const {
        patient_id,
        professionnel_id,
        statut,
        type_prescription,
        date_debut,
        date_fin,
        search_term,
        principe_actif,
        nom_commercial
      } = filters;

      const { page = 1, limit = 10 } = pagination;
      const offset = (page - 1) * limit;

      const whereClause = {};
      
      // Filtres directs
      if (patient_id) whereClause.patient_id = patient_id;
      if (professionnel_id) whereClause.professionnel_id = professionnel_id;
      if (statut) whereClause.statut = statut;
      if (type_prescription) whereClause.type_prescription = type_prescription;
      if (principe_actif) whereClause.principe_actif = { [Op.like]: `%${principe_actif}%` };
      if (nom_commercial) whereClause.nom_commercial = { [Op.like]: `%${nom_commercial}%` };
      
      // Filtre par période
      if (date_debut && date_fin) {
        whereClause.date_prescription = {
          [Op.between]: [date_debut, date_fin]
        };
      }

      // Recherche textuelle
      if (search_term) {
        whereClause[Op.or] = [
          { prescriptionNumber: { [Op.like]: `%${search_term}%` } },
          { principe_actif: { [Op.like]: `%${search_term}%` } },
          { nom_commercial: { [Op.like]: `%${search_term}%` } },
          { dosage: { [Op.like]: `%${search_term}%` } }
        ];
      }

      const { count, rows } = await Prescription.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Patient,
            as: 'patient',
            attributes: ['id_patient', 'nom', 'prenom']
          },
          {
            model: ProfessionnelSante,
            as: 'redacteur',
            attributes: ['id_professionnel', 'numero_adeli', 'specialite'],
            include: [{
              model: Utilisateur,
              as: 'compteUtilisateur',
              attributes: ['nom', 'prenom']
            }]
          }
        ],
        order: [['date_prescription', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return {
        prescriptions: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
          hasNext: page * limit < count,
          hasPrev: page > 1
        },
        filters: filters // Retourner les filtres appliqués
      };
    } catch (error) {
      console.error('❌ Erreur lors de la recherche de prescriptions:', error);
      throw new AppError('Impossible d\'effectuer la recherche', 500);
    }
  }

  /**
   * Mettre à jour une prescription
   * @param {number} id - ID de la prescription
   * @param {Object} updateData - Données à mettre à jour
   * @returns {Promise<Object>} Prescription mise à jour
   */
  static async updatePrescription(id, updateData) {
    try {
      const prescription = await Prescription.findByPk(id);
      if (!prescription) {
        throw new AppError('Prescription non trouvée', 404);
      }

      // Vérifier que la prescription peut être modifiée
      if (prescription.statut === 'terminee' || prescription.statut === 'annulee') {
        throw new AppError('Impossible de modifier une prescription terminée ou annulée', 400);
      }

      // Mise à jour avec hooks automatiques
      await prescription.update(updateData);
      
      // Retourner la prescription mise à jour avec ses relations
      return await this.getPrescriptionById(id);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de la prescription:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Impossible de mettre à jour la prescription', 500);
    }
  }

  /**
   * Supprimer une prescription (soft delete)
   * @param {number} id - ID de la prescription
   * @returns {Promise<boolean>} Succès de la suppression
   */
  static async deletePrescription(id) {
    try {
      const prescription = await Prescription.findByPk(id);
      if (!prescription) {
        throw new AppError('Prescription non trouvée', 404);
      }

      // Vérifier que la prescription peut être supprimée
      if (prescription.statut === 'active') {
        throw new AppError('Impossible de supprimer une prescription active. Veuillez d\'abord la suspendre.', 400);
      }

      const result = await prescription.destroy();
      return result > 0;
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de la prescription:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Impossible de supprimer la prescription', 500);
    }
  }

  /**
   * Renouveler une prescription
   * @param {number} id - ID de la prescription
   * @param {Object} renouvellementData - Données du renouvellement
   * @returns {Promise<Object>} Prescription renouvelée
   */
  static async renouvelerPrescription(id, renouvellementData) {
    try {
      const prescription = await Prescription.findByPk(id);
      if (!prescription) {
        throw new AppError('Prescription non trouvée', 404);
      }

      // Vérifications pour le renouvellement
      if (!prescription.renouvelable) {
        throw new AppError('Cette prescription n\'est pas renouvelable', 400);
      }

      if (prescription.statut !== 'active') {
        throw new AppError('Seules les prescriptions actives peuvent être renouvelées', 400);
      }

      if (prescription.renouvellements_effectues >= prescription.nb_renouvellements) {
        throw new AppError('Nombre maximum de renouvellements atteint', 400);
      }

      // Mise à jour avec les données de renouvellement
      const updateData = {
        renouvellements_effectues: prescription.renouvellements_effectues + 1,
        date_dernier_renouvellement: new Date(),
        ...renouvellementData
      };

      await prescription.update(updateData);
      
      return await this.getPrescriptionById(id);
    } catch (error) {
      console.error('❌ Erreur lors du renouvellement de la prescription:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Impossible de renouveler la prescription', 500);
    }
  }

  /**
   * Suspendre une prescription
   * @param {number} id - ID de la prescription
   * @param {Object} suspensionData - Données de suspension
   * @returns {Promise<Object>} Prescription suspendue
   */
  static async suspendrePrescription(id, suspensionData) {
    try {
      const prescription = await Prescription.findByPk(id);
      if (!prescription) {
        throw new AppError('Prescription non trouvée', 404);
      }

      if (prescription.statut !== 'active') {
        throw new AppError('Seules les prescriptions actives peuvent être suspendues', 400);
      }

      // Mise à jour avec les données de suspension
      const updateData = {
        statut: 'suspendue',
        date_arret: new Date(),
        ...suspensionData
      };

      await prescription.update(updateData);
      
      return await this.getPrescriptionById(id);
    } catch (error) {
      console.error('❌ Erreur lors de la suspension de la prescription:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Impossible de suspendre la prescription', 500);
    }
  }

  /**
   * Transférer une prescription à un autre patient
   * @param {number} id - ID de la prescription
   * @param {number} patientId - ID du patient destinataire
   * @param {number} userId - ID de l'utilisateur effectuant le transfert
   * @returns {Promise<Object>} Prescription transférée
   */
  static async transfererPrescription(id, patientId, userId) {
    try {
      // Vérifier que la prescription existe
      const prescription = await Prescription.findByPk(id);
      if (!prescription) {
        throw new AppError('Prescription non trouvée', 404);
      }

      // Vérifier que le patient destinataire existe
      const patient = await Patient.findByPk(patientId);
      if (!patient) {
        throw new AppError('Patient destinataire non trouvé', 404);
      }

      // Récupérer le dossier médical du patient destinataire
      const dossierMedical = await DossierMedical.findOne({
        where: { patient_id: patientId }
      });
      
      if (!dossierMedical) {
        throw new AppError('Dossier médical du patient destinataire non trouvé', 404);
      }

      // Mettre à jour la prescription
      await prescription.update({ 
        patient_id: patientId,
        dossier_id: dossierMedical.id_dossier,
        updatedBy: userId
      });

      // Retourner la prescription mise à jour avec les nouvelles relations
      return await this.getPrescriptionById(id);

    } catch (error) {
      console.error('❌ Erreur lors du transfert de la prescription:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Impossible de transférer la prescription', 500);
    }
  }

  /**
   * Récupérer les prescriptions actives d'un patient
   * @param {number} patientId - ID du patient
   * @returns {Promise<Array>} Prescriptions actives
   */
  static async getPrescriptionsActives(patientId) {
    try {
      const prescriptions = await Prescription.findAll({
        where: {
          patient_id: patientId,
          statut: 'active'
        },
        include: [
          {
            model: ProfessionnelSante,
            as: 'redacteur',
            attributes: ['id_professionnel', 'numero_adeli', 'specialite'],
            include: [{
              model: Utilisateur,
              as: 'compteUtilisateur',
              attributes: ['nom', 'prenom']
            }]
          }
        ],
        order: [['date_prescription', 'DESC']]
      });

      return prescriptions;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des prescriptions actives:', error);
      throw new AppError('Impossible de récupérer les prescriptions actives', 500);
    }
  }

  /**
   * Générer un rapport de prescription
   * @param {number} id - ID de la prescription
   * @returns {Promise<Object>} Rapport formaté
   */
  static async generatePrescriptionReport(id) {
    try {
      const prescription = await this.getPrescriptionById(id);
      return PrescriptionUtils.generatePrescriptionReport(prescription);
    } catch (error) {
      console.error('❌ Erreur lors de la génération du rapport:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Impossible de générer le rapport', 500);
    }
  }

  /**
   * Calculer les statistiques de prescription pour un professionnel
   * @param {number} professionnelId - ID du professionnel
   * @param {Object} periode - Période de calcul
   * @returns {Promise<Object>} Statistiques
   */
  static async calculateStats(professionnelId, periode = {}) {
    try {
      return await PrescriptionUtils.calculatePrescriptionStats(professionnelId, periode);
    } catch (error) {
      console.error('❌ Erreur lors du calcul des statistiques:', error);
      throw new AppError('Impossible de calculer les statistiques', 500);
    }
  }
}

module.exports = PrescriptionService;