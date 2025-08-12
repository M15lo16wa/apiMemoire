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
          attributes: ['id_dossier', 'numeroDossier', 'dateCreation']
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

  // ... existing code ...

static async getPrescriptionsByPatient(patientId, filters = {}, pagination = {}) {
  try {
    console.log('🔍 Service: Récupération des prescriptions pour le patient:', patientId);
    console.log('🔍 Service: Filtres appliqués:', filters);
    console.log('🔍 Service: Pagination:', pagination);

    // Construction de la clause WHERE
    const whereClause = {
      patient_id: patientId,
      ...filters
    };

    // Suppression des valeurs undefined
    Object.keys(whereClause).forEach(key => {
      if (whereClause[key] === undefined) {
        delete whereClause[key];
      }
    });

    console.log('🔍 Service: Clause WHERE finale:', whereClause);

    // Récupération des prescriptions avec associations complètes
    const prescriptions = await Prescription.findAll({
      where: whereClause,
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['id_patient', 'nom', 'prenom', 'date_naissance', 'telephone', 'numero_dossier']
        },
        {
          model: ProfessionnelSante,
          as: 'redacteur',
          attributes: ['id_professionnel', 'numero_adeli', 'specialite', 'statut', 'nom', 'prenom', 'email', 'telephone', 'telephone_portable', 'role']
        },
        {
          model: DossierMedical,
          as: 'dossier',
          attributes: ['id_dossier', 'numeroDossier', 'dateCreation', 'statut'],
          required: false
        }
      ],
      order: [['date_prescription', 'DESC']],
      limit: pagination.limit || 10,
      offset: ((pagination.page || 1) - 1) * (pagination.limit || 10)
    });

    // Comptage total pour la pagination
    const total = await Prescription.count({ where: whereClause });

    // Calcul des informations de pagination
    const totalPages = Math.ceil(total / (pagination.limit || 10));
    const currentPage = pagination.page || 1;

    console.log('✅ Service: Prescriptions récupérées avec succès:', prescriptions.length);
    console.log(' Service: Total des prescriptions:', total);
    console.log('📄 Service: Page actuelle:', currentPage, '/', totalPages);

    // Formatage des données pour une meilleure lisibilité
    const prescriptionsFormatees = prescriptions.map(prescription => {
      const prescriptionData = prescription.toJSON();
      
      // Amélioration de l'objet redacteur
      if (prescriptionData.redacteur) {
        prescriptionData.redacteur = {
          id_professionnel: prescriptionData.redacteur.id_professionnel,
          numero_adeli: prescriptionData.redacteur.numero_adeli,
          specialite: prescriptionData.redacteur.specialite,
          statut: prescriptionData.redacteur.statut,
          // Informations complètes du professionnel (directement depuis le modèle)
          nom_complet: `${prescriptionData.redacteur.prenom || ''} ${prescriptionData.redacteur.nom || ''}`.trim() || 'Professionnel non identifié',
          nom: prescriptionData.redacteur.nom || 'Non renseigné',
          prenom: prescriptionData.redacteur.prenom || 'Non renseigné',
          email: prescriptionData.redacteur.email || 'Non renseigné',
          telephone: prescriptionData.redacteur.telephone || prescriptionData.redacteur.telephone_portable || 'Non disponible',
          role: prescriptionData.redacteur.role || 'Non renseigné',
          // Informations de contact formatées
          contact: {
            email: prescriptionData.redacteur.email || 'Non renseigné',
            telephone: prescriptionData.redacteur.telephone || prescriptionData.redacteur.telephone_portable || 'Non disponible',
            telephone_portable: prescriptionData.redacteur.telephone_portable || 'Non disponible'
          },
          // Informations professionnelles
          profession: {
            numero_adeli: prescriptionData.redacteur.numero_adeli,
            specialite: prescriptionData.redacteur.specialite,
            statut: prescriptionData.redacteur.statut,
            role: prescriptionData.redacteur.role
          }
        };
      }

      // Amélioration de l'objet patient
      if (prescriptionData.patient) {
        prescriptionData.patient = {
          id_patient: prescriptionData.patient.id_patient,
          nom: prescriptionData.patient.nom,
          prenom: prescriptionData.patient.prenom,
          nom_complet: `${prescriptionData.patient.prenom || ''} ${prescriptionData.patient.nom || ''}`.trim(),
          date_naissance: prescriptionData.patient.date_naissance,
          telephone: prescriptionData.patient.telephone,
          numero_dossier: prescriptionData.patient.numero_dossier
        };
      }

      // Ajout d'informations calculées
      prescriptionData.informations_supplementaires = {
        age_prescription: prescriptionData.date_prescription 
          ? Math.floor((new Date() - new Date(prescriptionData.date_prescription)) / (1000 * 60 * 60 * 24 * 365.25))
          : null,
        statut_lisible: 
        prescriptionData.statut === 'active' ? 'Active' : 
        prescriptionData.statut === 'suspendue' ? 'Suspendue' :
        prescriptionData.statut === 'terminee' ? 'Terminée' :
        prescriptionData.statut === 'annulee' ? 'Annulée' :
        prescriptionData.statut === 'en_attente' ? 'En attente' : prescriptionData.statut,
        type_lisible: 
        prescriptionData.type_prescription === 'ordonnance' ? 'Ordonnance' :
        prescriptionData.type_prescription === 'examen' ? 'Examen' : prescriptionData.type_prescription
      };

      return prescriptionData;
    });

    return {
      prescriptions: prescriptionsFormatees,
      total: total,
      pagination: {
        page: currentPage,
        limit: pagination.limit || 10,
        totalPages: totalPages,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1,
        totalElements: total
      },
      metadata: {
        patient_id: patientId,
        filters_appliques: filters,
        date_requete: new Date().toISOString(),
        version_api: '2.0'
      }
    };

  } catch (error) {
    console.error('❌ Service: Erreur lors de la récupération des prescriptions:', error);
    throw new AppError('Impossible de récupérer les prescriptions du patient', 500);
  }
}

// ... existing code ...

  // static async getPrescriptionsByPatient(patientId, filters = {}, pagination = {}) {
  //   try {
  //     const { page = 1, limit = 10 } = pagination;
  //     const offset = (page - 1) * limit;

  //     const whereClause = { patient_id: patientId };
      
  //     // Application des filtres
  //     if (filters.statut){
  //       whereClause.statut = filters.statut;
  //     }
  //     if (filters.type_prescription){
  //       whereClause.type_prescription = filters.type_prescription;
  //     }
  //     if (filters.date_debut && filters.date_fin) {
  //       whereClause.date_prescription = {
  //         [Op.between]: [filters.date_debut, filters.date_fin]
  //       };
  //     }

  //     const includeOptions = [
  //       {
  //         model: ProfessionnelSante,
  //         as: 'redacteur',
  //         attributes: ['id_professionnel', 'numero_adeli', 'specialite'],
  //         include: [{
  //           model: Utilisateur,
  //           as: 'compteUtilisateur',
  //           attributes: ['nom', 'prenom']
  //         }]
  //       }
  //     ];

  //     const { count, rows } = await Prescription.findAndCountAll({
  //       where: whereClause,
  //       include: includeOptions,
  //       order: [['date_prescription', 'DESC']],
  //       limit: parseInt(limit),
  //       offset: parseInt(offset)
  //     });

  //     return {
  //       prescriptions: rows,
  //       pagination: {
  //         total: count,
  //         page: parseInt(page),
  //         limit: parseInt(limit),
  //         totalPages: Math.ceil(count / limit),
  //         hasNext: page * limit < count,
  //         hasPrev: page > 1
  //       }
  //     };
  //   } catch (error) {
  //     console.error('❌ Erreur lors de la récupération des prescriptions du patient:', error);
  //     throw new AppError('Impossible de récupérer les prescriptions du patient', 500);
  //   }
  // }

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

  /**
   * Récupérer les prescriptions les plus récentes (ordonnances et examens)
   * @param {Object} filters - Filtres incluant limit, type, professionnel_id
   * @returns {Promise<Object>} Prescriptions récentes triées par date
   */
  static async getOrdonnancesRecentes(filters = {}) {
    try {
      const { 
        limit = 10, 
        type = 'tous', 
        professionnel_id = null,
        patient_id = null
      } = filters;

      // Construire la clause WHERE
      const whereClause = {};
      
      // Filtrer par type si spécifié
      if (type !== 'tous') {
        whereClause.type_prescription = type;
      }
      
      // Filtrer par professionnel si spécifié
      if (professionnel_id) {
        whereClause.professionnel_id = professionnel_id;
      }
      // Si aucun professionnel n'est spécifié, on récupère toutes les prescriptions
      
      // Filtrer par patient si spécifié
      if (patient_id) {
        whereClause.patient_id = patient_id;
      }

      // Récupérer les prescriptions les plus récentes
      const prescriptions = await Prescription.findAll({
        where: whereClause,
        include: [
          {
            model: Patient,
            as: 'patient',
            attributes: ['id_patient', 'nom', 'prenom', 'date_naissance', 'telephone']
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
          },
          {
            model: DossierMedical,
            as: 'dossier',
            attributes: ['id_dossier', 'numeroDossier', 'dateCreation']
          }
        ],
        order: [['date_prescription', 'DESC']],
        limit: parseInt(limit)
      });

      // Compter le total pour la pagination
      const total = await Prescription.count({ where: whereClause });

      return {
        prescriptions: prescriptions,
        total: total,
        limit: parseInt(limit),
        type: type,
        periode: {
          dateDebut: prescriptions.length > 0 ? prescriptions[prescriptions.length - 1].date_prescription : null,
          dateFin: prescriptions.length > 0 ? prescriptions[0].date_prescription : null
        }
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des prescriptions récentes:', error);
      throw new AppError('Impossible de récupérer les prescriptions récentes', 500);
    }
  }

  /**
   * Ajouter une prescription au dossier médical du patient
   * @param {number} prescriptionId - ID de la prescription
   * @param {number} dossierId - ID du dossier médical
   * @returns {Promise<Object>} Prescription mise à jour
   */
  static async ajouterAuDossierPatient(prescriptionId, dossierId) {
    try {
      // Vérifier que la prescription existe
      const prescription = await Prescription.findByPk(prescriptionId);
      if (!prescription) {
        throw new AppError('Prescription non trouvée', 404);
      }

      // Vérifier que le dossier médical existe
      const dossier = await DossierMedical.findByPk(dossierId);
      if (!dossier) {
        throw new AppError('Dossier médical non trouvé', 404);
      }

      // Vérifier que le dossier appartient au patient de la prescription
      if (dossier.patient_id !== prescription.patient_id) {
        throw new AppError('Le dossier médical ne correspond pas au patient de la prescription', 400);
      }

      // Mettre à jour la prescription avec le dossier
      await prescription.update({
        dossier_id: dossierId,
        date_ajout_dossier: new Date()
      });

      // Retourner la prescription mise à jour avec ses relations
      return await this.getPrescriptionById(prescriptionId);
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout au dossier patient:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Impossible d\'ajouter la prescription au dossier patient', 500);
    }
  }

  /**
   * Créer une notification pour le patient
   * @param {number} prescriptionId - ID de la prescription
   * @param {string} typeNotification - Type de notification
   * @param {Object} options - Options de notification
   * @returns {Promise<Object>} Notification créée
   */
  static async creerNotificationPatient(prescriptionId, typeNotification = 'nouvelle_prescription', options = {}) {
    try {
      const prescription = await this.getPrescriptionById(prescriptionId);
      if (!prescription) {
        throw new AppError('Prescription non trouvée', 404);
      }

      const notificationData = {
        patient_id: prescription.patient_id,
        prescription_id: prescriptionId,
        type: typeNotification,
        titre: this.getTitreNotification(typeNotification, prescription),
        message: this.getMessageNotification(typeNotification, prescription),
        statut: 'non_lue',
        date_creation: new Date(),
        ...options
      };

      // Ici, vous devriez avoir un modèle Notification
      // Pour l'instant, on simule la création
      const notification = {
        id: Date.now(),
        ...notificationData,
        prescription: prescription
      };

      console.log('📧 Notification créée:', notification);

      return notification;
    } catch (error) {
      console.error('❌ Erreur lors de la création de la notification:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Impossible de créer la notification', 500);
    }
  }

  /**
   * Générer le titre de la notification
   * @param {string} type - Type de notification
   * @param {Object} prescription - Prescription concernée
   * @returns {string} Titre de la notification
   */
  static getTitreNotification(type, prescription) {
    const patient = prescription.patient;
    const nomPatient = `${patient.prenom} ${patient.nom}`;
    
    switch (type) {
      case 'nouvelle_prescription':
        return `Nouvelle ordonnance créée pour ${nomPatient}`;
      case 'renouvellement':
        return `Ordonnance renouvelée pour ${nomPatient}`;
      case 'suspension':
        return `Ordonnance suspendue pour ${nomPatient}`;
      case 'modification':
        return `Ordonnance modifiée pour ${nomPatient}`;
      default:
        return `Mise à jour prescription pour ${nomPatient}`;
    }
  }

  /**
   * Générer le message de la notification
   * @param {string} type - Type de notification
   * @param {Object} prescription - Prescription concernée
   * @returns {string} Message de la notification
   */
  static getMessageNotification(type, prescription) {
    const patient = prescription.patient;
    const nomPatient = `${patient.prenom} ${patient.nom}`;
    const numeroPrescription = prescription.prescriptionNumber;
    const principeActif = prescription.principe_actif;
    
    switch (type) {
      case 'nouvelle_prescription':
        return `Une nouvelle ordonnance (${numeroPrescription}) a été créée pour ${nomPatient} avec ${principeActif}. Veuillez consulter votre dossier médical.`;
      case 'renouvellement':
        return `L'ordonnance ${numeroPrescription} pour ${nomPatient} a été renouvelée.`;
      case 'suspension':
        return `L'ordonnance ${numeroPrescription} pour ${nomPatient} a été suspendue. Veuillez contacter votre médecin.`;
      case 'modification':
        return `L'ordonnance ${numeroPrescription} pour ${nomPatient} a été modifiée.`;
      default:
        return `Mise à jour de l'ordonnance ${numeroPrescription} pour ${nomPatient}.`;
    }
  }

  /**
   * Marquer une notification comme lue
   * @param {number} notificationId - ID de la notification
   * @returns {Promise<Object>} Notification mise à jour
   */
  static async marquerNotificationLue(notificationId) {
    try {
      // Simulation de mise à jour de notification
      const notification = {
        id: notificationId,
        statut: 'lue',
        date_lecture: new Date()
      };

      console.log('✅ Notification marquée comme lue:', notification);
      return notification;
    } catch (error) {
      console.error('❌ Erreur lors du marquage de la notification:', error);
      throw new AppError('Impossible de marquer la notification comme lue', 500);
    }
  }

  /**
   * Récupérer les notifications d'un patient
   * @param {number} patientId - ID du patient
   * @param {Object} options - Options de pagination et filtres
   * @returns {Promise<Object>} Notifications avec métadonnées
   */
  static async getNotificationsPatient(patientId, options = {}) {
    try {
      const { page = 1, limit = 10, statut } = options;
      const offset = (page - 1) * limit;

      // Simulation de récupération des notifications
      const notifications = [
        {
          id: 1,
          patient_id: patientId,
          prescription_id: 1,
          type: 'nouvelle_prescription',
          titre: 'Nouvelle ordonnance créée',
          message: 'Une nouvelle ordonnance a été créée pour vous.',
          statut: 'non_lue',
          date_creation: new Date()
        }
      ];

      const count = notifications.length;

      return {
        notifications: notifications.slice(offset, offset + limit),
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
      console.error('❌ Erreur lors de la récupération des notifications:', error);
      throw new AppError('Impossible de récupérer les notifications', 500);
    }
  }

  /**
   * Créer une ordonnance complète avec notification
   * @param {Object} prescriptionData - Données de la prescription
   * @param {Object} professionnelData - Données du professionnel
   * @param {Object} options - Options supplémentaires
   * @returns {Promise<Object>} Ordonnance créée avec notification
   */
  static async createOrdonnanceComplete(prescriptionData, professionnelData, options = {}) {
    try {
      // Créer l'ordonnance
      const ordonnance = await this.createOrdonnance(prescriptionData, professionnelData);

      // Ajouter au dossier patient si spécifié
      if (options.dossier_id) {
        await this.ajouterAuDossierPatient(ordonnance.id_prescription, options.dossier_id);
      }

      // Créer une notification pour le patient
      const notification = await this.creerNotificationPatient(
        ordonnance.id_prescription,
        'nouvelle_prescription',
        {
          priorite: options.priorite || 'normale',
          canal: options.canal || 'application'
        }
      );

      return {
        ordonnance,
        notification,
        message: 'Ordonnance créée avec succès et notification envoyée au patient'
      };
    } catch (error) {
      console.error('❌ Erreur lors de la création complète de l\'ordonnance:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Impossible de créer l\'ordonnance complète', 500);
    }
  }
}

module.exports = PrescriptionService;