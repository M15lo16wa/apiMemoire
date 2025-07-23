const { DataTypes, Op } = require('sequelize');

module.exports = (sequelize) => {
  const Patient = sequelize.define('Patient', {
    id_patient: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    numero_dossier: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    nom: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    prenom: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    date_naissance: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    lieu_naissance: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    sexe: {
      type: DataTypes.ENUM('M', 'F', 'X', 'I'),
      allowNull: false,
    },
    civilite: {
      type: DataTypes.ENUM('M.', 'Mme', 'Mlle', 'Dr', 'Pr'),
      allowNull: true,
    },
    numero_secu: {
      type: DataTypes.STRING(15),
      allowNull: true,
      unique: true,
    },
    adresse: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    complement_adresse: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    code_postal: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    ville: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    pays: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'France',
    },
    telephone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    telephone_secondaire: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
    mot_de_passe: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    profession: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    groupe_sanguin: {
      type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Inconnu'),
      allowNull: false,
      defaultValue: 'Inconnu',
    },
    poids: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    taille: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    photo: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    assure: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    nom_assurance: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    numero_assure: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    date_premiere_consultation: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    date_derniere_consultation: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    personne_contact: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    telephone_urgence: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    lien_parente: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // commentaires: {
    //   type: DataTypes.TEXT,
    //   allowNull: true,
    // },
    statut: {
      type: DataTypes.ENUM('actif', 'inactif', 'décédé'),
      defaultValue: 'actif',
      allowNull: false
    },
    mot_de_passe: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [8, 255]
      }
    },
    // La relation avec Utilisateur est gérée via createdBy et updatedBy
  }, {
    hooks: {
      beforeCreate: async (patient) => {
        if (!patient.numero_dossier) {
          // Générer un numéro de dossier unique basé sur la date et un nombre aléatoire
          const date = new Date();
          const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 chiffres aléatoires
          patient.numero_dossier = `PAT-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${randomNum}`;
        }
      }
    },
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
      },
      beforeCreate: async (patient) => {
        if (patient.mot_de_passe) {
          const bcrypt = require('bcryptjs');
          const salt = await bcrypt.genSalt(10);
          patient.mot_de_passe = await bcrypt.hash(patient.mot_de_passe, salt);
        }
      },
      beforeUpdate: async (patient) => {
        if (patient.changed('mot_de_passe')) {
          const bcrypt = require('bcryptjs');
          const salt = await bcrypt.genSalt(10);
          patient.mot_de_passe = await bcrypt.hash(patient.mot_de_passe, salt);
        }
      }
    }
  });

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