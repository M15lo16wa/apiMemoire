const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Historique2FA = sequelize.define('Historique2FA', {
    id_historique_2fa: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: 'Identifiant unique de l\'historique 2FA'
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID de l\'utilisateur (peut être patient, professionnel ou utilisateur)'
    },
    user_type: {
      type: DataTypes.ENUM('patient', 'professionnel', 'utilisateur'),
      allowNull: false,
      comment: 'Type d\'utilisateur'
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Action effectuée (setup, verify, disable, failed_attempt, recovery_used)'
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: 'Adresse IP de la tentative'
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'User-Agent du navigateur/appareil'
    },
    success: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      comment: 'Indique si la tentative a réussi'
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Détails supplémentaires sur la tentative'
    },
    // Note: La colonne metadata n'existe pas dans la base de données actuelle
    // Elle peut être ajoutée plus tard si nécessaire
  }, {
    tableName: 'Historique2FA',
    timestamps: false, // Désactiver les timestamps automatiques car nous avons created_at
    paranoid: false, // Pas de soft delete pour l'audit
    indexes: [
      {
        name: 'idx_historique_2fa_user',
        fields: ['user_id', 'user_type']
      },
      {
        name: 'idx_historique_2fa_action',
        fields: ['action']
      },
      {
        name: 'idx_historique_2fa_date',
        fields: ['created_at']
      },
      {
        name: 'idx_historique_2fa_success',
        fields: ['success']
      }
    ],
    hooks: {
      beforeCreate: (historique) => {
        // Définir automatiquement la date de création
        if (!historique.created_at) {
          historique.created_at = new Date();
        }
        
        // Nettoyer l'adresse IP si nécessaire
        if (historique.ip_address) {
          // Supprimer les espaces et normaliser
          historique.ip_address = historique.ip_address.trim();
        }
        
        // Limiter la taille du user-agent si trop long
        if (historique.user_agent && historique.user_agent.length > 1000) {
          historique.user_agent = historique.user_agent.substring(0, 1000) + '...';
        }
      }
    }
  });

  // Méthodes de classe pour l'analyse des tentatives
  Historique2FA.getFailedAttempts = async function(userId, userType, timeWindow = 15) {
    const { Op } = require('sequelize');
    const cutoffTime = new Date(Date.now() - timeWindow * 60 * 1000); // 15 minutes par défaut
    
    return await this.count({
      where: {
        user_id: userId,
        user_type: userType,
        success: false,
        created_at: {
          [Op.gte]: cutoffTime
        }
      }
    });
  };

  Historique2FA.getRecentActivity = async function(userId, userType, limit = 10) {
    return await this.findAll({
      where: {
        user_id: userId,
        user_type: userType
      },
      order: [['created_at', 'DESC']],
      limit: limit
    });
  };

  Historique2FA.getSecurityReport = async function(userId, userType, days = 30) {
    const { Op } = require('sequelize');
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const stats = await this.findAll({
      where: {
        user_id: userId,
        user_type: userType,
        created_at: {
          [Op.gte]: cutoffDate
        }
      },
      attributes: [
        'action',
        'success',
        [sequelize.fn('COUNT', sequelize.col('id_historique_2fa')), 'count']
      ],
      group: ['action', 'success'],
      raw: true
    });
    
    return stats;
  };

  // Méthode pour nettoyer l'historique ancien
  Historique2FA.cleanupOldRecords = async function(daysToKeep = 90) {
    const { Op } = require('sequelize');
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    
    const deletedCount = await this.destroy({
      where: {
        created_at: {
          [Op.lt]: cutoffDate
        }
      }
    });
    
    console.log(`🧹 Nettoyage Historique2FA: ${deletedCount} enregistrements supprimés (plus anciens que ${daysToKeep} jours)`);
    return deletedCount;
  };

  return Historique2FA;
};
