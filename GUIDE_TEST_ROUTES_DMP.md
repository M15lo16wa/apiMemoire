# Guide de Test des Routes DMP

## 🎯 Objectif
Vérifier que toutes les nouvelles routes DMP sont fonctionnelles et accessibles via l'API.

## ✅ Configuration Vérifiée

### 📁 Fichiers Présents
- ✅ `src/modules/patient/dmp.route.js` - Routes DMP
- ✅ `src/modules/patient/dmp.controller.js` - Contrôleurs DMP
- ✅ `src/modules/patient/dmp.service.js` - Service DMP
- ✅ `src/modules/patient/patient.route.js` - Routes patient (inclut DMP)
- ✅ `src/routes/api.js` - Routes API principales

### 🔗 Structure des Routes
```
/api/patient/dmp/[endpoint]
```

## 🚀 Étapes de Test

### 1. **Démarrer le Serveur**
```bash
npm start
```

### 2. **Authentification Patient**
```bash
# Login patient
curl -X POST "http://localhost:3000/api/auth/login-patient" \
  -H "Content-Type: application/json" \
  -d '{
    "numero_assure": "VOTRE_NUMERO",
    "mot_de_passe": "VOTRE_MOT_DE_PASSE"
  }'
```

### 3. **Tester les Routes DMP**

#### **Auto-mesures**
```bash
# Récupérer les auto-mesures
curl -X GET "http://localhost:3000/api/patient/dmp/auto-mesures" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Ajouter une auto-mesure
curl -X POST "http://localhost:3000/api/patient/dmp/auto-mesures" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type_mesure": "poids",
    "valeur": 75.5,
    "unite": "kg",
    "notes": "Mesure du matin"
  }'

# Modifier une auto-mesure
curl -X PUT "http://localhost:3000/api/patient/dmp/auto-mesures/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "valeur": 76.0,
    "notes": "Mesure corrigée"
  }'

# Supprimer une auto-mesure
curl -X DELETE "http://localhost:3000/api/patient/dmp/auto-mesures/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### **Documents Personnels**
```bash
# Récupérer les documents
curl -X GET "http://localhost:3000/api/patient/dmp/documents" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Uploader un document
curl -X POST "http://localhost:3000/api/patient/dmp/documents" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Ordonnance cardiologue",
    "type": "ordonnance",
    "description": "Ordonnance du Dr Martin",
    "url": "/uploads/ordonnance.pdf",
    "taille": 1024000,
    "format": "pdf"
  }'

# Supprimer un document
curl -X DELETE "http://localhost:3000/api/patient/dmp/documents/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### **Messages**
```bash
# Récupérer les messages
curl -X GET "http://localhost:3000/api/patient/dmp/messages" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Envoyer un message
curl -X POST "http://localhost:3000/api/patient/dmp/messages" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "professionnel_id": 1,
    "sujet": "Question sur mon traitement",
    "contenu": "Bonjour, j\'ai une question concernant mon traitement..."
  }'

# Supprimer un message
curl -X DELETE "http://localhost:3000/api/patient/dmp/messages/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### **Rappels**
```bash
# Récupérer les rappels
curl -X GET "http://localhost:3000/api/patient/dmp/rappels" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Créer un rappel
curl -X POST "http://localhost:3000/api/patient/dmp/rappels" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "medicament",
    "titre": "Prise de médicament",
    "description": "N\'oubliez pas de prendre votre médicament",
    "date_rappel": "2024-01-15T08:00:00Z",
    "priorite": "haute"
  }'

# Modifier un rappel
curl -X PUT "http://localhost:3000/api/patient/dmp/rappels/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titre": "Prise de médicament - URGENT",
    "priorite": "haute"
  }'

# Supprimer un rappel
curl -X DELETE "http://localhost:3000/api/patient/dmp/rappels/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### **Routes Existantes**
```bash
# Tableau de bord
curl -X GET "http://localhost:3000/api/patient/dmp/tableau-de-bord" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Historique médical
curl -X GET "http://localhost:3000/api/patient/dmp/historique-medical" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Journal d'activité
curl -X GET "http://localhost:3000/api/patient/dmp/journal-activite" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Droits d'accès
curl -X GET "http://localhost:3000/api/patient/dmp/droits-acces" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Fiche d'urgence
curl -X GET "http://localhost:3000/api/patient/dmp/fiche-urgence" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Statistiques
curl -X GET "http://localhost:3000/api/patient/dmp/statistiques" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 Routes DMP Disponibles

### **Nouvelles Routes (26 routes)**
- ✅ `GET /auto-mesures` - Récupérer les auto-mesures
- ✅ `POST /auto-mesures` - Ajouter une auto-mesure
- ✅ `PUT /auto-mesures/:id` - Modifier une auto-mesure
- ✅ `DELETE /auto-mesures/:id` - Supprimer une auto-mesure
- ✅ `GET /documents` - Récupérer les documents
- ✅ `POST /documents` - Uploader un document
- ✅ `DELETE /documents/:id` - Supprimer un document
- ✅ `GET /messages` - Récupérer les messages
- ✅ `POST /messages` - Envoyer un message
- ✅ `DELETE /messages/:id` - Supprimer un message
- ✅ `GET /rappels` - Récupérer les rappels
- ✅ `POST /rappels` - Créer un rappel
- ✅ `PUT /rappels/:id` - Modifier un rappel
- ✅ `DELETE /rappels/:id` - Supprimer un rappel

### **Routes Existantes**
- ✅ `GET /tableau-de-bord` - Tableau de bord
- ✅ `GET /historique-medical` - Historique médical
- ✅ `GET /journal-activite` - Journal d'activité
- ✅ `GET /droits-acces` - Droits d'accès
- ✅ `POST /autoriser-acces` - Autoriser l'accès
- ✅ `DELETE /revoquer-acces/:professionnel_id` - Révoquer l'accès
- ✅ `GET /fiche-urgence` - Fiche d'urgence
- ✅ `GET /rendez-vous` - Rendez-vous
- ✅ `GET /bibliotheque-sante` - Bibliothèque santé
- ✅ `GET /statistiques` - Statistiques

## 🔧 Test avec Postman

### **Collection Postman**
1. Importez les URLs dans Postman
2. Configurez l'environnement avec votre token
3. Testez chaque endpoint

### **Variables d'Environnement**
```
BASE_URL: http://localhost:3000/api
TOKEN: YOUR_JWT_TOKEN
```

## 🐛 Dépannage

### **Erreur 401 (Non authentifié)**
- Vérifiez que vous êtes connecté en tant que patient
- Vérifiez que le token JWT est valide
- Vérifiez l'en-tête Authorization

### **Erreur 404 (Route non trouvée)**
- Vérifiez que le serveur est démarré
- Vérifiez l'URL de la route
- Vérifiez que les routes sont bien incluses

### **Erreur 500 (Erreur serveur)**
- Vérifiez les logs du serveur
- Vérifiez que la base de données est accessible
- Vérifiez que les modèles sont bien définis

## ✅ Checklist de Test

- [ ] Serveur démarré (`npm start`)
- [ ] Authentification patient réussie
- [ ] Token JWT obtenu
- [ ] Test des auto-mesures (CRUD)
- [ ] Test des documents (CRUD)
- [ ] Test des messages (CRUD)
- [ ] Test des rappels (CRUD)
- [ ] Test des routes existantes
- [ ] Vérification des réponses JSON
- [ ] Vérification des codes de statut HTTP

## 🎉 Résultat Attendu

Toutes les routes DMP doivent être accessibles et fonctionnelles. Les réponses doivent être au format JSON avec les codes de statut appropriés (200, 201, 400, 401, 404, 500).

**Les nouvelles fonctionnalités DMP sont maintenant complètement intégrées à l'API !** 🚀 