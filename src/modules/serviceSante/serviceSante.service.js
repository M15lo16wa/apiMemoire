const { ServiceSante, Hopital, ProfessionnelSante } = require('../../models');
const AppError = require('../../utils/appError');

/**
 * Crée un nouveau service de santé.
 * @param {object} data - Les données du service de santé.
 * @returns {Promise<ServiceSante>}
 */
const createServiceSante = async (data) => {
  const hopital = await Hopital.findByPk(data.hopitalId);
  if (!hopital) {
    throw new AppError("L'hôpital spécifié n'existe pas", 404);
  }
  return ServiceSante.create(data);
};

/**
 * Récupère tous les services de santé, éventuellement filtrés par hôpital.
 * @param {number} [hopitalId] - L'ID de l'hôpital pour filtrer les services.
 * @returns {Promise<ServiceSante[]>}
 */
const getAllServicesSante = async (hopitalId) => {
  const options = {
    include: [{ model: Hopital, as: 'hopital' }],
    where: {},
  };
  if (hopitalId) {
    options.where.hopitalId = hopitalId;
  }
  return ServiceSante.findAll(options);
};

/**
 * Récupère un service de santé par son ID.
 * @param {number} id - L'ID du service de santé.
 * @returns {Promise<ServiceSante>}
 */
const getServiceSanteById = async (id) => {
  const service = await ServiceSante.findByPk(id, {
    include: [
      { model: Hopital, as: 'hopital' },
      { model: ProfessionnelSante, as: 'professionnelsSante' },
    ],
  });
  if (!service) {
    throw new AppError('Service de santé non trouvé', 404);
  }
  return service;
};

/**
 * Met à jour un service de santé.
 * @param {number} id - L'ID du service de santé.
 * @param {object} data - Les données à mettre à jour.
 * @returns {Promise<ServiceSante>}
 */
const updateServiceSante = async (id, data) => {
  const service = await ServiceSante.findByPk(id);
  if (!service) {
    throw new AppError('Service de santé non trouvé', 404);
  }
  if (data.hopitalId) {
    const hopital = await Hopital.findByPk(data.hopitalId);
    if (!hopital) {
      throw new AppError("L'hôpital spécifié n'existe pas", 404);
    }
  }
  await service.update(data);
  return service.reload();
};

/**
 * Supprime un service de santé.
 * @param {number} id - L'ID du service de santé.
 * @returns {Promise<void>}
 */
const deleteServiceSante = async (id) => {
  const service = await ServiceSante.findByPk(id);
  if (!service) {
    throw new AppError('Service de santé non trouvé', 404);
  }
  await service.destroy();
};

module.exports = {
  createServiceSante,
  getAllServicesSante,
  getServiceSanteById,
  updateServiceSante,
  deleteServiceSante,
};
