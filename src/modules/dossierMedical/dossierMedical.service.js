// src/modules/dossierMedical/dossierMedical.service.js

const { DossierMedical, Patient, ProfessionnelSante, Utilisateur, ServiceSante, Prescription, ExamenLabo, Consultation, DocumentPersonnel } = require('../../models');
const { Op } = require('sequelize');
const fs = require('fs').promises;
const path = require('path');

/**
 * Service pour la gestion des documents personnels des patients
 */
const documentPersonnelService = {
    /**
     * Upload d'un nouveau document personnel
     * @param {object} documentData - Données du document à créer
     * @param {number} documentData.patient_id - ID du patient
     * @param {string} documentData.nom - Nom du document
     * @param {string} documentData.type - Type de document (ordonnance, resultat, certificat, autre)
     * @param {string} documentData.description - Description du document
     * @param {string} documentData.url - Chemin du fichier uploadé
     * @param {number} documentData.taille - Taille du fichier en bytes
     * @param {string} documentData.format - Format du fichier
     * @returns {Promise<DocumentPersonnel>} Le document créé
     */
    async uploadDocument(documentData) {
        try {
            // Validation des données obligatoires
            if (!documentData.patient_id || !documentData.nom || !documentData.type) {
                throw new Error('Les champs patient_id, nom et type sont obligatoires');
            }

            // Validation du type de document
            const typesValides = ['ordonnance', 'resultat', 'certificat', 'general', 'autre'];
            if (!typesValides.includes(documentData.type)) {
                throw new Error('Type de document invalide. Types autorisés: ' + typesValides.join(', '));
            }

            // Vérifier que le patient existe
            const patient = await Patient.findByPk(documentData.patient_id);
            if (!patient) {
                throw new Error('Patient non trouvé');
            }

            // Créer le document
            const nouveauDocument = await DocumentPersonnel.create(documentData);
            
            console.log('✅ [documentPersonnelService.uploadDocument] Document uploadé avec succès:', nouveauDocument.id);
            return nouveauDocument;
        } catch (error) {
            console.error('❌ [documentPersonnelService.uploadDocument] Erreur lors de l\'upload du document:', error);
            throw new Error(`Impossible d'uploader le document: ${error.message}`);
        }
    },

    /**
     * Récupère tous les documents personnels d'un patient
     * @param {number} patientId - ID du patient
     * @param {object} filters - Filtres optionnels (type, date, etc.)
     * @returns {Promise<DocumentPersonnel[]>} Liste des documents du patient
     */
    async getDocumentsByPatient(patientId, filters = {}) {
        try {
            const whereClause = { patient_id: patientId };
            
            // Appliquer les filtres
            if (filters.type) {
                whereClause.type = filters.type;
            }
            if (filters.date_debut && filters.date_fin) {
                whereClause.createdAt = {
                    [Op.between]: [filters.date_debut, filters.date_fin]
                };
            }

            const documents = await DocumentPersonnel.findAll({
                where: whereClause,
                order: [['createdAt', 'DESC']],
                include: [
                    {
                        model: Patient,
                        as: 'patient',
                        attributes: ['id_patient', 'nom', 'prenom']
                    }
                ]
            });

            return documents;
        } catch (error) {
            console.error(`❌ [documentPersonnelService.getDocumentsByPatient] Erreur lors de la récupération des documents pour le patient ${patientId}:`, error);
            throw new Error('Impossible de récupérer les documents du patient');
        }
    },

    /**
     * Récupère un document personnel par son ID
     * @param {number} documentId - ID du document
     * @returns {Promise<DocumentPersonnel|null>} Le document ou null si non trouvé
     */
    async getDocumentById(documentId) {
        try {
            const document = await DocumentPersonnel.findByPk(documentId, {
                include: [
                    {
                        model: Patient,
                        as: 'patient',
                        attributes: ['id_patient', 'nom', 'prenom']
                    }
                ]
            });

            return document;
        } catch (error) {
            console.error(`❌ [documentPersonnelService.getDocumentById] Erreur lors de la récupération du document ${documentId}:`, error);
            throw new Error('Impossible de récupérer le document');
        }
    },

    /**
     * Met à jour un document personnel
     * @param {number} documentId - ID du document à mettre à jour
     * @param {object} updateData - Données de mise à jour
     * @returns {Promise<DocumentPersonnel|null>} Le document mis à jour ou null si non trouvé
     */
    async updateDocument(documentId, updateData) {
        try {
            const document = await DocumentPersonnel.findByPk(documentId);
            
            if (!document) {
                console.log('⚠️ [documentPersonnelService.updateDocument] Document non trouvé:', documentId);
                return null;
            }

            // Validation du type si modifié
            if (updateData.type) {
                const typesValides = ['ordonnance', 'resultat', 'certificat', 'general', 'autre'];
                if (!typesValides.includes(updateData.type)) {
                    throw new Error('Type de document invalide. Types autorisés: ' + typesValides.join(', '));
                }
            }

            await document.update(updateData);
            
            console.log('✅ [documentPersonnelService.updateDocument] Document mis à jour avec succès:', documentId);
            return document;
        } catch (error) {
            console.error(`❌ [documentPersonnelService.updateDocument] Erreur lors de la mise à jour du document ${documentId}:`, error);
            throw new Error(`Impossible de mettre à jour le document: ${error.message}`);
        }
    },

    /**
     * Supprime un document personnel
     * @param {number} documentId - ID du document à supprimer
     * @returns {Promise<boolean>} True si supprimé avec succès
     */
    async deleteDocument(documentId) {
        try {
            const document = await DocumentPersonnel.findByPk(documentId);
            
            if (!document) {
                console.log('⚠️ [documentPersonnelService.deleteDocument] Document non trouvé:', documentId);
                return false;
            }

            // Supprimer l'enregistrement de la base (le contenu est automatiquement supprimé)
            await document.destroy();
            
            console.log('✅ [documentPersonnelService.deleteDocument] Document supprimé avec succès:', documentId);
            return true;
        } catch (error) {
            console.error(`❌ [documentPersonnelService.deleteDocument] Erreur lors de la suppression du document ${documentId}:`, error);
            throw new Error(`Impossible de supprimer le document: ${error.message}`);
        }
    },

    /**
     * Récupère les statistiques des documents d'un patient
     * @param {number} patientId - ID du patient
     * @returns {Promise<object>} Statistiques des documents
     */
    async getDocumentStats(patientId) {
        try {
            const [totalDocuments, documentsParType] = await Promise.all([
                DocumentPersonnel.count({ where: { patient_id: patientId } }),
                DocumentPersonnel.findAll({
                    where: { patient_id: patientId },
                    attributes: [
                        'type',
                        [sequelize.literal('COUNT(*)'), 'count']
                    ],
                    group: ['type'],
                    raw: true
                })
            ]);

            const stats = {
                total_documents: totalDocuments,
                par_type: documentsParType.reduce((acc, item) => {
                    acc[item.type] = parseInt(item.count);
                    return acc;
                }, {}),
                taille_totale: await DocumentPersonnel.sum('taille', { where: { patient_id: patientId } }) || 0
            };

            return stats;
        } catch (error) {
            console.error(`❌ [documentPersonnelService.getDocumentStats] Erreur lors de la récupération des statistiques pour le patient ${patientId}:`, error);
            throw new Error('Impossible de récupérer les statistiques des documents');
        }
    },

    /**
     * Recherche de documents par critères
     * @param {object} searchCriteria - Critères de recherche
     * @param {number} searchCriteria.patient_id - ID du patient (optionnel)
     * @param {string} searchCriteria.nom - Nom du document (recherche partielle)
     * @param {string} searchCriteria.type - Type de document
     * @param {string} searchCriteria.description - Description (recherche partielle)
     * @param {string} searchCriteria.date_debut - Date de début de création
     * @param {string} searchCriteria.date_fin - Date de fin de création
     * @returns {Promise<DocumentPersonnel[]>} Documents correspondant aux critères
     */
    async searchDocuments(searchCriteria) {
        try {
            const whereClause = {};
            
            if (searchCriteria.patient_id) {
                whereClause.patient_id = searchCriteria.patient_id;
            }
            
            if (searchCriteria.nom) {
                whereClause.nom = {
                    [Op.iLike]: `%${searchCriteria.nom}%`
                };
            }
            
            if (searchCriteria.type) {
                whereClause.type = searchCriteria.type;
            }
            
            if (searchCriteria.description) {
                whereClause.description = {
                    [Op.iLike]: `%${searchCriteria.description}%`
                };
            }
            
            if (searchCriteria.date_debut && searchCriteria.date_fin) {
                whereClause.createdAt = {
                    [Op.between]: [searchCriteria.date_debut, searchCriteria.date_fin]
                };
            }

            const documents = await DocumentPersonnel.findAll({
                where: whereClause,
                include: [
                    {
                        model: Patient,
                        as: 'patient',
                        attributes: ['id_patient', 'nom', 'prenom']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            return documents;
        } catch (error) {
            console.error('❌ [documentPersonnelService.searchDocuments] Erreur lors de la recherche de documents:', error);
            throw new Error('Impossible de rechercher les documents');
        }
    }
};

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
   * Récupère tous les dossiers médicaux avec seulement l'ID et le statut
   * @param {object} filters - Filtres à appliquer (ex: { patient_id: 1, statut: 'actif' }).
   * @returns {Promise<Array<{id_dossier: number, statut: string}>>} Liste des dossiers médicaux avec ID et statut.
   */
async getAllDossiers(filters = {}) {
    try {
        return await DossierMedical.findAll({
            where: filters,
            attributes: ['id_dossier', 'statut'],
            raw: true
        });
    } catch (error) {
        throw new Error(`Erreur lors de la récupération des dossiers: ${error.message}`);
    }
},

/**
   * Récupère tous les dossiers médicaux, avec options de filtrage et d'inclusion.
   * @param {object} filters - Filtres à appliquer (ex: { patient_id: 1, statut: 'Ouvert' }).
   * @param {string[]} includes - Modèles à inclure (ex: ['patient', 'medecinReferent']).
   * @returns {Promise<DossierMedical[]>} Liste des dossiers médicaux.
   */
async getAllDossiersWithIncludes(filters = {}, includes = []) {
    const includeOptions = [];

    if (includes.includes('patient')) {
        includeOptions.push({ model: Patient, as: 'patient' });
    }
    if (includes.includes('professionnelsDuService')) {
        includeOptions.push({ model: ProfessionnelSante, as: 'professionnelsDuService', include: [{ model: ServiceSante, as: 'serviceSante', attributes: ['nom', 'prenom'] }] });
    }
    if (includes.includes('serviceResponsable')) {
        includeOptions.push({
            model: ServiceSante,
            as: 'serviceResponsable',
            attributes: [
                'id_service', 'code', 'nom', 'description', 'type_service', 'telephone', 'email', 'hopital_id', 'statut', 'horaires_ouverture', 'informations_complementaires', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt', 'deletedAt'
            ]
        });
    }
    // if (includes.includes('createur')) {
    //     includeOptions.push({ model: Utilisateur, as: 'createur', attributes: ['nom', 'prenom'] });
    // }
    if (includes.includes('dernierModificateur')) {
        includeOptions.push({ model: ProfessionnelSante, as: 'dernierModificateur', attributes: ['nom', 'prenom'] });
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
 *  Récupère un dossier médical par son ID avec les informations du patient incluses par défaut.
 *  Inclut automatiquement les informations complètes du patient et de son compte utilisateur.
 *  
 *  @param {number} id_dossier - L'ID du dossier médical.
 *  @param {string[]} [includes=[]] - Modèles supplémentaires à inclure. Peut contenir :
 *    - 'professionnelsDuService' : Inclut les professionnels du service liés au dossier
 *    - 'serviceResponsable' : Inclut les informations du service responsable
 *    - 'createur' : Inclut les informations de l'utilisateur ayant créé le dossier
 *    - 'dernierModificateur' : Inclut les informations du dernier utilisateur ayant modifié le dossier
 *  
 *  @returns {Promise<DossierMedical|null>} Le dossier médical avec les informations du patient incluses, ou null si non trouvé.
 *  
 *  @example
 *  // Retourne le dossier avec les informations du patient incluses
 *  const dossier = await getDossierById(123);
 *  
 *  // Retourne le dossier avec le patient et le service responsable
 *  const dossierAvecService = await getDossierById(123, ['serviceResponsable']);
 **/
async getDossierById(id_dossier, includes = []) {
    // Inclure uniquement les informations du patient de base
    const includeOptions = [
        { 
            model: Patient, 
            as: 'patient',
            attributes: ['id_patient', 'numero_dossier', 'nom', 'prenom', 'date_naissance', 'sexe', 'adresse', 'telephone', 'email']
        }
    ];

    // Ajouter les autres inclusions demandées
    if (includes.includes('professionnelsDuService')) {
        includeOptions.push({ 
            model: ProfessionnelSante, 
            as: 'professionnelsDuService', 
            include: [{ 
                model: ServiceSante, 
                as: 'serviceSante', 
                attributes: ['nom', 'prenom'] 
            }] 
        });
    }
    if (includes.includes('serviceResponsable')) {
        includeOptions.push({
            model: ServiceSante,
            as: 'serviceResponsable',
            attributes: [
                'id_service', 'code', 'nom', 'description', 'type_service', 'telephone', 'email', 'hopital_id', 'statut', 'horaires_ouverture', 'informations_complementaires', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt', 'deletedAt'
            ]
        });
    }
    if (includes.includes('createur')) {
        includeOptions.push({ 
            model: Utilisateur, 
            as: 'createur', 
            attributes: ['id_utilisateur', 'nom', 'prenom', 'email'] 
        });
    }
    if (includes.includes('dernierModificateur')) {
        includeOptions.push({ 
            model: Utilisateur, 
            as: 'dernierModificateur', 
            attributes: ['id_utilisateur', 'nom', 'prenom', 'email'] 
        });
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
 * Met à jour un dossier médical existant.
 * @param {number} id_dossier - L'ID du dossier à mettre à jour.
 * @param {object} updateData - Données de mise à jour.
 * @returns {Promise<DossierMedical|null>} Le dossier mis à jour ou null si non trouvé.
 */
async updateDossier(id_dossier, updateData) {
    try {
        // Validation de l'ID
        if (!id_dossier || isNaN(id_dossier) || id_dossier <= 0) {
            console.error('❌ [updateDossier] ID invalide:', id_dossier);
            throw new Error('ID du dossier médical invalide');
        }
        
        console.log('🔍 [updateDossier] Recherche du dossier:', id_dossier);
        const dossier = await DossierMedical.findByPk(id_dossier);
        
        if (!dossier) {
            console.log('⚠️ [updateDossier] Dossier non trouvé:', id_dossier);
            return null;
        }
        
        console.log('✅ [updateDossier] Dossier trouvé, mise à jour en cours...');
        await dossier.update(updateData);
        
        console.log('✅ [updateDossier] Dossier mis à jour avec succès:', id_dossier);
        return dossier;
    } catch (error) {
        console.error(`❌ [updateDossier] Erreur lors de la mise à jour du dossier médical avec l'ID ${id_dossier}:`, error);
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
        includeOptions.push({
            model: ServiceSante,
            as: 'serviceResponsable',
            attributes: [
                'id_service', 'code', 'nom', 'description', 'type_service', 'telephone', 'email', 'hopital_id', 'statut', 'horaires_ouverture', 'informations_complementaires', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt', 'deletedAt'
            ]
        });
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
        console.log('🔍 [service.getDossierCompletPatient] Début pour le patient:', patientId);
        
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
                {
                    model: ServiceSante,
                    as: 'serviceResponsable',
                    attributes: [
                        'id_service', 'code', 'nom', 'description', 'type_service', 'telephone', 'email', 'hopital_id', 'statut', 'horaires_ouverture', 'informations_complementaires', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt', 'deletedAt'
                    ]
                }
            ]
        });

        if (!dossier) {
            console.log('⚠️ [service.getDossierCompletPatient] Aucun dossier médical trouvé pour le patient', patientId, '- Retour d\'une réponse vide');
            
            // Retourner une réponse indiquant qu'aucun dossier n'existe
            return {
                status: 'success',
                message: 'Aucun dossier médical trouvé pour ce patient',
                data: {
                    dossier: null,
                    prescriptions_actives: [],
                    examens_recents: [],
                    consultations_recentes: [],
                    demandes_en_attente: [],
                    resultats_anormaux: [],
                    resume: {
                        nombre_prescriptions_actives: 0,
                        nombre_examens_recents: 0,
                        nombre_consultations_recentes: 0,
                        nombre_demandes_en_attente: 0,
                        nombre_resultats_anormaux: 0
                    }
                }
            };
        }

        console.log('✅ [service.getDossierCompletPatient] Dossier principal trouvé, récupération des données associées...');

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
            order: [['date_prescription', 'DESC']]
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
                    as: 'prescripteur',
                    include: [{ model: Utilisateur, as: 'compteUtilisateur', attributes: ['nom', 'prenom'] }]
                },
                {
                    model: ProfessionnelSante,
                    as: 'validateur',
                    include: [{ model: Utilisateur, as: 'compteUtilisateur', attributes: ['nom', 'prenom'] }]
                }
            ],
            order: [['date_realisation', 'DESC']],
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
                statut: 'en_attente'
            },
            include: [
                { 
                    model: ProfessionnelSante, 
                    as: 'redacteur',
                    include: [{ model: Utilisateur, as: 'compteUtilisateur', attributes: ['nom', 'prenom'] }]
                }
            ],
            order: [['date_prescription', 'DESC']]
        });

        // Récupérer les résultats d'examen anormaux récents
        const resultatsAnormaux = await ExamenLabo.findAll({
            where: { 
                patient_id: patientId,
                resultat_texte: 'anormal',
                statut: 'valide'
            },
            include: [
                { 
                    model: ProfessionnelSante, 
                    as: 'prescripteur',
                    include: [{ model: Utilisateur, as: 'compteUtilisateur', attributes: ['nom', 'prenom'] }]
                },
                {
                    model: ProfessionnelSante,
                    as: 'validateur',
                    include: [{ model: Utilisateur, as: 'compteUtilisateur', attributes: ['nom', 'prenom'] }]
                }
            ],
            order: [['date_realisation', 'DESC']],
            limit: 5
        });

        console.log('✅ [service.getDossierCompletPatient] Toutes les données récupérées avec succès');

        // Construire le dossier complet
        const dossierComplet = {
            status: 'success',
            message: 'Dossier médical complet récupéré avec succès',
            data: {
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
            }
        };

        return dossierComplet;
    } catch (error) {
        console.error('❌ [service.getDossierCompletPatient] Erreur lors de la récupération du dossier complet pour le patient', patientId, ':', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        // Remonter l'erreur avec plus de contexte
        if (error.name === 'SequelizeValidationError') {
            throw new Error(`Erreur de validation des données: ${error.message}`);
        } else if (error.name === 'SequelizeDatabaseError') {
            throw new Error(`Erreur de base de données: ${error.message}`);
        } else if (error.name === 'SequelizeConnectionError') {
            throw new Error('Erreur de connexion à la base de données');
        } else {
            throw new Error(`Impossible de récupérer le dossier médical complet: ${error.message}`);
        }
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
            order: [['date_prescription', 'DESC']],
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
            order: [['date_realisation', 'DESC']],
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

// Exposer le service des documents personnels
dossierMedicalService.documentPersonnel = documentPersonnelService;

module.exports = dossierMedicalService;