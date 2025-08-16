/**
 * Service pour la gestion des auto-mesures des patients
 */

const { AutoMesure, Patient } = require('../../models');
const { Op } = require('sequelize');

class AutoMesureService {
    /**
     * Créer une nouvelle auto-mesure
     * @param {Object} autoMesureData - Données de l'auto-mesure
     * @returns {Promise<AutoMesure>} L'auto-mesure créée
     */
    async createAutoMesure(autoMesureData) {
        try {
            // Validation des données
            if (!autoMesureData.patient_id) {
                throw new Error('ID du patient requis');
            }

            if (!autoMesureData.type_mesure) {
                throw new Error('Type de mesure requis');
            }

            if (autoMesureData.valeur === undefined || autoMesureData.valeur === null) {
                throw new Error('Valeur de mesure requise');
            }

            // Vérifier que le patient existe
            const patient = await Patient.findByPk(autoMesureData.patient_id);
            if (!patient) {
                throw new Error('Patient non trouvé');
            }

            // Créer l'auto-mesure
            const autoMesure = await AutoMesure.create({
                ...autoMesureData,
                date_mesure: autoMesureData.date_mesure || new Date(),
                heure_mesure: autoMesureData.heure_mesure || new Date().toTimeString().slice(0, 8)
            });

            return autoMesure;
        } catch (error) {
            throw new Error(`Erreur lors de la création de l'auto-mesure: ${error.message}`);
        }
    }

    /**
     * Récupérer une auto-mesure par ID
     * @param {number} id - ID de l'auto-mesure
     * @returns {Promise<AutoMesure|null>} L'auto-mesure trouvée
     */
    async getAutoMesureById(id) {
        try {
            const autoMesure = await AutoMesure.findByPk(id, {
                include: [{
                    model: Patient,
                    as: 'patient',
                    attributes: ['id_patient', 'nom', 'prenom', 'date_naissance']
                }]
            });

            return autoMesure;
        } catch (error) {
            throw new Error(`Erreur lors de la récupération de l'auto-mesure: ${error.message}`);
        }
    }

    /**
     * Récupérer toutes les auto-mesures d'un patient
     * @param {number} patientId - ID du patient
     * @param {Object} filters - Filtres optionnels
     * @returns {Promise<Array<AutoMesure>>} Liste des auto-mesures
     */
    async getAutoMesuresByPatient(patientId, filters = {}) {
        try {
            const whereClause = { patient_id: patientId };

            // Filtres optionnels
            if (filters.type_mesure) {
                whereClause.type_mesure = filters.type_mesure;
            }

            if (filters.date_debut && filters.date_fin) {
                whereClause.date_mesure = {
                    [Op.between]: [filters.date_debut, filters.date_fin]
                };
            }

            if (filters.valeur_min !== undefined) {
                whereClause.valeur = {
                    [Op.gte]: filters.valeur_min
                };
            }

            if (filters.valeur_max !== undefined) {
                whereClause.valeur = {
                    ...whereClause.valeur,
                    [Op.lte]: filters.valeur_max
                };
            }

            const autoMesures = await AutoMesure.findAll({
                where: whereClause,
                include: [{
                    model: Patient,
                    as: 'patient',
                    attributes: ['id_patient', 'nom', 'prenom']
                }],
                order: [['date_mesure', 'DESC'], ['heure_mesure', 'DESC']],
                limit: filters.limit || 100,
                offset: filters.offset || 0
            });

            return autoMesures;
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des auto-mesures: ${error.message}`);
        }
    }

    /**
     * Récupérer toutes les auto-mesures avec filtres
     * @param {Object} filters - Filtres optionnels
     * @returns {Promise<Array<AutoMesure>>} Liste des auto-mesures
     */
    async getAllAutoMesures(filters = {}) {
        try {
            const whereClause = {};

            if (filters.patient_id) {
                whereClause.patient_id = filters.patient_id;
            }

            if (filters.type_mesure) {
                whereClause.type_mesure = filters.type_mesure;
            }

            if (filters.date_debut && filters.date_fin) {
                whereClause.date_mesure = {
                    [Op.between]: [filters.date_debut, filters.date_fin]
                };
            }

            const autoMesures = await AutoMesure.findAll({
                where: whereClause,
                include: [{
                    model: Patient,
                    as: 'patient',
                    attributes: ['id_patient', 'nom', 'prenom']
                }],
                order: [['date_mesure', 'DESC'], ['heure_mesure', 'DESC']],
                limit: filters.limit || 100,
                offset: filters.offset || 0
            });

            return autoMesures;
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des auto-mesures: ${error.message}`);
        }
    }

    /**
     * Mettre à jour une auto-mesure
     * @param {number} id - ID de l'auto-mesure
     * @param {Object} updateData - Données de mise à jour
     * @returns {Promise<AutoMesure|null>} L'auto-mesure mise à jour
     */
    async updateAutoMesure(id, updateData) {
        try {
            const autoMesure = await AutoMesure.findByPk(id);
            if (!autoMesure) {
                return null;
            }

            // Mise à jour des champs autorisés
            const allowedFields = [
                'type_mesure', 'valeur', 'valeur_secondaire', 'unite', 
                'unite_secondaire', 'date_mesure', 'heure_mesure', 'notes'
            ];

            const filteredData = {};
            allowedFields.forEach(field => {
                if (updateData[field] !== undefined) {
                    filteredData[field] = updateData[field];
                }
            });

            await autoMesure.update(filteredData);
            return autoMesure;
        } catch (error) {
            throw new Error(`Erreur lors de la mise à jour de l'auto-mesure: ${error.message}`);
        }
    }

    /**
     * Supprimer une auto-mesure
     * @param {number} id - ID de l'auto-mesure
     * @returns {Promise<boolean>} True si supprimée
     */
    async deleteAutoMesure(id) {
        try {
            const autoMesure = await AutoMesure.findByPk(id);
            if (!autoMesure) {
                return false;
            }

            await autoMesure.destroy();
            return true;
        } catch (error) {
            throw new Error(`Erreur lors de la suppression de l'auto-mesure: ${error.message}`);
        }
    }

    /**
     * Obtenir les statistiques des auto-mesures d'un patient
     * @param {number} patientId - ID du patient
     * @param {string} typeMesure - Type de mesure (optionnel)
     * @returns {Promise<Object>} Statistiques des mesures
     */
    async getAutoMesuresStats(patientId, typeMesure = null) {
        try {
            const whereClause = { patient_id: patientId };
            if (typeMesure) {
                whereClause.type_mesure = typeMesure;
            }

            const stats = await AutoMesure.findAll({
                where: whereClause,
                attributes: [
                    'type_mesure',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'total_mesures'],
                    [sequelize.fn('AVG', sequelize.col('valeur')), 'moyenne'],
                    [sequelize.fn('MIN', sequelize.col('valeur')), 'minimum'],
                    [sequelize.fn('MAX', sequelize.col('valeur')), 'maximum'],
                    [sequelize.fn('DATE', sequelize.col('date_mesure')), 'derniere_mesure']
                ],
                group: ['type_mesure'],
                order: [['type_mesure', 'ASC']]
            });

            return stats;
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
        }
    }

    /**
     * Obtenir la dernière auto-mesure d'un patient par type
     * @param {number} patientId - ID du patient
     * @param {string} typeMesure - Type de mesure
     * @returns {Promise<AutoMesure|null>} Dernière auto-mesure
     */
    async getLastAutoMesureByType(patientId, typeMesure) {
        try {
            const autoMesure = await AutoMesure.findOne({
                where: {
                    patient_id: patientId,
                    type_mesure: typeMesure
                },
                order: [['date_mesure', 'DESC'], ['heure_mesure', 'DESC']],
                include: [{
                    model: Patient,
                    as: 'patient',
                    attributes: ['id_patient', 'nom', 'prenom']
                }]
            });

            return autoMesure;
        } catch (error) {
            throw new Error(`Erreur lors de la récupération de la dernière mesure: ${error.message}`);
        }
    }
}

module.exports = new AutoMesureService();
