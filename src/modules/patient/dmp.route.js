const express = require('express');
const DMPController = require('./dmp.controller');
const patientAuth = require('../../middlewares/patientAuth');

const router = express.Router();

// Toutes les routes DMP nécessitent une authentification patient
router.use(patientAuth);

/**
 * @swagger
 * /patient/dmp/tableau-de-bord:
 *   get:
 *     summary: Récupère le tableau de bord personnalisé du patient
 *     tags: [DMP - Patient]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tableau de bord récupéré avec succès
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
 *                     tableau_de_bord:
 *                       type: object
 *                       properties:
 *                         patient:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             nom:
 *                               type: string
 *                             prenom:
 *                               type: string
 *                             date_naissance:
 *                               type: string
 *                               format: date
 *                             identifiant:
 *                               type: string
 *                             groupe_sanguin:
 *                               type: string
 *                             allergies:
 *                               type: string
 *                             maladies_chroniques:
 *                               type: string
 *                         prochains_rendez_vous:
 *                           type: array
 *                           items:
 *                             type: object
 *                         dernieres_activites:
 *                           type: array
 *                           items:
 *                             type: object
 *                         notifications:
 *                           type: array
 *                           items:
 *                             type: object
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
router.get('/tableau-de-bord', DMPController.getTableauDeBord);

/**
 * @swagger
 * /patient/dmp/historique-medical:
 *   get:
 *     summary: Récupère l'historique médical complet du patient
 *     tags: [DMP - Patient]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Type de document (consultation, prescription, examen)
 *       - in: query
 *         name: date_debut
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début pour filtrer
 *       - in: query
 *         name: date_fin
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin pour filtrer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Nombre d'éléments à retourner
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Offset pour la pagination
 *     responses:
 *       200:
 *         description: Historique médical récupéré avec succès
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
 *                     historique_medical:
 *                       type: object
 *                       properties:
 *                         consultations:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Consultation'
 *                         prescriptions:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Prescription'
 *                         examens_laboratoire:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/ExamenLabo'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
router.get('/historique-medical', DMPController.getHistoriqueMedical);

/**
 * @swagger
 * /patient/dmp/journal-activite:
 *   get:
 *     summary: Récupère le journal d'activité et de consentement
 *     tags: [DMP - Patient]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Type d'activité (consultation, ajout, modification)
 *       - in: query
 *         name: date_debut
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début pour filtrer
 *       - in: query
 *         name: date_fin
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin pour filtrer
 *     responses:
 *       200:
 *         description: Journal d'activité récupéré avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
router.get('/journal-activite', DMPController.getJournalActivite);

/**
 * @swagger
 * /patient/dmp/droits-acces:
 *   get:
 *     summary: Récupère les droits d'accès du patient
 *     tags: [DMP - Patient]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Droits d'accès récupérés avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
router.get('/droits-acces', DMPController.getDroitsAcces);

/**
 * @swagger
 * /patient/dmp/autoriser-acces:
 *   post:
 *     summary: Autorise un nouveau professionnel à accéder au dossier
 *     tags: [DMP - Patient]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - professionnel_id
 *             properties:
 *               professionnel_id:
 *                 type: integer
 *                 description: ID du professionnel de santé
 *               permissions:
 *                 type: object
 *                 description: Permissions spécifiques accordées
 *     responses:
 *       201:
 *         description: Autorisation accordée avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Professionnel non trouvé
 *       409:
 *         description: Autorisation déjà existante
 */
router.post('/autoriser-acces', DMPController.autoriserAcces);

/**
 * @swagger
 * /patient/dmp/revoquer-acces/{professionnel_id}:
 *   delete:
 *     summary: Révoque l'accès d'un professionnel
 *     tags: [DMP - Patient]
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
 *         description: Accès révoqué avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Autorisation non trouvée
 */
router.delete('/revoquer-acces/:professionnel_id', DMPController.revoquerAcces);

/**
 * @swagger
 * /patient/dmp/informations-personnelles:
 *   patch:
 *     summary: Met à jour les informations personnelles du patient
 *     tags: [DMP - Patient]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               personne_urgence:
 *                 type: string
 *                 description: Nom de la personne à contacter en cas d'urgence
 *               telephone_urgence:
 *                 type: string
 *                 description: Téléphone de la personne d'urgence
 *               antecedents_familiaux:
 *                 type: string
 *                 description: Antécédents familiaux
 *               habitudes_vie:
 *                 type: object
 *                 description: Habitudes de vie (tabagisme, activité physique, etc.)
 *     responses:
 *       200:
 *         description: Informations personnelles mises à jour avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
router.patch('/informations-personnelles', DMPController.updateInformationsPersonnelles);

/**
 * @swagger
 * /patient/dmp/auto-mesures:
 *   post:
 *     summary: Ajoute une auto-mesure du patient
 *     tags: [DMP - Patient]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type_mesure
 *               - valeur
 *             properties:
 *               type_mesure:
 *                 type: string
 *                 enum: [poids, taille, tension_arterielle, glycemie, temperature]
 *                 description: Type de mesure
 *               valeur:
 *                 type: number
 *                 description: Valeur de la mesure
 *               unite:
 *                 type: string
 *                 description: Unité de mesure
 *               commentaire:
 *                 type: string
 *                 description: Commentaire optionnel
 *     responses:
 *       201:
 *         description: Auto-mesure ajoutée avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
router.post('/auto-mesures', DMPController.ajouterAutoMesure);

/**
 * @swagger
 * /patient/dmp/fiche-urgence:
 *   get:
 *     summary: Génère une fiche d'urgence avec QR Code
 *     tags: [DMP - Patient]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fiche d'urgence générée avec succès
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
 *                     fiche_urgence:
 *                       type: object
 *                       properties:
 *                         fiche_urgence:
 *                           type: object
 *                           properties:
 *                             nom:
 *                               type: string
 *                             date_naissance:
 *                               type: string
 *                             telephone:
 *                               type: string
 *                             groupe_sanguin:
 *                               type: string
 *                             allergies:
 *                               type: string
 *                             maladies_chroniques:
 *                               type: string
 *                         qr_code:
 *                           type: string
 *                           description: QR Code en base64
 *                         url_fiche:
 *                           type: string
 *                           description: URL de la fiche d'urgence
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
router.get('/fiche-urgence', DMPController.genererFicheUrgence);

/**
 * @swagger
 * /patient/dmp/rendez-vous:
 *   get:
 *     summary: Récupère les rendez-vous du patient
 *     tags: [DMP - Patient]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [confirme, en_attente, annule]
 *         description: Statut du rendez-vous
 *       - in: query
 *         name: date_debut
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début pour filtrer
 *       - in: query
 *         name: date_fin
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin pour filtrer
 *     responses:
 *       200:
 *         description: Rendez-vous récupérés avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
router.get('/rendez-vous', DMPController.getRendezVous);

/**
 * @swagger
 * /patient/dmp/messagerie:
 *   post:
 *     summary: Envoie un message sécurisé au médecin
 *     tags: [DMP - Patient]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - professionnel_id
 *               - sujet
 *               - message
 *             properties:
 *               professionnel_id:
 *                 type: integer
 *                 description: ID du professionnel destinataire
 *               sujet:
 *                 type: string
 *                 description: Sujet du message
 *               message:
 *                 type: string
 *                 description: Contenu du message
 *     responses:
 *       201:
 *         description: Message envoyé avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
router.post('/messagerie', DMPController.envoyerMessage);

/**
 * @swagger
 * /patient/dmp/rappels:
 *   get:
 *     summary: Récupère les rappels et plan de soins personnalisé
 *     tags: [DMP - Patient]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rappels récupérés avec succès
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
 *                     rappels:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             enum: [medicament, vaccin, controle]
 *                           message:
 *                             type: string
 *                           date:
 *                             type: string
 *                             format: date-time
 *                           priorite:
 *                             type: string
 *                             enum: [haute, moyenne, basse]
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
router.get('/rappels', DMPController.getRappels);

/**
 * @swagger
 * /patient/dmp/bibliotheque-sante:
 *   get:
 *     summary: Récupère la bibliothèque de santé
 *     tags: [DMP - Patient]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categorie
 *         schema:
 *           type: string
 *         description: Catégorie de document
 *       - in: query
 *         name: recherche
 *         schema:
 *           type: string
 *         description: Terme de recherche
 *     responses:
 *       200:
 *         description: Bibliothèque de santé récupérée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
router.get('/bibliotheque-sante', DMPController.getBibliothequeSante);

/**
 * @swagger
 * /patient/dmp/documents-personnels:
 *   get:
 *     summary: Récupère les documents personnels du patient
 *     tags: [DMP - Patient]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Documents personnels récupérés avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
router.get('/documents-personnels', DMPController.getDocumentsPersonnels);

/**
 * @swagger
 * /patient/dmp/upload-document:
 *   post:
 *     summary: Upload de documents personnels
 *     tags: [DMP - Patient]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - titre
 *               - type_document
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Fichier à uploader (PDF, JPG, PNG)
 *               titre:
 *                 type: string
 *                 description: Titre du document
 *               description:
 *                 type: string
 *                 description: Description optionnelle
 *               type_document:
 *                 type: string
 *                 enum: [analyse, radiographie, ordonnance, autre]
 *                 description: Type de document
 *     responses:
 *       201:
 *         description: Document uploadé avec succès
 *       400:
 *         description: Données invalides ou fichier manquant
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
router.post('/upload-document', DMPController.uploadDocumentPersonnel);

/**
 * @swagger
 * /patient/dmp/statistiques:
 *   get:
 *     summary: Récupère les statistiques du DMP
 *     tags: [DMP - Patient]
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
 *                     statistiques:
 *                       type: object
 *                       properties:
 *                         total_consultations:
 *                           type: integer
 *                         total_prescriptions:
 *                           type: integer
 *                         total_examens:
 *                           type: integer
 *                         derniere_activite:
 *                           type: string
 *                           format: date-time
 *                         professionnels_autorises:
 *                           type: integer
 *                         documents_uploades:
 *                           type: integer
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
router.get('/statistiques', DMPController.getStatistiquesDMP);

module.exports = router; 