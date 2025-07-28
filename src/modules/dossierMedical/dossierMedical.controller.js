// src/modules/dossierMedical/dossierMedical.controller.js

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
    const { patient_id, ...dossierData } = req.body;

    try {
        if (!patient_id) {
            return res.status(400).json({ message: "L'ID du patient est requis." });
        }
        // Injection automatique du professionnel connecté et du service
        const professionnel = req.professionnel;
        if (!professionnel) {
            return res.status(403).json({ message: "Aucun professionnel de santé connecté." });
        }
        const service_id = professionnel.service_id;
        const medecin_referent_id = professionnel.id_professionnel;
        // Génération automatique du numéro de dossier si absent ou vide
        let numeroDossier = dossierData.numeroDossier;
        if (!numeroDossier || typeof numeroDossier !== 'string' || numeroDossier.trim() === '') {
            // Génère un identifiant alphanumérique unique (ex: DOSSIER-AB12C-1A2B3)
            const randomPart = Math.random().toString(36).substr(2, 5).toUpperCase();
            const timePart = Date.now().toString(36).toUpperCase();
            numeroDossier = `DOSSIER-${randomPart}-${timePart}`;
        }
        const createdBy = req.user ? req.user.id_utilisateur || req.user.id : null;

        // Correction : statut synchronisé avec la migration (actif, ferme, archive, fusionne)
        let statut = dossierData.statut ? dossierData.statut.toLowerCase() : 'actif';
        // Sécurise la valeur
        const statutEnum = ['actif', 'ferme', 'archive', 'fusionne'];
        if (!statutEnum.includes(statut)) { statut = 'actif'; }
        const dataToCreate = {
            patient_id,
            medecin_referent_id, // injection automatique dans la bonne colonne
            service_id,
            numeroDossier,
            createdBy,
            ...dossierData,
            statut
        };

        const nouveauDossier = await dossierMedicalService.createDossier(dataToCreate);
        res.status(201).json({ message: 'Dossier médical créé avec succès.', dossier: nouveauDossier });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Récupère tous les dossiers médicaux.
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 */
exports.getAllDossiers = async (req, res) => {
    try {
        const { patientId, statut, includes } = req.query;
        const filters = {};
        if (patientId) filters.patient_id = patientId;
        if (statut) filters.statut = statut;

        const includeArray = includes ? includes.split(',') : ['patient', 'medecinReferent', 'serviceResponsable', 'createur', 'dernierModificateur'];

        const dossiers = await dossierMedicalService.getAllDossiers(filters, includeArray);
        res.status(200).json(dossiers);
    } catch (error) {
        res.status(500).json({ message: error.message });
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
        const { includes } = req.query;
        const includeArray = includes ? includes.split(',') : ['patient', 'medecinReferent', 'serviceResponsable', 'createur', 'dernierModificateur'];

        const dossier = await dossierMedicalService.getDossierById(id, includeArray);
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
        
        // Vérification des autorisations
        if (req.user.role === 'patient' && req.user.id_patient !== parseInt(patient_id)) {
            return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à accéder à ce dossier.' });
        }

        const dossierComplet = await dossierMedicalService.getDossierCompletPatient(patient_id);
        
        res.status(200).json({
            status: 'success',
            data: dossierComplet
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
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
        
        // Vérification des autorisations
        if (req.user.role === 'patient' && req.user.id_patient !== parseInt(patient_id)) {
            return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à accéder à ce résumé.' });
        }

        const resume = await dossierMedicalService.getResumePatient(patient_id);
        
        res.status(200).json({
            status: 'success',
            data: resume
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};