const { Consultation, ProfessionnelSante, Patient, DossierMedical, ServiceSante } = require('../../models'); // Correction du chemin d'import

const createConsultation = async (req, res) => {
    try {
    // Vérification de la validité du JSON reçu
    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ 
            message: 'Corps de requête invalide.',
            details: 'Le JSON envoyé n\'est pas valide ou est vide'
        });
    }

    // 1. Récupérer les données envoyées par le frontend
    const {
        date_consultation,
        motif,
        diagnostic,
        compte_rendu,
        examen_clinique,
        statut,
        duree,
        type_consultation,
        confidentialite,
        dossier_id,
        service_id: rawServiceId,
        date_annulation,
        motif_annulation,
        // createdBy et updatedBy seront gérés automatiquement ou via l'utilisateur authentifié
    } = req.body;

    // Nettoyer et valider service_id
    let service_id = null;
    if (rawServiceId !== undefined && rawServiceId !== null && rawServiceId !== '') {
        if (typeof rawServiceId === 'number' || (typeof rawServiceId === 'string' && !isNaN(rawServiceId))) {
            service_id = parseInt(rawServiceId, 10);
        } else {
            return res.status(400).json({ 
                message: 'service_id invalide.',
                details: 'Le service_id doit être un nombre valide ou null'
            });
        }
    }

    // Validation basique
    if (!dossier_id || !motif || !date_consultation) {
        return res.status(400).json({ message: 'Veuillez fournir tous les champs obligatoires : dossier_id, motif, date_consultation.' });
    }

    // Injection automatique du professionnel connecté et du service
    const professionnel = req.professionnel;
    if (!professionnel) {
        return res.status(403).json({ message: "Aucun professionnel de santé connecté." });
    }
    const professionnelServiceId = professionnel.service_id;
    const professionnel_id = professionnel.id_professionnel;

    // Utiliser le service_id fourni ou celui du professionnel connecté
    const finalServiceId = service_id || professionnelServiceId;

    // Vérifier l'existence du dossier
    const dossier = await DossierMedical.findByPk(dossier_id);
    if (!dossier) {
        return res.status(404).json({ message: 'Dossier médical introuvable.' });
    }

    // Vérifier l'existence du service
    if (finalServiceId) {
        const service = await ServiceSante.findByPk(finalServiceId);
        if (!service) {
            return res.status(404).json({ message: 'Service de santé introuvable.' });
        }
    }


    // Injection automatique du patient_id (depuis le dossier) et du professionnel_id (depuis la session)
    const patient_id = dossier.patient_id;
    const professionnelIdSession = professionnel.id_professionnel;

    // Validation critique : s'assurer que le patient_id existe
    if (!patient_id) {
        return res.status(400).json({ 
            message: 'Le dossier médical doit être associé à un patient valide.',
            details: 'patient_id manquant dans le dossier médical'
        });
    }

    // Vérifier l'existence du patient
    const patient = await Patient.findByPk(patient_id);
    if (!patient) {
        return res.status(404).json({ 
            message: 'Patient introuvable.',
            details: `Aucun patient trouvé avec l'ID ${patient_id}`
        });
    }

    // Créer la consultation
    const newConsultation = await Consultation.create({
        date_consultation,
        motif,
        diagnostic,
        compte_rendu,
        examen_clinique,
        statut,
        duree,
        type_consultation,
        confidentialite,
        dossier_id,
        patient_id, // injecté automatiquement
        professionnel_id: professionnelIdSession, // injecté automatiquement
        service_id: finalServiceId, // utiliser le service_id final calculé
        date_annulation,
        motif_annulation,
        createdBy: req.user && !req.professionnel && (req.user.id_utilisateur || req.user.id) ? (req.user.id_utilisateur || req.user.id) : undefined,
        updatedBy: req.user && !req.professionnel && (req.user.id_utilisateur || req.user.id) ? (req.user.id_utilisateur || req.user.id) : undefined,
    });

    // 5. Répondre au client avec la nouvelle consultation créée
    return res.status(201).json(newConsultation);

} catch (error) {
    console.error('Erreur lors de la création de la consultation :', error);
    // Gérer les erreurs spécifiques de Sequelize ou autres erreurs
    if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(err => err.message);
        return res.status(400).json({ message: 'Erreur de validation', errors });
    }
        return res.status(500).json({ message: 'Erreur serveur lors de la création de la consultation.' });
    }
};

// Récupérer toutes les consultations
const getAllConsultations = async (req, res) => {
    try {
        const consultations = await Consultation.findAll({
            include: [
                {
                    model: DossierMedical,
                    as: 'dossier',
                    include: [{ model: Patient, as: 'patient' }]
                },
                {
                    model: ProfessionnelSante,
                    as: 'professionnel'
                },
                {
                    model: ServiceSante,
                    as: 'service'
                }
            ],
            order: [['date_consultation', 'DESC']]
        });

        return res.status(200).json(consultations);
    } catch (error) {
        console.error('Erreur lors de la récupération des consultations :', error);
        return res.status(500).json({ message: 'Erreur serveur lors de la récupération des consultations.' });
    }
};

// Récupérer une consultation par ID
const getConsultationById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const consultation = await Consultation.findByPk(id, {
            include: [
                {
                    model: DossierMedical,
                    as: 'dossier',
                    include: [{ model: Patient, as: 'patient' }]
                },
                {
                    model: ProfessionnelSante,
                    as: 'professionnel'
                },
                {
                    model: ServiceSante,
                    as: 'service'
                }
            ]
        });

        if (!consultation) {
            return res.status(404).json({ message: 'Consultation introuvable.' });
        }

        return res.status(200).json(consultation);
    } catch (error) {
        console.error('Erreur lors de la récupération de la consultation :', error);
        return res.status(500).json({ message: 'Erreur serveur lors de la récupération de la consultation.' });
    }
};

// Récupérer les consultations par dossier médical
const getConsultationsByDossier = async (req, res) => {
    try {
        const { dossier_id } = req.params;
        
        const consultations = await Consultation.findAll({
            where: { dossier_id },
            include: [
                {
                    model: ProfessionnelSante,
                    as: 'professionnel'
                },
                {
                    model: ServiceSante,
                    as: 'service'
                }
            ],
            order: [['date_consultation', 'DESC']]
        });

        return res.status(200).json(consultations);
    } catch (error) {
        console.error('Erreur lors de la récupération des consultations du dossier :', error);
        return res.status(500).json({ message: 'Erreur serveur lors de la récupération des consultations du dossier.' });
    }
};

// Récupérer les consultations par professionnel de santé
const getConsultationsByProfessionnel = async (req, res) => {
    try {
        const { professionnel_id } = req.params;
        
        const consultations = await Consultation.findAll({
            where: { professionnel_id },
            include: [
                {
                    model: DossierMedical,
                    as: 'dossier',
                    include: [{ model: Patient, as: 'patient' }]
                },
                {
                    model: ServiceSante,
                    as: 'service'
                }
            ],
            order: [['date_consultation', 'DESC']]
        });

        return res.status(200).json(consultations);
    } catch (error) {
        console.error('Erreur lors de la récupération des consultations du professionnel :', error);
        return res.status(500).json({ message: 'Erreur serveur lors de la récupération des consultations du professionnel.' });
    }
};

// Récupérer les consultations par patient
const getConsultationsByPatient = async (req, res) => {
    try {
        const { patient_id } = req.params;
        
        // Validation du paramètre patient_id
        if (!patient_id || isNaN(patient_id)) {
            return res.status(400).json({ 
                message: 'ID du patient invalide.',
                details: 'Le paramètre patient_id doit être un nombre valide'
            });
        }
        
        // Vérifier l'existence du patient avant de chercher ses consultations
        const patient = await Patient.findByPk(patient_id);
        if (!patient) {
            return res.status(404).json({ 
                message: 'Patient introuvable.',
                details: `Aucun patient trouvé avec l'ID ${patient_id}`
            });
        }
        
        const consultations = await Consultation.findAll({
            where: { patient_id },
            include: [
                {
                    model: DossierMedical,
                    as: 'dossier'
                },
                {
                    model: ProfessionnelSante,
                    as: 'professionnel'
                },
                {
                    model: ServiceSante,
                    as: 'service'
                }
            ],
            order: [['date_consultation', 'DESC']]
        });

        return res.status(200).json(consultations);
    } catch (error) {
        console.error('Erreur lors de la récupération des consultations du patient :', error);
        return res.status(500).json({ message: 'Erreur serveur lors de la récupération des consultations du patient.' });
    }
};

// Mettre à jour une consultation
const updateConsultation = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            date_consultation,
            motif,
            diagnostic,
            compte_rendu,
            examen_clinique,
            statut,
            duree,
            type_consultation,
            confidentialite,
            dossier_id,
            patient_id,
            professionnel_id,
            service_id,
            date_annulation,
            motif_annulation
        } = req.body;

        const consultation = await Consultation.findByPk(id);
        
        if (!consultation) {
            return res.status(404).json({ message: 'Consultation introuvable.' });
        }

        // Logique de mise à jour du patient_id avec gestion intelligente
        let finalPatientId = patient_id; // Utiliser le patient_id fourni s'il existe
        
        // Vérifier l'existence des IDs de référence si fournis
        if (dossier_id) {
            const dossier = await DossierMedical.findByPk(dossier_id);
            if (!dossier) {
                return res.status(404).json({ message: 'Dossier médical introuvable.' });
            }
            
            // Si le dossier change, s'assurer que le patient_id est cohérent
            if (dossier_id !== consultation.dossier_id) {
                if (!patient_id) {
                    // Extraire automatiquement le patient_id du nouveau dossier
                    finalPatientId = dossier.patient_id;
                } else if (patient_id !== dossier.patient_id) {
                    // Vérifier la cohérence entre patient_id fourni et dossier
                    return res.status(400).json({ 
                        message: 'Incohérence détectée : le patient_id fourni ne correspond pas au patient du dossier médical.',
                        details: `patient_id fourni: ${patient_id}, patient_id du dossier: ${dossier.patient_id}`
                    });
                }
            }
        }
        
        // Si aucun patient_id n'est défini, utiliser celui de la consultation existante
        if (!finalPatientId) {
            finalPatientId = consultation.patient_id;
        }
        
        // Validation critique : s'assurer qu'on a un patient_id valide
        if (!finalPatientId) {
            return res.status(400).json({ 
                message: 'patient_id manquant. Impossible de mettre à jour la consultation sans un patient valide.',
                details: 'Veuillez fournir un patient_id ou un dossier_id valide'
            });
        }
        
        // Vérifier l'existence du patient final
        if (finalPatientId) {
            const patient = await Patient.findByPk(finalPatientId);
            if (!patient) {
                return res.status(404).json({ 
                    message: 'Patient introuvable.',
                    details: `Aucun patient trouvé avec l'ID ${finalPatientId}`
                });
            }
        }

        if (professionnel_id) {
            const professionnel = await ProfessionnelSante.findByPk(professionnel_id);
            if (!professionnel) {
                return res.status(404).json({ message: 'Professionnel de santé introuvable.' });
            }
        }

        if (service_id) {
            const service = await ServiceSante.findByPk(service_id);
            if (!service) {
                return res.status(404).json({ message: 'Service de santé introuvable.' });
            }
        }

        const userId = req.user ? req.user.id : null;

        // Mettre à jour la consultation avec le patient_id final calculé
        await consultation.update({
            date_consultation,
            motif,
            diagnostic,
            compte_rendu,
            examen_clinique,
            statut,
            duree,
            type_consultation,
            confidentialite,
            dossier_id,
            patient_id: finalPatientId, // Utiliser le patient_id calculé intelligemment
            professionnel_id,
            service_id,
            date_annulation,
            motif_annulation,
            updatedBy: userId
        });

        return res.status(200).json(consultation);
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la consultation :', error);
        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(err => err.message);
            return res.status(400).json({ message: 'Erreur de validation', errors });
        }
        return res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de la consultation.' });
    }
};

// Supprimer une consultation
const deleteConsultation = async (req, res) => {
    try {
        const { id } = req.params;
        
        const consultation = await Consultation.findByPk(id);
        
        if (!consultation) {
            return res.status(404).json({ message: 'Consultation introuvable.' });
        }

        await consultation.destroy();
        
        return res.status(200).json({ message: 'Consultation supprimée avec succès.' });
    } catch (error) {
        console.error('Erreur lors de la suppression de la consultation :', error);
        return res.status(500).json({ message: 'Erreur serveur lors de la suppression de la consultation.' });
    }
};

module.exports = {
    createConsultation,
    getAllConsultations,
    getConsultationById,
    getConsultationsByDossier,
    getConsultationsByProfessionnel,
    getConsultationsByPatient,
    updateConsultation,
    deleteConsultation
};
