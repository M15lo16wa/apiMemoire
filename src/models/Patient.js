const { DataTypes, Op } = require('sequelize');

module.exports = (sequelize) => {
  const Patient = sequelize.define('Patient', {
    id_patient: {
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
        len: [2, 50],
        is: /^[A-Za-zÀ-ÖØ-öø-ÿ\s\-']+$/
      }
    },
    prenom: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 50],
        is: /^[A-Za-zÀ-ÖØ-öø-ÿ\s\-']+$/
      }
    },
    date_naissance: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: true,
        isBefore: new Date().toISOString().split('T')[0],
        notEmpty: true
      }
    },
    lieu_naissance: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    sexe: {
      type: DataTypes.ENUM('M', 'F', 'Autre', 'Non précisé'),
      allowNull: false,
      defaultValue: 'Non précisé'
    },
    adresse: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: [0, 255]
      }
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
    telephone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: /^[0-9+()\- ]+$/,
        len: [8, 20]
      }
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
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 150
      }
    },
    numero_securite_sociale: {
      type: DataTypes.STRING(21),
      allowNull: true,
      unique: true,
      validate: {
        is: /^[0-9 ]+$/,
        len: [15, 21]
      }
    },
    groupe_sanguin: {
      type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Inconnu'),
      allowNull: false,
      defaultValue: 'Inconnu'
    },
    assurance_maladie: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    numero_assurance: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    personne_urgence_nom: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    personne_urgence_telephone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: /^[0-9+()\- ]+$/,
        len: [8, 20]
      }
    },
    personne_urgence_lien: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    profession: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    situation_familiale: {
      type: DataTypes.ENUM('Célibataire', 'Marié(e)', 'Pacsé(e)', 'Divorcé(e)', 'Veuf/Veuve', 'Union libre', 'Autre'),
      allowNull: true
    },
    nombre_enfants: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    commentaires: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    statut: {
      type: DataTypes.ENUM('actif', 'inactif', 'décédé'),
      defaultValue: 'actif',
      allowNull: false
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
    }
  }, {
    tableName: 'Patients',
    timestamps: true,
    paranoid: true, // Active la suppression douce (soft delete)
    defaultScope: {
      attributes: { exclude: ['numero_securite_sociale', 'numero_assurance'] }
    },
    scopes: {
      withSensitiveData: {
        attributes: { include: ['numero_securite_sociale', 'numero_assurance'] }
      },
      actifs: {
        where: { statut: 'actif' }
      },
      inactifs: {
        where: { statut: 'inactif' }
      }
    },
    hooks: {
      beforeValidate: (patient) => {
        // Nettoyage des numéros de téléphone
        if (patient.telephone) {
          patient.telephone = patient.telephone.replace(/[^0-9+]/g, '');
        }
        if (patient.personne_urgence_telephone) {
          patient.personne_urgence_telephone = patient.personne_urgence_telephone.replace(/[^0-9+]/g, '');
        }
        
        // Nettoyage du numéro de sécurité sociale
        if (patient.numero_securite_sociale) {
          patient.numero_securite_sociale = patient.numero_securite_sociale.replace(/\s+/g, '');
        }
      }
    }
  });

  // Méthode d'instance pour obtenir l'âge du patient
  Patient.prototype.getAge = function() {
    if (!this.date_naissance) return null;
    const today = new Date();
    const birthDate = new Date(this.date_naissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Méthode d'instance pour obtenir le nom complet
  Patient.prototype.getFullName = function() {
    return `${this.prenom} ${this.nom}`.trim();
  };

  // Méthode de classe pour rechercher par nom/prénom
  Patient.findByName = async function(searchTerm) {
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

  // Méthode pour récupérer toutes les prescriptions du patient
  Patient.prototype.getPrescriptions = async function(options = {}) {
    const { DossierMedical, Prescription } = this.sequelize.models;
    
    // Récupérer les IDs des dossiers du patient
    const dossiers = await DossierMedical.findAll({
      where: { patient_id: this.id_patient },
      attributes: ['id_dossier'],
      raw: true
    });
    
    if (dossiers.length === 0) return [];
    
    const dossierIds = dossiers.map(d => d.id_dossier);
    
    // Récupérer les prescriptions pour ces dossiers
    return await Prescription.findAll({
      where: {
        dossier_id: { [Op.in]: dossierIds }
      },
      include: [
        {
          model: this.sequelize.models.ProfessionnelSante,
          as: 'redacteur',
          include: [
            { 
              model: this.sequelize.models.Utilisateur,
              attributes: ['nom', 'prenom']
            }
          ]
        }
      ],
      order: [['date_prescription', 'DESC']],
      ...options
    });
  };

  // Méthode pour récupérer tous les examens de laboratoire du patient
  Patient.prototype.getExamensLabo = async function(options = {}) {
    const { DossierMedical, ExamenLabo } = this.sequelize.models;
    
    // Récupérer les IDs des dossiers du patient
    const dossiers = await DossierMedical.findAll({
      where: { patient_id: this.id_patient },
      attributes: ['id_dossier'],
      raw: true
    });
    
    if (dossiers.length === 0) return [];
    
    const dossierIds = dossiers.map(d => d.id_dossier);
    
    // Récupérer les examens pour ces dossiers
    return await ExamenLabo.findAll({
      where: {
        dossier_id: { [Op.in]: dossierIds }
      },
      include: [
        {
          model: this.sequelize.models.ProfessionnelSante,
          as: 'prescripteur',
          include: [
            { 
              model: this.sequelize.models.Utilisateur,
              attributes: ['nom', 'prenom']
            }
          ]
        },
        {
          model: this.sequelize.models.ServiceSante,
          attributes: ['nom', 'type_service']
        }
      ],
      order: [['date_prelevement', 'DESC']],
      ...options
    });
  };

  return Patient;
};