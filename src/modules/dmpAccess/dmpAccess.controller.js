const { Patient, ProfessionnelSante, SessionAccesDMP, NotificationAccesDMP, TentativeAuthentificationCPS } = require('../../models');
const CPSAuthService = require('../../services/CPSAuthService');
const NotificationService = require('../../services/NotificationService');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');

class DMPAccessController {
  /**
   * Recherche un patient par nom, prénom ou numéro de dossier
   * @route GET /api/medecin/dmp/rechercher-patient
   */
  static rechercherPatient = catchAsync(async (req, res, next) => {
    const { terme } = req.query;
    const professionnelId = req.user.id_professionnel;

    if (!terme || terme.length < 2) {
      return next(new AppError('Le terme de recherche doit contenir au moins 2 caractères', 400));
    }

    const patients = await Patient.findAll({
      where: {
        [sequelize.Op.or]: [
          { nom: { [sequelize.Op.iLike]: `%${terme}%` } },
          { prenom: { [sequelize.Op.iLike]: `%${terme}%` } },
          { numero_dossier: { [sequelize.Op.iLike]: `%${terme}%` } }
        ]
      },
      attributes: ['id_patient', 'nom', 'prenom', 'numero_dossier', 'date_naissance'],
      limit: 10,
      order: [['nom', 'ASC'], ['prenom', 'ASC']]
    });

    res.status(200).json({
      status: 'success',
      data: {
        patients,
        count: patients.length
      }
    });
  });

  /**
   * Sélectionne un patient pour l'accès au DMP
   * @route POST /api/medecin/dmp/selectionner-patient
   */
  static selectionnerPatient = catchAsync(async (req, res, next) => {
    const { patient_id } = req.body;
    const professionnelId = req.user.id_professionnel;

    const patient = await Patient.findByPk(patient_id, {
      attributes: ['id_patient', 'nom', 'prenom', 'numero_dossier', 'date_naissance']
    });

    if (!patient) {
      return next(new AppError('Patient non trouvé', 404));
    }

    // Vérifier s'il y a déjà une session active
    const sessionActive = await SessionAccesDMP.findOne({
      where: {
        professionnel_id: professionnelId,
        patient_id: patient_id,
        statut_session: 'en_cours'
      }
    });

    if (sessionActive) {
      return next(new AppError('Une session d\'accès est déjà active pour ce patient', 409));
    }

    res.status(200).json({
      status: 'success',
      data: {
        patient,
        session_active: false
      }
    });
  });

  /**
   * Authentification CPS pour accéder au DMP
   * @route POST /api/medecin/dmp/authentification-cps
   */
  static authentificationCPS = catchAsync(async (req, res, next) => {
    const { code_cps, patient_id } = req.body;
    const professionnelId = req.user.id_professionnel;

    if (!code_cps || code_cps.length !== 4) {
      return next(new AppError('Le code CPS doit contenir exactement 4 chiffres', 400));
    }

    // Vérifier que le patient existe
    const patient = await Patient.findByPk(patient_id);
    if (!patient) {
      return next(new AppError('Patient non trouvé', 404));
    }

    // Authentifier avec le code CPS
    const contexte = {
      adresseIp: req.ip,
      userAgent: req.get('User-Agent')
    };

    const resultat = await CPSAuthService.authentifierProfessionnel(professionnelId, code_cps, contexte);

    res.status(200).json({
      status: 'success',
      message: 'Authentification CPS réussie',
      data: {
        professionnel_id: professionnelId,
        patient_id: patient_id,
        authentification_reussie: true,
        timestamp: new Date()
      }
    });
  });

  /**
   * Sélection du mode d'accès au DMP
   * @route POST /api/medecin/dmp/selection-mode-acces
   */
  static selectionModeAcces = catchAsync(async (req, res, next) => {
    const { patient_id, mode_acces, raison_acces } = req.body;
    const professionnelId = req.user.id_professionnel;

    const modesValides = ['autorise_par_patient', 'urgence', 'connexion_secrete'];
    if (!modesValides.includes(mode_acces)) {
      return next(new AppError('Mode d\'accès invalide', 400));
    }

    // Vérifier que le patient existe
    const patient = await Patient.findByPk(patient_id);
    if (!patient) {
      return next(new AppError('Patient non trouvé', 404));
    }

    // Créer la session d'accès
    const session = await SessionAccesDMP.create({
      professionnel_id: professionnelId,
      patient_id: patient_id,
      mode_acces: mode_acces,
      raison_acces: raison_acces || 'Accès au DMP',
      code_cps_utilise: 'XXXX', // Masqué pour la sécurité
      adresse_ip: req.ip,
      user_agent: req.get('User-Agent'),
      validation_requise: mode_acces === 'autorise_par_patient',
      duree_acces: 60 // 1 heure par défaut
    });

    // Créer la notification appropriée
    const notificationService = new NotificationService();
    let typeNotification = 'information_acces';
    
    if (mode_acces === 'autorise_par_patient') {
      typeNotification = 'demande_validation';
    } else if (mode_acces === 'connexion_secrete') {
      typeNotification = 'alerte_securite';
    }

    const notification = await notificationService.creerNotificationAccesDMP({
      patient_id: patient_id,
      professionnel_id: professionnelId,
      session_id: session.id_session,
      type_notification: typeNotification,
      mode_acces: mode_acces,
      duree_acces: 60,
      raison_acces: raison_acces
    });

    // Envoyer la notification
    await notificationService.envoyerNotification(notification);

    res.status(201).json({
      status: 'success',
      message: 'Session d\'accès créée avec succès',
      data: {
        session_id: session.id_session,
        mode_acces: mode_acces,
        validation_requise: session.validation_requise,
        notification_envoyee: true,
        notification_id: notification.id_notification
      }
    });
  });

  /**
   * Récupère les informations du patient pour l'affichage
   * @route GET /api/medecin/dmp/informations-patient/:patientId
   */
  static getInformationsPatient = catchAsync(async (req, res, next) => {
    const { patientId } = req.params;
    const professionnelId = req.user.id_professionnel;

    const patient = await Patient.findByPk(patientId, {
      attributes: ['id_patient', 'nom', 'prenom', 'numero_dossier', 'date_naissance', 'groupe_sanguin'],
      include: [
        {
          model: DossierMedical,
          as: 'dossiers',
          attributes: ['id_dossier', 'date_creation', 'derniere_modification'],
          limit: 1,
          order: [['date_creation', 'DESC']]
        }
      ]
    });

    if (!patient) {
      return next(new AppError('Patient non trouvé', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        patient
      }
    });
  });

  /**
   * Récupère les sessions actives d'un professionnel
   * @route GET /api/medecin/dmp/sessions-actives
   */
  static getSessionsActives = catchAsync(async (req, res, next) => {
    const professionnelId = req.user.id_professionnel;

    const sessions = await SessionAccesDMP.getSessionsActives(professionnelId);

    res.status(200).json({
      status: 'success',
      data: {
        sessions,
        count: sessions.length
      }
    });
  });

  /**
   * Termine une session d'accès
   * @route POST /api/medecin/dmp/terminer-session/:sessionId
   */
  static terminerSession = catchAsync(async (req, res, next) => {
    const { sessionId } = req.params;
    const professionnelId = req.user.id_professionnel;

    const session = await SessionAccesDMP.findOne({
      where: {
        id_session: sessionId,
        professionnel_id: professionnelId
      }
    });

    if (!session) {
      return next(new AppError('Session non trouvée', 404));
    }

    await session.terminer('Termination manuelle par le professionnel');

    res.status(200).json({
      status: 'success',
      message: 'Session terminée avec succès',
      data: {
        session_id: sessionId,
        statut: 'terminee'
      }
    });
  });

  /**
   * Demande d'accès DMP
   * @route POST /api/medecin/dmp/demande-acces
   */
  static demandeAcces = catchAsync(async (req, res, next) => {
    const { session_id, professionnel_id, patient_id, mode_acces, duree_acces, raison_acces } = req.body;
    const professionnelId = req.user.id_professionnel;

    // Validation des données requises
    if (!mode_acces || !duree_acces || !raison_acces) {
      return next(new AppError('Données de demande d\'accès incomplètes', 400));
    }

    // Validation du mode d'accès
    const validModes = ['autorise_par_patient', 'urgence', 'connexion_secrete'];
    if (!validModes.includes(mode_acces)) {
      return next(new AppError('Mode d\'accès invalide', 400));
    }

    // Validation de la durée (1-1440 minutes)
    if (duree_acces < 1 || duree_acces > 1440) {
      return next(new AppError('Durée d\'accès invalide (1-1440 minutes)', 400));
    }

    // Validation de la raison (10-500 caractères)
    if (raison_acces.length < 10 || raison_acces.length > 500) {
      return next(new AppError('Raison d\'accès invalide (10-500 caractères)', 400));
    }

    let session;
    
    // Si session_id est fourni, chercher la session existante
    if (session_id) {
      session = await SessionAccesDMP.findByPk(session_id);
      if (!session) {
        return next(new AppError('Session d\'accès non trouvée', 404));
      }
      
      // Mettre à jour la session avec les nouvelles informations
      await session.update({
        mode_acces: mode_acces,
        duree_acces: duree_acces,
        raison_acces: raison_acces,
        validation_requise: mode_acces === 'autorise_par_patient'
      });
    } else {
      // Créer une nouvelle session si session_id n'est pas fourni
      const targetPatientId = patient_id ? parseInt(patient_id, 10) : null;
      if (!targetPatientId) {
        return next(new AppError('ID du patient requis', 400));
      }
      
      // Vérifier que le patient existe
      const patient = await Patient.findByPk(targetPatientId);
      if (!patient) {
        return next(new AppError('Patient non trouvé', 404));
      }
      
      session = await SessionAccesDMP.create({
        professionnel_id: professionnelId,
        patient_id: targetPatientId,
        mode_acces: mode_acces,
        duree_acces: duree_acces,
        raison_acces: raison_acces,
        validation_requise: mode_acces === 'autorise_par_patient',
        statut_session: 'en_cours',
        date_creation: new Date(),
        code_cps_utilise: 'XXXX' // Valeur par défaut
      });
    }

    // Créer une notification si nécessaire
    if (mode_acces === 'autorise_par_patient') {
      const notificationService = new NotificationService();
      await notificationService.creerNotificationAccesDMP({
        patient_id: session.patient_id,
        professionnel_id: professionnelId,
        session_id: session.id_session || session.id,
        type_notification: 'demande_validation',
        mode_acces: mode_acces,
        duree_acces: duree_acces,
        raison_acces: raison_acces
      });
    }

    res.status(201).json({
      success: true,
      data: {
        access_id: session.id_session || session.id,
        message: 'Demande d\'accès DMP créée avec succès',
        notification_sent: mode_acces === 'autorise_par_patient',
        expires_at: new Date(Date.now() + duree_acces * 60 * 1000).toISOString()
      }
    });
  });

  /**
   * Historique d'accès DMP
   * @route GET /api/medecin/dmp/historique/:patientId?
   */
  static getHistoriqueAcces = catchAsync(async (req, res, next) => {
    const { patientId } = req.params;
    const professionnelId = req.user.id_professionnel;

    let whereClause = {
      professionnel_id: professionnelId
    };

    // Filtrer par patient si spécifié
    if (patientId) {
      whereClause.patient_id = patientId;
    }

    const sessions = await SessionAccesDMP.findAll({
      where: whereClause,
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['id_patient', 'nom', 'prenom', 'numero_dossier']
        }
      ],
      order: [['date_creation', 'DESC']],
      limit: 50
    });

    const historique = sessions.map(session => ({
      id: session.id_session,
      date: session.date_creation,
      medecin: `${req.user.prenom} ${req.user.nom}`,
      patient: `${session.patient?.prenom} ${session.patient?.nom}`,
      mode: session.mode_acces,
      raison: session.raison_acces,
      statut: session.statut_session,
      expires_at: session.date_expiration
    }));

    res.status(200).json({
      success: true,
      data: historique
    });
  });

  // === ROUTES DE TEST POUR SWAGGER ===

  /**
   * Test du système DMP complet
   * @route GET /api/medecin/dmp/test/systeme
   */
  static testSystemeDMP = catchAsync(async (req, res, next) => {
    const professionnel = await ProfessionnelSante.findByPk(79);
    const patient = await Patient.findByPk(5);

    if (!professionnel || !patient) {
      return next(new AppError('Données de test non disponibles', 404));
    }

    // Créer une session de test
    const session = await SessionAccesDMP.create({
      professionnel_id: 79,
      patient_id: 5,
      mode_acces: 'autorise_par_patient',
      raison_acces: 'Test système DMP',
      code_cps_utilise: '1234',
      adresse_ip: '127.0.0.1',
      user_agent: 'Test System',
      validation_requise: true,
      duree_acces: 60
    });

    // Créer une notification de test
    const notificationService = new NotificationService();
    const notification = await notificationService.creerNotificationAccesDMP({
      patient_id: 5,
      professionnel_id: 79,
      session_id: session.id_session,
      type_notification: 'demande_validation',
      mode_acces: 'autorise_par_patient',
      duree_acces: 60,
      raison_acces: 'Test système DMP'
    });

    res.status(200).json({
      status: 'success',
      message: 'Test système DMP réussi',
      data: {
        medecin: {
          id: professionnel.id_professionnel,
          nom: professionnel.nom,
          prenom: professionnel.prenom
        },
        patient: {
          id: patient.id_patient,
          nom: patient.nom,
          prenom: patient.prenom,
          numero_dossier: patient.numero_dossier
        },
        session: {
          id: session.id_session,
          mode_acces: session.mode_acces,
          statut: session.statut_session
        },
        notification: {
          id: notification.id_notification,
          type: notification.type_notification,
          statut: notification.statut_envoi
        }
      }
    });
  });

  /**
   * Test d'authentification CPS
   * @route POST /api/medecin/dmp/test/authentification-cps
   */
  static testAuthentificationCPS = catchAsync(async (req, res, next) => {
    const { code_cps, professionnel_id } = req.body;

    // Test simplifié sans validation réelle
    const valide = code_cps === '1234';

    // Enregistrer la tentative avec les bons noms de colonnes
    await TentativeAuthentificationCPS.create({
      professionnel_id: professionnel_id || 79,
      code_cps_saisi: code_cps,  // Changé de code_saisi à code_cps_saisi
      code_cps_correct: '1234',  // Changé de code_attendu à code_cps_correct
      statut: valide ? 'reussie' : 'echouee',
      adresse_ip: '127.0.0.1',
      user_agent: 'Test API',
      raison_echec: valide ? null : 'Code CPS invalide'
    });

    res.status(200).json({
      status: 'success',
      message: valide ? 'Authentification CPS réussie' : 'Authentification CPS échouée',
      data: {
        code_saisi: code_cps,
        professionnel_id: professionnel_id || 79,
        valide: valide,
        timestamp: new Date()
      }
    });
  });

  /**
   * Test de création de session
   * @route POST /api/medecin/dmp/test/creation-session
   */
  static testCreationSession = catchAsync(async (req, res, next) => {
    const { professionnel_id, patient_id, mode_acces, raison_acces } = req.body;

    const session = await SessionAccesDMP.create({
      professionnel_id: professionnel_id || 79,
      patient_id: patient_id || 5,
      mode_acces: mode_acces || 'autorise_par_patient',
      raison_acces: raison_acces || 'Test création session',
      code_cps_utilise: '1234',
      adresse_ip: '127.0.0.1',
      user_agent: 'Test API',
      validation_requise: mode_acces === 'autorise_par_patient',
      duree_acces: 60
    });

    res.status(201).json({
      status: 'success',
      message: 'Session créée avec succès',
      data: {
        session_id: session.id_session,
        mode_acces: session.mode_acces,
        statut: session.statut_session,
        validation_requise: session.validation_requise,
        timestamp: new Date()
      }
    });
  });

  /**
   * Test de notification
   * @route POST /api/medecin/dmp/test/notification
   */
  static testNotification = catchAsync(async (req, res, next) => {
    const { patient_id, professionnel_id, session_id, type_notification } = req.body;

    const notificationService = new NotificationService();
    const notification = await notificationService.creerNotificationAccesDMP({
      patient_id: patient_id || 5,
      professionnel_id: professionnel_id || 79,
      session_id: session_id,
      type_notification: type_notification || 'demande_validation',
      mode_acces: 'autorise_par_patient',
      duree_acces: 60,
      raison_acces: 'Test notification'
    });

    // Envoyer la notification
    const resultat = await notificationService.envoyerNotification(notification);

    res.status(200).json({
      status: 'success',
      message: 'Notification envoyée avec succès',
      data: {
        notification_id: notification.id_notification,
        type: notification.type_notification,
        canal: notification.canal_envoi,
        statut: notification.statut_envoi,
        resultat_envoi: resultat
      }
    });
  });

  /**
   * Test de demande d'accès
   * @route POST /api/medecin/dmp/test/demande-acces
   */
  static testDemandeAcces = catchAsync(async (req, res, next) => {
    const { session_id, mode_acces, duree_acces, raison_acces } = req.body;

    // Validation des données requises
    if (!session_id || !mode_acces || !duree_acces || !raison_acces) {
      return res.status(400).json({
        success: false,
        error: 'Données de demande d\'accès incomplètes'
      });
    }

    // Validation du mode d'accès
    const validModes = ['autorise_par_patient', 'urgence', 'connexion_secrete'];
    if (!validModes.includes(mode_acces)) {
      return res.status(400).json({
        success: false,
        error: 'Mode d\'accès invalide'
      });
    }

    // Validation de la durée (1-1440 minutes)
    if (duree_acces < 1 || duree_acces > 1440) {
      return res.status(400).json({
        success: false,
        error: 'Durée d\'accès invalide (1-1440 minutes)'
      });
    }

    // Validation de la raison (10-500 caractères)
    if (raison_acces.length < 10 || raison_acces.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Raison d\'accès invalide (10-500 caractères)'
      });
    }

    // Créer une session de test si elle n'existe pas
    let session = await SessionAccesDMP.findByPk(session_id);
    if (!session) {
      session = await SessionAccesDMP.create({
        professionnel_id: 79,
        patient_id: 5,
        mode_acces: mode_acces,
        duree_acces: duree_acces,
        raison_acces: raison_acces,
        validation_requise: mode_acces === 'autorise_par_patient',
        statut_session: 'en_cours'
      });
    } else {
      await session.update({
        mode_acces: mode_acces,
        duree_acces: duree_acces,
        raison_acces: raison_acces,
        validation_requise: mode_acces === 'autorise_par_patient'
      });
    }

    res.status(201).json({
      success: true,
      data: {
        access_id: session.id_session,
        message: 'Demande d\'accès DMP créée avec succès',
        notification_sent: mode_acces === 'autorise_par_patient',
        expires_at: new Date(Date.now() + duree_acces * 60 * 1000).toISOString()
      }
    });
  });

  /**
   * Test d'historique
   * @route GET /api/medecin/dmp/test/historique/:patientId?
   */
  static testHistorique = catchAsync(async (req, res, next) => {
    const { patientId } = req.params;

    // Mock data pour les tests
    const mockHistory = [
      {
        id: 'access_1',
        date: new Date().toISOString(),
        medecin: 'Dr. Sakura Saza',
        patient: patientId ? `Patient ${patientId}` : 'Patient 123',
        mode: 'autorise_par_patient',
        raison: 'Suivi médical',
        statut: 'approuve',
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString()
      },
      {
        id: 'access_2',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        medecin: 'Dr. Sakura Saza',
        patient: patientId ? `Patient ${patientId}` : 'Patient 456',
        mode: 'urgence',
        raison: 'Consultation d\'urgence',
        statut: 'termine',
        expires_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      }
    ];

    res.status(200).json({
      success: true,
      data: patientId ? mockHistory.filter(h => h.patient.includes(patientId)) : mockHistory
    });
  });
}

module.exports = DMPAccessController; 