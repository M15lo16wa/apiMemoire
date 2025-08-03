# Guide de Démarrage Rapide - DMP Fonctionnel

## 🚀 Démarrage Immédiat

### 1. Vérifier l'état actuel
```bash
# Tester les endpoints DMP existants
node test-dmp-synchronisation.js
```

### 2. Implémenter les modèles manquants

#### Créer les migrations pour les nouvelles tables :

```bash
# Générer les migrations
npx sequelize-cli migration:generate --name create-auto-mesures-table
npx sequelize-cli migration:generate --name create-documents-personnels-table
npx sequelize-cli migration:generate --name create-messages-table
npx sequelize-cli migration:generate --name create-rappels-table
```

#### Migration Auto-mesures :
```javascript
// migrations/YYYYMMDDHHMMSS-create-auto-mesures-table.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('auto_mesures', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      patient_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Patients',
          key: 'id_patient'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type_mesure: {
        type: Sequelize.ENUM('poids', 'taille', 'tension_arterielle', 'glycemie', 'temperature', 'saturation'),
        allowNull: false
      },
      valeur: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      valeur_secondaire: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      unite: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      unite_secondaire: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      date_mesure: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      heure_mesure: {
        type: Sequelize.TIME,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('auto_mesures');
  }
};
```

### 3. Ajouter les modèles manquants

#### Créer `src/models/AutoMesure.js` :
```javascript
module.exports = (sequelize, DataTypes) => {
  const AutoMesure = sequelize.define('AutoMesure', {
    id: {
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
    type_mesure: {
      type: DataTypes.ENUM('poids', 'taille', 'tension_arterielle', 'glycemie', 'temperature', 'saturation'),
      allowNull: false
    },
    valeur: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    valeur_secondaire: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    unite: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    unite_secondaire: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    date_mesure: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    heure_mesure: {
      type: DataTypes.TIME,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'auto_mesures',
    timestamps: true
  });

  AutoMesure.associate = (models) => {
    AutoMesure.belongsTo(models.Patient, {
      foreignKey: 'patient_id',
      as: 'patient'
    });
  };

  return AutoMesure;
};
```

### 4. Compléter le service DMP

#### Ajouter dans `src/modules/patient/dmp.service.js` :

```javascript
// Gestion des auto-mesures
static async getAutoMesures(patientId, filters = {}) {
  try {
    const { type_mesure, date_debut, date_fin, limit = 20, offset = 0 } = filters;

    const whereClause = { patient_id: patientId };
    
    if (type_mesure) {
      whereClause.type_mesure = type_mesure;
    }
    
    if (date_debut && date_fin) {
      whereClause.date_mesure = {
        [Op.between]: [date_debut, date_fin]
      };
    }

    const autoMesures = await AutoMesure.findAll({
      where: whereClause,
      order: [['date_mesure', 'DESC']],
      limit,
      offset,
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['nom', 'prenom']
        }
      ]
    });

    return autoMesures;
  } catch (error) {
    console.error('Erreur lors de la récupération des auto-mesures:', error);
    throw error;
  }
}

static async ajouterAutoMesure(patientId, mesureData) {
  try {
    const mesure = await AutoMesure.create({
      patient_id: patientId,
      ...mesureData,
      date_mesure: new Date()
    });

    return {
      message: 'Auto-mesure ajoutée avec succès',
      mesure
    };
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'auto-mesure:', error);
    throw error;
  }
}

static async updateAutoMesure(patientId, mesureId, mesureData) {
  try {
    const mesure = await AutoMesure.findOne({
      where: { id: mesureId, patient_id: patientId }
    });

    if (!mesure) {
      throw new AppError('Auto-mesure non trouvée', 404);
    }

    await mesure.update(mesureData);

    return {
      message: 'Auto-mesure mise à jour avec succès',
      mesure
    };
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'auto-mesure:', error);
    throw error;
  }
}

static async deleteAutoMesure(patientId, mesureId) {
  try {
    const mesure = await AutoMesure.findOne({
      where: { id: mesureId, patient_id: patientId }
    });

    if (!mesure) {
      throw new AppError('Auto-mesure non trouvée', 404);
    }

    await mesure.destroy();

    return {
      message: 'Auto-mesure supprimée avec succès'
    };
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'auto-mesure:', error);
    throw error;
  }
}
```

### 5. Ajouter les routes manquantes

#### Ajouter dans `src/modules/patient/dmp.route.js` :

```javascript
// Routes pour auto-mesures
router.get('/auto-mesures', DMPController.getAutoMesures);
router.post('/auto-mesures', DMPController.ajouterAutoMesure);
router.put('/auto-mesures/:id', DMPController.updateAutoMesure);
router.delete('/auto-mesures/:id', DMPController.deleteAutoMesure);

// Routes pour documents
router.get('/documents', DMPController.getDocumentsPersonnels);
router.post('/documents', upload.single('document'), DMPController.uploadDocumentPersonnel);
router.delete('/documents/:id', DMPController.deleteDocumentPersonnel);

// Routes pour messages
router.get('/messages', DMPController.getMessages);
router.post('/messages', DMPController.envoyerMessage);
router.delete('/messages/:id', DMPController.deleteMessage);

// Routes pour rappels
router.get('/rappels', DMPController.getRappels);
router.post('/rappels', DMPController.creerRappel);
router.put('/rappels/:id', DMPController.updateRappel);
router.delete('/rappels/:id', DMPController.deleteRappel);
```

### 6. Ajouter les contrôleurs manquants

#### Ajouter dans `src/modules/patient/dmp.controller.js` :

```javascript
/**
 * Récupère les auto-mesures du patient
 */
static getAutoMesures = catchAsync(async (req, res, next) => {
  const patientId = req.patient.id_patient;
  const filters = {
    type_mesure: req.query.type_mesure,
    date_debut: req.query.date_debut,
    date_fin: req.query.date_fin,
    limit: parseInt(req.query.limit) || 20,
    offset: parseInt(req.query.offset) || 0
  };

  const autoMesures = await DMPService.getAutoMesures(patientId, filters);
  
  res.status(200).json({
    status: 'success',
    data: {
      auto_mesures: autoMesures
    }
  });
});

/**
 * Met à jour une auto-mesure
 */
static updateAutoMesure = catchAsync(async (req, res, next) => {
  const patientId = req.patient.id_patient;
  const mesureId = req.params.id;
  const mesureData = req.body;

  const result = await DMPService.updateAutoMesure(patientId, mesureId, mesureData);
  
  res.status(200).json({
    status: 'success',
    message: result.message,
    data: {
      mesure: result.mesure
    }
  });
});

/**
 * Supprime une auto-mesure
 */
static deleteAutoMesure = catchAsync(async (req, res, next) => {
  const patientId = req.patient.id_patient;
  const mesureId = req.params.id;

  const result = await DMPService.deleteAutoMesure(patientId, mesureId);
  
  res.status(200).json({
    status: 'success',
    message: result.message
  });
});
```

### 7. Exécuter les migrations

```bash
# Exécuter les migrations
npx sequelize-cli db:migrate

# Vérifier que les tables sont créées
npx sequelize-cli db:migrate:status
```

### 8. Tester les nouvelles fonctionnalités

```bash
# Tester les nouveaux endpoints
node test-dmp-synchronisation.js
```

## 🎯 Checklist de Démarrage Rapide

### Backend (1-2 heures)
- [ ] Créer les migrations pour les nouvelles tables
- [ ] Ajouter les modèles manquants
- [ ] Compléter le service DMP avec les nouvelles méthodes
- [ ] Ajouter les routes manquantes
- [ ] Ajouter les contrôleurs manquants
- [ ] Exécuter les migrations
- [ ] Tester les nouveaux endpoints

### Frontend (2-3 heures)
- [ ] Créer le hook `useDMP`
- [ ] Créer le contexte `DMPContext`
- [ ] Développer les composants DMP de base
- [ ] Implémenter la gestion d'état
- [ ] Ajouter la gestion des erreurs

### Tests (30 minutes)
- [ ] Tester tous les endpoints DMP
- [ ] Vérifier la synchronisation frontend-backend
- [ ] Tester les fonctionnalités CRUD

## 🚀 Commandes de Démarrage

```bash
# 1. Vérifier l'état actuel
node test-dmp-synchronisation.js

# 2. Créer les migrations
npx sequelize-cli migration:generate --name create-auto-mesures-table
npx sequelize-cli migration:generate --name create-documents-personnels-table
npx sequelize-cli migration:generate --name create-messages-table
npx sequelize-cli migration:generate --name create-rappels-table

# 3. Éditer les migrations avec le contenu fourni

# 4. Exécuter les migrations
npx sequelize-cli db:migrate

# 5. Redémarrer le serveur
npm start

# 6. Tester les nouvelles fonctionnalités
node test-dmp-synchronisation.js
```

## 📊 Métriques de Succès

### Fonctionnalités Implémentées
- [ ] Auto-mesures (CRUD complet)
- [ ] Documents personnels (upload/download)
- [ ] Messages sécurisés
- [ ] Rappels et notifications
- [ ] Statistiques DMP
- [ ] Fiche d'urgence avec QR Code

### Performance
- [ ] Temps de réponse < 2 secondes
- [ ] Cache efficace
- [ ] Gestion d'erreur robuste

### Sécurité
- [ ] Authentification JWT
- [ ] Validation des données
- [ ] Contrôle d'accès granulaire

## 🔧 Dépannage Rapide

### Erreurs Courantes

#### 1. Migration échoue
```bash
# Vérifier la syntaxe SQL
npx sequelize-cli db:migrate:status

# Annuler et refaire
npx sequelize-cli db:migrate:undo
npx sequelize-cli db:migrate
```

#### 2. Modèle non trouvé
```javascript
// Vérifier l'import dans models/index.js
const AutoMesure = require('./AutoMesure');
// ...
db.AutoMesure = AutoMesure(sequelize, Sequelize.DataTypes);
```

#### 3. Route non trouvée
```javascript
// Vérifier l'import dans routes/api.js
const dmpRoutes = require('../modules/patient/dmp.route');
router.use('/patient/dmp', dmpRoutes);
```

#### 4. Erreur CORS
```javascript
// Ajouter dans app.js
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));
```

## 🎉 Prochaines Étapes

1. **Implémenter les modèles manquants** (Document, Message, Rappel)
2. **Compléter les services** avec toutes les fonctionnalités
3. **Développer l'interface utilisateur** avec React/Ant Design
4. **Tester exhaustivement** toutes les fonctionnalités
5. **Optimiser les performances** et la sécurité

Ce guide vous permet de démarrer rapidement et d'avoir une base fonctionnelle en quelques heures ! 