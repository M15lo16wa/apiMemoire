const { Patient, AutoMesure, DocumentPersonnel, Message, Rappel, ProfessionnelSante } = require('../../models');
const { Op } = require('sequelize');

/**
 * Service d'administration pour les fonctionnalités DMP
 * Accès réservé aux administrateurs
 */
class AdminDMPService {

  /**
   * Récupère la liste des patients avec leurs données DMP
   */
  static async getPatientsList(limit = 20, offset = 0) {
    return await Patient.findAndCountAll({
      include: [
        {
          model: AutoMesure,
          as: 'autoMesures',
          attributes: ['id', 'type_mesure', 'valeur', 'date_mesure'],
          limit: 5,
          order: [['date_mesure', 'DESC']]
        },
        {
          model: DocumentPersonnel,
          as: 'documentsPersonnels',
          attributes: ['id', 'nom', 'type', 'createdAt'],
          limit: 5,
          order: [['createdAt', 'DESC']]
        },
        {
          model: Message,
          as: 'messages',
          attributes: ['id', 'sujet', 'lu', 'date_envoi'],
          limit: 5,
          order: [['date_envoi', 'DESC']]
        },
        {
          model: Rappel,
          as: 'rappels',
          attributes: ['id', 'titre', 'type', 'actif'],
          limit: 5,
          order: [['date_rappel', 'DESC']]
        }
      ],
      attributes: [
        'id_patient', 'nom', 'prenom', 'date_naissance', 'email', 
        'telephone', 'statut', 'createdAt'
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Récupère les données DMP d'un patient spécifique
   */
  static async getPatientDMPData(patientId) {
    const patient = await Patient.findByPk(patientId, {
      include: [
        {
          model: AutoMesure,
          as: 'autoMesures',
          attributes: ['id', 'type_mesure', 'valeur', 'valeur_secondaire', 'unite', 'unite_secondaire', 'date_mesure', 'heure_mesure', 'notes', 'createdAt'],
          order: [['date_mesure', 'DESC']]
        },
        {
          model: DocumentPersonnel,
          as: 'documentsPersonnels',
          attributes: ['id', 'nom', 'type', 'description', 'url', 'taille', 'format', 'createdAt'],
          order: [['createdAt', 'DESC']]
        },
        {
          model: Message,
          as: 'messages',
          include: [
            {
              model: ProfessionnelSante,
              as: 'professionnel',
              attributes: ['id_professionnel', 'nom', 'prenom', 'specialite']
            }
          ],
          attributes: ['id', 'sujet', 'contenu', 'lu', 'date_envoi', 'createdAt'],
          order: [['date_envoi', 'DESC']]
        },
        {
          model: Rappel,
          as: 'rappels',
          attributes: ['id', 'type', 'titre', 'description', 'date_rappel', 'priorite', 'actif', 'createdAt'],
          order: [['date_rappel', 'ASC']]
        }
      ],
      attributes: [
        'id_patient', 'nom', 'prenom', 'date_naissance', 'sexe', 'email', 
        'telephone', 'adresse', 'numero_assure', 'nom_assurance', 'statut', 'createdAt'
      ]
    });

    if (!patient) {
      return null;
    }

    // Calculer les statistiques du patient
    const stats = {
      total_auto_mesures: patient.autoMesures?.length || 0,
      total_documents: patient.documentsPersonnels?.length || 0,
      total_messages: patient.messages?.length || 0,
      total_rappels: patient.rappels?.length || 0,
      derniere_activite: null
    };

    // Trouver la dernière activité
    const allActivities = [
      ...(patient.autoMesures || []).map(am => ({ date: am.date_mesure, type: 'auto_mesure' })),
      ...(patient.documentsPersonnels || []).map(doc => ({ date: doc.createdAt, type: 'document' })),
      ...(patient.messages || []).map(msg => ({ date: msg.date_envoi, type: 'message' })),
      ...(patient.rappels || []).map(rap => ({ date: rap.date_rappel, type: 'rappel' }))
    ];

    if (allActivities.length > 0) {
      const latestActivity = allActivities.reduce((latest, current) => 
        new Date(current.date) > new Date(latest.date) ? current : latest
      );
      stats.derniere_activite = latestActivity;
    }

    return {
      patient: patient.toJSON(),
      statistiques: stats
    };
  }

  /**
   * Récupère toutes les auto-mesures de tous les patients
   */
  static async getAllAutoMesures(filters = {}) {
    const { patientId, type_mesure, date_debut, date_fin, limit = 50, offset = 0 } = filters;
    
    const whereClause = {};
    
    if (patientId) {
      whereClause.patient_id = patientId;
    }
    
    if (type_mesure) {
      whereClause.type_mesure = type_mesure;
    }
    
    if (date_debut || date_fin) {
      whereClause.date_mesure = {};
      if (date_debut) {
        whereClause.date_mesure[Op.gte] = new Date(date_debut);
      }
      if (date_fin) {
        whereClause.date_mesure[Op.lte] = new Date(date_fin);
      }
    }

    return await AutoMesure.findAndCountAll({
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['id_patient', 'nom', 'prenom', 'email']
        }
      ],
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date_mesure', 'DESC']]
    });
  }

  /**
   * Supprime une auto-mesure (admin uniquement)
   */
  static async deleteAutoMesure(id) {
    const autoMesure = await AutoMesure.findByPk(id);
    if (!autoMesure) {
      return false;
    }
    
    await autoMesure.destroy();
    return true;
  }

  /**
   * Récupère tous les documents personnels de tous les patients
   */
  static async getAllDocuments(filters = {}) {
    const { patientId, type, limit = 50, offset = 0 } = filters;
    
    const whereClause = {};
    
    if (patientId) {
      whereClause.patient_id = patientId;
    }
    
    if (type) {
      whereClause.type = type;
    }

    return await DocumentPersonnel.findAndCountAll({
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['id_patient', 'nom', 'prenom', 'email']
        }
      ],
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Supprime un document personnel (admin uniquement)
   */
  static async deleteDocument(id) {
    const document = await DocumentPersonnel.findByPk(id);
    if (!document) {
      return false;
    }
    
    await document.destroy();
    return true;
  }

  /**
   * Récupère tous les messages de tous les patients
   */
  static async getAllMessages(filters = {}) {
    const { patientId, professionnelId, lu, limit = 50, offset = 0 } = filters;
    
    const whereClause = {};
    
    if (patientId) {
      whereClause.patient_id = patientId;
    }
    
    if (professionnelId) {
      whereClause.professionnel_id = professionnelId;
    }
    
    if (lu !== undefined) {
      whereClause.lu = lu === 'true';
    }

    return await Message.findAndCountAll({
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['id_patient', 'nom', 'prenom', 'email']
        },
        {
          model: ProfessionnelSante,
          as: 'professionnel',
          attributes: ['id_professionnel', 'nom', 'prenom', 'specialite']
        }
      ],
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date_envoi', 'DESC']]
    });
  }

  /**
   * Supprime un message (admin uniquement)
   */
  static async deleteMessage(id) {
    const message = await Message.findByPk(id);
    if (!message) {
      return false;
    }
    
    await message.destroy();
    return true;
  }

  /**
   * Récupère tous les rappels de tous les patients
   */
  static async getAllRappels(filters = {}) {
    const { patientId, type, actif, limit = 50, offset = 0 } = filters;
    
    const whereClause = {};
    
    if (patientId) {
      whereClause.patient_id = patientId;
    }
    
    if (type) {
      whereClause.type = type;
    }
    
    if (actif !== undefined) {
      whereClause.actif = actif === 'true';
    }

    return await Rappel.findAndCountAll({
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['id_patient', 'nom', 'prenom', 'email']
        }
      ],
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date_rappel', 'ASC']]
    });
  }

  /**
   * Supprime un rappel (admin uniquement)
   */
  static async deleteRappel(id) {
    const rappel = await Rappel.findByPk(id);
    if (!rappel) {
      return false;
    }
    
    await rappel.destroy();
    return true;
  }

  /**
   * Récupère les statistiques globales du DMP
   */
  static async getGlobalStatistics() {
    const [
      totalPatients,
      totalAutoMesures,
      totalDocuments,
      totalMessages,
      totalRappels,
      patientsActifs
    ] = await Promise.all([
      Patient.count(),
      AutoMesure.count(),
      DocumentPersonnel.count(),
      Message.count(),
      Rappel.count(),
      Patient.count({ where: { statut: 'actif' } })
    ]);

    // Trouver la dernière activité globale
    const latestActivities = await Promise.all([
      AutoMesure.max('date_mesure'),
      DocumentPersonnel.max('createdAt'),
      Message.max('date_envoi'),
      Rappel.max('date_rappel')
    ]);

    const derniereActivite = latestActivities
      .filter(date => date !== null)
      .sort((a, b) => new Date(b) - new Date(a))[0];

    return {
      total_patients: totalPatients,
      total_auto_mesures: totalAutoMesures,
      total_documents: totalDocuments,
      total_messages: totalMessages,
      total_rappels: totalRappels,
      patients_actifs: patientsActifs,
      derniere_activite: derniereActivite
    };
  }

  /**
   * Désactive l'accès DMP d'un patient
   */
  static async desactiverAccesDMP(patientId) {
    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return false;
    }
    
    // Ajouter un champ pour désactiver l'accès DMP
    // Pour l'instant, on utilise le statut général
    await patient.update({ statut: 'inactif' });
    return true;
  }

  /**
   * Réactive l'accès DMP d'un patient
   */
  static async reactiverAccesDMP(patientId) {
    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return false;
    }
    
    await patient.update({ statut: 'actif' });
    return true;
  }
}

module.exports = AdminDMPService; 