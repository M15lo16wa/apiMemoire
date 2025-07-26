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
    const { patient_id, professionnel_sante_id, service_id, createdBy, ...dossierData } = req.body;

    try {
      // Assurez-vous que patient_id et professionnel_sante_id sont présents et valides
        if (!patient_id) {
            return res.status(400).json({ message: 'L\'ID du patient est requis.' });
        }
      // Note: medecin_referent_id est le nom de la colonne dans le modèle/migration
      // professionnel_sante_id est l'ID du professionnel de santé passé dans la requête
        const dataToCreate = {
        patient_id,
        medecin_referent_id: professionnel_sante_id, // Mapper vers le nom de la colonne de la DB
        service_id, // Peut être null si non fourni
        createdBy, // Peut être null si non fourni (sera l'ID de l'utilisateur connecté)
        ...dossierData
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