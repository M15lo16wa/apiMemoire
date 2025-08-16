/**
 * Contrôleur pour la gestion des auto-mesures des patients
 */

const autoMesureService = require('./autoMesure.service');
const { validationResult } = require('express-validator');

/**
 * Créer une nouvelle auto-mesure
 * @param {Object} req - L'objet de requête Express
 * @param {Object} res - L'objet de réponse Express
 */
exports.createAutoMesure = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                message: 'Données de validation invalides',
                errors: errors.array()
            });
        }

        const autoMesureData = req.body;
        
        // Ajouter l'ID du patient depuis l'utilisateur connecté si c'est un patient
        if (req.patient) {
            autoMesureData.patient_id = req.patient.id_patient;
        }

        const autoMesure = await autoMesureService.createAutoMesure(autoMesureData);
        
        res.status(201).json({
            status: 'success',
            message: 'Auto-mesure créée avec succès',
            data: autoMesure
        });
    } catch (error) {
        console.error('❌ [createAutoMesure] Erreur:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur serveur lors de la création de l\'auto-mesure',
            error: error.message
        });
    }
};

/**
 * Récupérer une auto-mesure par ID
 * @param {Object} req - L'objet de requête Express
 * @param {Object} res - L'objet de réponse Express
 */
exports.getAutoMesureById = async (req, res) => {
    try {
        const { id } = req.params;
        const autoMesure = await autoMesureService.getAutoMesureById(parseInt(id, 10));
        
        if (!autoMesure) {
            return res.status(404).json({
                status: 'error',
                message: 'Auto-mesure non trouvée'
            });
        }

        // Vérifier l'accès (seul le patient propriétaire ou un professionnel autorisé)
        if (req.patient && autoMesure.patient_id !== req.patient.id_patient) {
            return res.status(403).json({
                status: 'error',
                message: 'Accès non autorisé à cette auto-mesure'
            });
        }

        res.status(200).json({
            status: 'success',
            data: autoMesure
        });
    } catch (error) {
        console.error('❌ [getAutoMesureById] Erreur:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur serveur lors de la récupération de l\'auto-mesure',
            error: error.message
        });
    }
};

/**
 * Récupérer toutes les auto-mesures d'un patient
 * @param {Object} req - L'objet de requête Express
 * @param {Object} res - L'objet de réponse Express
 */
exports.getAutoMesuresByPatient = async (req, res) => {
    try {
        const { patient_id } = req.params;
        const filters = req.query;

        // Vérifier l'accès (seul le patient propriétaire ou un professionnel autorisé)
        if (req.patient && parseInt(patient_id, 10) !== req.patient.id_patient) {
            return res.status(403).json({
                status: 'error',
                message: 'Accès non autorisé aux auto-mesures de ce patient'
            });
        }

        const autoMesures = await autoMesureService.getAutoMesuresByPatient(
            parseInt(patient_id, 10), 
            filters
        );

        res.status(200).json({
            status: 'success',
            results: autoMesures.length,
            data: autoMesures
        });
    } catch (error) {
        console.error('❌ [getAutoMesuresByPatient] Erreur:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur serveur lors de la récupération des auto-mesures',
            error: error.message
        });
    }
};

/**
 * Récupérer toutes les auto-mesures avec filtres
 * @param {Object} req - L'objet de requête Express
 * @param {Object} res - L'objet de réponse Express
 */
exports.getAllAutoMesures = async (req, res) => {
    try {
        const filters = req.query;
        
        // Si c'est un patient, limiter aux siennes
        if (req.patient) {
            filters.patient_id = req.patient.id_patient;
        }

        const autoMesures = await autoMesureService.getAllAutoMesures(filters);

        res.status(200).json({
            status: 'success',
            results: autoMesures.length,
            data: autoMesures
        });
    } catch (error) {
        console.error('❌ [getAllAutoMesures] Erreur:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur serveur lors de la récupération des auto-mesures',
            error: error.message
        });
    }
};

/**
 * Mettre à jour une auto-mesure
 * @param {Object} req - L'objet de requête Express
 * @param {Object} res - L'objet de réponse Express
 */
exports.updateAutoMesure = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                message: 'Données de validation invalides',
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const updateData = req.body;

        // Vérifier que l'auto-mesure existe et récupérer ses informations
        const existingAutoMesure = await autoMesureService.getAutoMesureById(parseInt(id, 10));
        if (!existingAutoMesure) {
            return res.status(404).json({
                status: 'error',
                message: 'Auto-mesure non trouvée'
            });
        }

        // Vérifier l'accès (seul le patient propriétaire ou un professionnel autorisé)
        if (req.patient && existingAutoMesure.patient_id !== req.patient.id_patient) {
            return res.status(403).json({
                status: 'error',
                message: 'Accès non autorisé à cette auto-mesure'
            });
        }

        const autoMesure = await autoMesureService.updateAutoMesure(parseInt(id, 10), updateData);
        
        res.status(200).json({
            status: 'success',
            message: 'Auto-mesure mise à jour avec succès',
            data: autoMesure
        });
    } catch (error) {
        console.error('❌ [updateAutoMesure] Erreur:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur serveur lors de la mise à jour de l\'auto-mesure',
            error: error.message
        });
    }
};

/**
 * Supprimer une auto-mesure
 * @param {Object} req - L'objet de requête Express
 * @param {Object} res - L'objet de réponse Express
 */
exports.deleteAutoMesure = async (req, res) => {
    try {
        const { id } = req.params;

        // Vérifier que l'auto-mesure existe et récupérer ses informations
        const existingAutoMesure = await autoMesureService.getAutoMesureById(parseInt(id, 10));
        if (!existingAutoMesure) {
            return res.status(404).json({
                status: 'error',
                message: 'Auto-mesure non trouvée'
            });
        }

        // Vérifier l'accès (seul le patient propriétaire ou un professionnel autorisé)
        if (req.patient && existingAutoMesure.patient_id !== req.patient.id_patient) {
            return res.status(403).json({
                status: 'error',
                message: 'Accès non autorisé à cette auto-mesure'
            });
        }

        const deleted = await autoMesureService.deleteAutoMesure(parseInt(id, 10));
        
        if (deleted) {
            res.status(200).json({
                status: 'success',
                message: 'Auto-mesure supprimée avec succès'
            });
        } else {
            res.status(404).json({
                status: 'error',
                message: 'Auto-mesure non trouvée'
            });
        }
    } catch (error) {
        console.error('❌ [deleteAutoMesure] Erreur:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur serveur lors de la suppression de l\'auto-mesure',
            error: error.message
        });
    }
};

/**
 * Obtenir les statistiques des auto-mesures d'un patient
 * @param {Object} req - L'objet de requête Express
 * @param {Object} res - L'objet de réponse Express
 */
exports.getAutoMesuresStats = async (req, res) => {
    try {
        const { patient_id } = req.params;
        const { type_mesure } = req.query;

        // Vérifier l'accès (seul le patient propriétaire ou un professionnel autorisé)
        if (req.patient && parseInt(patient_id, 10) !== req.patient.id_patient) {
            return res.status(403).json({
                status: 'error',
                message: 'Accès non autorisé aux statistiques de ce patient'
            });
        }

        const stats = await autoMesureService.getAutoMesuresStats(
            parseInt(patient_id, 10), 
            type_mesure
        );

        res.status(200).json({
            status: 'success',
            data: stats
        });
    } catch (error) {
        console.error('❌ [getAutoMesuresStats] Erreur:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur serveur lors de la récupération des statistiques',
            error: error.message
        });
    }
};

/**
 * Obtenir la dernière auto-mesure d'un patient par type
 * @param {Object} req - L'objet de requête Express
 * @param {Object} res - L'objet de réponse Express
 */
exports.getLastAutoMesureByType = async (req, res) => {
    try {
        const { patient_id, type_mesure } = req.params;

        // Vérifier l'accès (seul le patient propriétaire ou un professionnel autorisé)
        if (req.patient && parseInt(patient_id, 10) !== req.patient.id_patient) {
            return res.status(403).json({
                status: 'error',
                message: 'Accès non autorisé aux auto-mesures de ce patient'
            });
        }

        const autoMesure = await autoMesureService.getLastAutoMesureByType(
            parseInt(patient_id, 10), 
            type_mesure
        );

        if (!autoMesure) {
            return res.status(404).json({
                status: 'error',
                message: 'Aucune auto-mesure trouvée pour ce type'
            });
        }

        res.status(200).json({
            status: 'success',
            data: autoMesure
        });
    } catch (error) {
        console.error('❌ [getLastAutoMesureByType] Erreur:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur serveur lors de la récupération de la dernière auto-mesure',
            error: error.message
        });
    }
};
