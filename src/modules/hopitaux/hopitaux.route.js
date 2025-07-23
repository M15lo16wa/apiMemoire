const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const hopitalController = require('./hopitaux.controller');
const { handleValidationErrors } = require('../../middlewares/validation.middleware');

/**
 * @swagger
 * tags:
 *   name: Hopitaux
 *   description: Gestion des hôpitaux
 */

// Validation pour la création et la mise à jour d'un hôpital
const hopitalValidationRules = [
  body('nom').notEmpty().withMessage('Le nom est requis.').isString(),
  body('adresse').notEmpty().withMessage('L\'adresse est requise.').isString(),
  body('telephone').notEmpty().withMessage('Le téléphone est requis.').isString(),
  body('type_etablissement').isIn(['Public', 'Privé', 'Spécialisé']).withMessage('Le type d\'établissement est invalide.')
];

/**
 * @swagger
 * /hopital:
 *   post:
 *     summary: Créer un nouvel hôpital
 *     tags: [Hopitaux]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - adresse
 *               - telephone
 *               - type_etablissement
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "Hôpital Central"
 *               adresse:
 *                 type: string
 *                 example: "123 Rue de la Santé, 75001 Paris"
 *               telephone:
 *                 type: string
 *                 example: "+33123456789"
 *               type_etablissement:
 *                 type: string
 *                 enum: [Public, Privé, Spécialisé]
 *                 example: "Public"
 *     responses:
 *       201:
 *         description: Hôpital créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hopital'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *
 *   get:
 *     summary: Récupérer tous les hôpitaux
 *     tags: [Hopitaux]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des hôpitaux
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Hopital'
 *       401:
 *         description: Non authentifié
 */

/**
 * @swagger
 * /hopital/{id}:
 *   get:
 *     summary: Récupérer un hôpital par son ID
 *     tags: [Hopitaux]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'hôpital
 *     responses:
 *       200:
 *         description: Détails de l'hôpital
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hopital'
 *       404:
 *         description: Hôpital non trouvé
 *       401:
 *         description: Non authentifié
 *
 *   put:
 *     summary: Mettre à jour un hôpital
 *     tags: [Hopitaux]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'hôpital
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "Grand Hôpital de Paris"
 *               adresse:
 *                 type: string
 *                 example: "123 Rue de la Santé, 75001 Paris"
 *               telephone:
 *                 type: string
 *                 example: "+33123456789"
 *               type_etablissement:
 *                 type: string
 *                 enum: [Public, Privé, Spécialisé]
 *                 example: "Public"
 *     responses:
 *       200:
 *         description: Hôpital mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hopital'
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Hôpital non trouvé
 *       401:
 *         description: Non authentifié
 *
 *   delete:
 *     summary: Supprimer un hôpital
 *     tags: [Hopitaux]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'hôpital
 *     responses:
 *       204:
 *         description: Hôpital supprimé avec succès
 *       404:
 *         description: Hôpital non trouvé
 *       401:
 *         description: Non authentifié
 */


// CRUD Hôpital
router.post('/', hopitalValidationRules, handleValidationErrors, hopitalController.createHopital);
router.get('/', hopitalController.getAllHopitaux);
router.get('/:id', hopitalController.getHopitalById);
router.put('/:id', hopitalValidationRules, handleValidationErrors, hopitalController.updateHopital);
router.delete('/:id', hopitalController.deleteHopital);

module.exports = router;
