const cron = require('node-cron');
const NotificationService = require('./NotificationService');

class CronService {
  constructor() {
    this.notificationService = new NotificationService();
    this.tasks = new Map();
  }

  /**
   * Initialise toutes les tâches cron
   */
  init() {
    console.log('🕐 Initialisation des tâches cron...');
    
    // Nettoyage des anciennes notifications (tous les dimanches à 3h du matin)
    this.scheduleNettoyageNotifications();
    
    // Traitement des notifications en attente (toutes les 5 minutes)
    this.scheduleTraitementNotifications();
    
    console.log('✅ Tâches cron initialisées avec succès');
  }

  /**
   * Planifie le nettoyage des anciennes notifications
   */
  scheduleNettoyageNotifications() {
    const task = cron.schedule('0 3 * * 0', async () => {
      try {
        console.log('🔄 Début du nettoyage des anciennes notifications...');
        const nombreSupprimees = await this.notificationService.nettoyerAnciennesNotifications(90);
        console.log(`✅ ${nombreSupprimees} anciennes notifications ont été supprimées`);
      } catch (error) {
        console.error('❌ Erreur lors du nettoyage des notifications:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Europe/Paris'
    });

    this.tasks.set('nettoyage_notifications', task);
    task.start();
    console.log('📅 Tâche de nettoyage des notifications planifiée (tous les dimanches à 3h)');
  }

  /**
   * Planifie le traitement des notifications en attente
   */
  scheduleTraitementNotifications() {
    const task = cron.schedule('*/5 * * * *', async () => {
      try {
        console.log('🔄 Traitement des notifications en attente...');
        const nombreTraitees = await this.notificationService.traiterNotificationsEnAttente();
        if (nombreTraitees > 0) {
          console.log(`✅ ${nombreTraitees} notifications ont été traitées`);
        }
      } catch (error) {
        console.error('❌ Erreur lors du traitement des notifications:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Europe/Paris'
    });

    this.tasks.set('traitement_notifications', task);
    task.start();
    console.log('📅 Tâche de traitement des notifications planifiée (toutes les 5 minutes)');
  }

  /**
   * Arrête toutes les tâches cron
   */
  stop() {
    console.log('🛑 Arrêt des tâches cron...');
    for (const [name, task] of this.tasks) {
      task.stop();
      console.log(`⏹️ Tâche "${name}" arrêtée`);
    }
    this.tasks.clear();
  }

  /**
   * Redémarre toutes les tâches cron
   */
  restart() {
    this.stop();
    this.init();
  }

  /**
   * Récupère le statut des tâches cron
   */
  getStatus() {
    const status = {};
    for (const [name, task] of this.tasks) {
      status[name] = {
        running: task.running,
        lastRun: task.lastRun,
        nextRun: task.nextRun
      };
    }
    return status;
  }

  /**
   * Exécute manuellement une tâche
   */
  async executeTask(taskName) {
    switch (taskName) {
      case 'nettoyage_notifications':
        return await this.notificationService.nettoyerAnciennesNotifications(90);
      
      case 'traitement_notifications':
        return await this.notificationService.traiterNotificationsEnAttente();
      
      default:
        throw new Error(`Tâche inconnue: ${taskName}`);
    }
  }
}

module.exports = CronService;
