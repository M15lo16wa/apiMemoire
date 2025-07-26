// src/modules/dossierMedical/dossierMedical.service.js

const { DossierMedical, Patient, ProfessionnelSante, Utilisateur, ServiceSante, Prescription, ExamenLabo, Consultation } = require('../../models');
const { Op } = require('sequelize');

const dossierMedicalService = {

/**
 *  Crée un nouveau dossier médical.
 *  @param {object} dossierData - Données du dossier à créer.
 *  @returns {Promise<DossierMedical>} Le dossier médical créé.
*/
async createDossier(dossierData) {
    try {
        const nouveauDossier = await DossierMedical.create(dossierData);
        return nouveauDossier;
    } catch (error) {
        console.error('Erreur lors de la création du dossier médical:', error);
        throw new Error('Impossible de créer le dossier médical.');
    }
},

/**
   * Récupère tous les dossiers médicaux, avec options de filtrage et d'inclusion.
   * @param {object} filters - Filtres à appliquer (ex: { patient_id: 1, statut: 'Ouvert' }).
   * @param {string[]} includes - Modèles à inclure (ex: ['patient', 'medecinReferent']).
   * @returns {Promise<DossierMedical[]>} Liste des dossiers médicaux.
   */
async getAllDossiers(filters = {}, includes = []) {
    const includeOptions = [];

    if (includes.includes('patient')) {
        includeOptions.push({ model: Patient, as: 'patient' });
    }
    if (includes.includes('medecinReferent')) {
        includeOptions.push({ model: ProfessionnelSante, as: 'medecinReferent', include: [{ model: Utilisateur, as: 'compteUtilisateur', attributes: ['nom', 'prenom'] }] });
    }
    if (includes.includes('serviceResponsable')) {
        includeOptions.push({ model: ServiceSante, as: 'serviceResponsable' });
    }
    if (includes.includes('createur')) {
        includeOptions.push({ model: Utilisateur, as: 'createur', attributes: ['nom', 'prenom'] });
    }
    if (includes.includes('dernierModificateur')) {
        includeOptions.push({ model: Utilisateur, as: 'dernierModificateur', attributes: ['nom', 'prenom'] });
    }

    try {
        const dossiers = await DossierMedical.findAll({
            where: filters,
            include: includeOptions,
            paranoid: false // Inclut les dossiers supprimés logiquement si nécessaire, sinon true
        });
        return dossiers;
    } catch (error) {
        console.error('Erreur lors de la récupération des dossiers médicaux:', error);
        throw new Error('Impossible de récupérer les dossiers médicaux.');
    }
},

/**
 *  Récupère un dossier médical par son ID.
 *  @param {number} id_dossier - L'ID du dossier médical.
 *  @param {string[]} includes - Modèles à inclure.
 *  @returns {Promise<DossierMedical|null>} Le dossier médical ou null si non trouvé.
 **/
async getDossierById(id_dossier, includes = []) {
    const includeOptions = [];

    if (includes.includes('patient')) {
        includeOptions.push({ model: Patient, as: 'patient' });
    }
    if (includes.includes('medecinReferent')) {
        includeOptions.push({ model: ProfessionnelSante, as: 'medecinReferent', include: [{ model: Utilisateur, as: 'compteUtilisateur', attributes: ['nom', 'prenom'] }] });
    }
    if (includes.includes('serviceResponsable')) {
        includeOptions.push({ model: ServiceSante, as: 'serviceResponsable' });
    }
    if (includes.includes('createur')) {
        includeOptions.push({ model: Utilisateur, as: 'createur', attributes: ['nom', 'prenom'] });
    }
    if (includes.includes('dernierModificateur')) {
        includeOptions.push({ model: Utilisateur, as: 'dernierModificateur', attributes: ['nom', 'prenom'] });
    }

    try {
        const dossier = await DossierMedical.findByPk(id_dossier, {
            include: includeOptions,
            paranoid: false // Inclut les dossiers supprimés logiquement si nécessaire
        });
        return dossier;
    } catch (error) {
        console.error(`Erreur lors de la récupération du dossier médical avec l'ID ${id_dossier}:`, error);
        throw new Error('Impossible de récupérer le dossier médical.');
    }
},

/**
 *  Met à jour un dossier médical.
 *  @param {number} id_dossier - L'ID du dossier à mettre à jour.
 *  @param {object} updateData - Données de mise à jour.
 *  @returns {Promise<DossierMedical|null>} Le dossier mis à jour ou null si non trouvé.
 * */

async updateDossier(id_dossier, updateData) {
    try {
        const dossier = await DossierMedical.findByPk(id_dossier);
        if (!dossier) {
        return null;
    }
    await dossier.update(updateData);
    return dossier;
    } catch (error) {
        console.error(`Erreur lors de la mise à jour du dossier médical avec l'ID ${id_dossier}:`, error);
        throw new Error('Impossible de mettre à jour le dossier médical.');
    }
},

/**
   * Supprime logiquement un dossier médical.
   * @param {number} id_dossier - L'ID du dossier à supprimer.
   * @returns {Promise<number>} Nombre de lignes supprimées (0 ou 1).
   */
async deleteDossier(id_dossier) {
    try {
        const result = await DossierMedical.destroy({
        where: { id_dossier: id_dossier }
    });
      return result; // Renvoie 1 si supprimé, 0 sinon
    } catch (error) {
        console.error(`Erreur lors de la suppression du dossier médical avec l'ID ${id_dossier}:`, error);
        throw new Error('Impossible de supprimer le dossier médical.');
    }
},

/**
   * Récupère un dossier médical par le numeroDossier.
   * @param {string} numeroDossier - Le numéro unique du dossier.
   * @returns {Promise<DossierMedical|null>} Le dossier médical ou null si non trouvé.
   */
async getDossierByNumero(numeroDossier) {
    try {
        const dossier = await DossierMedical.findOne({
        where: { numeroDossier: numeroDossier }
    });
    return dossier;
    } catch (error) {
        console.error(`Erreur lors de la récupération du dossier médical avec le numéro ${numeroDossier}:`, error);
        throw new Error('Impossible de récupérer le dossier médical par numéro.');
    }
},

/**
   * Récupère tous les dossiers médicaux d'un patient donné.
   * @param {number} patientId - L'ID du patient.
   * @param {string[]} includes - Modèles à inclure.
   * @returns {Promise<DossierMedical[]>} Liste des dossiers médicaux du patient.
   */
async getDossiersByPatientId(patientId, includes = []) {
    const includeOptions = [];

    if (includes.includes('patient')) {
        includeOptions.push({ model: Patient, as: 'patient' });
    }
    if (includes.includes('medecinReferent')) {
        includeOptions.push({ model: ProfessionnelSante, as: 'medecinReferent', include: [{ model: Utilisateur, as: 'compteUtilisateur', attributes: ['nom', 'prenom'] }] });
    }
    if (includes.includes('serviceResponsable')) {
        includeOptions.push({ model: ServiceSante, as: 'serviceResponsable' });
    }
    if (includes.includes('createur')) {
        includeOptions.push({ model: Utilisateur, as: 'createur', attributes: ['nom', 'prenom'] });
    }
    if (includes.includes('dernierModificateur')) {
        includeOptions.push({ model: Utilisateur, as: 'dernierModificateur', attributes: ['nom', 'prenom'] });
    }

    try {
        const dossiers = await DossierMedical.findAll({
        where: { patient_id: patientId },
        include: includeOptions,
        paranoid: false // Inclut les dossiers supprimés logiquement si nécessaire
    });
    return dossiers;
    } catch (error) {
        console.error(`Erreur lors de la récupération des dossiers médicaux pour le patient ${patientId}:`, error);
        throw new Error('Impossible de récupérer les dossiers médicaux du patient.');
    }
},

/**
 * Récupère le dossier médical complet d'un patient avec toutes les informations nécessaires au partage
 * @param {number} patientId - L'ID du patient
 * @returns {Promise<object>} Le dossier médical complet avec toutes les informations
 */
async getDossierCompletPatient(patientId) {
    try {
        // Récupérer le dossier médical principal
        const dossier = await DossierMedical.findOne({
            where: { patient_id: patientId },
            include: [
                { model: Patient, as: 'patient' },
                { 
                    model: ProfessionnelSante, 
                    as: 'medecinReferent',
                    include: [{ model: Utilisateur, as: 'compteUtilisateur', attributes: ['nom', 'prenom'] }]
                },
                { model: ServiceSante, as: 'serviceResponsable' }
            ]
        });

        if (!dossier) {
            throw new Error('Dossier médical non trouvé pour ce patient.');
        }

        // Récupérer les prescriptions actives
        const prescriptions = await Prescription.findAll({
            where: { 
                patient_id: patientId,
                statut: 'active'
            },
            include: [
                { 
                    model: ProfessionnelSante, 
                    as: 'redacteur',
                    include: [{ model: Utilisateur, as: 'compteUtilisateur', attributes: ['nom', 'prenom'] }]
                }
            ],
            order: [['datePrescription', 'DESC']]
        });

        // Récupérer les résultats d'examen récents
        const examens = await ExamenLabo.findAll({
            where: { 
                patient_id: patientId,
                statut: 'valide'
            },
            include: [
                { 
                    model: ProfessionnelSante, 
                    as: 'professionnel',
                    include: [{ model: Utilisateur, as: 'compteUtilisateur', attributes: ['nom', 'prenom'] }]
                }
            ],
            order: [['date_examen', 'DESC']],
            limit: 10 // Limiter aux 10 derniers examens
        });

        // Récupérer les consultations récentes
        const consultations = await Consultation.findAll({
            where: { dossier_id: dossier.id_dossier },
            include: [
                { 
                    model: ProfessionnelSante, 
                    as: 'professionnel',
                    include: [{ model: Utilisateur, as: 'compteUtilisateur', attributes: ['nom', 'prenom'] }]
                }
            ],
            order: [['date_consultation', 'DESC']],
            limit: 5 // Limiter aux 5 dernières consultations
        });

        // Récupérer les demandes d'examen en attente
        const demandesEnAttente = await Prescription.findAll({
            where: { 
                patient_id: patientId,
                prescrit_traitement: false, // Demandes d'examen
                statut: 'en_attente'
            },
            include: [
                { 
                    model: ProfessionnelSante, 
                    as: 'redacteur',
                    include: [{ model: Utilisateur, as: 'compteUtilisateur', attributes: ['nom', 'prenom'] }]
                }
            ],
            order: [['datePrescription', 'DESC']]
        });

        // Récupérer les résultats d'examen anormaux récents
        const resultatsAnormaux = await ExamenLabo.findAll({
            where: { 
                patient_id: patientId,
                resultat: 'anormal',
                statut: 'valide'
            },
            include: [
                { 
                    model: ProfessionnelSante, 
                    as: 'professionnel',
                    include: [{ model: Utilisateur, as: 'compteUtilisateur', attributes: ['nom', 'prenom'] }]
                }
            ],
            order: [['date_examen', 'DESC']],
            limit: 5
        });

        // Construire le dossier complet
        const dossierComplet = {
            dossier: dossier,
            prescriptions_actives: prescriptions,
            examens_recents: examens,
            consultations_recentes: consultations,
            demandes_en_attente: demandesEnAttente,
            resultats_anormaux: resultatsAnormaux,
            resume: {
                nombre_prescriptions_actives: prescriptions.length,
                nombre_examens_recents: examens.length,
                nombre_consultations_recentes: consultations.length,
                nombre_demandes_en_attente: demandesEnAttente.length,
                nombre_resultats_anormaux: resultatsAnormaux.length
            }
        };

        return dossierComplet;
    } catch (error) {
        console.error(`Erreur lors de la récupération du dossier complet pour le patient ${patientId}:`, error);
        throw new Error('Impossible de récupérer le dossier médical complet.');
    }
},

/**
 * Récupère un résumé des informations médicales d'un patient
 * @param {number} patientId - L'ID du patient
 * @returns {Promise<object>} Le résumé des informations médicales
 */
async getResumePatient(patientId) {
    try {
        // Compter les différents types d'informations
        const [prescriptionsCount, examensCount, consultationsCount] = await Promise.all([
            Prescription.count({ where: { patient_id: patientId, statut: 'active' } }),
            ExamenLabo.count({ where: { patient_id: patientId, statut: 'valide' } }),
            Consultation.count({ 
                include: [{ model: DossierMedical, as: 'dossier', where: { patient_id: patientId } }]
            })
        ]);

        // Récupérer les dernières activités
        const dernierePrescription = await Prescription.findOne({
            where: { patient_id: patientId },
            order: [['datePrescription', 'DESC']],
            include: [
                { 
                    model: ProfessionnelSante, 
                    as: 'redacteur',
                    include: [{ model: Utilisateur, as: 'compteUtilisateur', attributes: ['nom', 'prenom'] }]
                }
            ]
        });

        const dernierExamen = await ExamenLabo.findOne({
            where: { patient_id: patientId, statut: 'valide' },
            order: [['date_examen', 'DESC']],
            include: [
                { 
                    model: ProfessionnelSante, 
                    as: 'professionnel',
                    include: [{ model: Utilisateur, as: 'compteUtilisateur', attributes: ['nom', 'prenom'] }]
                }
            ]
        });

        const derniereConsultation = await Consultation.findOne({
            include: [
                { model: DossierMedical, as: 'dossier', where: { patient_id: patientId } },
                { 
                    model: ProfessionnelSante, 
                    as: 'professionnel',
                    include: [{ model: Utilisateur, as: 'compteUtilisateur', attributes: ['nom', 'prenom'] }]
                }
            ],
            order: [['date_consultation', 'DESC']]
        });

        return {
            resume: {
                prescriptions_actives: prescriptionsCount,
                examens_valides: examensCount,
                consultations_total: consultationsCount
            },
            dernieres_activites: {
                derniere_prescription: dernierePrescription,
                dernier_examen: dernierExamen,
                derniere_consultation: derniereConsultation
            }
        };
    } catch (error) {
        console.error(`Erreur lors de la récupération du résumé pour le patient ${patientId}:`, error);
        throw new Error('Impossible de récupérer le résumé du patient.');
    }
}
};

module.exports = dossierMedicalService;