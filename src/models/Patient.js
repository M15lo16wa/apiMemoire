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
    sexe: {
      type: DataTypes.ENUM('M', 'F', 'X', 'I'),
      allowNull: false,
    },
    adresse: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    telephone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
    numero_dossier: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Numéro unique du dossier patient. Format recommandé: [ETABLISSEMENT]-[ANNEE]-[NUMERO] (ex: HOP-2023-0001)'
    },
    identifiantNational: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Identifiant national du patient (numéro sécurité sociale, etc.)'
    },
    numero_assure: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Numéro d\'assuré pour l\'authentification du patient'
    },
    nom_assurance: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Nom de la compagnie d\'assurance du patient'
    },
    mot_de_passe: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Mot de passe hashé du patient pour l\'authentification'
    },
    // =================================================================
    // === CHAMPS 2FA (AUTHENTIFICATION À DOUBLE FACTEUR) ===
    // =================================================================
    two_factor_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indique si l\'authentification à double facteur est activée'
    },
    two_factor_secret: {
      type: DataTypes.STRING(32),
      allowNull: true,
      comment: 'Secret TOTP pour l\'authentification 2FA (chiffré)'
    },
    two_factor_recovery_codes: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Codes de récupération 2FA (chiffrés)'
    },
    two_factor_backup_codes_used: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Codes de récupération 2FA déjà utilisés'
    },
    two_factor_last_used: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date de dernière utilisation du 2FA'
    }
    // Direct relationships from UML diagram
    // seConnecter() method will be implemented as instance method
    // creerCompte() method will be implemented as class method
    // gererAccesDossier() method will be implemented as instance method
  }, {
    tableName: 'Patients',
    timestamps: true,
    paranoid: true, // Active la suppression douce (soft delete)
    defaultScope: {
      attributes: { exclude: ['mot_de_passe'] }
    },
    scopes: {
      withSensitiveData: {
        attributes: { include: ['numero_securite_sociale', 'numero_assurance'] }
      },
      withPassword: {
        attributes: {}
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
    
    // if (dossiers.length === 0) return [];
    if (dossiers.length === 0) {
      return [];
    }
    
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
    
    if (dossiers.length === 0) {
      return [];
    }
    
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

  // UML Diagram Methods Implementation
  
  // seConnecter() method from UML diagram
  Patient.prototype.seConnecter = async function(motDePasse) {
    const bcrypt = require('bcryptjs');
    const isValid = await bcrypt.compare(motDePasse, this.mot_de_passe);
    
    if (isValid) {
      // Update derniere_connexion if field exists
      if (this.date_derniere_connexion !== undefined) {
        this.date_derniere_connexion = new Date();
        await this.save();
      }
      return true;
    }
    return false;
  };

  // creerCompte() class method from UML diagram
  Patient.creerCompte = async function(patientData) {
    const bcrypt = require('bcryptjs');
    
    // Generate unique numero_dossier if not provided
    if (!patientData.numero_dossier) {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      patientData.numero_dossier = `PAT-${timestamp}-${random}`;
    }
    
    // Hash password if provided
    if (patientData.mot_de_passe) {
      const salt = await bcrypt.genSalt(10);
      patientData.mot_de_passe = await bcrypt.hash(patientData.mot_de_passe, salt);
    }
    
    return await this.create(patientData);
  };

  // gererAccesDossier() method from UML diagram
  Patient.prototype.gererAccesDossier = async function(professionnelId, typeAcces = 'lecture') {
    const { AutorisationAcces, ProfessionnelSante } = this.sequelize.models;
    
    // Verify professional exists
    const professionnel = await ProfessionnelSante.findByPk(professionnelId);
    if (!professionnel) {
      throw new Error('Professionnel de santé non trouvé');
    }
    
    // Create access authorization
    const autorisation = await AutorisationAcces.create({
      patient_id: this.id_patient,
      professionnel_id: professionnelId,
      typeAcces: typeAcces,
      dateDebut: new Date(),
      statut: 'Actif',
      raison: `Autorisation d'accès ${typeAcces} accordée par le patient`
    });
    
    return autorisation;
  };

  // consulterDossier() method from UML diagram
  Patient.prototype.consulterDossier = async function() {
    const { DossierMedical } = this.sequelize.models;
    
    return await DossierMedical.findAll({
      where: { patient_id: this.id_patient },
      include: [
        {
          model: this.sequelize.models.ProfessionnelSante,
          as: 'medecinReferent'
        },
        {
          model: this.sequelize.models.ServiceSante,
          as: 'serviceResponsable'
        }
      ],
      order: [['dateCreation', 'DESC']]
    });
  };

  return Patient;
};