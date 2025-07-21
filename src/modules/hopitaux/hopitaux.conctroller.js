const hopitalService = require('./hopitaux.service');
const catchAsync = require('../../utils/catchAsync');

// Créer un nouvel hôpital
exports.createHopital = catchAsync(async (req, res, next) => {
    const newHopital = await hopitalService.createHopital(req.body);
    res.status(201).json({
    status: 'success',
    data: {
        hopital: newHopital,
    },
    });
});

// Récupérer tous les hôpitaux
exports.getAllHopitaux = catchAsync(async (req, res, next) => {
    const hopitaux = await hopitalService.getAllHopitaux();
    res.status(200).json({
    status: 'success',
    results: hopitaux.length,
    data: {
        hopitaux,
    },
    });
});

// Récupérer un hôpital par son ID
exports.getHopitalById = catchAsync(async (req, res, next) => {
    const hopital = await hopitalService.getHopitalById(req.params.id);
    res.status(200).json({
        status: 'success',
        data: {
        hopital,
    },
    });
});

// Mettre à jour un hôpital
exports.updateHopital = catchAsync(async (req, res, next) => {
    const updatedHopital = await hopitalService.updateHopital(req.params.id, req.body);
    res.status(200).json({
        status: 'success',
        data: {
        hopital: updatedHopital,
        },
    });
});

// Supprimer un hôpital (soft delete)
exports.deleteHopital = catchAsync(async (req, res, next) => {
    await hopitalService.deleteHopital(req.params.id);
    res.status(204).json({
        status: 'success',
        data: null,
    });
});