const nodemailer = require('nodemailer');
const twilio = require('twilio');
const { NotificationAccesDMP, Patient, ProfessionnelSante } = require('../models');

class NotificationService {
  constructor() {
    this.emailTransporter = this.createEmailTransporter();
    this.smsClient = this.createSMSClient();
  }

  /**
   * Crée le transporteur email avec Mailtrap
   * @returns {Object} - Transporteur nodemailer
   */
  createEmailTransporter() {
    return nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      secure: false,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS
      }
    });
  }

  /**
   * Crée le client SMS avec Twilio
   * @returns {Object} - Client Twilio
   */
  createSMSClient() {
    return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }

  /**
   * Envoie une notification par email
   * @param {Object} notification - Données de la notification
   * @returns {Object} - Résultat de l'envoi
   */
  async envoyerEmail(notification) {
    try {
      const mailOptions = {
        from: process.env.MAILTRAP_FROM_EMAIL,
        to: notification.destinataire,
        subject: this.generateEmailSubject(notification.type_notification),
        text: notification.contenu_notification,
        html: notification.contenu_html || this.generateEmailTemplate(notification)
      };

      const result = await this.emailTransporter.sendMail(mailOptions);
      
      await notification.marquerEnvoyee();
      
      return {
        success: true,
        messageId: result.messageId,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Erreur envoi email:', error);
      await notification.marquerEchouee(error.message);
      throw new Error(`Erreur envoi email: ${error.message}`);
    }
  }

  /**
   * Envoie une notification par SMS
   * @param {Object} notification - Données de la notification
   * @returns {Object} - Résultat de l'envoi
   */
  async envoyerSMS(notification) {
    try {
      const message = await this.smsClient.messages.create({
        body: notification.contenu_notification,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: notification.destinataire
      });

      await notification.marquerEnvoyee();
      
      return {
        success: true,
        messageId: message.sid,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Erreur envoi SMS:', error);
      await notification.marquerEchouee(error.message);
      throw new Error(`Erreur envoi SMS: ${error.message}`);
    }
  }

  /**
   * Envoie une notification selon le canal spécifié
   * @param {Object} notification - Données de la notification
   * @returns {Object} - Résultat de l'envoi
   */
  async envoyerNotification(notification) {
    try {
      switch (notification.canal_envoi) {
        case 'email':
          return await this.envoyerEmail(notification);
        case 'sms':
          return await this.envoyerSMS(notification);
        case 'in_app':
          return await this.envoyerNotificationInApp(notification);
        case 'push':
          return await this.envoyerNotificationPush(notification);
        default:
          throw new Error(`Canal d'envoi non supporté: ${notification.canal_envoi}`);
      }
    } catch (error) {
      console.error('Erreur envoi notification:', error);
      throw error;
    }
  }

  /**
   * Envoie une notification in-app (simulation)
   * @param {Object} notification - Données de la notification
   * @returns {Object} - Résultat de l'envoi
   */
  async envoyerNotificationInApp(notification) {
    // Simulation d'envoi in-app
    await notification.marquerEnvoyee();
    return {
      success: true,
      messageId: `inapp_${Date.now()}`,
      timestamp: new Date()
    };
  }

  /**
   * Envoie une notification push (simulation)
   * @param {Object} notification - Données de la notification
   * @returns {Object} - Résultat de l'envoi
   */
  async envoyerNotificationPush(notification) {
    // Simulation d'envoi push
    await notification.marquerEnvoyee();
    return {
      success: true,
      messageId: `push_${Date.now()}`,
      timestamp: new Date()
    };
  }

  /**
   * Crée une notification d'accès au DMP
   * @param {Object} donnees - Données de la notification
   * @returns {Object} - Notification créée
   */
  async creerNotificationAccesDMP(donnees) {
    try {
      const { patient_id, professionnel_id, session_id, type_notification, canal_envoi = 'email' } = donnees;

      // Récupérer les informations du patient et du professionnel
      const patient = await Patient.findByPk(patient_id);
      const professionnel = await ProfessionnelSante.findByPk(professionnel_id);

      if (!patient || !professionnel) {
        throw new Error('Patient ou professionnel non trouvé');
      }

      const contenu = this.generateNotificationContent(type_notification, patient, professionnel, donnees);
      const contenuHtml = this.generateEmailTemplate({
        type_notification,
        contenu_notification: contenu,
        patient,
        professionnel,
        ...donnees
      });

      // Utiliser une requête SQL brute pour éviter les problèmes de mapping Sequelize
      const { sequelize } = NotificationAccesDMP;
      const [results] = await sequelize.query(
        `INSERT INTO "NotificationsAccesDMP" (
          patient_id, professionnel_id, session_id, type_notification, 
          canal_envoi, contenu_notification, contenu_html, titre, message,
          destinataire, statut_envoi, nombre_tentatives, delai_expiration,
          date_expiration, priorite, metadata, date_creation
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
        {
          replacements: [
            patient_id,
            professionnel_id,
            session_id,
            type_notification,
            canal_envoi,
            contenu,
            contenuHtml,
            this.generateEmailSubject(type_notification) || 'Notification DMP',
            contenu,
            patient.email || patient.telephone,
            'en_attente',
            0,
            60,
            new Date(Date.now() + 60 * 60 * 1000),
            this.getPriorite(type_notification),
            JSON.stringify({
              mode_acces: donnees.mode_acces,
              duree_acces: donnees.duree_acces,
              raison_acces: donnees.raison_acces
            }),
            new Date()
          ],
          type: sequelize.QueryTypes.INSERT
        }
      );

      // Récupérer la notification créée
      const notification = await NotificationAccesDMP.findByPk(results[0].id_notification);

      return notification;
    } catch (error) {
      console.error('Erreur création notification:', error);
      throw new Error(`Erreur création notification: ${error.message}`);
    }
  }

  /**
   * Génère le contenu de la notification selon le type
   * @param {string} type - Type de notification
   * @param {Object} patient - Données du patient
   * @param {Object} professionnel - Données du professionnel
   * @param {Object} donnees - Données supplémentaires
   * @returns {string} - Contenu de la notification
   */
  generateNotificationContent(type, patient, professionnel, donnees) {
    const nomPatient = `${patient.nom} ${patient.prenom}`;
    const nomProfessionnel = `${professionnel.nom} ${professionnel.prenom}`;

    switch (type) {
      case 'demande_validation':
        return `Dr. ${nomProfessionnel} demande l'accès à votre dossier médical partagé (DMP). Raison: ${donnees.raison_acces || 'Consultation médicale'}. Veuillez valider cette demande.`;
      
      case 'information_acces':
        return `Dr. ${nomProfessionnel} a accédé à votre dossier médical partagé (DMP) en mode ${donnees.mode_acces}. Durée: ${donnees.duree_acces || 60} minutes.`;
      
      case 'alerte_securite':
        return `ALERTE: Accès à votre dossier médical partagé (DMP) par Dr. ${nomProfessionnel} en mode ${donnees.mode_acces}. Si vous n'êtes pas à l'origine de cette demande, contactez immédiatement votre médecin.`;
      
      default:
        return `Notification concernant votre dossier médical partagé (DMP) de la part de Dr. ${nomProfessionnel}.`;
    }
  }

  /**
   * Génère le template HTML pour les emails
   * @param {Object} notification - Données de la notification
   * @returns {string} - Template HTML
   */
  generateEmailTemplate(notification) {
    const { patient, professionnel, type_notification, contenu_notification } = notification;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Notification DMP</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f8f9fa; }
          .footer { background: #ecf0f1; padding: 15px; text-align: center; font-size: 12px; }
          .alert { background: #e74c3c; color: white; padding: 15px; margin: 10px 0; }
          .info { background: #3498db; color: white; padding: 15px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Dossier Médical Partagé (DMP)</h1>
          </div>
          <div class="content">
            <h2>Notification d'accès</h2>
            <p>${contenu_notification}</p>
            
            ${type_notification === 'alerte_securite' ? 
              '<div class="alert"><strong>⚠️ ALERTE DE SÉCURITÉ</strong><br>Si vous n\'êtes pas à l\'origine de cette demande, contactez immédiatement votre médecin.</div>' : 
              '<div class="info"><strong>ℹ️ Information</strong><br>Cette notification vous informe d\'un accès à votre dossier médical.</div>'
            }
            
            <p><strong>Patient:</strong> ${patient.nom} ${patient.prenom}</p>
            <p><strong>Professionnel:</strong> Dr. ${professionnel.nom} ${professionnel.prenom}</p>
            <p><strong>Type:</strong> ${type_notification.replace('_', ' ')}</p>
          </div>
          <div class="footer">
            <p>Ce message est généré automatiquement par le système DMP.</p>
            <p>Pour toute question, contactez votre médecin traitant.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Génère le sujet de l'email selon le type
   * @param {string} type - Type de notification
   * @returns {string} - Sujet de l'email
   */
  generateEmailSubject(type) {
    switch (type) {
      case 'demande_validation':
        return 'Demande d\'accès à votre DMP - Action requise';
      case 'information_acces':
        return 'Information - Accès à votre DMP';
      case 'alerte_securite':
        return 'ALERTE SÉCURITÉ - Accès à votre DMP';
      default:
        return 'Notification DMP';
    }
  }

  /**
   * Détermine la priorité selon le type de notification
   * @param {string} type - Type de notification
   * @returns {string} - Priorité
   */
  getPriorite(type) {
    switch (type) {
      case 'alerte_securite':
        return 'urgente';
      case 'demande_validation':
        return 'haute';
      case 'information_acces':
        return 'normale';
      default:
        return 'normale';
    }
  }

  /**
   * Traite les notifications en attente
   * @returns {number} - Nombre de notifications traitées
   */
  async traiterNotificationsEnAttente() {
    try {
      const notifications = await NotificationAccesDMP.getNotificationsEnAttente();
      let traitees = 0;

      for (const notification of notifications) {
        try {
          await this.envoyerNotification(notification);
          traitees++;
        } catch (error) {
          console.error(`Erreur traitement notification ${notification.id_notification}:`, error);
        }
      }

      return traitees;
    } catch (error) {
      console.error('Erreur traitement notifications:', error);
      throw error;
    }
  }

  /**
   * Nettoie les anciennes notifications
   * @param {number} jours - Nombre de jours à conserver
   * @returns {number} - Nombre de notifications supprimées
   */
  async nettoyerAnciennesNotifications(jours = 90) {
    return await NotificationAccesDMP.nettoyerAnciennesNotifications(jours);
  }
}

module.exports = NotificationService; 