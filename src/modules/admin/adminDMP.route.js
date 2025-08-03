const express = require('express');
const adminDMPController = require('./adminDMP.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = express.Router();

// Toutes les routes d'administration DMP nécessitent une authentification medecin
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('medecin'));

/**
 * @swagger
 * /admin/dmp/patients:
 *   get:
 *     summary: Récupère la liste des patients avec leurs données DMP
 *     tags: [Medecin - DMP]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Nombre maximum de résultats
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Nombre de résultats à ignorer
 *     responses:
 *       200:
 *         description: Liste des patients récupérée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (rôle medecin requis)
 */
router.get('/patients', adminDMPController.getPatientsList);

/**
 * @swagger
 * /admin/dmp/patients/{patientId}:
 *   get:
 *     summary: Récupère les données DMP d'un patient spécifique
 *     tags: [Medecin - DMP]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du patient
 *     responses:
 *       200:
 *         description: Données DMP du patient récupérées avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (rôle medecin requis)
 *       404:
 *         description: Patient non trouvé
 */
router.get('/patients/:patientId', adminDMPController.getPatientDMPData);

/**
 * @swagger
 * /admin/dmp/auto-mesures:
 *   get:
 *     summary: Récupère toutes les auto-mesures de tous les patients
 *     tags: [Medecin - DMP]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: integer
 *         description: Filtrer par patient spécifique
 *       - in: query
 *         name: type_mesure
 *         schema:
 *           type: string
 *         description: Filtrer par type de mesure
 *       - in: query
 *         name: date_debut
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début pour le filtrage
 *       - in: query
 *         name: date_fin
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin pour le filtrage
 *     responses:
 *       200:
 *         description: Auto-mesures récupérées avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (rôle medecin requis)
 */
router.get('/auto-mesures', adminDMPController.getAllAutoMesures);

/**
 * @swagger
 * /admin/dmp/auto-mesures/{id}:
 *   delete:
 *     summary: Supprime une auto-mesure (medecin uniquement)
 *     tags: [Medecin - DMP]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'auto-mesure
 *     responses:
 *       200:
 *         description: Auto-mesure supprimée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (rôle medecin requis)
 *       404:
 *         description: Auto-mesure non trouvée
 */
router.delete('/auto-mesures/:id', adminDMPController.deleteAutoMesure);

/**
 * @swagger
 * /admin/dmp/documents:
 *   get:
 *     summary: Récupère tous les documents personnels de tous les patients
 *     tags: [Medecin - DMP]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: integer
 *         description: Filtrer par patient spécifique
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filtrer par type de document
 *     responses:
 *       200:
 *         description: Documents récupérés avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (rôle medecin requis)
 */
router.get('/documents', adminDMPController.getAllDocuments);

/**
 * @swagger
 * /admin/dmp/documents/{id}:
 *   delete:
 *     summary: Supprime un document personnel (medecin uniquement)
 *     tags: [Medecin - DMP]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du document
 *     responses:
 *       200:
 *         description: Document supprimé avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (rôle medecin requis)
 *       404:
 *         description: Document non trouvé
 */
router.delete('/documents/:id', adminDMPController.deleteDocument);

/**
 * @swagger
 * /admin/dmp/messages:
 *   get:
 *     summary: Récupère tous les messages de tous les patients
 *     tags: [Medecin - DMP]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: integer
 *         description: Filtrer par patient spécifique
 *       - in: query
 *         name: professionnelId
 *         schema:
 *           type: integer
 *         description: Filtrer par professionnel spécifique
 *       - in: query
 *         name: lu
 *         schema:
 *           type: boolean
 *         description: Filtrer par statut lu/non lu
 *     responses:
 *       200:
 *         description: Messages récupérés avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (rôle medecin requis)
 */
router.get('/messages', adminDMPController.getAllMessages);

/**
 * @swagger
 * /admin/dmp/messages/{id}:
 *   delete:
 *     summary: Supprime un message (medecin uniquement)
 *     tags: [Medecin - DMP]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du message
 *     responses:
 *       200:
 *         description: Message supprimé avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (rôle medecin requis)
 *       404:
 *         description: Message non trouvé
 */
router.delete('/messages/:id', adminDMPController.deleteMessage);

/**
 * @swagger
 * /admin/dmp/rappels:
 *   get:
 *     summary: Récupère tous les rappels de tous les patients
 *     tags: [Medecin - DMP]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: integer
 *         description: Filtrer par patient spécifique
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filtrer par type de rappel
 *       - in: query
 *         name: actif
 *         schema:
 *           type: boolean
 *         description: Filtrer par statut actif/inactif
 *     responses:
 *       200:
 *         description: Rappels récupérés avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (rôle medecin requis)
 */
router.get('/rappels', adminDMPController.getAllRappels);

/**
 * @swagger
 * /admin/dmp/rappels/{id}:
 *   delete:
 *     summary: Supprime un rappel (medecin uniquement)
 *     tags: [Medecin - DMP]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du rappel
 *     responses:
 *       200:
 *         description: Rappel supprimé avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (rôle medecin requis)
 *       404:
 *         description: Rappel non trouvé
 */
router.delete('/rappels/:id', adminDMPController.deleteRappel);

/**
 * @swagger
 * /admin/dmp/statistiques:
 *   get:
 *     summary: Récupère les statistiques globales du DMP
 *     tags: [Medecin - DMP]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_patients:
 *                       type: integer
 *                     total_auto_mesures:
 *                       type: integer
 *                     total_documents:
 *                       type: integer
 *                     total_messages:
 *                       type: integer
 *                     total_rappels:
 *                       type: integer
 *                     patients_actifs:
 *                       type: integer
 *                     derniere_activite:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (rôle medecin requis)
 */
router.get('/statistiques', adminDMPController.getGlobalStatistics);

/**
 * @swagger
 * /admin/dmp/patients/{patientId}/desactiver:
 *   patch:
 *     summary: Désactive l'accès DMP d'un patient
 *     tags: [Medecin - DMP]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du patient
 *     responses:
 *       200:
 *         description: Accès DMP désactivé avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (rôle medecin requis)
 *       404:
 *         description: Patient non trouvé
 */
router.patch('/patients/:patientId/desactiver', adminDMPController.desactiverAccesDMP);

/**
 * @swagger
 * /admin/dmp/patients/{patientId}/reactiver:
 *   patch:
 *     summary: Réactive l'accès DMP d'un patient
 *     tags: [Medecin - DMP]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du patient
 *     responses:
 *       200:
 *         description: Accès DMP réactivé avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (rôle medecin requis)
 *       404:
 *         description: Patient non trouvé
 */
router.patch('/patients/:patientId/reactiver', adminDMPController.reactiverAccesDMP);

module.exports = router; 