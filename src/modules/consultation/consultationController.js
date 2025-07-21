const { Consultation, ProfessionnelSante, Patient, DossierMedical, ServiceSante } = require('../../models'); // Correction du chemin d'import

const createConsultation = async (req, res) => {
    try {
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
        professionnel_id,
        service_id,
        date_annulation,
        motif_annulation,
      // createdBy et updatedBy seront gérés automatiquement ou via l'utilisateur authentifié
    } = req.body;

    // 2. Validation basique (une validation plus avancée peut être faite avec des librairies comme Joi ou Express-validator)
    if (!dossier_id || !professionnel_id || !motif || !date_consultation) {
        return res.status(400).json({ message: 'Veuillez fournir tous les champs obligatoires : dossier_id, professionnel_id, motif, date_consultation.' });
    }

    // 3. Vérifier l'existence des IDs de référence (très important pour l'intégrité des données)
    const [dossier, professionnel] = await Promise.all([
        DossierMedical.findByPk(dossier_id),
        ProfessionnelSante.findByPk(professionnel_id),
    ]);

    if (!dossier) {
        return res.status(404).json({ message: 'Dossier médical introuvable.' });
    }
    if (!professionnel) {
        return res.status(404).json({ message: 'Professionnel de santé introuvable.' });
    }
    if (service_id) {
        const service = await ServiceSante.findByPk(service_id);
        if (!service) {
            return res.status(404).json({ message: 'Service de santé introuvable.' });
        }
    }


    // Supposons que l'ID de l'utilisateur authentifié est disponible dans req.user.id après l'authentification
    const userId = req.user ? req.user.id : null; // À adapter selon votre système d'authentification

    // 4. Créer la consultation dans la base de données
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
        professionnel_id,
        service_id,
        date_annulation,
        motif_annulation,
      createdBy: userId, // Enregistre l'ID de l'utilisateur qui a créé
      updatedBy: userId, // Initialise updatedBy aussi
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
            professionnel_id,
            service_id,
            date_annulation,
            motif_annulation
        } = req.body;

        const consultation = await Consultation.findByPk(id);
        
        if (!consultation) {
            return res.status(404).json({ message: 'Consultation introuvable.' });
        }

        // Vérifier l'existence des IDs de référence si fournis
        if (dossier_id) {
            const dossier = await DossierMedical.findByPk(dossier_id);
            if (!dossier) {
                return res.status(404).json({ message: 'Dossier médical introuvable.' });
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

        // Mettre à jour la consultation
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
    updateConsultation,
    deleteConsultation
};