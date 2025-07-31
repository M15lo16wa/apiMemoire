const prescriptionService = require('./prescription.service');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const { validationResult } = require('express-validator');

/**
 * Créer une nouvelle ordonnance
 */
exports.createOrdonnance = catchAsync(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }


    const { dossier_id, consultation_id, service_id, ...ordonnanceData } = req.body;
    // Récupérer l'ID du professionnel depuis le token JWT
    const professionnel_id = req.user.id_professionnel;
    if (!professionnel_id) {
        return next(new AppError('Accès non autorisé. Connexion professionnel requise.', 401));
    }
    // Injection automatique du patient_id à partir du dossier
    let patient_id = req.body.patient_id;
    if (!patient_id && dossier_id) {
        const { DossierMedical } = require('../../models');
        const dossier = await DossierMedical.findByPk(dossier_id);
        if (!dossier) {
            return next(new AppError('Dossier médical introuvable pour injecter le patient.', 404));
        }
        patient_id = dossier.patient_id;
    }
    if (!patient_id) {
        return next(new AppError('Impossible de déterminer le patient lié à la prescription.', 400));
    }
    const nouvelleOrdonnance = await prescriptionService.createOrdonnance({
        ...ordonnanceData,
        patient_id,
        professionnel_id,
        dossier_id,
        consultation_id,
        service_id,
        createdBy: req.user.id
    });

    res.status(201).json({
        status: 'success',
        data: {
            ordonnance: nouvelleOrdonnance
        }
    });
});

/**
 * Créer une demande d'examen
 */
exports.createDemandeExamen = catchAsync(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }


    const { dossier_id, consultation_id, service_id, ...demandeData } = req.body;
    // Récupérer l'ID du professionnel depuis le token JWT
    const professionnel_id = req.user.id_professionnel;
    if (!professionnel_id) {
        return next(new AppError('Accès non autorisé. Connexion professionnel requise.', 401));
    }
    // Injection automatique du patient_id à partir du dossier
    let patient_id = req.body.patient_id;
    if (!patient_id && dossier_id) {
        const { DossierMedical } = require('../../models');
        const dossier = await DossierMedical.findByPk(dossier_id);
        if (!dossier) {
            return next(new AppError('Dossier médical introuvable pour injecter le patient.', 404));
        }
        patient_id = dossier.patient_id;
    }
    if (!patient_id) {
        return next(new AppError('Impossible de déterminer le patient lié à la demande d\'examen.', 400));
    }
    const nouvelleDemande = await prescriptionService.createDemandeExamen({
        ...demandeData,
        patient_id,
        professionnel_id,
        dossier_id,
        consultation_id,
        service_id,
        createdBy: req.user.id
    });

    res.status(201).json({
        status: 'success',
        data: {
            demande: nouvelleDemande
        }
    });
});

/**
 * Récupérer toutes les prescriptions d'un patient
 */
exports.getPrescriptionsByPatient = catchAsync(async (req, res, next) => {
    const { patient_id } = req.params;
    const { statut, type } = req.query;
    
    const filters = { patient_id };
    if (statut) filters.statut = statut;
    if (type) filters.prescrit_traitement = type === 'traitement';

    // const includeArray = includes ? includes.split(',') : ['patient', 'redacteur', 'dossier', 'consultation'];
    
    const prescriptions = await prescriptionService.getPrescriptionsByPatient(patient_id, filters);
    
    res.status(200).json({
        status: 'success',
        results: prescriptions.length,
        data: {
            prescriptions
        }
    });
});

/**
 * Récupérer une prescription par son ID
 */
exports.getPrescriptionById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    // const { includes } = req.query;
    
    // const includeArray = includes ? includes.split(',') : ['patient', 'medecin', 'dossier', 'consultation'];
    
    const prescription = await prescriptionService.getPrescriptionById(id);
    
    if (!prescription) {
        return next(new AppError('Prescription non trouvée', 404));
    }
    
    res.status(200).json({
        status: 'success',
        data: {
            prescription
        }
    });
});

/**
 * Mettre à jour une prescription
 */
exports.updatePrescription = catchAsync(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = {
        ...req.body,
        updatedBy: req.user.id
    };

    const prescriptionMiseAJour = await prescriptionService.updatePrescription(id, updateData);
    
    if (!prescriptionMiseAJour) {
        return next(new AppError('Prescription non trouvée', 404));
    }
    
    res.status(200).json({
        status: 'success',
        data: {
            prescription: prescriptionMiseAJour
        }
    });
});

/**
 * Supprimer une prescription (soft delete)
 */
exports.deletePrescription = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    
    const result = await prescriptionService.deletePrescription(id);
    
    if (result === 0) {
        return next(new AppError('Prescription non trouvée', 404));
    }
    
    res.status(204).json({
        status: 'success',
        data: null
    });
});

/**
 * Renouveler une prescription
 */
exports.renouvelerPrescription = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { motif_renouvellement } = req.body;
    
    const prescriptionRenouvelee = await prescriptionService.renouvelerPrescription(id, {
        motif_renouvellement,
        updatedBy: req.user.id
    });
    
    if (!prescriptionRenouvelee) {
        return next(new AppError('Prescription non trouvée ou non renouvelable', 404));
    }
    
    res.status(200).json({
        status: 'success',
        data: {
            prescription: prescriptionRenouvelee
        }
    });
});

/**
 * Suspendre une prescription
 */
exports.suspendrePrescription = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { motif_arret } = req.body;
    
    const prescriptionSuspendue = await prescriptionService.suspendrePrescription(id, {
        motif_arret,
        updatedBy: req.user.id
    });
    
    if (!prescriptionSuspendue) {
        return next(new AppError('Prescription non trouvée', 404));
    }
    
    res.status(200).json({
        status: 'success',
        data: {
            prescription: prescriptionSuspendue
        }
    });
});

/** 
 * transferer une prescription à un patient
*/
exports.transfererPrescription = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { patient_id } = req.body;

    // 1. Validation des paramètres
    if (!patient_id) {
        return next(new AppError('ID du patient destinataire requis', 400));
    }

    // Validation que l'ID de prescription est un nombre valide
    if (!id || isNaN(parseInt(id))) {
        return next(new AppError('ID de prescription invalide', 400));
    }

    // Validation que patient_id est un nombre valide
    if (isNaN(parseInt(patient_id))) {
        return next(new AppError('ID du patient destinataire invalide', 400));
    }

    try {
        // 3. Appel au service avec l'ID utilisateur pour la traçabilité
        const prescriptionTransferee = await prescriptionService.transfererPrescription(
            parseInt(id), 
            parseInt(patient_id), 
            req.user.id
        );

        // 4. Réponse de succès avec informations détaillées
        res.status(200).json({
            status: 'success',
            message: 'Prescription transférée avec succès',
            data: {
                prescription: prescriptionTransferee,
                transfert: {
                    date: new Date(),
                    effectue_par: req.user.id,
                    patient_destinataire: patient_id
                }
            }
        });

    } catch (error) {
        // 5. Le service lance déjà des AppError, donc on les propage
        return next(error);
    }

    /** 
     * * recuperation de la prescription transmise à un patient
     * */
    exports.getPrescriptionTransmise = catchAsync(async (req, res, next) => {
        const { id } = req.params;

        // Validation que l'ID de prescription est un nombre valide
        if (!id || isNaN(parseInt(id))) {
            return next(new AppError('ID de prescription invalide', 400));
        }

        try {
            // Appel au service pour récupérer la prescription transmise
            const prescriptionTransmise = await prescriptionService.getPrescriptionTransmise(parseInt(id));

            if (!prescriptionTransmise) {
                return next(new AppError('Prescription transmise non trouvée', 404));
            }

            res.status(200).json({
                status: 'success',
                data: {
                    prescription: prescriptionTransmise
                }
            });

        } catch (error) {
            return next(error);
        }
    });

});

module.exports = exports; 