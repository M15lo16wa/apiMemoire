const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const serviceSanteController = require('./serviceSante.controller');
const { handleValidationErrors } = require('../../middlewares/validation.middleware');

const serviceSanteValidationRules = [
  body('nom').notEmpty().withMessage('Le nom est requis.').isString(),
  body('type_service').notEmpty().withMessage('Le type de service est requis.').isString(),
  body('hopital_id').notEmpty().withMessage("L'id de l'hôpital est requis.").isInt()
];

router.post('/', serviceSanteValidationRules, handleValidationErrors, serviceSanteController.createServiceSante);
router.get('/', serviceSanteController.getAllServicesSante);
router.get('/:id', serviceSanteController.getServiceSanteById);
router.put('/:id', serviceSanteValidationRules, handleValidationErrors, serviceSanteController.updateServiceSante);
router.delete('/:id', serviceSanteController.deleteServiceSante);

module.exports = router;
