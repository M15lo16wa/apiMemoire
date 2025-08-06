const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SessionAccesDMP = sequelize.define('SessionAccesDMP', {
    id_session: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    professionnel_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ProfessionnelsSante',
        key: 'id_professionnel'
      }
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Patients',
        key: 'id_patient'
      }
    },
    mode_acces: {
      type: DataTypes.ENUM('autorise_par_patient', 'urgence', 'connexion_secrete'),
      allowNull: false,
      defaultValue: 'autorise_par_patient'
    },
    raison_acces: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    code_cps_utilise: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: 'Code CPS utilisé pour l\'authentification'
    },
    adresse_ip: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date_debut: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    date_fin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    duree_acces: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 60,
      comment: 'Durée en minutes'
    },
    statut_session: {
      type: DataTypes.ENUM('en_cours', 'terminee', 'expiree', 'annulee'),
      allowNull: false,
      defaultValue: 'en_cours'
    },
    validation_requise: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    validation_statut: {
      type: DataTypes.ENUM('en_attente', 'approuvee', 'refusee'),
      allowNull: false,
      defaultValue: 'en_attente'
    },
    validation_date: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'SessionsAccesDMP',
    timestamps: true,
    indexes: [
      {
        fields: ['professionnel_id', 'patient_id']
      },
      {
        fields: ['statut_session']
      },
      {
        fields: ['date_debut']
      }
    ]
  });

  // Méthodes d'instance
  SessionAccesDMP.prototype.terminer = async function(raison = 'Termination manuelle') {
    this.statut_session = 'terminee';
    this.date_fin = new Date();
    return await this.save();
  };

  SessionAccesDMP.prototype.approuver = async function() {
    this.validation_statut = 'approuvee';
    this.validation_date = new Date();
    return await this.save();
  };

  SessionAccesDMP.prototype.refuser = async function() {
    this.validation_statut = 'refusee';
    this.validation_date = new Date();
    this.statut_session = 'annulee';
    this.date_fin = new Date();
    return await this.save();
  };

  SessionAccesDMP.prototype.estExpiree = function() {
    if (!this.date_fin) return false;
    return new Date() > this.date_fin;
  };

  SessionAccesDMP.prototype.estActive = function() {
    return this.statut_session === 'en_cours' && !this.estExpiree();
  };

  // Méthodes de classe
  SessionAccesDMP.getSessionsActives = async function(professionnelId) {
    return await this.findAll({
      where: {
        professionnel_id: professionnelId,
        statut_session: 'en_cours'
      },
      include: [
        {
          model: sequelize.models.Patient,
          as: 'patient',
          attributes: ['nom', 'prenom', 'numero_dossier']
        }
      ],
      order: [['date_debut', 'DESC']]
    });
  };

  SessionAccesDMP.nettoyerSessionsExpirees = async function() {
    const sessionsExpirees = await this.findAll({
      where: {
        statut_session: 'en_cours',
        date_fin: {
          [sequelize.Op.lt]: new Date()
        }
      }
    });

    for (const session of sessionsExpirees) {
      await session.terminer();
    }

    return sessionsExpirees.length;
  };

  return SessionAccesDMP;
}; 