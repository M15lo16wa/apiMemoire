const rendezVousService = require('./rendezVous.service');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');

/**
 * Créer un nouveau rendez-vous
 */
exports.createRendezVous = catchAsync(async (req, res, next) => {
  const newRendezVous = await rendezVousService.createRendezVous(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      rendezVous: newRendezVous
    }
  });
});

/**
 * Récupérer tous les rendez-vous
 * Possibilité de filtrer par patient, professionnel, service ou hôpital
 */
exports.getAllRendezVous = catchAsync(async (req, res, next) => {
  const { patient_id, professionnel_id, service_id, hopital_id, date_debut, date_fin } = req.query;
  const filters = {};
  
  if (patient_id) filters.patient_id = patient_id;
  if (professionnel_id) filters.professionnel_id = professionnel_id;
  if (service_id) filters.service_id = service_id;
  if (hopital_id) filters.hopital_id = hopital_id;
  
  // Filtrage par plage de dates
  if (date_debut || date_fin) {
    filters.DateHeure = {};
    if (date_debut) filters.DateHeure[Op.gte] = new Date(date_debut);
    if (date_fin) filters.DateHeure[Op.lte] = new Date(date_fin);
  }
  
  const rendezVous = await rendezVousService.getAllRendezVous(filters);
  res.status(200).json({
    status: 'success',
    results: rendezVous.length,
    data: {
      rendezVous
    }
  });
});

/**
 * Récupérer un rendez-vous par son ID
 */
exports.getRendezVousById = catchAsync(async (req, res, next) => {
  const rendezVous = await rendezVousService.getRendezVousById(req.params.id);
  if (!rendezVous) {
    return next(new AppError('Rendez-vous non trouvé', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      rendezVous
    }
  });
});

/**
 * Mettre à jour un rendez-vous
 */
exports.updateRendezVous = catchAsync(async (req, res, next) => {
  const updatedRendezVous = await rendezVousService.updateRendezVous(req.params.id, req.body);
  res.status(200).json({
    status: 'success',
    data: {
      rendezVous: updatedRendezVous
    }
  });
});

/**
 * Supprimer un rendez-vous
 */
exports.deleteRendezVous = catchAsync(async (req, res, next) => {
  await rendezVousService.deleteRendezVous(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null
  });
});

/**
 * Prendre un rendez-vous (implémentation de la méthode PrendreRendezVous du diagramme de classe)
 */
exports.prendreRendezVous = catchAsync(async (req, res, next) => {
  // Vérification des données requises
  const { nom, prenom, email, dateNaissance, sexe, telephone, DateHeure, motif_consultation, 
          id_hopital, id_service, id_medecin, numero_assure, assureur } = req.body;
          
  if (!nom || !prenom || !email || !dateNaissance || !sexe || !telephone || !DateHeure || 
      !motif_consultation || !id_hopital || !id_service || !numero_assure || !assureur) {
    return next(new AppError('Veuillez fournir toutes les informations requises pour le rendez-vous', 400));
  }
  
  const newRendezVous = await rendezVousService.prendreRendezVous(req.body);
  
  res.status(201).json({
    status: 'success',
    data: {
      rendezVous: newRendezVous
    }
  });
});

/**
 * Créer un rappel pour un patient
 */
exports.creerRappel = catchAsync(async (req, res, next) => {
  const { patient_id, id_medecin, date_rappel, message, type_rappel, rendez_vous_id } = req.body;
  
  if (!patient_id || !date_rappel || !message) {
    return next(new AppError('Veuillez fournir patient_id, date_rappel et message', 400));
  }
  
  const rappel = await rendezVousService.creerRappel(req.body);
  
  res.status(201).json({
    status: 'success',
    data: {
      rappel
    }
  });
});

/**
 * Récupérer les rappels d'un patient
 */
exports.getRappelsByPatient = catchAsync(async (req, res, next) => {
  const { patient_id } = req.params;
  const { type_rappel, date_debut, date_fin } = req.query;
  
  const filters = {};
  if (type_rappel) filters.type_rappel = type_rappel;
  if (date_debut || date_fin) {
    filters.DateHeure = {};
    if (date_debut) filters.DateHeure[Op.gte] = new Date(date_debut);
    if (date_fin) filters.DateHeure[Op.lte] = new Date(date_fin);
  }
  
  const rappels = await rendezVousService.getRappelsByPatient(patient_id, filters);
  
  res.status(200).json({
    status: 'success',
    results: rappels.length,
    data: {
      rappels
    }
  });
});

/**
 * Récupérer les rendez-vous à venir d'un patient
 */
exports.getRendezVousAVenir = catchAsync(async (req, res, next) => {
  const { patient_id } = req.params;
  const { limit } = req.query;
  
  const rendezVous = await rendezVousService.getRendezVousAVenir(patient_id, limit ? parseInt(limit) : 10);
  
  res.status(200).json({
    status: 'success',
    results: rendezVous.length,
    data: {
      rendezVous
    }
  });
});

/**
 * Annuler un rendez-vous
 */
exports.annulerRendezVous = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { motif } = req.body;
  
  if (!motif) {
    return next(new AppError('Le motif d\'annulation est requis', 400));
  }
  
  const rendezVousAnnule = await rendezVousService.annulerRendezVous(id, motif);
  
  res.status(200).json({
    status: 'success',
    data: {
      rendezVous: rendezVousAnnule
    }
  });
});

/**
 * Récupérer les rappels à envoyer (pour un service de notification)
 */
exports.getRappelsAEnvoyer = catchAsync(async (req, res, next) => {
  const { date_limite } = req.query;
  const dateLimite = date_limite ? new Date(date_limite) : new Date();
  
  const rappels = await rendezVousService.getRappelsAEnvoyer(dateLimite);
  
  res.status(200).json({
    status: 'success',
    results: rappels.length,
    data: {
      rappels
    }
  });
});

/**
 * Marquer un rappel comme envoyé
 */
exports.marquerRappelEnvoye = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  await rendezVousService.marquerRappelEnvoye(id);
  
  res.status(200).json({
    status: 'success',
    message: 'Rappel marqué comme envoyé'
  });
});