const express = require('express');
const router = express.Router();
const PrescriptionController = require('./prescription.controller');
const { handleValidationErrors } = require('../../middlewares/validation.middleware');
const { authenticateToken } = require('../../middlewares/auth.middleware');
// La 2FA ne s'applique qu'à l'accès aux dossiers patients, pas aux prescriptions
const {
  ordonnanceValidationRules,
  demandeExamenValidationRules,
  updateValidationRules,
  searchValidationRules,
  paramValidationRules,
  prescriptionParamValidationRules,
  patientParamValidationRules,
  renouvellementValidationRules,
  suspensionValidationRules,
  transfertValidationRules,
  statsValidationRules
} = require('./prescription.validators');

/**
 * @swagger
 * tags:
 *   name: Prescription
 *   description: Gestion moderne des ordonnances et demandes d'examen avec génération automatique
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PrescriptionModerne:
 *       type: object
 *       properties:
 *         id_prescription:
 *           type: integer
 *           description: ID unique de la prescription
 *         prescriptionNumber:
 *           type: string
 *           description: Numéro unique généré automatiquement (ORD-YYYY-XXXXXX ou EXA-YYYY-XXXXXX)
 *           example: "ORD-2025-000001"
 *         type_prescription:
 *           type: string
 *           enum: [ordonnance, examen]
 *           description: Type de prescription
 *         principe_actif:
 *           type: string
 *           description: Principe actif (DCI) ou type d'examen
 *         nom_commercial:
 *           type: string
 *           description: Nom commercial du médicament
 *         dosage:
 *           type: string
 *           description: Dosage prescrit ou paramètres d'examen
 *         frequence:
 *           type: string
 *           description: Fréquence de prise ou urgence
 *         voie_administration:
 *           type: string
 *           enum: [orale, cutanée, nasale, oculaire, auriculaire, vaginale, rectale, inhalée, injection, autre]
 *         statut:
 *           type: string
 *           enum: [active, suspendue, terminee, annulee, en_attente]
 *         qrCode:
 *           type: string
 *           description: QR Code généré automatiquement pour vérification
 *         signatureElectronique:
 *           type: string
 *           description: Signature électronique du prescripteur
 *         date_prescription:
 *           type: string
 *           format: date-time
 *         patient:
 *           $ref: '#/components/schemas/PatientInfo'
 *         redacteur:
 *           $ref: '#/components/schemas/ProfessionnelInfo'
 *     PatientInfo:
 *       type: object
 *       properties:
 *         id_patient:
 *           type: integer
 *         nom:
 *           type: string
 *         prenom:
 *           type: string
 *         date_naissance:
 *           type: string
 *           format: date
 *     ProfessionnelInfo:
 *       type: object
 *       properties:
 *         id_professionnel:
 *           type: integer
 *         numero_adeli:
 *           type: string
 *         specialite:
 *           type: string
 *         compteUtilisateur:
 *           type: object
 *           properties:
 *             nom:
 *               type: string
 *             prenom:
 *               type: string
 */

/**
 * @swagger
 * /prescription/ordonnance:
 *   post:
 *     summary: Créer une nouvelle ordonnance avec génération automatique
 *     tags: [Prescription]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patient_id
 *               - principe_actif
 *               - dosage
 *               - frequence
 *             properties:
 *               patient_id:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID du patient
 *               dossier_id:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID du dossier médical (optionnel)
 *               principe_actif:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 255
 *                 description: Principe actif (DCI) du médicament
 *                 example: "Paracétamol"
 *               nom_commercial:
 *                 type: string
 *                 maxLength: 255
 *                 description: Nom commercial du médicament
 *                 example: "Doliprane"
 *               code_cip:
 *                 type: string
 *                 pattern: "^\\d{13}$"
 *                 description: Code CIP à 13 chiffres
 *               dosage:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: Dosage prescrit
 *                 example: "500mg"
 *               forme_pharmaceutique:
 *                 type: string
 *                 enum: [comprimé, gélule, sirop, solution, pommade, crème, gel, suppositoire, injection, autre]
 *               quantite:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 9999
 *               unite:
 *                 type: string
 *                 enum: [boîte, flacon, tube, ampoule, sachet, comprimé, gélule, ml, g, mg, autre]
 *               frequence:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: Fréquence de prise
 *                 example: "3 fois par jour"
 *               voie_administration:
 *                 type: string
 *                 enum: [orale, cutanée, nasale, oculaire, auriculaire, vaginale, rectale, inhalée, injection, autre]
 *               duree_traitement:
 *                 type: string
 *                 pattern: "^(\\d+\\s*(jour|jours|semaine|semaines|mois|an|ans|heure|heures)|\\d+\\s*-\\s*\\d+\\s*(jour|jours|semaine|semaines|mois))$"
 *                 example: "7 jours"
 *               instructions_speciales:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Instructions particulières
 *               renouvelable:
 *                 type: boolean
 *                 description: Si la prescription est renouvelable
 *               nb_renouvellements:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 12
 *                 description: Nombre de renouvellements autorisés
 *     responses:
 *       201:
 *         description: Ordonnance créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: "Ordonnance créée avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     ordonnance:
 *                       $ref: '#/components/schemas/PrescriptionModerne'
 *                     numero:
 *                       type: string
 *                       example: "ORD-2025-000001"
 *                     qrCode:
 *                       type: string
 *                       description: QR Code en format Data URL
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Patient ou dossier non trouvé
 */
router.post('/ordonnance', 
  authenticateToken, 
  ordonnanceValidationRules, 
  handleValidationErrors, 
  PrescriptionController.createOrdonnance
);

/**
 * @swagger
 * /prescription/demande-examen:
 *   post:
 *     summary: Créer une demande d'examen avec génération automatique
 *     tags: [Prescription]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patient_id
 *               - type_examen
 *             properties:
 *               patient_id:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID du patient
 *               dossier_id:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID du dossier médical (optionnel)
 *               type_examen:
 *                 type: string
 *                 enum: [Radiographie, Scanner, IRM, Échographie, Endoscopie, Prise de sang, Analyse d'urine, ECG, EEG, Spirométrie, Biopsie, Mammographie, Coloscopie, Gastroscopie, Test allergologique, Bilan cardiologique, Bilan neurologique, Autre]
 *                 description: Type d'examen demandé
 *               parametres:
 *                 type: string
 *                 maxLength: 500
 *                 description: Paramètres spécifiques de l'examen
 *               urgence:
 *                 type: string
 *                 enum: [urgent, semi-urgent, normal, programmé]
 *                 description: Niveau d'urgence
 *               instructions_speciales:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Instructions particulières
 *               date_souhaitee:
 *                 type: string
 *                 format: date-time
 *                 description: Date souhaitée pour l'examen
 *     responses:
 *       201:
 *         description: Demande d'examen créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: "Demande d'examen créée avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     demande:
 *                       $ref: '#/components/schemas/PrescriptionModerne'
 *                     numero:
 *                       type: string
 *                       example: "EXA-2025-000001"
 *                     qrCode:
 *                       type: string
 *                       description: QR Code en format Data URL
 */
router.post('/demande-examen', 
  authenticateToken, 
  demandeExamenValidationRules, 
  handleValidationErrors, 
  PrescriptionController.createDemandeExamen
);

/**
 * @swagger
 * /prescription/search:
 *   get:
 *     summary: Recherche avancée de prescriptions avec pagination
 *     tags: [Prescription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: patient_id
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Filtrer par patient
 *       - in: query
 *         name: professionnel_id
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Filtrer par professionnel
 *       - in: query
 *         name: type_prescription
 *         schema:
 *           type: string
 *           enum: [ordonnance, examen]
 *         description: Filtrer par type
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [active, suspendue, terminee, annulee, en_attente]
 *         description: Filtrer par statut
 *       - in: query
 *         name: search_term
 *         schema:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *         description: Recherche textuelle (numéro, principe actif, nom commercial)
 *       - in: query
 *         name: date_debut
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début de période
 *       - in: query
 *         name: date_fin
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin de période
 *     responses:
 *       200:
 *         description: Résultats de recherche
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     prescriptions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PrescriptionModerne'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         hasNext:
 *                           type: boolean
 *                         hasPrev:
 *                           type: boolean
 */
router.get('/search', 
  authenticateToken, 
  searchValidationRules, 
  handleValidationErrors, 
  PrescriptionController.searchPrescriptions
);

/**
 * @swagger
 * /prescription/patient/{patient_id}:
 *   get:
 *     summary: Récupérer les prescriptions d'un patient
 *     tags: [Prescription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patient_id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID du patient
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [active, suspendue, terminee, annulee, en_attente]
 *         description: Filtrer par statut
 *       - in: query
 *         name: type_prescription
 *         schema:
 *           type: string
 *           enum: [ordonnance, examen]
 *         description: Filtrer par type
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: Liste des prescriptions du patient
 */
router.get('/patient/:patient_id', 
  authenticateToken, 
  patientParamValidationRules, 
  handleValidationErrors, 
  PrescriptionController.getPrescriptionsByPatient
);

/**
 * @swagger
 * /prescription/patient/{patient_id}/actives:
 *   get:
 *     summary: Récupérer les prescriptions actives d'un patient
 *     tags: [Prescription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patient_id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID du patient
 *     responses:
 *       200:
 *         description: Prescriptions actives du patient
 */
router.get('/patient/:patient_id/actives', 
  authenticateToken, 
  paramValidationRules, 
  handleValidationErrors, 
  PrescriptionController.getPrescriptionsActives
);

/**
 * @swagger
 * /prescription/ordonnances-recentes:
 *   get:
 *     summary: Récupérer les prescriptions les plus récentes
 *     tags: [Prescription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Nombre de prescriptions à récupérer
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [tous, ordonnance, examen]
 *           default: tous
 *         description: Type de prescription à filtrer
 *       - in: query
 *         name: professionnel_id
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID du professionnel (optionnel, utilise le professionnel connecté par défaut)
 *       - in: query
 *         name: patient_id
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID du patient pour filtrer les prescriptions (optionnel)
 *     responses:
 *       200:
 *         description: Prescriptions récentes récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Prescriptions récentes récupérées avec succès
 *                 data:
 *                   type: object
 *                   properties:
 *                     prescriptions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PrescriptionModerne'
 *                     total:
 *                       type: integer
 *                       description: Nombre total de prescriptions correspondant aux critères
 *                     limit:
 *                       type: integer
 *                       description: Nombre de prescriptions retournées
 *                     type:
 *                       type: string
 *                       description: Type de prescription filtré
 *                     periode:
 *                       type: object
 *                       description: Période couverte par les prescriptions
 */
router.get('/ordonnances-recentes', 
  authenticateToken, 
  PrescriptionController.getOrdonnancesRecentes
);

/**
 * @swagger
 * /prescription/{id}:
 *   get:
 *     summary: Récupérer une prescription par son ID
 *     tags: [Prescription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID de la prescription
 *     responses:
 *       200:
 *         description: Détail de la prescription
 *       404:
 *         description: Prescription non trouvée
 */
router.get('/:id', 
  authenticateToken, 
  paramValidationRules, 
  handleValidationErrors, 
  PrescriptionController.getPrescriptionById
);

/**
 * @swagger
 * /prescription/update/{id}:
 *   put:
 *     summary: Mettre à jour une prescription
 *     tags: [Prescription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID de la prescription
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               principe_actif:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 255
 *               dosage:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               frequence:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               statut:
 *                 type: string
 *                 enum: [active, suspendue, terminee, annulee, en_attente]
 *               instructions_speciales:
 *                 type: string
 *                 maxLength: 1000
 *     responses:
 *       200:
 *         description: Prescription mise à jour
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Prescription non trouvée
 */
router.put('/update/:id', 
  authenticateToken, 
  paramValidationRules, 
  updateValidationRules, 
  handleValidationErrors, 
  PrescriptionController.updatePrescription
);

/**
 * @swagger
 * /prescription/delete/{id}:
 *   delete:
 *     summary: Supprimer une prescription (soft delete)
 *     tags: [Prescription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID de la prescription
 *     responses:
 *       200:
 *         description: Prescription supprimée
 *       400:
 *         description: Impossible de supprimer une prescription active
 *       404:
 *         description: Prescription non trouvée
 */
router.delete('/delete/:id', 
  authenticateToken, 
  paramValidationRules, 
  handleValidationErrors, 
  PrescriptionController.deletePrescription
);

/**
 * @swagger
 * /prescription/{id}/renouveler:
 *   patch:
 *     summary: Renouveler une prescription
 *     tags: [Prescription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID de la prescription
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motif_renouvellement:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 500
 *                 description: Motif du renouvellement
 *               nouvelle_duree:
 *                 type: string
 *                 pattern: "^(\\d+\\s*(jour|jours|semaine|semaines|mois|an|ans))$"
 *                 description: Nouvelle durée si différente
 *               nouveau_dosage:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: Nouveau dosage si modifié
 *     responses:
 *       200:
 *         description: Prescription renouvelée
 *       400:
 *         description: Prescription non renouvelable ou limite atteinte
 */
router.patch('/:id/renouveler', 
  authenticateToken, 
  paramValidationRules, 
  renouvellementValidationRules, 
  handleValidationErrors, 
  PrescriptionController.renouvelerPrescription
);

/**
 * @swagger
 * /prescription/{id}/suspendre:
 *   patch:
 *     summary: Suspendre une prescription
 *     tags: [Prescription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID de la prescription
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - motif_arret
 *             properties:
 *               motif_arret:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 500
 *                 description: Motif de l'arrêt
 *               date_arret:
 *                 type: string
 *                 format: date-time
 *                 description: Date d'arrêt (par défaut maintenant)
 *     responses:
 *       200:
 *         description: Prescription suspendue
 *       400:
 *         description: Seules les prescriptions actives peuvent être suspendues
 */
router.patch('/:id/suspendre', 
  authenticateToken, 
  paramValidationRules, 
  suspensionValidationRules, 
  handleValidationErrors, 
  PrescriptionController.suspendrePrescription
);

/**
 * @swagger
 * /prescription/{id}/transferer:
 *   post:
 *     summary: Transférer une prescription à un autre patient
 *     tags: [Prescription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID de la prescription
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patient_id
 *             properties:
 *               patient_id:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID du patient destinataire
 *               motif_transfert:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 500
 *                 description: Motif du transfert
 *     responses:
 *       200:
 *         description: Prescription transférée avec succès
 *       404:
 *         description: Prescription ou patient destinataire non trouvé
 */
router.post('/:id/transferer',
  authenticateToken,
  paramValidationRules,
  transfertValidationRules,
  handleValidationErrors,
  PrescriptionController.transfererPrescription
);

/**
 * @swagger
 * /prescription/{id}/rapport:
 *   get:
 *     summary: Générer un rapport de prescription pour impression
 *     tags: [Prescription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID de la prescription
 *     responses:
 *       200:
 *         description: Rapport généré avec succès
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
 *                     rapport:
 *                       type: object
 *                       description: Données formatées pour impression
 */
router.get('/:id/rapport', 
  authenticateToken, 
  paramValidationRules, 
  handleValidationErrors, 
  PrescriptionController.generateReport
);

/**
 * @swagger
 * /prescription/stats:
 *   get:
 *     summary: Calculer les statistiques de prescription
 *     tags: [Prescription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: professionnel_id
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID du professionnel (par défaut utilisateur connecté)
 *       - in: query
 *         name: date_debut
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début de période
 *       - in: query
 *         name: date_fin
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin de période
 *     responses:
 *       200:
 *         description: Statistiques calculées
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
 *                         total:
 *                           type: integer
 *                         par_type:
 *                           type: object
 *                           properties:
 *                             ordonnances:
 *                               type: integer
 *                             examens:
 *                               type: integer
 *                         par_statut:
 *                           type: object
 */
router.get('/stats', 
  authenticateToken, 
  statsValidationRules, 
  handleValidationErrors, 
  PrescriptionController.getStats
);

/**
 * @swagger
 * /prescription/validate/qr:
 *   post:
 *     summary: Valider un QR Code de prescription
 *     tags: [Prescription]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - qrData
 *             properties:
 *               qrData:
 *                 type: string
 *                 description: Données du QR Code à valider
 *     responses:
 *       200:
 *         description: QR Code valide
 *       400:
 *         description: QR Code invalide
 */
router.post('/validate/qr', 
  authenticateToken, 
  PrescriptionController.validateQRCode
);

/**
 * @swagger
 * /prescription/validate/signature:
 *   post:
 *     summary: Valider une signature électronique
 *     tags: [Prescription]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - signature
 *             properties:
 *               signature:
 *                 type: string
 *                 description: Signature électronique à valider (base64)
 *     responses:
 *       200:
 *         description: Signature valide
 *       400:
 *         description: Signature invalide
 */
router.post('/validate/signature', 
  authenticateToken, 
  PrescriptionController.validateSignature
);



/**
 * @swagger
 * /prescription/{prescription_id}/ajouter-dossier:
 *   post:
 *     summary: Ajouter une prescription au dossier médical du patient
 *     tags: [Prescription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: prescription_id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID de la prescription
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dossier_id
 *             properties:
 *               dossier_id:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID du dossier médical
 *     responses:
 *       200:
 *         description: Prescription ajoutée au dossier
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Prescription ou dossier non trouvé
 */
router.post('/:prescription_id/ajouter-dossier',
  authenticateToken,
  prescriptionParamValidationRules,
  handleValidationErrors,
  PrescriptionController.ajouterAuDossierPatient
);

/**
 * @swagger
 * /prescription/{prescription_id}/notification:
 *   post:
 *     summary: Créer une notification pour le patient
 *     tags: [Prescription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: prescription_id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID de la prescription
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [nouvelle_prescription, renouvellement, suspension, modification]
 *                 default: nouvelle_prescription
 *                 description: Type de notification
 *               priorite:
 *                 type: string
 *                 enum: [basse, normale, haute, urgente]
 *                 default: normale
 *                 description: Priorité de la notification
 *               canal:
 *                 type: string
 *                 enum: [application, email, sms, push]
 *                 default: application
 *                 description: Canal de notification
 *     responses:
 *       201:
 *         description: Notification créée avec succès
 */
router.post('/:prescription_id/notification',
  authenticateToken,
  prescriptionParamValidationRules,
  handleValidationErrors,
  PrescriptionController.creerNotification
);

/**
 * @swagger
 * /prescription/notification/{notification_id}/lue:
 *   patch:
 *     summary: Marquer une notification comme lue
 *     tags: [Prescription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notification_id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID de la notification
 *     responses:
 *       200:
 *         description: Notification marquée comme lue
 */
router.patch('/notification/:notification_id/lue',
  authenticateToken,
  PrescriptionController.marquerNotificationLue
);

/**
 * @swagger
 * /prescription/patient/{patient_id}/notifications:
 *   get:
 *     summary: Récupérer les notifications d'un patient
 *     tags: [Prescription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patient_id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID du patient
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [non_lue, lue, toutes]
 *           default: toutes
 *         description: Filtrer par statut
 *     responses:
 *       200:
 *         description: Notifications récupérées
 */
router.get('/patient/:patient_id/notifications',
  authenticateToken,
  patientParamValidationRules,
  handleValidationErrors,
  PrescriptionController.getNotificationsPatient
);

/**
 * @swagger
 * /prescription/ordonnance-complete:
 *   post:
 *     summary: Créer une ordonnance complète avec notification et ajout au dossier
 *     tags: [Prescription]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/OrdonnanceRequest'
 *               - type: object
 *                 properties:
 *                   dossier_id:
 *                     type: integer
 *                     minimum: 1
 *                     description: ID du dossier médical (optionnel)
 *                   priorite:
 *                     type: string
 *                     enum: [basse, normale, haute, urgente]
 *                     default: normale
 *                     description: Priorité de la notification
 *                   canal:
 *                     type: string
 *                     enum: [application, email, sms, push]
 *                     default: application
 *                     description: Canal de notification
 *     responses:
 *       201:
 *         description: Ordonnance créée avec notification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     ordonnance:
 *                       $ref: '#/components/schemas/PrescriptionModerne'
 *                     notification:
 *                       type: object
 *                     numero:
 *                       type: string
 *                     qrCode:
 *                       type: string
 */
router.post('/ordonnance-complete',
  authenticateToken,
  ordonnanceValidationRules,
  handleValidationErrors,
  PrescriptionController.createOrdonnanceComplete
);

/**
 * @swagger
 * /prescription/resume-aujourdhui:
 *   get:
 *     summary: Récupérer le résumé des ordonnances créées aujourd'hui
 *     tags: [Prescription]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Résumé des ordonnances d'aujourd'hui
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
 *                     total_aujourdhui:
 *                       type: integer
 *                     par_type:
 *                       type: object
 *                       properties:
 *                         ordonnances:
 *                           type: integer
 *                         examens:
 *                           type: integer
 *                     derniere_ordonnance:
 *                       $ref: '#/components/schemas/PrescriptionModerne'
 *                     periode:
 *                       type: object
 */
router.get('/resume-aujourdhui',
  authenticateToken,
  PrescriptionController.getResumeOrdonnancesAujourdhui
);

module.exports = router;