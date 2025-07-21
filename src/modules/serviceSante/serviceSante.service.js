const { ServiceSante, Hopital, ProfessionnelSante } = require('../../models');
const AppError = require('../../utils/appError');

exports.createServiceSante = async (data) => {
  // Vérifier que l'hôpital existe
  const hopital = await Hopital.findByPk(data.hopital_id);
  if (!hopital) throw new AppError("L'hôpital spécifié n'existe pas", 400);
  return await ServiceSante.create(data);
};

exports.getAllServicesSante = async (hopitalId) => {
  const where = hopitalId ? { hopital_id: hopitalId } : {};
  return await ServiceSante.findAll({
    where,
    include: [{ model: Hopital, as: 'hopital' }]
  });
};

exports.getServiceSanteById = async (id) => {
  const service = await ServiceSante.findByPk(id, {
    include: [
      { model: Hopital, as: 'hopital' },
      { model: ProfessionnelSante, as: 'professionnelsDuService' }
    ]
  });
  if (!service) throw new AppError('Service de santé non trouvé', 404);
  return service;
};

exports.updateServiceSante = async (id, data) => {
  const service = await ServiceSante.findByPk(id);
  if (!service) throw new AppError('Service de santé non trouvé', 404);
  if (data.hopital_id) {
    const hopital = await Hopital.findByPk(data.hopital_id);
    if (!hopital) throw new AppError("L'hôpital spécifié n'existe pas", 400);
  }
  await service.update(data);
  return service;
};

exports.deleteServiceSante = async (id) => {
  const service = await ServiceSante.findByPk(id);
  if (!service) throw new AppError('Service de santé non trouvé', 404);
  await service.destroy();
  return;
};
