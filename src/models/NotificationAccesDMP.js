const { DataTypes, Op } = require('sequelize');

module.exports = (sequelize) => {
  const NotificationAccesDMP = sequelize.define('NotificationAccesDMP', {
    id_notification: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Patients',
        key: 'id_patient'
      }
    },
    professionnel_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ProfessionnelsSante',
        key: 'id_professionnel'
      }
    },
    session_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'SessionsAccesDMP',
        key: 'id_session'
      }
    },
    type_notification: {
      type: DataTypes.ENUM('demande_validation', 'information_acces', 'alerte_securite'),
      allowNull: false
    },
    canal_envoi: {
      type: DataTypes.ENUM('email', 'sms', 'in_app', 'push'),
      allowNull: false,
      defaultValue: 'email'
    },
    contenu_notification: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    contenu_html: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Contenu HTML pour les emails'
    },
    titre: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Titre de la notification'
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Message de la notification'
    },
    destinataire: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Email ou numéro de téléphone du destinataire'
    },
    statut_envoi: {
      type: DataTypes.ENUM('en_attente', 'envoyee', 'livree', 'echouee'),
      allowNull: false,
      defaultValue: 'en_attente'
    },
    date_envoi: {
      type: DataTypes.DATE,
      allowNull: true
    },
    date_livraison: {
      type: DataTypes.DATE,
      allowNull: true
    },
    nombre_tentatives: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    erreur_envoi: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Message d\'erreur en cas d\'échec'
    },
    delai_expiration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Délai d\'expiration en minutes'
    },
    date_expiration: {
      type: DataTypes.DATE,
      allowNull: true
    },
    priorite: {
      type: DataTypes.ENUM('basse', 'normale', 'haute', 'urgente'),
      allowNull: false,
      defaultValue: 'normale'
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Données supplémentaires (mode accès, durée, etc.)'
    },
    date_creation: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'NotificationsAccesDMP',
    timestamps: false,
    indexes: [
      {
        fields: ['patient_id', 'type_notification']
      },
      {
        fields: ['statut_envoi']
      },
      {
        fields: ['date_creation']
      },
      {
        fields: ['canal_envoi']
      }
    ]
  });

  // Méthodes d'instance
  NotificationAccesDMP.prototype.marquerEnvoyee = async function() {
    this.statut_envoi = 'envoyee';
    this.date_envoi = new Date();
    this.nombre_tentatives += 1;
    return await this.save();
  };

  NotificationAccesDMP.prototype.marquerLivree = async function() {
    this.statut_envoi = 'livree';
    this.date_livraison = new Date();
    return await this.save();
  };

  NotificationAccesDMP.prototype.marquerEchouee = async function(erreur) {
    this.statut_envoi = 'echouee';
    this.erreur_envoi = erreur;
    this.nombre_tentatives += 1;
    return await this.save();
  };

  NotificationAccesDMP.prototype.estExpiree = function() {
    if (!this.date_expiration) return false;
    return new Date() > this.date_expiration;
  };

  NotificationAccesDMP.prototype.peutReenvoyer = function() {
    return this.statut_envoi === 'echouee' && this.nombre_tentatives < 3;
  };

  // Méthodes de classe
  NotificationAccesDMP.getNotificationsEnAttente = async function() {
    return await this.findAll({
      where: {
        statut_envoi: 'en_attente',
        date_creation: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24h
        }
      },
      order: [['priorite', 'DESC'], ['date_creation', 'ASC']],
      limit: 50
    });
  };

  NotificationAccesDMP.getNotificationsExpirees = async function() {
    return await this.findAll({
      where: {
        date_expiration: {
          [Op.lt]: new Date()
        },
        statut_envoi: 'en_attente'
      }
    });
  };

  NotificationAccesDMP.nettoyerAnciennesNotifications = async function(jours = 90) {
    const dateLimite = new Date(Date.now() - jours * 24 * 60 * 60 * 1000);
    return await this.destroy({
      where: {
        date_creation: {
          [Op.lt]: dateLimite
        },
        statut_envoi: {
          [Op.in]: ['livree', 'echouee']
        }
      }
    });
  };

  return NotificationAccesDMP;
}; 