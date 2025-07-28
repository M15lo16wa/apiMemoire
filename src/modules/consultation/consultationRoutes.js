// routes/consultationRoutes.js
const express = require('express');
const router = express.Router();
const consultationController = require('./consultationController');
const attachProfessionnel = require('../../middlewares/attachProfessionnel');

/**
 * @swagger
 * components:
 *   schemas:
 *     Consultation:
 *       type: object
 *       required:
 *         - date_consultation
 *         - motif
 *         - dossier_id
 *       properties:
 *         id_consultation:
 *           type: integer
 *           description: Identifiant unique de la consultation
 *         date_consultation:
 *           type: string
 *           format: date-time
 *           description: Date et heure de la consultation
 *         motif:
 *           type: string
 *           description: Motif de la consultation
 *         diagnostic:
 *           type: string
 *           description: Diagnostic établi lors de la consultation
 *         compte_rendu:
 *           type: string
 *           description: Compte-rendu détaillé de la consultation
 *         examen_clinique:
 *           type: object
 *           description: Résultats de l'examen clinique (TA, fréquence cardiaque, etc.)
 *         statut:
 *           type: string
 *           enum: [planifiee, en_cours, terminee, annulee, reportee]
 *           description: Statut actuel de la consultation
 *         duree:
 *           type: integer
 *           description: Durée prévue de la consultation en minutes
 *         type_consultation:
 *           type: string
 *           enum: [premiere, suivi, urgence, controle, autre]
 *           description: Type de consultation
 *         confidentialite:
 *           type: string
 *           enum: [normal, confidentiel, tres_confidentiel]
 *           description: Niveau de confidentialité de la consultation
 *         dossier_id:
 *           type: integer
 *           description: ID du dossier médical associé
 *         professionnel_id:
 *           type: integer
 *           description: ID du professionnel de santé (injecté automatiquement, ne pas fournir)
 *         patient_id:
 *           type: integer
 *           description: ID du patient (injecté automatiquement, ne pas fournir)
 *         service_id:
 *           type: integer
 *           description: ID du service de santé (optionnel)
 *         date_annulation:
 *           type: string
 *           format: date-time
 *           description: Date d'annulation si la consultation a été annulée
 *         motif_annulation:
 *           type: string
 *           description: Raison de l'annulation de la consultation
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /consultation:
 *   get:
 *     summary: Récupérer toutes les consultations
 *     tags: [Consultations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des consultations récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Consultation'
 *       500:
 *         description: Erreur serveur
 */
router.get('/', consultationController.getAllConsultations);

/**
 * @swagger
 * /consultation/{id}:
 *   get:
 *     summary: Récupérer une consultation par ID
 *     tags: [Consultations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la consultation
 *     responses:
 *       200:
 *         description: Consultation récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Consultation'
 *       404:
 *         description: Consultation introuvable
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', consultationController.getConsultationById);

/**
 * @swagger
 * /consultation/dossier/{dossier_id}:
 *   get:
 *     summary: Récupérer les consultations par dossier médical
 *     tags: [Consultations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dossier_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du dossier médical
 *     responses:
 *       200:
 *         description: Consultations du dossier récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Consultation'
 *       500:
 *         description: Erreur serveur
 */
router.get('/dossier/:dossier_id', consultationController.getConsultationsByDossier);

/**
 * @swagger
 * /consultation/professionnel/{professionnel_id}:
 *   get:
 *     summary: Récupérer les consultations par professionnel de santé
 *     tags: [Consultations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: professionnel_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du professionnel de santé
 *     responses:
 *       200:
 *         description: Consultations du professionnel récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Consultation'
 *       500:
 *         description: Erreur serveur
 */
router.get('/professionnel/:professionnel_id', consultationController.getConsultationsByProfessionnel);

/**
 * @swagger
 * /consultation:
 *   post:
 *     summary: Créer une nouvelle consultation
 *     tags: [Consultations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date_consultation
 *               - motif
 *               - dossier_id
 *               - professionnel_id
 *             properties:
 *               date_consultation:
 *                 type: string
 *                 format: date-time
 *                 description: Date et heure de la consultation
 *               motif:
 *                 type: string
 *                 description: Motif de la consultation
 *               diagnostic:
 *                 type: string
 *                 description: Diagnostic établi lors de la consultation
 *               compte_rendu:
 *                 type: string
 *                 description: Compte-rendu détaillé de la consultation
 *               examen_clinique:
 *                 type: object
 *                 description: Résultats de l'examen clinique (TA, fréquence cardiaque, etc.)
 *               statut:
 *                 type: string
 *                 enum: [planifiee, en_cours, terminee, annulee, reportee]
 *                 description: Statut actuel de la consultation
 *               duree:
 *                 type: integer
 *                 description: Durée prévue de la consultation en minutes
 *               type_consultation:
 *                 type: string
 *                 enum: [premiere, suivi, urgence, controle, autre]
 *                 description: Type de consultation
 *               confidentialite:
 *                 type: string
 *                 enum: [normal, confidentiel, tres_confidentiel]
 *                 description: Niveau de confidentialité de la consultation
 *               dossier_id:
 *                 type: integer
 *                 description: ID du dossier médical associé
 *               professionnel_id:
 *                 type: integer
 *                 description: ID du professionnel de santé
 *               service_id:
 *                 type: integer
 *                 description: ID du service de santé (optionnel)
 *               date_annulation:
 *                 type: string
 *                 format: date-time
 *                 description: Date d'annulation si la consultation a été annulée
 *               motif_annulation:
 *                 type: string
 *                 description: Raison de l'annulation de la consultation
 *     responses:
 *       201:
 *         description: Consultation créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Consultation'
 *       400:
 *         description: Données invalides ou champs manquants
 *       404:
 *         description: Dossier médical, professionnel ou service introuvable
 *       500:
 *         description: Erreur serveur
 */
const { authenticateToken } = require('../../middlewares/auth.middleware');
router.post('/', authenticateToken, attachProfessionnel, consultationController.createConsultation);

/**
 * @swagger
 * /consultation/{id}:
 *   put:
 *     summary: Mettre à jour une consultation
 *     tags: [Consultations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la consultation à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date_consultation:
 *                 type: string
 *                 format: date-time
 *                 description: Date et heure de la consultation
 *               motif:
 *                 type: string
 *                 description: Motif de la consultation
 *               diagnostic:
 *                 type: string
 *                 description: Diagnostic établi lors de la consultation
 *               compte_rendu:
 *                 type: string
 *                 description: Compte-rendu détaillé de la consultation
 *               examen_clinique:
 *                 type: object
 *                 description: Résultats de l'examen clinique (TA, fréquence cardiaque, etc.)
 *               statut:
 *                 type: string
 *                 enum: [planifiee, en_cours, terminee, annulee, reportee]
 *                 description: Statut actuel de la consultation
 *               duree:
 *                 type: integer
 *                 description: Durée prévue de la consultation en minutes
 *               type_consultation:
 *                 type: string
 *                 enum: [premiere, suivi, urgence, controle, autre]
 *                 description: Type de consultation
 *               confidentialite:
 *                 type: string
 *                 enum: [normal, confidentiel, tres_confidentiel]
 *                 description: Niveau de confidentialité de la consultation
 *               dossier_id:
 *                 type: integer
 *                 description: ID du dossier médical associé
 *               professionnel_id:
 *                 type: integer
 *                 description: ID du professionnel de santé
 *               service_id:
 *                 type: integer
 *                 description: ID du service de santé (optionnel)
 *               date_annulation:
 *                 type: string
 *                 format: date-time
 *                 description: Date d'annulation si la consultation a été annulée
 *               motif_annulation:
 *                 type: string
 *                 description: Raison de l'annulation de la consultation
 *     responses:
 *       200:
 *         description: Consultation mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Consultation'
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Consultation, dossier médical, professionnel ou service introuvable
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', consultationController.updateConsultation);

/**
 * @swagger
 * /consultation/{id}:
 *   delete:
 *     summary: Supprimer une consultation
 *     tags: [Consultations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la consultation à supprimer
 *     responses:
 *       200:
 *         description: Consultation supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Consultation supprimée avec succès."
 *       404:
 *         description: Consultation introuvable
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', consultationController.deleteConsultation);

module.exports = router;