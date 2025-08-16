# 📊 Module Auto-Mesures - Documentation Complète

## 🎯 **Vue d'ensemble**

Le module **Auto-Mesures** permet aux patients de gérer leurs mesures médicales personnelles (poids, taille, tension artérielle, glycémie, température, saturation en oxygène). Il offre une API complète avec authentification, validation des données et gestion des autorisations.

## 🏗️ **Architecture du Module**

```
src/modules/patient/
├── autoMesure.service.js      # Logique métier et accès aux données
├── autoMesure.controller.js   # Gestion des requêtes HTTP
├── autoMesure.route.js        # Définition des routes API
├── autoMesure.swagger.js      # Documentation Swagger
└── index.js                   # Export du module
```

## 🔧 **Fonctionnalités**

### **Types de Mesures Supportés**
- **Poids** : Mesure du poids corporel
- **Taille** : Mesure de la taille
- **Tension artérielle** : Pression systolique et diastolique
- **Glycémie** : Niveau de sucre dans le sang
- **Température** : Température corporelle
- **Saturation** : Saturation en oxygène

### **Opérations CRUD**
- ✅ **Créer** : Ajouter une nouvelle auto-mesure
- 📖 **Lire** : Récupérer une ou plusieurs auto-mesures
- 🔄 **Mettre à jour** : Modifier une auto-mesure existante
- 🗑️ **Supprimer** : Supprimer une auto-mesure

### **Fonctionnalités Avancées**
- 🔍 **Filtrage** : Par patient, type de mesure, dates, valeurs
- 📊 **Statistiques** : Moyennes, min/max, nombre de mesures
- ⏰ **Historique** : Dernière mesure par type
- 🔐 **Sécurité** : Authentification et autorisation par patient

## 🚀 **Installation et Configuration**

### **1. Dépendances Requises**
```bash
npm install express-validator sequelize
```

### **2. Intégration dans l'Application**
```javascript
// Dans src/app.js ou votre fichier principal
const { autoMesureRoutes } = require('./modules/patient');

// Monter les routes
app.use('/api/patient', autoMesureRoutes);
```

### **3. Configuration Swagger**
```javascript
// Dans votre configuration Swagger
const autoMesureSwagger = require('./modules/patient/autoMesure.swagger');

// Ajouter à votre configuration
swaggerOptions.definition.paths = {
    ...swaggerOptions.definition.paths,
    ...autoMesureSwagger.paths
};
```

## 📡 **API Endpoints**

### **Routes Principales**

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/patient/auto-mesures` | Créer une nouvelle auto-mesure |
| `GET` | `/api/patient/auto-mesures` | Récupérer toutes les auto-mesures |
| `GET` | `/api/patient/auto-mesures/:id` | Récupérer une auto-mesure par ID |
| `PUT` | `/api/patient/auto-mesures/:id` | Mettre à jour une auto-mesure |
| `DELETE` | `/api/patient/auto-mesures/:id` | Supprimer une auto-mesure |

### **Routes Spécifiques au Patient**

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/patient/:patient_id/auto-mesures` | Auto-mesures d'un patient spécifique |
| `GET` | `/api/patient/:patient_id/auto-mesures/stats` | Statistiques des auto-mesures |
| `GET` | `/api/patient/:patient_id/auto-mesures/last/:type_mesure` | Dernière mesure par type |

## 📋 **Modèles de Données**

### **Création d'Auto-Mesure**
```json
{
  "type_mesure": "glycemie",
  "valeur": 95.0,
  "valeur_secondaire": null,
  "unite": "mg/dL",
  "unite_secondaire": null,
  "date_mesure": "2025-08-16T10:00:00.000Z",
  "heure_mesure": "10:00:00",
  "notes": "Mesure à jeun"
}
```

### **Réponse de Création**
```json
{
  "status": "success",
  "message": "Auto-mesure créée avec succès",
  "data": {
    "id": 1,
    "patient_id": 123,
    "type_mesure": "glycemie",
    "valeur": 95.0,
    "unite": "mg/dL",
    "notes": "Mesure à jeun",
    "createdAt": "2025-08-16T10:00:00.000Z",
    "updatedAt": "2025-08-16T10:00:00.000Z"
  }
}
```

## 🔐 **Sécurité et Authentification**

### **Middleware Requis**
- `authenticateToken` : Vérification du token JWT
- `handleValidationErrors` : Validation des données d'entrée

### **Autorisations**
- **Patients** : Accès uniquement à leurs propres auto-mesures
- **Professionnels de santé** : Accès aux auto-mesures des patients autorisés

### **Validation des Données**
- Vérification des types de mesure autorisés
- Validation des valeurs numériques
- Contrôle de la longueur des champs texte
- Validation des formats de date et heure

## 🧪 **Tests et Validation**

### **Script de Test**
```bash
# Définir le token de test
export TEST_TOKEN="your_actual_token"

# Exécuter tous les tests
node test_auto_mesures.js

# Ou tester des fonctions spécifiques
node -e "
const { testCreateAutoMesure } = require('./test_auto_mesures');
testCreateAutoMesure();
"
```

### **Tests Disponibles**
- ✅ Création d'auto-mesure
- ✅ Récupération par ID
- ✅ Récupération de toutes les mesures
- ✅ Mise à jour
- ✅ Suppression
- ✅ Récupération par patient
- ✅ Statistiques
- ✅ Dernière mesure par type

## 📊 **Exemples d'Utilisation**

### **1. Créer une Mesure de Glycémie**
```javascript
const response = await axios.post('/api/patient/auto-mesures', {
    type_mesure: 'glycemie',
    valeur: 95.0,
    unite: 'mg/dL',
    notes: 'Mesure à jeun'
}, {
    headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
    }
});
```

### **2. Récupérer les Mesures d'un Patient**
```javascript
const response = await axios.get('/api/patient/123/auto-mesures', {
    headers: { 'Authorization': 'Bearer ' + token }
});
```

### **3. Obtenir les Statistiques**
```javascript
const response = await axios.get('/api/patient/123/auto-mesures/stats?type_mesure=glycemie', {
    headers: { 'Authorization': 'Bearer ' + token }
});
```

## 🚨 **Gestion des Erreurs**

### **Codes d'Erreur Communs**
- `400` : Données invalides ou validation échouée
- `401` : Token d'authentification manquant ou invalide
- `403` : Accès non autorisé à la ressource
- `404` : Auto-mesure non trouvée
- `500` : Erreur serveur interne

### **Exemple d'Erreur**
```json
{
  "status": "error",
  "message": "Données de validation invalides",
  "errors": [
    {
      "field": "type_mesure",
      "message": "Type de mesure invalide"
    }
  ]
}
```

## 🔧 **Configuration et Personnalisation**

### **Variables d'Environnement**
```bash
# Configuration de la base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medical_db
DB_USER=username
DB_PASSWORD=password

# Configuration de l'API
API_PORT=3001
JWT_SECRET=your_jwt_secret
```

### **Personnalisation des Types de Mesure**
Pour ajouter de nouveaux types de mesure, modifiez :
1. Le modèle `AutoMesure.js`
2. Les règles de validation dans `autoMesure.route.js`
3. La documentation Swagger dans `autoMesure.swagger.js`

## 📚 **Documentation Swagger**

Le module inclut une documentation Swagger complète accessible via :
- **URL** : `/api-docs` (si configuré)
- **Fichier** : `src/modules/patient/autoMesure.swagger.js`

### **Schémas Documentés**
- `AutoMesure` : Modèle complet d'auto-mesure
- `AutoMesureCreate` : Données de création
- `AutoMesureUpdate` : Données de mise à jour
- `AutoMesureStats` : Statistiques des mesures

## 🚀 **Déploiement**

### **1. Vérification Pré-Déploiement**
```bash
# Tester la connexion à la base de données
node -e "require('./src/config/database').testConnection()"

# Vérifier les migrations
npx sequelize-cli db:migrate:status

# Exécuter les tests
npm test
```

### **2. Variables de Production**
```bash
NODE_ENV=production
DB_HOST=production_db_host
JWT_SECRET=strong_production_secret
LOG_LEVEL=info
```

## 🤝 **Contribution et Maintenance**

### **Structure des Fichiers**
- **Service** : Logique métier et accès aux données
- **Contrôleur** : Gestion des requêtes HTTP
- **Routes** : Définition des endpoints
- **Swagger** : Documentation de l'API
- **Tests** : Validation du fonctionnement

### **Bonnes Pratiques**
- Toujours valider les données d'entrée
- Gérer les erreurs de manière appropriée
- Maintenir la cohérence des réponses API
- Documenter les nouvelles fonctionnalités
- Ajouter des tests pour les nouvelles fonctionnalités

## 📞 **Support et Contact**

Pour toute question ou problème :
1. Consultez la documentation Swagger
2. Exécutez les tests de validation
3. Vérifiez les logs de l'application
4. Consultez la documentation de la base de données

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2025-08-16  
**Auteur** : Équipe de développement API Mémoire
