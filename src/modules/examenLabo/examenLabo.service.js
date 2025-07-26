const { ExamenLabo, Patient, ProfessionnelSante, DossierMedical, Prescription, Utilisateur } = require('../../models');
const { Op } = require('sequelize');
const AppError = require('../../utils/appError');

const examenLaboService = {

    /**
     * Créer un nouveau résultat d'examen
     */
    async createResultatExamen(resultatData) {
        try {
            // Validation des données requises
            const { patient_id, professionnel_id, type_examen, resultat, valeur_normale } = resultatData;
            
            if (!patient_id || !professionnel_id || !type_examen || !resultat) {
                throw new AppError('Données manquantes pour créer le résultat d\'examen', 400);
            }

            // Vérifier que le patient existe
            const patient = await Patient.findByPk(patient_id);
            if (!patient) {
                throw new AppError('Patient non trouvé', 404);
            }

            // Vérifier que le professionnel existe
            const professionnel = await ProfessionnelSante.findByPk(professionnel_id);
            if (!professionnel) {
                throw new AppError('Professionnel de santé non trouvé', 404);
            }

            // Créer le résultat d'examen
            const nouveauResultat = await ExamenLabo.create({
                ...resultatData,
                statut: 'en_attente' // Par défaut en attente de validation
            });

            return nouveauResultat;
        } catch (error) {
            console.error('Erreur lors de la création du résultat d\'examen:', error);
            throw error;
        }
    },

    /**
     * Récupérer les résultats d'examen d'un patient
     */
    async getResultatsByPatient(patientId, filters = {}, includes = []) {
        try {
            const includeOptions = [];

            if (includes.includes('patient')) {
                includeOptions.push({ model: Patient, as: 'patient' });
            }
            if (includes.includes('professionnel')) {
                includeOptions.push({ 
                    model: ProfessionnelSante, 
                    as: 'professionnel',
                    include: [{ model: Utilisateur, as: 'compteUtilisateur', attributes: ['nom', 'prenom'] }]
                });
            }
            if (includes.includes('dossier')) {
                includeOptions.push({ model: DossierMedical, as: 'dossier' });
            }
            if (includes.includes('prescription')) {
                includeOptions.push({ model: Prescription, as: 'prescription' });
            }

            const resultats = await ExamenLabo.findAll({
                where: {
                    patient_id: patientId,
                    ...filters
                },
                include: includeOptions,
                order: [['date_examen', 'DESC']]
            });

            return resultats;
        } catch (error) {
            console.error('Erreur lors de la récupération des résultats d\'examen:', error);
            throw new AppError('Impossible de récupérer les résultats d\'examen', 500);
        }
    },

    /**
     * Récupérer un résultat d'examen par son ID
     */
    async getResultatById(id, includes = []) {
        try {
            const includeOptions = [];

            if (includes.includes('patient')) {
                includeOptions.push({ model: Patient, as: 'patient' });
            }
            if (includes.includes('professionnel')) {
                includeOptions.push({ 
                    model: ProfessionnelSante, 
                    as: 'professionnel',
                    include: [{ model: Utilisateur, as: 'compteUtilisateur', attributes: ['nom', 'prenom'] }]
                });
            }
            if (includes.includes('dossier')) {
                includeOptions.push({ model: DossierMedical, as: 'dossier' });
            }
            if (includes.includes('prescription')) {
                includeOptions.push({ model: Prescription, as: 'prescription' });
            }

            const resultat = await ExamenLabo.findByPk(id, {
                include: includeOptions
            });

            return resultat;
        } catch (error) {
            console.error('Erreur lors de la récupération du résultat d\'examen:', error);
            throw new AppError('Impossible de récupérer le résultat d\'examen', 500);
        }
    },

    /**
     * Mettre à jour un résultat d'examen
     */
    async updateResultat(id, updateData) {
        try {
            const resultat = await ExamenLabo.findByPk(id);
            if (!resultat) {
                return null;
            }

            await resultat.update(updateData);
            return resultat;
        } catch (error) {
            console.error('Erreur lors de la mise à jour du résultat d\'examen:', error);
            throw new AppError('Impossible de mettre à jour le résultat d\'examen', 500);
        }
    },

    /**
     * Supprimer un résultat d'examen (soft delete)
     */
    async deleteResultat(id) {
        try {
            const result = await ExamenLabo.destroy({
                where: { id_examen: id }
            });
            return result;
        } catch (error) {
            console.error('Erreur lors de la suppression du résultat d\'examen:', error);
            throw new AppError('Impossible de supprimer le résultat d\'examen', 500);
        }
    },

    /**
     * Valider un résultat d'examen
     */
    async validerResultat(id, validationData) {
        try {
            const resultat = await ExamenLabo.findByPk(id);
            if (!resultat) {
                return null;
            }

            // Mettre à jour le résultat
            await resultat.update({
                statut: 'valide',
                date_validation: new Date(),
                ...validationData
            });

            return resultat;
        } catch (error) {
            console.error('Erreur lors de la validation du résultat d\'examen:', error);
            throw new AppError('Impossible de valider le résultat d\'examen', 500);
        }
    },

    /**
     * Récupérer les résultats d'examen en attente de validation
     */
    async getResultatsEnAttente(serviceId = null) {
        try {
            const whereClause = { statut: 'en_attente' };
            
            if (serviceId) {
                whereClause.service_id = serviceId;
            }

            const resultats = await ExamenLabo.findAll({
                where: whereClause,
                include: [
                    { model: Patient, as: 'patient' },
                    { 
                        model: ProfessionnelSante, 
                        as: 'professionnel',
                        include: [{ model: Utilisateur, as: 'compteUtilisateur', attributes: ['nom', 'prenom'] }]
                    }
                ],
                order: [['date_examen', 'ASC']]
            });

            return resultats;
        } catch (error) {
            console.error('Erreur lors de la récupération des résultats en attente:', error);
            throw new AppError('Impossible de récupérer les résultats en attente', 500);
        }
    },

    /**
     * Récupérer les statistiques d'examens d'un patient
     */
    async getStatistiquesPatient(patientId, periode = 'annee') {
        try {
            const dateLimite = new Date();
            
            // Calculer la date de début selon la période
            switch (periode) {
                case 'mois':
                    dateLimite.setMonth(dateLimite.getMonth() - 1);
                    break;
                case 'trimestre':
                    dateLimite.setMonth(dateLimite.getMonth() - 3);
                    break;
                case 'annee':
                default:
                    dateLimite.setFullYear(dateLimite.getFullYear() - 1);
                    break;
            }

            const resultats = await ExamenLabo.findAll({
                where: {
                    patient_id: patientId,
                    date_examen: {
                        [Op.gte]: dateLimite
                    }
                },
                attributes: [
                    'type_examen',
                    'statut',
                    [sequelize.fn('COUNT', sequelize.col('id_examen')), 'nombre_examens']
                ],
                group: ['type_examen', 'statut'],
                raw: true
            });

            // Calculer les statistiques
            const statistiques = {
                total_examens: 0,
                examens_valides: 0,
                examens_en_attente: 0,
                examens_anormaux: 0,
                par_type: {}
            };

            resultats.forEach(resultat => {
                const count = parseInt(resultat.nombre_examens);
                statistiques.total_examens += count;
                
                if (resultat.statut === 'valide') {
                    statistiques.examens_valides += count;
                } else if (resultat.statut === 'en_attente') {
                    statistiques.examens_en_attente += count;
                }

                if (!statistiques.par_type[resultat.type_examen]) {
                    statistiques.par_type[resultat.type_examen] = 0;
                }
                statistiques.par_type[resultat.type_examen] += count;
            });

            return statistiques;
        } catch (error) {
            console.error('Erreur lors du calcul des statistiques:', error);
            throw new AppError('Impossible de calculer les statistiques', 500);
        }
    },

    /**
     * Récupérer les résultats d'examen anormaux d'un patient
     */
    async getResultatsAnormaux(patientId) {
        try {
            const resultats = await ExamenLabo.findAll({
                where: {
                    patient_id: patientId,
                    resultat: 'anormal'
                },
                include: [
                    { model: Patient, as: 'patient' },
                    { 
                        model: ProfessionnelSante, 
                        as: 'professionnel',
                        include: [{ model: Utilisateur, as: 'compteUtilisateur', attributes: ['nom', 'prenom'] }]
                    }
                ],
                order: [['date_examen', 'DESC']]
            });

            return resultats;
        } catch (error) {
            console.error('Erreur lors de la récupération des résultats anormaux:', error);
            throw new AppError('Impossible de récupérer les résultats anormaux', 500);
        }
    }
};

module.exports = examenLaboService; 