const { Prescription, Patient, ProfessionnelSante, DossierMedical, Consultation, Utilisateur } = require('../../models');
const { Op } = require('sequelize');
const AppError = require('../../utils/appError');

const prescriptionService = {

    /**
     * Créer une nouvelle ordonnance
     */
    async createOrdonnance(prescriptionData) {
        try {
            // Validation des données requises
            const { patient_id, professionnel_id, medicament, dosage, frequence } = prescriptionData;
            
            if (!patient_id || !professionnel_id || !medicament || !dosage || !frequence) {
                throw new AppError('Données manquantes pour créer l\'ordonnance', 400);
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

            // Créer l'ordonnance
            const nouvelleOrdonnance = await Prescription.create({
                ...prescriptionData,
                prescrit_traitement: true, // C'est une ordonnance de traitement
                statut: 'active'
            });

            return nouvelleOrdonnance;
        } catch (error) {
            console.error('Erreur lors de la création de l\'ordonnance:', error);
            throw error;
        }
    },

    /**
     * Créer une demande d'examen
     */
    async createDemandeExamen(demandeData) {
        try {
            // Validation des données requises
            const { patient_id, professionnel_id, medicament, dosage, frequence } = demandeData;
            
            if (!patient_id || !professionnel_id || !medicament || !dosage || !frequence) {
                throw new AppError('Données manquantes pour créer la demande d\'examen', 400);
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

            // Créer la demande d'examen
            const nouvelleDemande = await Prescription.create({
                ...demandeData,
                prescrit_traitement: false, // C'est une demande d'examen
                statut: 'en_attente'
            });

            return nouvelleDemande;
        } catch (error) {
            console.error('Erreur lors de la création de la demande d\'examen:', error);
            throw error;
        }
    },

    /**
     * Récupérer les prescriptions d'un patient
     */
    async getPrescriptionsByPatient(patientId, filters = {}, includes = []) {
        try {
            const includeOptions = [];

            if (includes.includes('patient')) {
                includeOptions.push({ model: Patient, as: 'patient' });
            }
            if (includes.includes('redacteur')) {
                includeOptions.push({ 
                    model: ProfessionnelSante, 
                    as: 'redacteur',
                    include: [{ model: Utilisateur, as: 'compteUtilisateur', attributes: ['nom', 'prenom'] }]
                });
            }
            if (includes.includes('dossier')) {
                includeOptions.push({ model: DossierMedical, as: 'dossier' });
            }
            if (includes.includes('consultation')) {
                includeOptions.push({ model: Consultation, as: 'consultation' });
            }

            const prescriptions = await Prescription.findAll({
                where: {
                    patient_id: patientId,
                    ...filters
                },
                include: includeOptions,
                order: [['date_prescription', 'DESC']]
            });

            return prescriptions;
        } catch (error) {
            console.error('Erreur lors de la récupération des prescriptions:', error);
            throw new AppError('Impossible de récupérer les prescriptions', 500);
        }
    },

    /**
     * Récupérer une prescription par son ID
     */
    async getPrescriptionById(id) {
        try {
            // const includeOptions = [];

            // if (includes.includes('patient')) {
            //     includeOptions.push({ model: Patient, as: 'patient' });
            // }
            // if (includes.includes('redacteur')) {
            //     includeOptions.push({ 
            //         model: ProfessionnelSante, 
            //         as: 'redacteur',
            //         include: [{ model: Utilisateur, as: 'compteUtilisateur', attributes: ['nom', 'prenom'] }]
            //     });
            // }
            // if (includes.includes('dossier')) {
            //     includeOptions.push({ model: DossierMedical, as: 'dossier' });
            // }
            // if (includes.includes('consultation')) {
            //     includeOptions.push({ model: Consultation, as: 'consultation' });
            // }

            const prescription = await Prescription.findByPk(id, 
                // { include: includeOptions }
            );

            return prescription;
        } catch (error) {
            console.error('Erreur lors de la récupération de la prescription:', error);
            throw new AppError('Impossible de récupérer la prescription', 500);
        }
    },

    /**
     * Mettre à jour une prescription
     */
    async updatePrescription(id, updateData) {
        try {
            const prescription = await Prescription.findByPk(id);
            if (!prescription) {
                return null;
            }

            await prescription.update(updateData);
            return prescription;
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la prescription:', error);
            throw new AppError('Impossible de mettre à jour la prescription', 500);
        }
    },

    /**
     * Supprimer une prescription (soft delete)
     */
    async deletePrescription(id) {
        try {
            const result = await Prescription.destroy({
                where: { id_prescription: id }
            });
            return result;
        } catch (error) {
            console.error('Erreur lors de la suppression de la prescription:', error);
            throw new AppError('Impossible de supprimer la prescription', 500);
        }
    },

    /**
     * Renouveler une prescription
     */
    async renouvelerPrescription(id, renouvellementData) {
        try {
            const prescription = await Prescription.findByPk(id);
            if (!prescription) {
                return null;
            }

            // Vérifier que la prescription est renouvelable
            if (!prescription.renouvelable) {
                throw new AppError('Cette prescription n\'est pas renouvelable', 400);
            }

            // Vérifier le nombre de renouvellements
            if (prescription.renouvellements_effectues >= prescription.nb_renouvellements) {
                throw new AppError('Nombre maximum de renouvellements atteint', 400);
            }

            // Mettre à jour la prescription
            await prescription.update({
                renouvellements_effectues: prescription.renouvellements_effectues + 1,
                date_dernier_renouvellement: new Date(),
                statut: 'active',
                ...renouvellementData
            });

            return prescription;
        } catch (error) {
            console.error('Erreur lors du renouvellement de la prescription:', error);
            throw error;
        }
    },

    /**
     * Suspendre une prescription
     */
    async suspendrePrescription(id, suspensionData) {
        try {
            const prescription = await Prescription.findByPk(id);
            if (!prescription) {
                return null;
            }

            // Mettre à jour la prescription
            await prescription.update({
                statut: 'suspendue',
                date_arret: new Date(),
                ...suspensionData
            });

            return prescription;
        } catch (error) {
            console.error('Erreur lors de la suspension de la prescription:', error);
            throw new AppError('Impossible de suspendre la prescription', 500);
        }
    },

    /**
     * Récupérer les prescriptions actives d'un patient
     */
    async getPrescriptionsActives(patientId) {
        try {
            const prescriptions = await Prescription.findAll({
                where: {
                    patient_id: patientId,
                    statut: 'active'
                },
                include: [
                    { model: Patient, as: 'patient' },
                    { 
                        model: ProfessionnelSante, 
                        as: 'redacteur',
                        include: [{ model: Utilisateur, as: 'compteUtilisateur', attributes: ['nom', 'prenom'] }]
                    }
                ],
                order: [['date_prescription', 'DESC']]
            });

            return prescriptions;
        } catch (error) {
            console.error('Erreur lors de la récupération des prescriptions actives:', error);
            throw new AppError('Impossible de récupérer les prescriptions actives', 500);
        }
    },

    /**
     * transmettre une prescription à un patient 
     */
async transfererPrescription(id, patientId) {
    try {
        // 1. Vérifier que la prescription existe
        const prescription = await Prescription.findByPk(id);
        if (!prescription) {
            throw new AppError('Prescription non trouvée', 404);
        }

        // 2. Vérifier que le patient destinataire existe
        const patient = await Patient.findByPk(patientId);
        if (!patient) {
            throw new AppError('Patient destinataire non trouvé', 404);
        }

        // 3. Récupérer le dossier médical du patient destinataire
        const dossierMedical = await DossierMedical.findOne({
            where: { patient_id: patientId }
        });
        
        if (!dossierMedical) {
            throw new AppError('Dossier médical du patient destinataire non trouvé', 404);
        }

        
        // 4. Mettre à jour la prescription avec le nouveau dossier médical
        await prescription.update({ 
            dossier_id: dossierMedical.id_dossier,
            date_modification: new Date() // Si vous avez ce champ
        });

        

        // 6. Retourner la prescription mise à jour avec les relations
        const prescriptionUpdated = await Prescription.findByPk(id, {
            include: [
                {
                    model: DossierMedical,
                    as: 'dossier',
                    include: [{ model: Patient, 
                        as: 'patient' 
                    }]
                }
            ]
        });

        return prescriptionUpdated;

    } catch (error) {
        console.error('Erreur lors de la transmission de la prescription:', error);
        
        // Si c'est déjà une AppError, la relancer
        if (error instanceof AppError) {
            throw error;
        }
        
        // Sinon, créer une nouvelle AppError générique
        throw new AppError('Impossible de transmettre la prescription', 500);
    }
},

    /**
     * affichage de la prescription transmise au niveau du patient
     */
async getPrescriptionTransmise(patientId, prescriptionId) {
    try {
        const prescription = await Prescription.findOne({
            where: {
                id_prescription: prescriptionId,
                patient_id: patientId
            },
            include: [
                { model: Patient, as: 'patient' },
                { 
                    model: ProfessionnelSante, 
                    as: 'redacteur',
                    include: [{ model: Utilisateur, as: 'compteUtilisateur', attributes: ['nom', 'prenom'] }]
                }
            ]
        });

        if (!prescription) {
            throw new AppError('Prescription non trouvée pour ce patient', 404);
        }

        return prescription;
        } catch (error) {
            console.error('Erreur lors de la récupération de la prescription transmise:', error);
            throw new AppError('Impossible de récupérer la prescription transmise', 500);}
        }
    }

module.exports = prescriptionService; 