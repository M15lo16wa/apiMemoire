// src/modules/dossierMedical/documentPersonnel.route.js

const express = require('express');
const router = express.Router();
const documentPersonnelController = require('./documentPersonnel.controller');
const { protect } = require('../../middlewares/auth.middleware');
const { checkMedicalRecordAccess } = require('../../middlewares/access.middleware');
const multer = require('multer');

// Configuration multer pour gérer les uploads
const storage = multer.memoryStorage(); // Stockage en mémoire pour conversion base64
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 1
    },
    fileFilter: (req, file, cb) => {
        // Types de fichiers autorisés
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Type de fichier non autorisé. Types acceptés: PDF, JPG, PNG, GIF, DOC, DOCX, TXT'), false);
        }
    }
});

/**
 * @swagger
 * tags:
 *   name: Documents Personnels
 *   description: Gestion des documents personnels des patients (ordonnances, résultats, certificats, etc.)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     DocumentPersonnel:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID unique du document
 *         patient_id:
 *           type: integer
 *           description: ID du patient propriétaire du document
 *         nom:
 *           type: string
 *           description: Nom du document
 *           example: "Ordonnance cardiologie"
 *         type:
 *           type: string
 *           enum: [ordonnance, resultat, certificat, general, autre]
 *           description: Type de document
 *         description:
 *           type: string
 *           description: Description optionnelle du document
 *         url:
 *           type: string
 *           description: URL du fichier (optionnel, stockage en base64)
 *         taille:
 *           type: integer
 *           description: Taille du fichier en bytes
 *         format:
 *           type: string
 *           description: Format du fichier (pdf, jpg, doc, etc.)
 *         contenu:
 *           type: string
 *           description: Contenu du fichier encodé en base64
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création du document
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière modification
 *       required:
 *         - patient_id
 *         - nom
 *         - type
 *         - contenu
 *     
 *     DocumentUpload:
 *       type: object
 *       properties:
 *         file:
 *           type: string
 *           format: binary
 *           description: Fichier à uploader (objet File)
 *         title:
 *           type: string
 *           description: Titre du document
 *         description:
 *           type: string
 *           description: Description du document
 *         type:
 *           type: string
 *           enum: [ordonnance, resultat, certificat, general, autre]
 *           description: Type de document
 *         categorie:
 *           type: string
 *           description: Catégorie du document (optionnel)
 *       required:
 *         - file
 *         - title
 *         - type
 *       note: "L'ID du patient est automatiquement récupéré depuis le token d'authentification JWT"
 *     
 *     DocumentStats:
 *       type: object
 *       properties:
 *         total_documents:
 *           type: integer
 *           description: Nombre total de documents
 *         par_type:
 *           type: object
 *           description: Répartition par type de document
 *           properties:
 *             ordonnance:
 *               type: integer
 *             resultat:
 *               type: integer
 *             certificat:
 *               type: integer
 *             general:
 *               type: integer
 *             autre:
 *               type: integer
 *         taille_totale:
 *           type: integer
 *           description: Taille totale des documents en bytes
 *     
 *     DocumentSearch:
 *       type: object
 *       properties:
 *         patient_id:
 *           type: integer
 *           description: ID du patient (optionnel)
 *         nom:
 *           type: string
 *           description: Nom du document (recherche partielle)
 *         type:
 *           type: string
 *           enum: [ordonnance, resultat, certificat, general, autre]
 *           description: Type de document
 *         description:
 *           type: string
 *           description: Description (recherche partielle)
 *         date_debut:
 *           type: string
 *           format: date
 *           description: Date de début de création
 *         date_fin:
 *           type: string
 *           format: date
 *           description: Date de fin de création
 *     
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           description: Message d'erreur
 *     
 *     Success:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           description: Message de succès
 *         data:
 *           type: object
 *           description: Données retournées
 */

/**
 * Routes pour la gestion des documents personnels
 * 
 * Ces routes permettent aux patients, médecins et infirmiers de :
 * - Uploader des documents
 * - Consulter les documents
 * - Télécharger des documents
 * - Mettre à jour les métadonnées
 * - Supprimer des documents
 * - Rechercher des documents
 */

// Note: L'authentification est appliquée individuellement sur chaque route

/**
 * @swagger
 * /api/documents/upload:
 *   post:
 *     summary: Upload d'un document personnel
 *     description: Permet d'uploader un document (ordonnance, résultat, certificat, etc.) pour un patient
 *     tags: [Documents Personnels]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/DocumentUpload'
 *     responses:
 *       201:
 *         description: Document uploadé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/DocumentPersonnel'
 *       400:
 *         description: Données invalides ou fichier manquant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé au dossier du patient
 *       500:
 *         description: Erreur serveur
 */

// Routes accessibles aux professionnels de santé et patients
router.post('/upload',
    protect, // Authentification AVANT multer
    upload.single('file'), // Multer parse le fichier et l'attache à req.file
    (req, res, next) => {
        // Vérifier qu'un fichier a été uploadé
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Aucun fichier fourni dans le champ "file"'
            });
        }
        
        // Validation des types de fichiers déjà faite par multer
        // Validation des champs requis faite par le contrôleur
        // Pas de validation redondante ici
        
        console.log('📋 [multer] Champs reçus:', req.body);
        console.log('📁 [multer] Fichier reçu:', {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            buffer: req.file.buffer ? 'Buffer présent' : 'Buffer absent'
        });
        
        next(); // Continuer vers le contrôleur
    },
    checkMedicalRecordAccess, // Vérifie que l'utilisateur a accès au dossier du patient
    documentPersonnelController.uploadDocument
);

/**
 * @swagger
 * /api/documents/patient:
 *   get:
 *     summary: Récupérer les documents du patient connecté
 *     description: Récupère tous les documents personnels du patient connecté (ID récupéré automatiquement depuis le token JWT)
 *     tags: [Documents Personnels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [ordonnance, resultat, certificat, general, autre]
 *         description: Filtrer par type de document
 *       - in: query
 *         name: date_debut
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début pour filtrer les documents
 *       - in: query
 *         name: date_fin
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin pour filtrer les documents
 *     responses:
 *       200:
 *         description: Liste des documents récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DocumentPersonnel'
 *                     count:
 *                       type: integer
 *                       description: Nombre total de documents
 *       400:
 *         description: Paramètres invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé au dossier du patient
 *       500:
 *         description: Erreur serveur
 */
router.get('/patient', 
    protect, // Authentification requise
    checkMedicalRecordAccess, // Vérifie que l'utilisateur a accès au dossier du patient
    documentPersonnelController.getDocumentsByPatient
);

/**
 * @swagger
 * /api/documents/{documentId}:
 *   get:
 *     summary: Récupérer un document par ID
 *     description: Récupère les informations d'un document personnel spécifique
 *     tags: [Documents Personnels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du document
 *     responses:
 *       200:
 *         description: Document récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/DocumentPersonnel'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé au document
 *       404:
 *         description: Document non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:documentId', 
    protect, // Authentification requise
    checkMedicalRecordAccess, // Vérifie que l'utilisateur a accès au document
    documentPersonnelController.getDocumentById
);

/**
 * @swagger
 * /api/documents/{documentId}/download:
 *   get:
 *     summary: Télécharger un document
 *     description: Télécharge le contenu d'un document personnel (fichier)
 *     tags: [Documents Personnels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du document à télécharger
 *     responses:
 *       200:
 *         description: Fichier téléchargé avec succès
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Disposition:
 *             description: Nom du fichier
 *             schema:
 *               type: string
 *           Content-Type:
 *             description: Type MIME du fichier
 *             schema:
 *               type: string
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé au document
 *       404:
 *         description: Document non trouvé ou contenu manquant
 *       500:
 *         description: Erreur serveur
 */
router.get('/:documentId/download', 
    protect, // Authentification requise
    checkMedicalRecordAccess, // Vérifie que l'utilisateur a accès au document
    documentPersonnelController.downloadDocument
);

/**
 * @swagger
 * /api/documents/{documentId}:
 *   put:
 *     summary: Mettre à jour un document
 *     description: Met à jour les métadonnées d'un document personnel (nom, type, description)
 *     tags: [Documents Personnels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du document à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nouveau nom du document
 *               type:
 *                 type: string
 *                 enum: [ordonnance, resultat, certificat, general, autre]
 *                 description: Nouveau type de document
 *               description:
 *                 type: string
 *                 description: Nouvelle description du document
 *     responses:
 *       200:
 *         description: Document mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/DocumentPersonnel'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé au document
 *       404:
 *         description: Document non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/:documentId', 
    protect, // Authentification requise
    checkMedicalRecordAccess, // Vérifie que l'utilisateur a accès au document
    documentPersonnelController.updateDocument
);

/**
 * @swagger
 * /api/documents/{documentId}:
 *   delete:
 *     summary: Supprimer un document
 *     description: Supprime définitivement un document personnel et son contenu
 *     tags: [Documents Personnels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du document à supprimer
 *     responses:
 *       200:
 *         description: Document supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé au document
 *       404:
 *         description: Document non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:documentId', 
    protect, // Authentification requise
    checkMedicalRecordAccess, // Vérifie que l'utilisateur a accès au document
    documentPersonnelController.deleteDocument
);

/**
 * @swagger
 * /api/documents/patient/stats:
 *   get:
 *     summary: Statistiques des documents du patient connecté
 *     description: Récupère les statistiques des documents personnels du patient connecté (ID récupéré automatiquement depuis le token JWT)
 *     tags: [Documents Personnels]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/DocumentStats'
 *       400:
 *         description: Paramètres invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé au dossier du patient
 *       500:
 *         description: Erreur serveur
 */
router.get('/patient/stats', 
    protect, // Authentification requise
    checkMedicalRecordAccess, // Vérifie que l'utilisateur a accès au dossier du patient
    documentPersonnelController.getDocumentStats
);

/**
 * @swagger
 * /api/documents/search:
 *   post:
 *     summary: Rechercher des documents
 *     description: Recherche des documents personnels selon différents critères
 *     tags: [Documents Personnels]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DocumentSearch'
 *     responses:
 *       200:
 *         description: Recherche effectuée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DocumentPersonnel'
 *                     count:
 *                       type: integer
 *                       description: Nombre de documents trouvés
 *       400:
 *         description: Critères de recherche invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé aux dossiers recherchés
 *       500:
 *         description: Erreur serveur
 */
router.post('/search', 
    protect, // Authentification requise
    checkMedicalRecordAccess, // Vérifie que l'utilisateur a accès aux dossiers recherchés
    documentPersonnelController.searchDocuments
);

module.exports = router;
