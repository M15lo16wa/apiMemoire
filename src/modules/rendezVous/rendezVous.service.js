const { RendezVous, Hopital, ServiceSante, ProfessionnelSante, Patient } = require('../../models');
const AppError = require('../../utils/appError');
const { Op } = require('sequelize');

/**
 * Créer un nouveau rendez-vous
 * @param {Object} rendezVousData - Les données du rendez-vous
 * @returns {Promise<RendezVous>} Le rendez-vous créé
 */
exports.createRendezVous = async (rendezVousData) => {
  try {
    // Vérifier que l'hôpital existe
    if (rendezVousData.id_hopital) {
      const hopital = await Hopital.findByPk(rendezVousData.id_hopital);
      if (!hopital) {
        throw new AppError('Hôpital non trouvé', 404);
      }
    }
    
    // Vérifier que le service existe
    if (rendezVousData.id_service) {
      const service = await ServiceSante.findByPk(rendezVousData.id_service);
      if (!service) {
        throw new AppError('Service de santé non trouvé', 404);
      }
    }
    
    // Vérifier que le médecin existe si spécifié
    if (rendezVousData.id_medecin) {
      const medecin = await ProfessionnelSante.findByPk(rendezVousData.id_medecin);
      if (!medecin) {
        throw new AppError('Professionnel de santé non trouvé', 404);
      }
    }
    
    // Vérifier que le patient existe si spécifié
    if (rendezVousData.patient_id) {
      const patient = await Patient.findByPk(rendezVousData.patient_id);
      if (!patient) {
        throw new AppError('Patient non trouvé', 404);
      }
    }
    
    // Vérifier la disponibilité du créneau
    if (rendezVousData.DateHeure && rendezVousData.id_medecin) {
      const dateHeure = new Date(rendezVousData.DateHeure);
      const duree = rendezVousData.duree || 30; // Durée par défaut de 30 minutes
      
      const dateHeureDebut = new Date(dateHeure);
      const dateHeureFin = new Date(dateHeure);
      dateHeureFin.setMinutes(dateHeureFin.getMinutes() + duree);
      
      const rendezVousExistant = await RendezVous.findOne({
        where: {
          id_medecin: rendezVousData.id_medecin,
          DateHeure: {
            [Op.between]: [dateHeureDebut, dateHeureFin]
          },
          statut: {
            [Op.notIn]: ['Annulé', 'Terminé']
          }
        }
      });
      
      if (rendezVousExistant) {
        throw new AppError('Ce créneau horaire est déjà réservé pour ce médecin', 400);
      }
    }
    
    const newRendezVous = await RendezVous.create(rendezVousData);
    return newRendezVous;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Erreur lors de la création du rendez-vous: ${error.message}`, 500);
  }
};

/**
 * Récupérer tous les rendez-vous avec filtres optionnels
 * @param {Object} filters - Filtres à appliquer
 * @returns {Promise<RendezVous[]>} Liste des rendez-vous
 */
exports.getAllRendezVous = async (filters = {}) => {
  try {
    return await RendezVous.findAll({
      where: filters,
      include: [
        { model: Hopital, as: 'hopital' },
        { model: ServiceSante, as: 'service' },
        { model: ProfessionnelSante, as: 'affecteA' },
        { model: Patient, as: 'patientConcerne' }
      ],
      order: [['DateHeure', 'ASC']]
    });
  } catch (error) {
    throw new AppError(`Erreur lors de la récupération des rendez-vous: ${error.message}`, 500);
  }
};

/**
 * Récupérer un rendez-vous par son ID
 * @param {number} id - ID du rendez-vous
 * @returns {Promise<RendezVous>} Le rendez-vous trouvé
 */
exports.getRendezVousById = async (id) => {
  try {
    const rendezVous = await RendezVous.findByPk(id, {
      include: [
        { model: Hopital, as: 'hopital' },
        { model: ServiceSante, as: 'service' },
        { model: ProfessionnelSante, as: 'affecteA' },
        { model: Patient, as: 'patientConcerne' }
      ]
    });
    
    if (!rendezVous) {
      throw new AppError('Rendez-vous non trouvé', 404);
    }
    
    return rendezVous;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Erreur lors de la récupération du rendez-vous: ${error.message}`, 500);
  }
};

/**
 * Mettre à jour un rendez-vous
 * @param {number} id - ID du rendez-vous
 * @param {Object} updateData - Données de mise à jour
 * @returns {Promise<RendezVous>} Le rendez-vous mis à jour
 */
exports.updateRendezVous = async (id, updateData) => {
  try {
    const rendezVous = await RendezVous.findByPk(id);
    if (!rendezVous) {
      throw new AppError('Rendez-vous non trouvé', 404);
    }
    
    // Vérifications similaires à celles de createRendezVous si nécessaire
    
    await rendezVous.update(updateData);
    return rendezVous;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Erreur lors de la mise à jour du rendez-vous: ${error.message}`, 500);
  }
};

/**
 * Supprimer un rendez-vous
 * @param {number} id - ID du rendez-vous
 * @returns {Promise<void>}
 */
exports.deleteRendezVous = async (id) => {
  try {
    const rendezVous = await RendezVous.findByPk(id);
    if (!rendezVous) {
      throw new AppError('Rendez-vous non trouvé', 404);
    }
    
    await rendezVous.destroy();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Erreur lors de la suppression du rendez-vous: ${error.message}`, 500);
  }
};

/**
 * Prendre un rendez-vous (implémentation de la méthode PrendreRendezVous du diagramme de classe)
 * @param {Object} rendezVousData - Les données du rendez-vous
 * @returns {Promise<RendezVous>} Le rendez-vous créé
 */
exports.prendreRendezVous = async (rendezVousData) => {
  try {
    // Définir le statut par défaut
    if (!rendezVousData.statut) {
      rendezVousData.statut = 'Planifié';
    }
    
    // Créer le rendez-vous
    const newRendezVous = await this.createRendezVous(rendezVousData);
    
    // Logique supplémentaire spécifique à la prise de rendez-vous
    // Par exemple, envoi de notification, mise à jour du calendrier, etc.
    
    return newRendezVous;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Erreur lors de la prise de rendez-vous: ${error.message}`, 500);
  }
};