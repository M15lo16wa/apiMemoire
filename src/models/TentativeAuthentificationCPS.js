const { DataTypes, Op } = require('sequelize');

module.exports = (sequelize) => {
  const TentativeAuthentificationCPS = sequelize.define('TentativeAuthentificationCPS', {
    id_tentative: {
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
      allowNull: true,
      references: {
        model: 'Patients',
        key: 'id_patient'
      }
    },
    code_cps_saisi: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: 'Code CPS saisi par l\'utilisateur'
    },
    code_cps_correct: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: 'Code CPS correct (pour validation)'
    },
    statut: {
      type: DataTypes.ENUM('reussie', 'echouee'),
      allowNull: false
    },
    date_tentative: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    adresse_ip: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    delai_tentative: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Délai d\'attente imposé en minutes'
    },
    session_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'SessionsAccesDMP',
        key: 'id_session'
      }
    },
    raison_echec: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Raison de l\'échec si applicable'
    },
    tentative_numero: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Numéro de tentative dans la période'
    }
  }, {
    tableName: 'TentativesAuthentificationCPS',
    timestamps: true,
    indexes: [
      {
        fields: ['professionnel_id', 'date_tentative']
      },
      {
        fields: ['statut']
      },
      {
        fields: ['adresse_ip']
      },
      {
        fields: ['session_id']
      }
    ],
    hooks: {
      beforeCreate: async (tentative) => {
        const derniereTentative = await TentativeAuthentificationCPS.findOne({
          where: {
            professionnel_id: tentative.professionnel_id,
            date_tentative: {
              [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24h
            }
          },
          order: [['tentative_numero', 'DESC']]
        });
        tentative.tentative_numero = derniereTentative ? derniereTentative.tentative_numero + 1 : 1;
      }
    }
  });

  // Méthodes de classe
  TentativeAuthentificationCPS.estProfessionnelBloque = async function(professionnelId) {
    const tentativesRecentes = await this.count({
      where: {
        professionnel_id: professionnelId,
        statut: 'echouee',
        date_tentative: {
          [Op.gte]: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes
        }
      }
    });
    return tentativesRecentes >= 3;
  };

  TentativeAuthentificationCPS.getTentativesRecentes = async function(professionnelId, minutes = 15) {
    return await this.findAll({
      where: {
        professionnel_id: professionnelId,
        date_tentative: {
          [Op.gte]: new Date(Date.now() - minutes * 60 * 1000)
        }
      },
      order: [['date_tentative', 'DESC']],
      limit: 10
    });
  };

  TentativeAuthentificationCPS.nettoyerAnciennesTentatives = async function(jours = 30) {
    const dateLimite = new Date(Date.now() - jours * 24 * 60 * 60 * 1000);
    return await this.destroy({
      where: {
        date_tentative: {
          [Op.lt]: dateLimite
        }
      }
    });
  };

  TentativeAuthentificationCPS.peutTenterAuthentification = async function(professionnelId) {
    const estBloque = await this.estProfessionnelBloque(professionnelId);
    if (estBloque) {
      return {
        peutTenter: false,
        raison: 'Compte temporairement bloqué. Trop de tentatives échouées.',
        delaiRestant: 15 // minutes
      };
    }

    const tentativesRecentes = await this.count({
      where: {
        professionnel_id: professionnelId,
        date_tentative: {
          [Op.gte]: new Date(Date.now() - 60 * 1000) // 1 minute
        }
      }
    });

    if (tentativesRecentes >= 5) {
      return {
        peutTenter: false,
        raison: 'Trop de tentatives récentes. Attendez 1 minute.',
        delaiRestant: 1
      };
    }

    return {
      peutTenter: true,
      tentativesRestantes: 5 - tentativesRecentes
    };
  };

  return TentativeAuthentificationCPS;
}; 