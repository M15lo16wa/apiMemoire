// src/modules/dossierMedical/dossierMedical.route.js

const express = require('express');
const router = express.Router();
const dossierMedicalController = require('./dossierMedical.controller');
const { body, param, query } = require('express-validator');
const authMiddleware = require('../../middlewares/auth.middleware');

// Validation pour la création et la mise à jour d'un dossier
const dossierValidationRules = [
    body('patient_id').isInt().withMessage('L\'ID du patient doit être un entier valide.'),
    body('numeroDossier').isString().notEmpty().withMessage('Le numéro de dossier est requis.'),
    body('dateCreation').isISO8601().toDate().withMessage('La date de création doit être une date valide (YYYY-MM-DD).'),
    body('statut').isIn(['Ouvert', 'Fermé', 'Archivé']).withMessage('Le statut est invalide.'),
    body('type_dossier').isIn(['principal', 'specialite', 'urgence', 'suivi', 'consultation', 'autre']).withMessage('Le type de dossier est invalide.'),
    body('medecin_referent_id').optional().isInt().withMessage('L\'ID du médecin référent doit être un entier valide si fourni.'),
    body('service_id').optional().isInt().withMessage('L\'ID du service doit être un entier valide si fourni.'),
    body('createdBy').optional().isInt().withMessage('L\'ID du créateur doit être un entier valide si fourni.'),
    body('updatedBy').optional().isInt().withMessage('L\'ID du modificateur doit être un entier valide si fourni.'),
  // Vous pouvez ajouter des validations pour d'autres champs comme resume, antecedent_medicaux, etc.
  // Par exemple: body('resume').optional().isString().trim().escape(),
];

/**
 * @swagger
 * /dossierMedical:
 *   get:
 *     summary: Récupérer tous les dossiers médicaux
 *     tags: [DossierMedical]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: integer
 *         description: Filtrer par ID du patient
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [Ouvert, Fermé, Archivé, actif, ferme, archive, fusionne]
 *         description: Filtrer par statut du dossier
 *       - in: query
 *         name: includes
 *         schema:
 *           type: string
 *         description: "Inclure des relations (ex: patient,medecinReferent,serviceResponsable)"
 *     responses:
 *       200:
 *         description: Liste des dossiers médicaux
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DossierMedical'
 *       401:
 *         description: Non authentifié (token manquant ou invalide)
 *       403:
 *         description: Accès refusé (rôle requis)
 *   post:
 *     summary: Créer un nouveau dossier médical
 *     tags: [DossierMedical]
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
 *               - numeroDossier
 *               - dateCreation
 *               - statut
 *               - type_dossier
 *             properties:
 *               patient_id:
 *                 type: integer
 *                 description: ID du patient propriétaire du dossier
 *                 example: 1
 *               numeroDossier:
 *                 type: string
 *                 description: Numéro unique du dossier
 *                 example: "DM-2024-001"
 *               dateCreation:
 *                 type: string
 *                 format: date
 *                 description: Date de création du dossier
 *                 example: "2024-01-15"
 *               statut:
 *                 type: string
 *                 enum: [Ouvert, Fermé, Archivé]
 *                 description: Statut du dossier
 *                 example: "Ouvert"
 *               type_dossier:
 *                 type: string
 *                 enum: [principal, specialite, urgence, suivi, consultation, autre]
 *                 description: Type de dossier médical
 *                 example: "principal"
 *               service_id:
 *                 type: integer
 *                 description: ID du service de santé responsable
 *                 example: 1
 *               medecin_referent_id:
 *                 type: integer
 *                 description: ID du médecin référent principal
 *                 example: 1
 *               resume:
 *                 type: string
 *                 description: Résumé clinique du patient
 *                 example: "Patient de 45 ans présentant une hypertension artérielle"
 *               antecedent_medicaux:
 *                 type: object
 *                 description: Antécédents médicaux structurés
 *                 example: {"pathologies": ["HTA", "Diabète"], "chirurgies": ["Appendicectomie 2010"]}
 *               allergies:
 *                 type: object
 *                 description: Allergies et intolérances
 *                 example: {"medicaments": ["Pénicilline"], "autres": ["Latex"]}
 *               traitements_chroniques:
 *                 type: object
 *                 description: Traitements au long cours
 *                 example: {"medicaments": [{"nom": "Amlodipine", "posologie": "5mg/jour"}]}
 *               parametres_vitaux:
 *                 type: object
 *                 description: Derniers paramètres vitaux
 *                 example: {"tension": "140/90", "poids": "75kg", "taille": "170cm"}
 *               habitudes_vie:
 *                 type: object
 *                 description: Informations sur le mode de vie
 *                 example: {"tabac": "Non", "alcool": "Occasionnel", "sport": "Régulier"}
 *               historique_familial:
 *                 type: string
 *                 description: Antécédents familiaux notables
 *                 example: "Père décédé d'un infarctus à 60 ans"
 *               directives_anticipées:
 *                 type: string
 *                 description: Directives anticipées et personnes de confiance
 *                 example: "Personne de confiance: Marie Martin (épouse)"
 *               observations:
 *                 type: string
 *                 description: Notes et observations diverses
 *                 example: "Patient très observant de son traitement"
 *               createdBy:
 *                 type: integer
 *                 description: ID de l'utilisateur créant le dossier
 *                 example: 1
 *     responses:
 *       201:
 *         description: Dossier médical créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Dossier médical créé avec succès."
 *                 dossier:
 *                   $ref: '#/components/schemas/DossierMedical'
 *       400:
 *         description: Erreur de validation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 *       401:
 *         description: Non authentifié (token manquant ou invalide)
 *       403:
 *         description: Accès refusé (rôle admin ou professionnel requis)
 */
// GET /api/dossiers - Récupérer tous les dossiers médicaux
router.get(
    '/',
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'secretaire', 'medecin', 'infirmier'),
    query('patientId').optional().isInt().withMessage('L\'ID du patient doit être un entier valide.'),
    query('statut').optional().isIn(['Ouvert', 'Fermé', 'Archivé', 'actif', 'ferme', 'archive', 'fusionne']).withMessage('Statut de dossier invalide.'),
    query('includes').optional().isString().withMessage('Includes doit être une chaîne de caractères (ex: patient,medecinReferent).'),
    dossierMedicalController.getAllDossiers
);

/**
 * @swagger
 * /dossierMedical/{id}:
 *   get:
 *     summary: Récupérer un dossier médical par ID
 *     tags: [DossierMedical]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du dossier médical
 *       - in: query
 *         name: includes
 *         schema:
 *           type: string
 *         description: "Inclure des relations (ex: patient,medecinReferent,serviceResponsable)"
 *     responses:
 *       200:
 *         description: Détails du dossier médical
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DossierMedical'
 *       401:
 *         description: Non authentifié (token manquant ou invalide)
 *       403:
 *         description: Accès refusé (rôle requis)
 *       404:
 *         description: Dossier médical non trouvé
 */
// GET /api/dossiers/:id - Récupérer un dossier médical par ID
router.get(
    '/:id',
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'secretaire', 'medecin', 'infirmier'),
    param('id').isInt().withMessage('L\'ID du dossier doit être un entier valide.'),
    query('includes').optional().isString().withMessage('Includes doit être une chaîne de caractères.'),
    dossierMedicalController.getDossierById
);

// POST /api/dossiers - Créer un nouveau dossier médical
router.post(
    '/',
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'medecin'),
    dossierValidationRules,
    dossierMedicalController.createDossier
);

/**
 * @swagger
 * /dossierMedical/{id}:
 *   put:
 *     summary: Mettre à jour un dossier médical
 *     tags: [DossierMedical]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du dossier médical
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               numeroDossier:
 *                 type: string
 *                 example: "DM-2024-001"
 *               statut:
 *                 type: string
 *                 enum: [Ouvert, Fermé, Archivé]
 *                 example: "Ouvert"
 *               type_dossier:
 *                 type: string
 *                 enum: [principal, specialite, urgence, suivi, consultation, autre]
 *                 example: "principal"
 *               resume:
 *                 type: string
 *                 example: "Mise à jour du résumé clinique"
 *               antecedent_medicaux:
 *                 type: object
 *                 example: {"pathologies": ["HTA", "Diabète"], "chirurgies": ["Appendicectomie 2010"]}
 *               allergies:
 *                 type: object
 *                 example: {"medicaments": ["Pénicilline"], "autres": ["Latex"]}
 *               traitements_chroniques:
 *                 type: object
 *                 example: {"medicaments": [{"nom": "Amlodipine", "posologie": "5mg/jour"}]}
 *               parametres_vitaux:
 *                 type: object
 *                 example: {"tension": "140/90", "poids": "75kg", "taille": "170cm"}
 *               habitudes_vie:
 *                 type: object
 *                 example: {"tabac": "Non", "alcool": "Occasionnel", "sport": "Régulier"}
 *               historique_familial:
 *                 type: string
 *                 example: "Père décédé d'un infarctus à 60 ans"
 *               directives_anticipées:
 *                 type: string
 *                 example: "Personne de confiance: Marie Martin (épouse)"
 *               observations:
 *                 type: string
 *                 example: "Patient très observant de son traitement"
 *               updatedBy:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Dossier médical mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Dossier médical mis à jour avec succès."
 *                 dossier:
 *                   $ref: '#/components/schemas/DossierMedical'
 *       400:
 *         description: Erreur de validation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 *       401:
 *         description: Non authentifié (token manquant ou invalide)
 *       403:
 *         description: Accès refusé (rôle admin ou professionnel requis)
 *       404:
 *         description: Dossier médical non trouvé
 */
// PUT /api/dossiers/:id - Mettre à jour un dossier médical
router.put(
    '/:id',
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'medecin'),
    param('id').isInt().withMessage('L\'ID du dossier doit être un entier valide.'),
  dossierValidationRules, // Réutiliser les mêmes règles de validation pour la mise à jour
    dossierMedicalController.updateDossier
);

/**
 * @swagger
 * /dossierMedical/{id}:
 *   delete:
 *     summary: Supprimer un dossier médical (soft delete)
 *     tags: [DossierMedical]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du dossier médical
 *     responses:
 *       200:
 *         description: Dossier médical supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Dossier médical supprimé avec succès."
 *       401:
 *         description: Non authentifié (token manquant ou invalide)
 *       403:
 *         description: Accès refusé (rôle admin requis)
 *       404:
 *         description: Dossier médical non trouvé
 */
// DELETE /api/dossiers/:id - Supprimer un dossier médical (soft delete)
router.delete(
    '/:id',
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    param('id').isInt().withMessage('L\'ID du dossier doit être un entier valide.'),
    dossierMedicalController.deleteDossier
);

module.exports = router;