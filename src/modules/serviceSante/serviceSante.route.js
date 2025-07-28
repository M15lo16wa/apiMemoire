const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const serviceSanteController = require('./serviceSante.controller');
const { handleValidationErrors } = require('../../middlewares/validation.middleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     ServiceSante:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID unique du service de santé
 *         nom:
 *           type: string
 *           description: Nom du service de santé
 *         type_service:
 *           type: string
 *           description: Type du service (par exemple, CARDIOLOGIE, URGENCE, etc.)
 *         hopital_id:
 *           type: integer
 *           description: ID de l'hôpital auquel appartient le service
 *         description:
 *           type: string
 *           description: Description du service (optionnel)
 *         telephone:
 *           type: string
 *           description: Numéro de téléphone du service (optionnel)
 *       required:
 *         - id
 *         - nom
 *         - type_service
 *         - hopital_id
 *
 * /service-sante:
 *   post:
 *     summary: Créer un nouveau service de santé
 *     tags: [ServiceSante]
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
 *               - type_service
 *               - hopital_id
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nom du service de santé
 *               type_service:
 *                 type: string
 *                 description: Type du service (par exemple, CARDIOLOGIE, URGENCE, etc.)
 *               hopital_id:
 *                 type: integer
 *                 description: ID de l'hôpital auquel appartient le service
 *               description:
 *                 type: string
 *                 description: Description du service (optionnel)
 *               telephone:
 *                 type: string
 *                 description: Numéro de téléphone du service (optionnel)
 *     responses:
 *       201:
 *         description: Service de santé créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceSante'
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur serveur
 *   get:
 *     summary: Récupérer tous les services de santé
 *     tags: [ServiceSante]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: hopital_id
 *         schema:
 *           type: integer
 *         description: Filtrer par hôpital
 *     responses:
 *       200:
 *         description: Liste des services de santé récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ServiceSante'
 *       500:
 *         description: Erreur serveur
 *
 * /service-sante/{id}:
 *   get:
 *     summary: Récupérer un service de santé par ID
 *     tags: [ServiceSante]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du service de santé à récupérer
 *     responses:
 *       200:
 *         description: Service de santé récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceSante'
 *       404:
 *         description: Service de santé non trouvé
 *       500:
 *         description: Erreur serveur
 *   put:
 *     summary: Mettre à jour un service de santé par ID
 *     tags: [ServiceSante]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du service de santé à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - type_service
 *               - hopital_id
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nom du service de santé
 *               type_service:
 *                 type: string
 *                 description: Type du service (par exemple, CARDIOLOGIE, URGENCE, etc.)
 *               hopital_id:
 *                 type: integer
 *                 description: ID de l'hôpital auquel appartient le service
 *               description:
 *                 type: string
 *                 description: Description du service (optionnel)
 *               telephone:
 *                 type: string
 *                 description: Numéro de téléphone du service (optionnel)
 *     responses:
 *       200:
 *         description: Service de santé mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceSante'
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Service de santé non trouvé
 *       500:
 *         description: Erreur serveur
 *   delete:
 *     summary: Supprimer un service de santé par ID
 *     tags: [ServiceSante]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du service de santé à supprimer
 *     responses:
 *       204:
 *         description: Service de santé supprimé avec succès
 *       404:
 *         description: Service de santé non trouvé
 *       500:
 *         description: Erreur serveur
 */

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
