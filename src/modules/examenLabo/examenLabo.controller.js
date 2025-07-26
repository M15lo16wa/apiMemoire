const examenLaboService = require('./examenLabo.service');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

/**
 * Créer un nouveau résultat d'examen
 */
exports.createResultatExamen = catchAsync(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { patient_id, dossier_id, prescription_id, service_id, ...resultatData } = req.body;
    
    // Récupérer l'ID du professionnel depuis le token JWT
    const professionnel_id = req.user.id_professionnel;
    
    if (!professionnel_id) {
        return next(new AppError('Accès non autorisé. Connexion professionnel requise.', 401));
    }

    const nouveauResultat = await examenLaboService.createResultatExamen({
        ...resultatData,
        patient_id,
        professionnel_id,
        dossier_id,
        prescription_id,
        service_id,
        createdBy: req.user.id
    });

    res.status(201).json({
        status: 'success',
        data: {
            resultat: nouveauResultat
        }
    });
});

/**
 * Récupérer tous les résultats d'examen d'un patient
 */
exports.getResultatsByPatient = catchAsync(async (req, res, next) => {
    const { patient_id } = req.params;
    const { statut, type_examen, date_debut, date_fin, includes } = req.query;
    
    const filters = { patient_id };
    if (statut) filters.statut = statut;
    if (type_examen) filters.type_examen = type_examen;
    
    // Filtrage par plage de dates
    if (date_debut || date_fin) {
        filters.date_examen = {};
        if (date_debut) filters.date_examen[Op.gte] = new Date(date_debut);
        if (date_fin) filters.date_examen[Op.lte] = new Date(date_fin);
    }

    const includeArray = includes ? includes.split(',') : ['patient', 'professionnel', 'dossier', 'prescription'];
    
    const resultats = await examenLaboService.getResultatsByPatient(patient_id, filters, includeArray);
    
    res.status(200).json({
        status: 'success',
        results: resultats.length,
        data: {
            resultats
        }
    });
});

/**
 * Récupérer un résultat d'examen par son ID
 */
exports.getResultatById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { includes } = req.query;
    
    const includeArray = includes ? includes.split(',') : ['patient', 'professionnel', 'dossier', 'prescription'];
    
    const resultat = await examenLaboService.getResultatById(id, includeArray);
    
    if (!resultat) {
        return next(new AppError('Résultat d\'examen non trouvé', 404));
    }
    
    res.status(200).json({
        status: 'success',
        data: {
            resultat
        }
    });
});

/**
 * Mettre à jour un résultat d'examen
 */
exports.updateResultat = catchAsync(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = {
        ...req.body,
        updatedBy: req.user.id
    };

    const resultatMisAJour = await examenLaboService.updateResultat(id, updateData);
    
    if (!resultatMisAJour) {
        return next(new AppError('Résultat d\'examen non trouvé', 404));
    }
    
    res.status(200).json({
        status: 'success',
        data: {
            resultat: resultatMisAJour
        }
    });
});

/**
 * Supprimer un résultat d'examen (soft delete)
 */
exports.deleteResultat = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    
    const result = await examenLaboService.deleteResultat(id);
    
    if (result === 0) {
        return next(new AppError('Résultat d\'examen non trouvé', 404));
    }
    
    res.status(204).json({
        status: 'success',
        data: null
    });
});

/**
 * Valider un résultat d'examen
 */
exports.validerResultat = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { commentaire_validation } = req.body;
    
    const resultatValide = await examenLaboService.validerResultat(id, {
        commentaire_validation,
        updatedBy: req.user.id
    });
    
    if (!resultatValide) {
        return next(new AppError('Résultat d\'examen non trouvé', 404));
    }
    
    res.status(200).json({
        status: 'success',
        data: {
            resultat: resultatValide
        }
    });
});

/**
 * Récupérer les résultats d'examen en attente de validation
 */
exports.getResultatsEnAttente = catchAsync(async (req, res, next) => {
    const { service_id } = req.query;
    
    const resultats = await examenLaboService.getResultatsEnAttente(service_id);
    
    res.status(200).json({
        status: 'success',
        results: resultats.length,
        data: {
            resultats
        }
    });
});

/**
 * Récupérer les statistiques d'examens d'un patient
 */
exports.getStatistiquesPatient = catchAsync(async (req, res, next) => {
    const { patient_id } = req.params;
    const { periode } = req.query; // 'mois', 'trimestre', 'annee'
    
    const statistiques = await examenLaboService.getStatistiquesPatient(patient_id, periode);
    
    res.status(200).json({
        status: 'success',
        data: {
            statistiques
        }
    });
});

module.exports = exports; 