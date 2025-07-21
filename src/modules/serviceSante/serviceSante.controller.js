const serviceSanteService = require('./serviceSante.service');
const catchAsync = require('../../utils/catchAsync');

exports.createServiceSante = catchAsync(async (req, res, next) => {
  const newService = await serviceSanteService.createServiceSante(req.body);
  res.status(201).json({ status: 'success', data: { service: newService } });
});

exports.getAllServicesSante = catchAsync(async (req, res, next) => {
  const { hopital_id } = req.query;
  const services = await serviceSanteService.getAllServicesSante(hopital_id);
  res.status(200).json({ status: 'success', results: services.length, data: { services } });
});

exports.getServiceSanteById = catchAsync(async (req, res, next) => {
  const service = await serviceSanteService.getServiceSanteById(req.params.id);
  res.status(200).json({ status: 'success', data: { service } });
});

exports.updateServiceSante = catchAsync(async (req, res, next) => {
  const service = await serviceSanteService.updateServiceSante(req.params.id, req.body);
  res.status(200).json({ status: 'success', data: { service } });
});

exports.deleteServiceSante = catchAsync(async (req, res, next) => {
  await serviceSanteService.deleteServiceSante(req.params.id);
  res.status(204).json({ status: 'success', data: null });
});
