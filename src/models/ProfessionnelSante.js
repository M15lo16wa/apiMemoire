// src/models/ProfessionnelSante.js

const { DataTypes, Op } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const ProfessionnelSante = sequelize.define('ProfessionnelSante', {
    id_professionnel: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    nom: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 50]
      }
    },
    prenom: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 50],
        is: /^[A-Za-zÀ-ÖØ-öø-ÿ\s\-'\.]+$/
      }
    },
    date_naissance: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: true,
        isBefore: new Date().toISOString().split('T')[0]
      }
    },
    sexe: {
      type: DataTypes.ENUM('M', 'F', 'Autre', 'Non précisé'),
      defaultValue: 'Non précisé',
      allowNull: false
    },
    specialite: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true,
        len: [0, 100]
      }
    },
    telephone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: /^[0-9+()\- ]+$/,
        len: [8, 20]
      }
    },
    telephone_portable: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: /^[0-9+()\- ]+$/,
        len: [8, 20]
      }
    },
    adresse: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    code_postal: {
      type: DataTypes.STRING(10),
      allowNull: true,
      validate: {
        is: /^[0-9]{5}$/,
        len: [5, 5]
      }
    },
    ville: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    pays: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'France'
    },
    role: {
      type: DataTypes.ENUM(
        'medecin', 
        'infirmier', 
        'secretaire',
        'aide_soignant',
        'technicien_laboratoire',
        'pharmacien',
        'kinesitherapeute',
        'chirurgien',
        'radiologue',
        'anesthesiste',
        'autre'
      ),
      allowNull: false,
      defaultValue: 'medecin'
    },
    numero_licence: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true
    },
    numero_adeli: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
      comment: 'Numéro ADELI pour les professionnels de santé',
      validate: {
        is: /^[A-Za-z0-9]{6,20}$/,
        len: [6, 20]
      }
    },
    mot_de_passe: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Mot de passe hashé pour l\'authentification directe'
    },
    date_obtention_licence: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: true
      }
    },
    statut: {
      type: DataTypes.ENUM('actif', 'inactif', 'en_conges', 'retraite'),
      defaultValue: 'actif',
      allowNull: false
    },
    date_embauche: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: true
      }
    },
    date_depart: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    photo_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    // Clé étrangère vers Utilisateur (compte associé)
    utilisateur_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Utilisateurs',
        key: 'id_utilisateur'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    // Clé étrangère vers ServiceSante
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'ServicesSante',
        key: 'id_service'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    }
  }, {
    tableName: 'ProfessionnelsSante',
    timestamps: true,
    paranoid: true, // Active la suppression douce (soft delete)
    defaultScope: {
      where: { statut: 'actif' },
      attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'mot_de_passe'] }
    },
    scopes: {
      withInactifs: {
        where: {}
      },
      withSensitiveData: {
        attributes: { include: ['numero_licence', 'numero_adeli'] }
      },
      withPassword: {
        attributes: { include: ['mot_de_passe'] }
      },
      parService: (serviceId) => ({
        where: { service_id: serviceId }
      })
    },
    hooks: {
      beforeValidate: (professionnel) => {
        // Nettoyage des numéros de téléphone
        if (professionnel.telephone) {
          professionnel.telephone = professionnel.telephone.replace(/[^0-9+]/g, '');
        }
        if (professionnel.telephone_portable) {
          professionnel.telephone_portable = professionnel.telephone_portable.replace(/[^0-9+]/g, '');
        }
      },
      async beforeCreate(professionnel) {
        if (professionnel.mot_de_passe) {
          professionnel.mot_de_passe = await bcrypt.hash(professionnel.mot_de_passe, 12);
        }
      },
      async beforeUpdate(professionnel) {
        if (professionnel.changed('mot_de_passe')) {
          professionnel.mot_de_passe = await bcrypt.hash(professionnel.mot_de_passe, 12);
        }
      }
    }
  });

  // Méthode d'instance pour obtenir le nom complet
  ProfessionnelSante.prototype.getFullName = function() {
    return `${this.prenom} ${this.nom}`.trim();
  };

  // Méthode pour calculer l'ancienneté en années
  ProfessionnelSante.prototype.getAnciennete = function() {
    if (!this.date_embauche) return null;
    const today = new Date();
    const embauche = new Date(this.date_embauche);
    let annees = today.getFullYear() - embauche.getFullYear();
    const m = today.getMonth() - embauche.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < embauche.getDate())) {
      annees--;
    }
    return annees;
  };

  // Méthode de classe pour rechercher par nom/prénom
  ProfessionnelSante.findByName = async function(searchTerm) {
    return await this.findAll({
      where: {
        [Op.or]: [
          { nom: { [Op.iLike]: `%${searchTerm}%` } },
          { prenom: { [Op.iLike]: `%${searchTerm}%` } }
        ]
      },
      limit: 50
    });
  };

  return ProfessionnelSante;
};