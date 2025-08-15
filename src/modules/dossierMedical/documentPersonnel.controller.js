// src/modules/dossierMedical/documentPersonnel.controller.js

const dossierMedicalService = require('./dossierMedical.service');
const path = require('path');

const documentPersonnelController = {

    /**
     * Upload d'un nouveau document personnel
     * POST /api/documents/upload
     */
    async uploadDocument(req, res) {
        try {
            console.log('🔍 [uploadDocument] ===== DIAGNOSTIC COMPLET =====');
            console.log('📋 [uploadDocument] Headers reçus:', req.headers);
            console.log('📦 [uploadDocument] Body complet reçu:', JSON.stringify(req.body, null, 2));
            console.log('📁 [uploadDocument] Fichier reçu:', req.file ? {
                fieldname: req.file.fieldname,
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                buffer: req.file.buffer ? 'Buffer présent' : 'Buffer absent'
            } : 'AUCUN FICHIER');
            console.log('🔍 [uploadDocument] ===== FIN DIAGNOSTIC =====');

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Aucun fichier fourni dans le champ "file".'
                });
            }

            // Récupérer les données du body (maintenant parsé par multer)
            const { 
                title,
                description,
                type,
                categorie
            } = req.body;

            // Récupérer l'ID du patient depuis le token JWT (req.user est défini par le middleware protect)
            const patientId = req.user.patient_id || req.user.id;
            
            if (!patientId) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Impossible de récupérer l\'ID du patient depuis le token d\'authentification.' 
                });
            }

            if (!title) {
                return res.status(400).json({ success: false, message: 'Titre du document requis (title).' });
            }
            if (!type) {
                return res.status(400).json({ success: false, message: 'Type de document requis (type).' });
            }

            // Validation du type de document
            const allowedTypes = ['ordonnance', 'resultat', 'certificat', 'general', 'autre'];
            if (!allowedTypes.includes(type)) {
                return res.status(400).json({
                    success: false,
                    message: `Type de document non autorisé. Types acceptés: ${allowedTypes.join(', ')}`
                });
            }

            // Utiliser le buffer de multer (déjà en mémoire)
            if (!req.file.buffer) {
                console.error('❌ [uploadDocument] Pas de buffer dans req.file:', req.file);
                return res.status(400).json({
                    success: false,
                    message: 'Erreur: contenu du fichier non trouvé'
                });
            }
            
            // Convertir le buffer en base64
            const base64Content = req.file.buffer.toString('base64');
            
            const documentData = {
                patient_id: parseInt(patientId),
                nom: title || req.file.originalname,
                type: type || 'general',
                description: description || null,
                url: null,
                taille: req.file.size,
                format: path.extname(req.file.originalname).substring(1),
                contenu: base64Content
            };
            console.log('📝 [uploadDocument] Données du document préparées:', documentData);

            const nouveauDocument = await dossierMedicalService.documentPersonnel.uploadDocument(documentData);

            console.log('✅ [uploadDocument] Document créé avec succès:', nouveauDocument.id);

            res.status(201).json({
                success: true,
                message: 'Document uploadé avec succès',
                data: nouveauDocument
            });

        } catch (error) {
            console.error('❌ [uploadDocument] Erreur:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Erreur lors de l\'upload du document'
            });
        }
    },

    /**
     * Récupérer tous les documents du patient connecté
     * GET /api/documents/patient
     */
    async getDocumentsByPatient(req, res) {
        try {
            // Récupérer l'ID du patient depuis le token JWT
            const patientId = req.user.patient_id || req.user.id;
            
            if (!patientId) {
                return res.status(400).json({
                    success: false,
                    message: 'Impossible de récupérer l\'ID du patient depuis le token d\'authentification.'
                });
            }

            const { type, date_debut, date_fin } = req.query;

            const filters = {};
            if (type) filters.type = type;
            if (date_debut && date_fin) {
                filters.date_debut = new Date(date_debut);
                filters.date_fin = new Date(date_fin);
            }

            const documents = await dossierMedicalService.documentPersonnel.getDocumentsByPatient(
                parseInt(patientId),
                filters
            );

            res.json({
                success: true,
                data: documents,
                count: documents.length
            });
        } catch (error) {
            console.error('❌ [getDocumentsByPatient] Erreur:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Erreur lors de la récupération des documents'
            });
        }
    },

    /**
     * Récupérer un document par son ID
     * GET /api/documents/:documentId
     */
    async getDocumentById(req, res) {
        try {
            const { documentId } = req.params;
            const document = await dossierMedicalService.documentPersonnel.getDocumentById(parseInt(documentId));

            if (!document) {
                return res.status(404).json({
                    success: false,
                    message: 'Document non trouvé'
                });
            }

            res.json({
                success: true,
                data: document
            });
        } catch (error) {
            console.error('❌ [getDocumentById] Erreur:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Erreur lors de la récupération du document'
            });
        }
    },

    /**
     * Télécharger un document
     * GET /api/documents/:documentId/download
     */
    async downloadDocument(req, res) {
        try {
            const { documentId } = req.params;
            const document = await dossierMedicalService.documentPersonnel.getDocumentById(parseInt(documentId));

            if (!document) {
                return res.status(404).json({
                    success: false,
                    message: 'Document non trouvé'
                });
            }

            // Vérifier que le contenu existe
            if (!document.contenu) {
                return res.status(404).json({
                    success: false,
                    message: 'Contenu du document non trouvé'
                });
            }

            // Convertir le contenu base64 en buffer
            const fileBuffer = Buffer.from(document.contenu, 'base64');
            
            // Définir le type MIME approprié
            const mimeTypes = {
                'pdf': 'application/pdf',
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'png': 'image/png',
                'gif': 'image/gif',
                'doc': 'application/msword',
                'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'txt': 'text/plain'
            };
            
            const mimeType = mimeTypes[document.format] || 'application/octet-stream';
            
            // Envoyer le fichier
            res.set({
                'Content-Type': mimeType,
                'Content-Disposition': `attachment; filename="${document.nom}.${document.format}"`,
                'Content-Length': fileBuffer.length
            });
            
            res.send(fileBuffer);
        } catch (error) {
            console.error('❌ [downloadDocument] Erreur:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Erreur lors du téléchargement du document'
            });
        }
    },

    /**
     * Mettre à jour un document
     * PUT /api/documents/:documentId
     */
    async updateDocument(req, res) {
        try {
            const { documentId } = req.params;
            const updateData = req.body;

            // Validation des données
            if (updateData.type) {
                const typesValides = ['ordonnance', 'resultat', 'certificat', 'general', 'autre'];
                if (!typesValides.includes(updateData.type)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Type de document invalide. Types autorisés: ' + typesValides.join(', ')
                    });
                }
            }

            const document = await dossierMedicalService.documentPersonnel.updateDocument(
                parseInt(documentId),
                updateData
            );

            if (!document) {
                return res.status(404).json({
                    success: false,
                    message: 'Document non trouvé'
                });
            }

            res.json({
                success: true,
                message: 'Document mis à jour avec succès',
                data: document
            });
        } catch (error) {
            console.error('❌ [updateDocument] Erreur:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Erreur lors de la mise à jour du document'
            });
        }
    },

    /**
     * Supprimer un document
     * DELETE /api/documents/:documentId
     */
    async deleteDocument(req, res) {
        try {
            const { documentId } = req.params;

            const success = await dossierMedicalService.documentPersonnel.deleteDocument(
                parseInt(documentId)
            );

            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: 'Document non trouvé'
                });
            }

            res.json({
                success: true,
                message: 'Document supprimé avec succès'
            });
        } catch (error) {
            console.error('❌ [deleteDocument] Erreur:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Erreur lors de la suppression du document'
            });
        }
    },

    /**
     * Récupérer les statistiques des documents du patient connecté
     * GET /api/documents/patient/stats
     */
    async getDocumentStats(req, res) {
        try {
            // Récupérer l'ID du patient depuis le token JWT
            const patientId = req.user.patient_id || req.user.id;
            
            if (!patientId) {
                return res.status(400).json({
                    success: false,
                    message: 'Impossible de récupérer l\'ID du patient depuis le token d\'authentification.'
                });
            }

            const stats = await dossierMedicalService.documentPersonnel.getDocumentStats(parseInt(patientId));

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('❌ [getDocumentStats] Erreur:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Erreur lors de la récupération des statistiques'
            });
        }
    },

    /**
     * Rechercher des documents par critères
     * POST /api/documents/search
     */
    async searchDocuments(req, res) {
        try {
            const searchCriteria = req.body;
            const documents = await dossierMedicalService.documentPersonnel.searchDocuments(searchCriteria);

            res.json({
                success: true,
                data: documents,
                count: documents.length
            });
        } catch (error) {
            console.error('❌ [searchDocuments] Erreur:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Erreur lors de la recherche de documents'
            });
        }
    }
};

module.exports = documentPersonnelController;
