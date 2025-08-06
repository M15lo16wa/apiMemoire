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
    
    // Vérifier que le professionnel de santé existe si spécifié
    if (rendezVousData.id_professionnel) {
      const professionnel = await ProfessionnelSante.findByPk(rendezVousData.id_professionnel);
      if (!professionnel) {
        throw new AppError('Professionnel de santé non trouvé', 404);
      }
    }
    
    // Gestion du patient - La table RendezVous contient directement les infos patient
    // Vérifier qu'on a les informations nécessaires pour le patient
    if (!rendezVousData.nom || !rendezVousData.prenom || !rendezVousData.email || !rendezVousData.telephone) {
      throw new AppError('Informations du patient manquantes. Veuillez fournir nom, prénom, email et téléphone.', 400);
    }
    
    // Nettoyer les données du rendez-vous
    const champsRendezVous = [
      'DateHeure', 'motif_consultation', 'statut',
      'service_id', 'notes', 'id_hopital', 'id_service',
      'id_professionnel', 'numero_assure', 'assureur',
      'nom', 'prenom', 'email', 'dateNaissance', 'sexe', 'telephone',
      'professionnel_id'
    ];
    
    const donneesRendezVous = {};
    champsRendezVous.forEach(champ => {
      if (rendezVousData[champ] !== undefined) {
        donneesRendezVous[champ] = rendezVousData[champ];
      }
    });
    
    // Définir les valeurs par défaut si nécessaire
    if (!donneesRendezVous.statut) donneesRendezVous.statut = 'planifie';
    
    // Vérifier la disponibilité du créneau
    if (!rendezVousData.DateHeure) {
      throw new AppError('La date et l\'heure du rendez-vous sont requises', 400);
    }
    
    const dateHeure = new Date(rendezVousData.DateHeure);
    
    // Vérifier la disponibilité du professionnel
    if (rendezVousData.id_professionnel) {
      const conflitRendezVous = await RendezVous.findOne({
        where: {
          id_professionnel: rendezVousData.id_professionnel,
          DateHeure: dateHeure,
          statut: {
            [Op.notIn]: ['annule', 'termine']
          },
          id_rendezvous: { [Op.ne]: rendezVousData.id_rendezvous || null }
        }
      });
      
      if (conflitRendezVous) {
        throw new AppError('Ce créneau horaire est déjà réservé pour ce professionnel de santé', 400);
      }
    }
    
    const newRendezVous = await RendezVous.create(donneesRendezVous);
    return newRendezVous;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Erreur lors de la création du rendez-vous: ${error.message}`, 500);
  }
};

/**
 * Récupérer tous les rendez-vous avec filtres optionnels
 * @param {Object} filters - Filtres à appliquer
 * @returns {Promise<Array<{id_rendezvous: number}>>} Liste des IDs des rendez-vous
 */
exports.getAllRendezVous = async (filters = {}) => {
  const whereClause = {};
  
  // Ajouter les filtres à la clause where
  Object.keys(filters).forEach(key => {
    if (key === 'DateHeure') {
      whereClause[key] = filters[key];
    } else if (filters[key] !== undefined) {
      whereClause[key] = filters[key];
    }
  });
  
  try {
    return await RendezVous.findAll({
      where: whereClause,
      attributes: ['id_rendezvous'],
      raw: true
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

/**
 * Créer un rappel pour un rendez-vous
 * @param {Object} rappelData - Les données du rappel
 * @returns {Promise<Object>} Le rappel créé
 */
exports.creerRappel = async (rappelData) => {
  try {
    const { patient_id, id_professionnel, date_rappel, message, type_rappel, rendezvous_id } = rappelData;
    
    // Vérifier que le patient existe
    if (patient_id) {
      const patient = await Patient.findByPk(patient_id);
      if (!patient) {
        throw new AppError('Patient non trouvé', 404);
      }
    }
    
    // Vérifier que le médecin existe
    if (id_professionnel) {
      const medecin = await ProfessionnelSante.findByPk(id_professionnel);
      if (!medecin) {
        throw new AppError('Professionnel de santé non trouvé', 404);
      }
    }
    
    // Vérifier que le rendez-vous existe si spécifié
    if (rendezvous_id) {
      const rendezVous = await RendezVous.findByPk(rendezvous_id);
      if (!rendezVous) {
        throw new AppError('Rendez-vous non trouvé', 404);
      }
    }
    
    // Créer le rappel (pour l'instant, on stocke dans la table RendezVous avec un type spécial)
    const rappel = await RendezVous.create({
      patient_id,
      id_professionnel,
      date_heure: date_rappel,
      motif: message,
      description: `Rappel: ${message}`,
      statut: 'planifie',
      type_rendezvous: 'rappel',
      service_id: 1, // Service par défaut pour les rappels
      duree: 0, // Pas de durée pour un rappel
      rappel_envoye: false,
      type_rappel: type_rappel || 'general',
      rendezvous_id
    });
    
    return rappel;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Erreur lors de la création du rappel: ${error.message}`, 500);
  }
};

/**
 * Récupérer les rappels d'un patient
 * @param {number} patientId - ID du patient
 * @param {Object} filters - Filtres optionnels
 * @returns {Promise<RendezVous[]>} Liste des rappels
 */
exports.getRappelsByPatient = async (patientId, filters = {}) => {
  try {
    // Récupérer d'abord le patient pour avoir ses informations
    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      throw new AppError('Patient non trouvé', 404);
    }
    
    const whereClause = {
      nom: patient.nom,
      prenom: patient.prenom,
      email: patient.email,
      statut: 'Rappel',
      ...filters
    };
    
    return await RendezVous.findAll({
      where: {
        ...whereClause,
        type_rendezvous: 'rappel'
      },
      include: [
        { model: Hopital, as: 'hopital' },
        { model: ServiceSante, as: 'service' },
        { model: ProfessionnelSante, as: 'affecteA' }
      ],
      order: [['DateHeure', 'ASC']]
    });
  } catch (error) {
    throw new AppError(`Erreur lors de la récupération des rappels: ${error.message}`, 500);
  }
};

/**
 * Récupérer les rappels à envoyer (pour un service de notification)
 * @param {Date} dateLimite - Date limite pour les rappels à envoyer
 * @returns {Promise<RendezVous[]>} Liste des rappels à envoyer
 */
exports.getRappelsAEnvoyer = async (dateLimite = new Date()) => {
  try {
    return await RendezVous.findAll({
      where: {
        type_rendezvous: 'rappel',
        rappel_envoye: false,
        date_heure: {
          [Op.lte]: dateLimite
        },
        statut: 'planifie'
      },
      include: [
        { model: Patient, as: 'patientConcerne' },
        { model: ProfessionnelSante, as: 'affecteA' }
      ],
      order: [['DateHeure', 'ASC']]
    });
  } catch (error) {
    throw new AppError(`Erreur lors de la récupération des rappels à envoyer: ${error.message}`, 500);
  }
};

/**
 * Marquer un rappel comme envoyé
 * @param {number} rappelId - ID du rappel
 * @returns {Promise<void>}
 */
exports.marquerRappelEnvoye = async (rappelId) => {
  try {
    const rappel = await RendezVous.findByPk(rappelId);
    if (!rappel) {
      throw new AppError('Rappel non trouvé', 404);
    }
    
    await rappel.update({
      envoye: true,
      date_envoi: new Date()
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Erreur lors du marquage du rappel: ${error.message}`, 500);
  }
};

/**
 * Récupérer les rendez-vous à venir d'un patient
 * @param {number} patientId - ID du patient
 * @param {number} limit - Nombre maximum de rendez-vous à récupérer
 * @returns {Promise<RendezVous[]>} Liste des rendez-vous à venir
 */
exports.getRendezVousAVenir = async (patientId, limit = 10) => {
  try {
    // Récupérer d'abord le patient pour avoir ses informations
    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      throw new AppError('Patient non trouvé', 404);
    }
    
    return await RendezVous.findAll({
      where: {
        nom: patient.nom,
        prenom: patient.prenom,
        email: patient.email,
        DateHeure: {
          [Op.gte]: new Date()
        },
        type_rendezvous: {
          [Op.ne]: 'rappel' // Exclure les rappels
        },
        statut: {
          [Op.in]: ['planifie', 'confirme']
        }
      },
      include: [
        { model: Hopital, as: 'hopital' },
        { model: ServiceSante, as: 'service' },
        { model: ProfessionnelSante, as: 'affecteA' }
      ],
      order: [['DateHeure', 'ASC']],
      limit: limit
    });
  } catch (error) {
    throw new AppError(`Erreur lors de la récupération des rendez-vous à venir: ${error.message}`, 500);
  }
};

/**
 * Annuler un rendez-vous
 * @param {number} rendezVousId - ID du rendez-vous
 * @param {string} motif - Motif de l'annulation
 * @returns {Promise<RendezVous>} Le rendez-vous annulé
 */
exports.annulerRendezVous = async (rendezVousId, motif) => {
  try {
    const rendezVous = await RendezVous.findByPk(rendezVousId);
    if (!rendezVous) {
      throw new AppError('Rendez-vous non trouvé', 404);
    }
    
    await rendezVous.update({
      statut: 'Annulé',
      motif_annulation: motif,
      date_annulation: new Date()
    });
    
    return rendezVous;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Erreur lors de l'annulation du rendez-vous: ${error.message}`, 500);
  }
};
