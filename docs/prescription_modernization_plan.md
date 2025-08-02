# Plan de Modernisation du CRUD Prescription

## 🔍 Analyse des Problèmes Identifiés

### Problèmes Critiques Détectés

1. **Incohérences dans le Service** :
   - Le service utilise encore des champs obsolètes (`medicament`) supprimés par la migration
   - Références à des champs inexistants dans les validations
   - Logique de création qui ne gère pas le `prescriptionNumber`

2. **Modèle Prescription** :
   - Champ `prescriptionNumber` requis mais pas généré automatiquement
   - Associations manquantes avec Patient dans le service
   - Pas de hooks Sequelize pour la génération automatique

3. **Contrôleur** :
   - Validation basée sur des champs supprimés
   - Gestion d'erreurs basique
   - Pas de différenciation claire entre ordonnances et demandes d'examen

4. **Routes et Validation** :
   - Règles de validation obsolètes
   - Documentation Swagger incohérente avec le modèle actuel

## 🚀 Plan de Modernisation Proposé

### 1. Service de Génération Automatique de Numéros (ORD-YYYY-XXXXXX)

```javascript
// src/utils/prescriptionUtils.js
const QRCode = require('qrcode');
const crypto = require('crypto');
const { Prescription } = require('../models');

class PrescriptionUtils {
  /**
   * Génère un numéro de prescription unique
   * Format: ORD-YYYY-XXXXXX ou EXA-YYYY-XXXXXX
   */
  static async generatePrescriptionNumber(type = 'ordonnance') {
    const year = new Date().getFullYear();
    const prefix = type === 'ordonnance' ? 'ORD' : 'EXA';
    
    // Trouver le dernier numéro de l'année
    const lastPrescription = await Prescription.findOne({
      where: {
        prescriptionNumber: {
          [Op.like]: `${prefix}-${year}-%`
        }
      },
      order: [['prescriptionNumber', 'DESC']]
    });
    
    let nextNumber = 1;
    if (lastPrescription) {
      const lastNumber = parseInt(lastPrescription.prescriptionNumber.split('-')[2]);
      nextNumber = lastNumber + 1;
    }
    
    return `${prefix}-${year}-${nextNumber.toString().padStart(6, '0')}`;
  }

  /**
   * Génère un QR Code pour la prescription
   */
  static async generateQRCode(prescriptionData) {
    const qrData = {
      id: prescriptionData.id_prescription,
      number: prescriptionData.prescriptionNumber,
      patient: prescriptionData.patient_id,
      professionnel: prescriptionData.professionnel_id,
      date: prescriptionData.date_prescription,
      hash: crypto.createHash('sha256')
        .update(`${prescriptionData.id_prescription}-${prescriptionData.prescriptionNumber}`)
        .digest('hex').substring(0, 16)
    };
    
    return await QRCode.toDataURL(JSON.stringify(qrData));
  }

  /**
   * Génère une signature électronique
   */
  static generateElectronicSignature(prescriptionData, professionnelData) {
    const signatureData = {
      prescription_id: prescriptionData.id_prescription,
      professionnel_id: professionnelData.id_professionnel,
      adeli: professionnelData.numero_adeli,
      timestamp: new Date().toISOString(),
      hash: crypto.createHash('sha256')
        .update(`${prescriptionData.id_prescription}-${professionnelData.numero_adeli}-${Date.now()}`)
        .digest('hex')
    };
    
    return Buffer.from(JSON.stringify(signatureData)).toString('base64');
  }
}

module.exports = PrescriptionUtils;
```

### 2. Modèle Prescription Modernisé avec Hooks

```javascript
// src/models/Prescription.js (version modernisée)
const { DataTypes } = require('sequelize');
const PrescriptionUtils = require('../utils/prescriptionUtils');

module.exports = (sequelize) => {
  const Prescription = sequelize.define('Prescription', {
    // ... champs existants ...
    
    // Nouveau champ pour différencier ordonnances et examens
    type_prescription: {
      type: DataTypes.ENUM('ordonnance', 'examen'),
      allowNull: false,
      defaultValue: 'ordonnance'
    },
    
    // Champs modernisés
    nom_commercial: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Nom commercial du médicament'
    },
    
    principe_actif: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Principe actif (DCI)'
    }
  }, {
    tableName: 'Prescriptions',
    timestamps: true,
    paranoid: true,
    
    // Hooks pour génération automatique
    hooks: {
      beforeCreate: async (prescription, options) => {
        // Génération automatique du numéro
        if (!prescription.prescriptionNumber) {
          prescription.prescriptionNumber = await PrescriptionUtils.generatePrescriptionNumber(
            prescription.type_prescription
          );
        }
        
        // Génération du QR Code
        if (!prescription.qrCode) {
          prescription.qrCode = await PrescriptionUtils.generateQRCode(prescription);
        }
      },
      
      afterCreate: async (prescription, options) => {
        // Log de création pour audit
        console.log(`Prescription créée: ${prescription.prescriptionNumber}`);
      }
    }
  });

  return Prescription;
};
```

### 3. Service Prescription Modernisé

```javascript
// src/modules/prescription/prescription.service.js (version modernisée)
const { Prescription, Patient, ProfessionnelSante, DossierMedical } = require('../../models');
const { Op } = require('sequelize');
const AppError = require('../../utils/appError');
const PrescriptionUtils = require('../../utils/prescriptionUtils');

class PrescriptionService {
  /**
   * Créer une nouvelle ordonnance avec génération automatique
   */
  static async createOrdonnance(prescriptionData, professionnelData) {
    try {
      // Validation des données requises
      const { patient_id, professionnel_id, principe_actif, dosage, frequence } = prescriptionData;
      
      if (!patient_id || !professionnel_id || !principe_actif || !dosage || !frequence) {
        throw new AppError('Données manquantes pour créer l\'ordonnance', 400);
      }

      // Vérifications d'existence
      const [patient, professionnel] = await Promise.all([
        Patient.findByPk(patient_id),
        ProfessionnelSante.findByPk(professionnel_id)
      ]);

      if (!patient) throw new AppError('Patient non trouvé', 404);
      if (!professionnel) throw new AppError('Professionnel de santé non trouvé', 404);

      // Génération de la signature électronique
      const signatureElectronique = PrescriptionUtils.generateElectronicSignature(
        prescriptionData, 
        professionnelData
      );

      // Création avec hooks automatiques
      const nouvelleOrdonnance = await Prescription.create({
        ...prescriptionData,
        type_prescription: 'ordonnance',
        statut: 'active',
        signatureElectronique
      });

      return await this.getPrescriptionById(nouvelleOrdonnance.id_prescription);
    } catch (error) {
      console.error('Erreur lors de la création de l\'ordonnance:', error);
      throw error;
    }
  }

  /**
   * Créer une demande d'examen avec génération automatique
   */
  static async createDemandeExamen(demandeData, professionnelData) {
    try {
      const { patient_id, professionnel_id, type_examen, parametres } = demandeData;
      
      if (!patient_id || !professionnel_id || !type_examen) {
        throw new AppError('Données manquantes pour créer la demande d\'examen', 400);
      }

      // Vérifications d'existence
      const [patient, professionnel] = await Promise.all([
        Patient.findByPk(patient_id),
        ProfessionnelSante.findByPk(professionnel_id)
      ]);

      if (!patient) throw new AppError('Patient non trouvé', 404);
      if (!professionnel) throw new AppError('Professionnel de santé non trouvé', 404);

      // Génération de la signature électronique
      const signatureElectronique = PrescriptionUtils.generateElectronicSignature(
        demandeData, 
        professionnelData
      );

      // Création avec hooks automatiques
      const nouvelleDemande = await Prescription.create({
        ...demandeData,
        type_prescription: 'examen',
        principe_actif: type_examen, // Utiliser ce champ pour le type d'examen
        dosage: parametres || 'Standard',
        frequence: demandeData.urgence || 'Normal',
        statut: 'en_attente',
        signatureElectronique
      });

      return await this.getPrescriptionById(nouvelleDemande.id_prescription);
    } catch (error) {
      console.error('Erreur lors de la création de la demande d\'examen:', error);
      throw error;
    }
  }

  /**
   * Récupérer une prescription avec toutes ses relations
   */
  static async getPrescriptionById(id) {
    try {
      const prescription = await Prescription.findByPk(id, {
        include: [
          {
            model: Patient,
            as: 'patient',
            attributes: ['id_patient', 'nom', 'prenom', 'date_naissance']
          },
          {
            model: ProfessionnelSante,
            as: 'redacteur',
            attributes: ['id_professionnel', 'numero_adeli', 'specialite'],
            include: [{
              model: require('../../models').Utilisateur,
              as: 'compteUtilisateur',
              attributes: ['nom', 'prenom']
            }]
          },
          {
            model: DossierMedical,
            as: 'dossier',
            attributes: ['id_dossier', 'numero_dossier']
          }
        ]
      });

      if (!prescription) {
        throw new AppError('Prescription non trouvée', 404);
      }

      return prescription;
    } catch (error) {
      console.error('Erreur lors de la récupération de la prescription:', error);
      throw error;
    }
  }

  /**
   * Recherche avancée de prescriptions
   */
  static async searchPrescriptions(filters = {}, pagination = {}) {
    try {
      const {
        patient_id,
        professionnel_id,
        statut,
        type_prescription,
        date_debut,
        date_fin,
        search_term
      } = filters;

      const { page = 1, limit = 10 } = pagination;
      const offset = (page - 1) * limit;

      const whereClause = {};
      
      if (patient_id) whereClause.patient_id = patient_id;
      if (professionnel_id) whereClause.professionnel_id = professionnel_id;
      if (statut) whereClause.statut = statut;
      if (type_prescription) whereClause.type_prescription = type_prescription;
      
      if (date_debut && date_fin) {
        whereClause.date_prescription = {
          [Op.between]: [date_debut, date_fin]
        };
      }

      if (search_term) {
        whereClause[Op.or] = [
          { prescriptionNumber: { [Op.like]: `%${search_term}%` } },
          { principe_actif: { [Op.like]: `%${search_term}%` } },
          { nom_commercial: { [Op.like]: `%${search_term}%` } }
        ];
      }

      const { count, rows } = await Prescription.findAndCountAll({
        where: whereClause,
        include: [
          { model: Patient, as: 'patient' },
          { model: ProfessionnelSante, as: 'redacteur' }
        ],
        order: [['date_prescription', 'DESC']],
        limit,
        offset
      });

      return {
        prescriptions: rows,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      console.error('Erreur lors de la recherche de prescriptions:', error);
      throw error;
    }
  }
}

module.exports = PrescriptionService;
```

### 4. Contrôleur Modernisé

```javascript
// src/modules/prescription/prescription.controller.js (version modernisée)
const PrescriptionService = require('./prescription.service');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const { validationResult } = require('express-validator');

class PrescriptionController {
  /**
   * Créer une nouvelle ordonnance
   */
  static createOrdonnance = catchAsync(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }

    const professionnel_id = req.user.id_professionnel;
    if (!professionnel_id) {
      return next(new AppError('Accès non autorisé. Connexion professionnel requise.', 401));
    }

    const ordonnanceData = {
      ...req.body,
      professionnel_id,
      createdBy: req.user.id
    };

    const nouvelleOrdonnance = await PrescriptionService.createOrdonnance(
      ordonnanceData,
      req.user
    );

    res.status(201).json({
      status: 'success',
      message: 'Ordonnance créée avec succès',
      data: {
        ordonnance: nouvelleOrdonnance
      }
    });
  });

  /**
   * Créer une demande d'examen
   */
  static createDemandeExamen = catchAsync(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }

    const professionnel_id = req.user.id_professionnel;
    if (!professionnel_id) {
      return next(new AppError('Accès non autorisé. Connexion professionnel requise.', 401));
    }

    const demandeData = {
      ...req.body,
      professionnel_id,
      createdBy: req.user.id
    };

    const nouvelleDemande = await PrescriptionService.createDemandeExamen(
      demandeData,
      req.user
    );

    res.status(201).json({
      status: 'success',
      message: 'Demande d\'examen créée avec succès',
      data: {
        demande: nouvelleDemande
      }
    });
  });

  /**
   * Recherche avancée de prescriptions
   */
  static searchPrescriptions = catchAsync(async (req, res, next) => {
    const filters = {
      patient_id: req.query.patient_id,
      professionnel_id: req.query.professionnel_id,
      statut: req.query.statut,
      type_prescription: req.query.type,
      date_debut: req.query.date_debut,
      date_fin: req.query.date_fin,
      search_term: req.query.search
    };

    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10
    };

    const result = await PrescriptionService.searchPrescriptions(filters, pagination);

    res.status(200).json({
      status: 'success',
      data: result
    });
  });
}

module.exports = PrescriptionController;
```

### 5. Validation Modernisée

```javascript
// src/modules/prescription/prescription.validators.js
const { body, query, param } = require('express-validator');

const ordonnanceValidationRules = [
  body('patient_id')
    .notEmpty()
    .withMessage('L\'ID du patient est requis')
    .isInt({ min: 1 })
    .withMessage('L\'ID du patient doit être un entier positif'),
    
  body('principe_actif')
    .notEmpty()
    .withMessage('Le principe actif est requis')
    .isLength({ min: 2, max: 255 })
    .withMessage('Le principe actif doit contenir entre 2 et 255 caractères'),
    
  body('nom_commercial')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Le nom commercial ne peut pas dépasser 255 caractères'),
    
  body('dosage')
    .notEmpty()
    .withMessage('Le dosage est requis')
    .isLength({ max: 100 })
    .withMessage('Le dosage ne peut pas dépasser 100 caractères'),
    
  body('frequence')
    .notEmpty()
    .withMessage('La fréquence est requise')
    .isLength({ max: 100 })
    .withMessage('La fréquence ne peut pas dépasser 100 caractères'),
    
  body('voie_administration')
    .optional()
    .isIn(['orale', 'cutanée', 'nasale', 'oculaire', 'auriculaire', 'vaginale', 'rectale', 'inhalée', 'injection', 'autre'])
    .withMessage('Voie d\'administration invalide'),
    
  body('renouvelable')
    .optional()
    .isBoolean()
    .withMessage('Le champ renouvelable doit être un booléen'),
    
  body('nb_renouvellements')
    .optional()
    .isInt({ min: 0, max: 12 })
    .withMessage('Le nombre de renouvellements doit être entre 0 et 12')
];

const demandeExamenValidationRules = [
  body('patient_id')
    .notEmpty()
    .withMessage('L\'ID du patient est requis')
    .isInt({ min: 1 })
    .withMessage('L\'ID du patient doit être un entier positif'),
    
  body('type_examen')
    .notEmpty()
    .withMessage('Le type d\'examen est requis')
    .isLength({ min: 2, max: 255 })
    .withMessage('Le type d\'examen doit contenir entre 2 et 255 caractères'),
    
  body('parametres')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Les paramètres ne peuvent pas dépasser 500 caractères'),
    
  body('urgence')
    .optional()
    .isIn(['urgent', 'normal', 'programmé'])
    .withMessage('Niveau d\'urgence invalide')
];

const searchValidationRules = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Le numéro de page doit être un entier positif'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être entre 1 et 100'),
    
  query('type')
    .optional()
    .isIn(['ordonnance', 'examen'])
    .withMessage('Type de prescription invalide'),
    
  query('statut')
    .optional()
    .isIn(['active', 'suspendue', 'terminee', 'annulee', 'en_attente'])
    .withMessage('Statut invalide')
];

module.exports = {
  ordonnanceValidationRules,
  demandeExamenValidationRules,
  searchValidationRules
};
```

## 🎯 Avantages de cette Modernisation

1. **Génération Automatique** : Numéros de prescription générés automatiquement au format ORD-YYYY-XXXXXX
2. **QR Code** : Génération automatique pour vérification et traçabilité
3. **Signature Électronique** : Authentification et non-répudiation
4. **Validation Robuste** : Validation complète des données d'entrée
5. **Recherche Avancée** : Filtres multiples et pagination
6. **Audit Trail** : Traçabilité complète des actions
7. **Performance** : Requêtes optimisées avec includes sélectifs
8. **Sécurité** : Validation stricte et gestion d'erreurs

## 📋 Étapes d'Implémentation

1. Créer les utilitaires de prescription
2. Modifier le modèle avec les hooks
3. Mettre à jour le service avec la nouvelle logique
4. Moderniser le contrôleur
5. Ajouter les nouvelles validations
6. Mettre à jour les routes
7. Tester l'ensemble du système

Cette modernisation résoudra tous les problèmes identifiés et apportera une base solide pour les évolutions futures.