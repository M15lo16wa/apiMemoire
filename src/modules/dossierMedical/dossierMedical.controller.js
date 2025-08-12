'use strict';
const dossierMedicalService = require('./dossierMedical.service');
const { validationResult } = require('express-validator');

/**
 * Crée un nouveau dossier médical.
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 */

exports.createDossier = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    // On ignore tout medecin_referent_id ou professionnel_sante_id passé dans le body pour garantir la cohérence session
    const { patient_id, ...dossierData } = req.body;

    try {
        if (!patient_id) {
            return res.status(400).json({ message: "L'ID du patient est requis." });
        }
        // Gestion de la responsabilité : professionnel ou utilisateur classique
        let service_id = null;
        let medecin_referent_id = null;
        let createdBy = null;

        if (req.professionnel) {
            service_id = req.professionnel.service_id;
            medecin_referent_id = req.professionnel.id_professionnel;
            if (!medecin_referent_id) {
                return res.status(403).json({ message: "Impossible de déterminer l'identifiant du professionnel de santé référent." });
            }
        } else if (req.user && (req.user.id_utilisateur || req.user.id)) {
            createdBy = req.user.id_utilisateur || req.user.id;
        } else {
            return res.status(403).json({ message: "Aucun professionnel de santé ou utilisateur connecté." });
        }
        // Génération automatique du numéro de dossier si absent ou vide
        let numeroDossier = dossierData.numeroDossier;
        if (!numeroDossier || typeof numeroDossier !== 'string' || numeroDossier.trim() === '') {
            // Génère un identifiant alphanumérique unique (ex: DOSSIER-AB12C-1A2B3)
            const randomPart = Math.random().toString(36).substr(2, 5).toUpperCase();
            const timePart = Date.now().toString(36).toUpperCase();
            numeroDossier = `DOSSIER-${randomPart}-${timePart}`;
        }
        // Correction : statut synchronisé avec la migration (actif, ferme, archive, fusionne)
        let statut = dossierData.statut ? dossierData.statut.toLowerCase() : 'actif';
        // Sécurise la valeur
        const statutEnum = ['actif', 'ferme', 'archive', 'fusionne'];
        if (!statutEnum.includes(statut)) { statut = 'actif'; }
        const dataToCreate = {
            patient_id,
            numeroDossier,
            ...dossierData,
            statut
        };
        if (medecin_referent_id) dataToCreate.medecin_referent_id = medecin_referent_id;
        if (service_id) dataToCreate.service_id = service_id;
        if (createdBy) dataToCreate.createdBy = createdBy;

        const nouveauDossier = await dossierMedicalService.createDossier(dataToCreate);
        res.status(201).json({ message: 'Dossier médical créé avec succès.', dossier: nouveauDossier });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Récupère tous les dossiers médicaux (simplifié pour ne retourner que l'ID et le statut).
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 */
exports.getAllDossiers = async (req, res) => {
    try {
        const { patient_id, statut } = req.query;
        const filters = {};
        if (patient_id) filters.patient_id = patient_id;
        if (statut) filters.statut = statut;

        const dossiers = await dossierMedicalService.getAllDossiers(filters);
        res.status(200).json({
            status: 'success',
            results: dossiers.length,
            data: {
                dossiers
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des dossiers:', error);
        res.status(500).json({
            status: 'error',
            message: 'Une erreur est survenue lors de la récupération des dossiers',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Récupère un dossier médical par son ID.
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 */
exports.getDossierById = async (req, res) => {
    try {
        const { id } = req.params;
        // const { includes } = req.query;
        // const includeArray = includes ? includes.split(',') : ['patient', 'medecinReferent', 'serviceResponsable', 'createur', 'dernierModificateur'];

        const dossier = await dossierMedicalService.getDossierById(id);
        if (!dossier) {
            return res.status(404).json({ message: 'Dossier médical non trouvé.' });
        }
        res.status(200).json(dossier);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Met à jour un dossier médical.
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 */
exports.updateDossier = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const updateData = req.body; // updatedBy peut être ajouté ici via un middleware d'authentification

    try {
        const dossierMisAJour = await dossierMedicalService.updateDossier(id, updateData);
    if (!dossierMisAJour) {
        return res.status(404).json({ message: 'Dossier médical non trouvé.' });
    }
    res.status(200).json({ message: 'Dossier médical mis à jour avec succès.', dossier: dossierMisAJour });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Supprime logiquement un dossier médical.
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 */
exports.deleteDossier = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await dossierMedicalService.deleteDossier(id);
    if (result === 0) {
        return res.status(404).json({ message: 'Dossier médical non trouvé.' });
    }
        res.status(200).json({ message: 'Dossier médical supprimé avec succès.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Récupère le dossier médical complet d'un patient avec toutes les informations nécessaires au partage
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 */
exports.getDossierCompletPatient = async (req, res) => {
    try {
        const { patient_id } = req.params;
        
        console.log('🔍 [getDossierCompletPatient] Début de la récupération pour le patient:', patient_id);
        
        // L'accès a déjà été vérifié par le middleware checkMedicalRecordAccess
        // req.accessInfo contient les informations d'accès
        const dossierComplet = await dossierMedicalService.getDossierCompletPatient(patient_id);
        
        console.log('✅ [getDossierCompletPatient] Dossier récupéré avec succès');
        
        res.status(200).json({
            status: 'success',
            data: dossierComplet
        });
    } catch (error) {
        console.error('❌ [getDossierCompletPatient] Erreur lors de la récupération du dossier:', {
            patient_id: req.params.patient_id,
            error: error.message,
            stack: error.stack
        });
        
        // Gestion d'erreur plus robuste
        if (error.message.includes('non trouvé')) {
            return res.status(404).json({ 
                status: 'error',
                message: error.message 
            });
        }
        
        res.status(500).json({ 
            status: 'error',
            message: 'Erreur interne du serveur lors de la récupération du dossier médical',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Récupère un résumé des informations médicales d'un patient
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 */
exports.getResumePatient = async (req, res) => {
    try {
        const { patient_id } = req.params;
        
        // L'accès a déjà été vérifié par le middleware checkMedicalRecordAccess
        // req.accessInfo contient les informations d'accès
        const resume = await dossierMedicalService.getResumePatient(patient_id);
        
        res.status(200).json({
            status: 'success',
            data: resume
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
