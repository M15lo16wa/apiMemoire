const PrescriptionService = require('./prescription.service');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const { validationResult } = require('express-validator');

/**
 * Contrôleur modernisé pour la gestion des prescriptions
 */
class PrescriptionController {
  /**
   * Créer une nouvelle ordonnance
   */
  static createOrdonnance = catchAsync(async (req, res, next) => {
    // Validation des erreurs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Données de validation invalides',
        errors: errors.array()
      });
    }

    // Vérification de l'authentification professionnel
    const professionnel_id = req.user?.id_professionnel;
    if (!professionnel_id) {
      return next(new AppError('Accès non autorisé. Connexion professionnel requise.', 401));
    }

    // Injection automatique du patient_id à partir du dossier si nécessaire
    let patient_id = req.body.patient_id;
    if (!patient_id && req.body.dossier_id) {
      const { DossierMedical } = require('../../models');
      const dossier = await DossierMedical.findByPk(req.body.dossier_id);
      if (!dossier) {
        return next(new AppError('Dossier médical introuvable pour déterminer le patient.', 404));
      }
      patient_id = dossier.patient_id;
    }

    if (!patient_id) {
      return next(new AppError('Impossible de déterminer le patient lié à la prescription.', 400));
    }

    // Préparation des données de l'ordonnance
    const ordonnanceData = {
      ...req.body,
      patient_id,
      professionnel_id,
      createdBy: req.user.id
    };

    // Création de l'ordonnance via le service
    const nouvelleOrdonnance = await PrescriptionService.createOrdonnance(
      ordonnanceData,
      req.user
    );

    res.status(201).json({
      status: 'success',
      message: 'Ordonnance créée avec succès',
      data: {
        ordonnance: nouvelleOrdonnance,
        numero: nouvelleOrdonnance.prescriptionNumber,
        qrCode: nouvelleOrdonnance.qrCode
      }
    });
  });

  /**
   * Créer une demande d'examen
   */
  static createDemandeExamen = catchAsync(async (req, res, next) => {
    // Validation des erreurs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Données de validation invalides',
        errors: errors.array()
      });
    }

    // Vérification de l'authentification professionnel
    const professionnel_id = req.user?.id_professionnel;
    if (!professionnel_id) {
      return next(new AppError('Accès non autorisé. Connexion professionnel requise.', 401));
    }

    // Injection automatique du patient_id à partir du dossier si nécessaire
    let patient_id = req.body.patient_id;
    if (!patient_id && req.body.dossier_id) {
      const { DossierMedical } = require('../../models');
      const dossier = await DossierMedical.findByPk(req.body.dossier_id);
      if (!dossier) {
        return next(new AppError('Dossier médical introuvable pour déterminer le patient.', 404));
      }
      patient_id = dossier.patient_id;
    }

    if (!patient_id) {
      return next(new AppError('Impossible de déterminer le patient lié à la demande d\'examen.', 400));
    }

    // Préparation des données de la demande d'examen
    const demandeData = {
      ...req.body,
      patient_id,
      professionnel_id,
      createdBy: req.user.id
    };

    // Création de la demande d'examen via le service
    const nouvelleDemande = await PrescriptionService.createDemandeExamen(
      demandeData,
      req.user
    );

    res.status(201).json({
      status: 'success',
      message: 'Demande d\'examen créée avec succès',
      data: {
        demande: nouvelleDemande,
        numero: nouvelleDemande.prescriptionNumber,
        qrCode: nouvelleDemande.qrCode
      }
    });
  });

  /**
   * Récupérer toutes les prescriptions d'un patient avec pagination
   */
  static getPrescriptionsByPatient = catchAsync(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Paramètres de requête invalides',
        errors: errors.array()
      });
    }

    const { patient_id } = req.params;
    const { statut, type_prescription, page = 1, limit = 10 } = req.query;
    
    // Construction des filtres
    const filters = {};
    if (statut) filters.statut = statut;
    if (type_prescription) filters.type_prescription = type_prescription;

    // Options de pagination
    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit)
    };
    
    const result = await PrescriptionService.getPrescriptionsByPatient(
      parseInt(patient_id), 
      filters, 
      pagination
    );
    
    res.status(200).json({
      status: 'success',
      message: `${result.prescriptions.length} prescription(s) trouvée(s)`,
      data: result
    });
  });

  /**
   * Récupérer une prescription par son ID
   */
  static getPrescriptionById = catchAsync(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'ID de prescription invalide',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    
    const prescription = await PrescriptionService.getPrescriptionById(parseInt(id));
    
    res.status(200).json({
      status: 'success',
      data: {
        prescription
      }
    });
  });

  /**
   * Recherche avancée de prescriptions
   */
  static searchPrescriptions = catchAsync(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Paramètres de recherche invalides',
        errors: errors.array()
      });
    }

    // Extraction des filtres de recherche
    const filters = {
      patient_id: req.query.patient_id ? parseInt(req.query.patient_id) : undefined,
      professionnel_id: req.query.professionnel_id ? parseInt(req.query.professionnel_id) : undefined,
      statut: req.query.statut,
      type_prescription: req.query.type_prescription,
      date_debut: req.query.date_debut,
      date_fin: req.query.date_fin,
      search_term: req.query.search_term,
      principe_actif: req.query.principe_actif,
      nom_commercial: req.query.nom_commercial
    };

    // Options de pagination
    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10
    };

    const result = await PrescriptionService.searchPrescriptions(filters, pagination);

    res.status(200).json({
      status: 'success',
      message: `${result.prescriptions.length} prescription(s) trouvée(s)`,
      data: result
    });
  });

  /**
   * Mettre à jour une prescription
   */
  static updatePrescription = catchAsync(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Données de mise à jour invalides',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedBy: req.user.id
    };

    const prescriptionMiseAJour = await PrescriptionService.updatePrescription(
      parseInt(id), 
      updateData
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Prescription mise à jour avec succès',
      data: {
        prescription: prescriptionMiseAJour
      }
    });
  });

  /**
   * Supprimer une prescription (soft delete)
   */
  static deletePrescription = catchAsync(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'ID de prescription invalide',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    
    const success = await PrescriptionService.deletePrescription(parseInt(id));
    
    if (!success) {
      return next(new AppError('Échec de la suppression de la prescription', 500));
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Prescription supprimée avec succès',
      data: null
    });
  });

  /**
   * Renouveler une prescription
   */
  static renouvelerPrescription = catchAsync(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Données de renouvellement invalides',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const renouvellementData = {
      ...req.body,
      updatedBy: req.user.id
    };
    
    const prescriptionRenouvelee = await PrescriptionService.renouvelerPrescription(
      parseInt(id), 
      renouvellementData
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Prescription renouvelée avec succès',
      data: {
        prescription: prescriptionRenouvelee,
        renouvellements_restants: prescriptionRenouvelee.nb_renouvellements - prescriptionRenouvelee.renouvellements_effectues
      }
    });
  });

  /**
   * Suspendre une prescription
   */
  static suspendrePrescription = catchAsync(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Données de suspension invalides',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const suspensionData = {
      ...req.body,
      updatedBy: req.user.id
    };
    
    const prescriptionSuspendue = await PrescriptionService.suspendrePrescription(
      parseInt(id), 
      suspensionData
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Prescription suspendue avec succès',
      data: {
        prescription: prescriptionSuspendue
      }
    });
  });

  /**
   * Transférer une prescription à un autre patient
   */
  static transfererPrescription = catchAsync(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Données de transfert invalides',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { patient_id } = req.body;

    const prescriptionTransferee = await PrescriptionService.transfererPrescription(
      parseInt(id), 
      parseInt(patient_id), 
      req.user.id
    );

    res.status(200).json({
      status: 'success',
      message: 'Prescription transférée avec succès',
      data: {
        prescription: prescriptionTransferee,
        transfert: {
          date: new Date(),
          effectue_par: req.user.id,
          patient_destinataire: patient_id,
          ancien_patient: req.body.ancien_patient_id
        }
      }
    });
  });

  /**
   * Récupérer les prescriptions actives d'un patient
   */
  static getPrescriptionsActives = catchAsync(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'ID de patient invalide',
        errors: errors.array()
      });
    }

    const { patient_id } = req.params;
    
    const prescriptionsActives = await PrescriptionService.getPrescriptionsActives(
      parseInt(patient_id)
    );
    
    res.status(200).json({
      status: 'success',
      message: `${prescriptionsActives.length} prescription(s) active(s) trouvée(s)`,
      data: {
        prescriptions: prescriptionsActives,
        count: prescriptionsActives.length
      }
    });
  });

  /**
   * Générer un rapport de prescription
   */
  static generateReport = catchAsync(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'ID de prescription invalide',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    
    const rapport = await PrescriptionService.generatePrescriptionReport(parseInt(id));
    
    if (!rapport) {
      return next(new AppError('Impossible de générer le rapport', 500));
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Rapport généré avec succès',
      data: {
        rapport
      }
    });
  });

  /**
   * Calculer les statistiques de prescription
   */
  static getStats = catchAsync(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Paramètres de statistiques invalides',
        errors: errors.array()
      });
    }

    const professionnelId = req.query.professionnel_id ? 
      parseInt(req.query.professionnel_id) : 
      req.user.id_professionnel;

    if (!professionnelId) {
      return next(new AppError('ID du professionnel requis pour les statistiques', 400));
    }

    const periode = {};
    if (req.query.date_debut) periode.debut = req.query.date_debut;
    if (req.query.date_fin) periode.fin = req.query.date_fin;

    const stats = await PrescriptionService.calculateStats(professionnelId, periode);
    
    if (!stats) {
      return next(new AppError('Impossible de calculer les statistiques', 500));
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Statistiques calculées avec succès',
      data: {
        statistiques: stats,
        professionnel_id: professionnelId
      }
    });
  });

  /**
   * Valider un QR Code de prescription
   */
  static validateQRCode = catchAsync(async (req, res, next) => {
    const { qrData } = req.body;
    
    if (!qrData) {
      return next(new AppError('Données QR Code manquantes', 400));
    }

    const PrescriptionUtils = require('../../utils/prescriptionUtils');
    const validatedData = PrescriptionUtils.validateQRCode(qrData);
    
    if (!validatedData) {
      return res.status(400).json({
        status: 'error',
        message: 'QR Code invalide ou corrompu',
        valid: false
      });
    }

    // Vérifier que la prescription existe toujours
    const prescription = await PrescriptionService.getPrescriptionById(validatedData.id);
    
    res.status(200).json({
      status: 'success',
      message: 'QR Code valide',
      data: {
        valid: true,
        prescription_data: validatedData,
        prescription_exists: !!prescription
      }
    });
  });

  /**
   * Valider une signature électronique
   */
  static validateSignature = catchAsync(async (req, res, next) => {
    const { signature } = req.body;
    
    if (!signature) {
      return next(new AppError('Signature électronique manquante', 400));
    }

    const PrescriptionUtils = require('../../utils/prescriptionUtils');
    const validatedSignature = PrescriptionUtils.validateElectronicSignature(signature);
    
    if (!validatedSignature) {
      return res.status(400).json({
        status: 'error',
        message: 'Signature électronique invalide',
        valid: false
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Signature électronique valide',
      data: {
        valid: true,
        signature_data: validatedSignature
      }
    });
  });
}

module.exports = PrescriptionController;