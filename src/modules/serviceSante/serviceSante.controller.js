const serviceSanteService = require('./serviceSante.service');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');

const createServiceSante = catchAsync(async (req, res) => {
  const service = await serviceSanteService.createServiceSante(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      service,
    },
  });
});

const getAllServicesSante = catchAsync(async (req, res) => {
  const { hopitalId } = req.query;
  const services = await serviceSanteService.getAllServicesSante(hopitalId);
  res.status(200).json({
    status: 'success',
    results: services.length,
    data: {
      services,
    },
  });
});

const getServiceSanteById = catchAsync(async (req, res, next) => {
  const service = await serviceSanteService.getServiceSanteById(req.params.id);
  if (!service) {
    return next(new AppError('No service found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      service,
    },
  });
});

const updateServiceSante = catchAsync(async (req, res, next) => {
  const service = await serviceSanteService.updateServiceSante(req.params.id, req.body);
  if (!service) {
    return next(new AppError('No service found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      service,
    },
  });
});

const deleteServiceSante = catchAsync(async (req, res, next) => {
  await serviceSanteService.deleteServiceSante(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

module.exports = {
  createServiceSante,
  getAllServicesSante,
  getServiceSanteById,
  updateServiceSante,
  deleteServiceSante,
};
