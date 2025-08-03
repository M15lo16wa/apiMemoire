const AdminDMPService = require('./adminDMP.service');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');

/**
 * Contrôleur d'administration pour les fonctionnalités DMP
 * Accès réservé aux administrateurs
 */
class AdminDMPController {

  /**
   * Récupère la liste des patients avec leurs données DMP
   */
  static getPatientsList = catchAsync(async (req, res) => {
    const { limit = 20, offset = 0 } = req.query;
    
    const patients = await AdminDMPService.getPatientsList(limit, offset);
    
    res.status(200).json({
      status: 'success',
      data: {
        patients: patients.rows,
        total: patients.count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  });

  /**
   * Récupère les données DMP d'un patient spécifique
   */
  static getPatientDMPData = catchAsync(async (req, res) => {
    const { patientId } = req.params;
    
    const patientData = await AdminDMPService.getPatientDMPData(patientId);
    
    if (!patientData) {
      throw new AppError('Patient non trouvé', 404);
    }
    
    res.status(200).json({
      status: 'success',
      data: patientData
    });
  });

  /**
   * Récupère toutes les auto-mesures de tous les patients
   */
  static getAllAutoMesures = catchAsync(async (req, res) => {
    const { patientId, type_mesure, date_debut, date_fin, limit = 50, offset = 0 } = req.query;
    
    const autoMesures = await AdminDMPService.getAllAutoMesures({
      patientId,
      type_mesure,
      date_debut,
      date_fin,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        auto_mesures: autoMesures.rows,
        total: autoMesures.count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  });

  /**
   * Supprime une auto-mesure (admin uniquement)
   */
  static deleteAutoMesure = catchAsync(async (req, res) => {
    const { id } = req.params;
    
    const result = await AdminDMPService.deleteAutoMesure(id);
    
    if (!result) {
      throw new AppError('Auto-mesure non trouvée', 404);
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Auto-mesure supprimée avec succès'
    });
  });

  /**
   * Récupère tous les documents personnels de tous les patients
   */
  static getAllDocuments = catchAsync(async (req, res) => {
    const { patientId, type, limit = 50, offset = 0 } = req.query;
    
    const documents = await AdminDMPService.getAllDocuments({
      patientId,
      type,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        documents: documents.rows,
        total: documents.count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  });

  /**
   * Supprime un document personnel (admin uniquement)
   */
  static deleteDocument = catchAsync(async (req, res) => {
    const { id } = req.params;
    
    const result = await AdminDMPService.deleteDocument(id);
    
    if (!result) {
      throw new AppError('Document non trouvé', 404);
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Document supprimé avec succès'
    });
  });

  /**
   * Récupère tous les messages de tous les patients
   */
  static getAllMessages = catchAsync(async (req, res) => {
    const { patientId, professionnelId, lu, limit = 50, offset = 0 } = req.query;
    
    const messages = await AdminDMPService.getAllMessages({
      patientId,
      professionnelId,
      lu,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        messages: messages.rows,
        total: messages.count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  });

  /**
   * Supprime un message (admin uniquement)
   */
  static deleteMessage = catchAsync(async (req, res) => {
    const { id } = req.params;
    
    const result = await AdminDMPService.deleteMessage(id);
    
    if (!result) {
      throw new AppError('Message non trouvé', 404);
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Message supprimé avec succès'
    });
  });

  /**
   * Récupère tous les rappels de tous les patients
   */
  static getAllRappels = catchAsync(async (req, res) => {
    const { patientId, type, actif, limit = 50, offset = 0 } = req.query;
    
    const rappels = await AdminDMPService.getAllRappels({
      patientId,
      type,
      actif,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        rappels: rappels.rows,
        total: rappels.count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  });

  /**
   * Supprime un rappel (admin uniquement)
   */
  static deleteRappel = catchAsync(async (req, res) => {
    const { id } = req.params;
    
    const result = await AdminDMPService.deleteRappel(id);
    
    if (!result) {
      throw new AppError('Rappel non trouvé', 404);
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Rappel supprimé avec succès'
    });
  });

  /**
   * Récupère les statistiques globales du DMP
   */
  static getGlobalStatistics = catchAsync(async (req, res) => {
    const statistics = await AdminDMPService.getGlobalStatistics();
    
    res.status(200).json({
      status: 'success',
      data: statistics
    });
  });

  /**
   * Désactive l'accès DMP d'un patient
   */
  static desactiverAccesDMP = catchAsync(async (req, res) => {
    const { patientId } = req.params;
    
    const result = await AdminDMPService.desactiverAccesDMP(patientId);
    
    if (!result) {
      throw new AppError('Patient non trouvé', 404);
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Accès DMP désactivé avec succès'
    });
  });

  /**
   * Réactive l'accès DMP d'un patient
   */
  static reactiverAccesDMP = catchAsync(async (req, res) => {
    const { patientId } = req.params;
    
    const result = await AdminDMPService.reactiverAccesDMP(patientId);
    
    if (!result) {
      throw new AppError('Patient non trouvé', 404);
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Accès DMP réactivé avec succès'
    });
  });
}

module.exports = AdminDMPController; 