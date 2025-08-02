# Documentation du Module Patient

## 📋 Vue d'ensemble

Le module Patient gère l'ensemble des opérations CRUD (Create, Read, Update, Delete) pour les patients, ainsi que l'authentification spécifique aux patients. Il implémente un système de gestion des dossiers patients avec contrôle d'accès granulaire et authentification par numéro d'assuré.

## 🏗️ Architecture du Module

### Structure des Fichiers
```
src/modules/patient/
├── patient.service.js      # Logique métier et opérations CRUD
├── patient.controller.js    # Gestion des requêtes HTTP
├── patient.route.js        # Définition des routes API
├── patient.auth.service.js # Service d'authentification patient
├── dmp.service.js          # Service pour les fonctionnalités DMP
├── dmp.controller.js       # Contrôleur pour les endpoints DMP
└── dmp.route.js           # Routes DMP avec documentation Swagger
```

## 🔧 Fonctionnalités Implémentées

### 1. Service Patient (`patient.service.js`)

#### Fonctionnalités Principales

##### `generateNumeroDossier()`
- **Objectif** : Génère automatiquement un numéro de dossier unique
- **Format** : `PAT{ANNÉE}{NUMÉRO_SÉQUENTIEL}` (ex: PAT20240001)
- **Logique** : Compte le nombre total de patients + 1, formaté sur 4 chiffres

##### `getAllPatients()`
- **Objectif** : Récupère tous les patients de la base de données
- **Retour** : Liste complète des patients
- **Utilisation** : Réservé aux professionnels de santé

##### `getPatientById(id)`
- **Objectif** : Récupère un patient spécifique par son ID
- **Validation** : Vérifie l'existence du patient
- **Erreur** : 404 si patient non trouvé

##### `createPatient(patientData)`
- **Objectif** : Crée un nouveau patient avec validation complète
- **Validations** :
  - Rejet explicite du champ `role` (non autorisé)
  - Vérification des champs requis
  - Contrôle d'unicité email
  - Contrôle d'unicité numéro d'assuré
  - Contrôle d'unicité identifiant national (optionnel)
- **Champs Requis** : `nom`, `prenom`, `date_naissance`, `sexe`, `email`, `telephone`, `numero_assure`, `nom_assurance`, `mot_de_passe`
- **Sécurité** : Support des champs `mot_de_passe` et `password`

##### `updatePatient(id, patientData)`
- **Objectif** : Met à jour les informations d'un patient
- **Sécurité** : Empêche la modification des champs sensibles (`role`, `id_patient`)
- **Validation** : Vérifie l'unicité de l'email si modifié
- **Contrôle d'accès** : Vérifie l'existence du patient

##### `deletePatient(id)`
- **Objectif** : Supprime un patient de la base de données
- **Validation** : Vérifie l'existence du patient
- **Retour** : Message de confirmation

### 2. Contrôleur Patient (`patient.controller.js`)

#### Endpoints d'Authentification

##### `login(req, res, next)`
- **Route** : `POST /patient/auth/login`
- **Authentification** : Par numéro d'assuré et mot de passe
- **Validation** : Vérifie la présence des champs requis
- **Retour** : Token JWT et informations patient

##### `logout(req, res)`
- **Route** : `POST /patient/auth/logout`
- **Fonction** : Déconnexion avec invalidation du cookie JWT
- **Sécurité** : Cookie expiré en 10 secondes

##### `changePassword(req, res, next)`
- **Route** : `POST /patient/auth/change-password`
- **Fonction** : Changement de mot de passe patient
- **Validation** : Vérifie l'ancien mot de passe
- **Sécurité** : Requiert authentification patient

##### `getMe(req, res, next)`
- **Route** : `GET /patient/auth/me`
- **Fonction** : Récupère le profil du patient connecté
- **Sécurité** : Requiert authentification patient

#### Endpoints CRUD

##### `getAllPatients(req, res, next)`
- **Route** : `GET /patient`
- **Fonction** : Liste tous les patients
- **Accès** : Professionnels de santé uniquement
- **Retour** : Liste paginée avec métadonnées

##### `getPatient(req, res, next)`
- **Route** : `GET /patient/:id`
- **Fonction** : Récupère un patient spécifique
- **Contrôle d'accès** : Patient peut voir uniquement son propre dossier
- **Sécurité** : Vérification granulaire des permissions

##### `createPatient(req, res, next)`
- **Route** : `POST /patient`
- **Fonction** : Crée un nouveau patient
- **Validation** : Champs requis stricts
- **Flexibilité** : Support auto-inscription et création par professionnel

##### `updatePatient(req, res, next)`
- **Route** : `PATCH /patient/:id`
- **Fonction** : Met à jour un patient
- **Contrôle d'accès** : Patient ne peut modifier que son propre dossier
- **Sécurité** : Vérification des permissions

##### `deletePatient(req, res, next)`
- **Route** : `DELETE /patient/:id`
- **Fonction** : Supprime un patient
- **Accès** : Administrateurs uniquement

### 3. Routes Patient (`patient.route.js`)

#### Structure des Routes

##### Routes Principales
```javascript
// GET /patient - Liste tous les patients (professionnels)
// POST /patient - Crée un patient (public ou professionnel)
// GET /patient/:id - Récupère un patient (contrôle d'accès)
// PATCH /patient/:id - Met à jour un patient (contrôle d'accès)
// DELETE /patient/:id - Supprime un patient (admin uniquement)
```

##### Routes d'Authentification
```javascript
// POST /patient/auth/login - Connexion patient
// POST /patient/auth/logout - Déconnexion patient
// GET /patient/auth/me - Profil patient connecté
// POST /patient/auth/change-password - Changement mot de passe
```

##### Routes DMP (Dossier Médical Partagé)
```javascript
// GET /patient/dmp/tableau-de-bord - Tableau de bord personnalisé
// GET /patient/dmp/historique-medical - Historique médical complet
// GET /patient/dmp/journal-activite - Journal d'activité et consentement
// GET /patient/dmp/droits-acces - Gestion des droits d'accès
// POST /patient/dmp/autoriser-acces - Autoriser un professionnel
// DELETE /patient/dmp/revoquer-acces/:id - Révoquer l'accès
// PATCH /patient/dmp/informations-personnelles - Mise à jour infos personnelles
// POST /patient/dmp/auto-mesures - Ajout d'auto-mesures
// GET /patient/dmp/fiche-urgence - Génération fiche d'urgence avec QR Code
// GET /patient/dmp/rendez-vous - Gestion des rendez-vous
// POST /patient/dmp/messagerie - Messagerie sécurisée
// GET /patient/dmp/rappels - Rappels et plan de soins
// GET /patient/dmp/bibliotheque-sante - Bibliothèque de santé
// GET /patient/dmp/documents-personnels - Documents personnels
// POST /patient/dmp/upload-document - Upload de documents
// GET /patient/dmp/statistiques - Statistiques du DMP
```

### 4. Service DMP (`dmp.service.js`)

#### Fonctionnalités Principales

##### `getTableauDeBord(patientId)`
- **Objectif** : Récupère le tableau de bord personnalisé du patient
- **Contenu** : Identité, informations critiques, notifications, activités récentes
- **Retour** : Vue synthétique du dossier médical

##### `getHistoriqueMedical(patientId, filters)`
- **Objectif** : Récupère l'historique médical complet avec filtres
- **Types** : Consultations, prescriptions, examens de laboratoire
- **Filtres** : Par type, date, pagination
- **Retour** : Données structurées par catégorie

##### `getJournalActivite(patientId, filters)`
- **Objectif** : Journal d'activité et de consentement
- **Traçabilité** : Qui a accédé, quand, pourquoi
- **Types** : Consultation, ajout, modification, autorisation
- **Audit** : Traçabilité complète des accès

##### `getDroitsAcces(patientId)`
- **Objectif** : Gestion des droits d'accès du patient
- **Contrôle** : Liste des professionnels autorisés
- **Permissions** : Contrôle granulaire des accès
- **Sécurité** : Contrôle total du patient sur ses données

##### `autoriserAcces(patientId, professionnelId, permissions)`
- **Objectif** : Autorise un nouveau professionnel à accéder au dossier
- **Validation** : Vérification de l'existence du professionnel
- **Permissions** : Contrôle sélectif des droits
- **Audit** : Enregistrement de l'autorisation

##### `revoquerAcces(patientId, professionnelId)`
- **Objectif** : Révoque l'accès d'un professionnel
- **Validation** : Vérification de l'autorisation existante
- **Sécurité** : Révocation immédiate
- **Audit** : Enregistrement de la révocation

##### `updateInformationsPersonnelles(patientId, informations)`
- **Objectif** : Met à jour les informations personnelles du patient
- **Champs** : Personne d'urgence, antécédents familiaux, habitudes de vie
- **Validation** : Contrôle des champs autorisés
- **Sécurité** : Mise à jour sécurisée

##### `ajouterAutoMesure(patientId, mesure)`
- **Objectif** : Ajoute une auto-mesure du patient
- **Types** : Poids, taille, tension, glycémie, température
- **Validation** : Contrôle des valeurs et unités
- **Stockage** : Sauvegarde dans le dossier médical

##### `genererFicheUrgence(patientId)`
- **Objectif** : Génère une fiche d'urgence avec QR Code
- **Contenu** : Informations vitales, allergies, traitements
- **QR Code** : Accès rapide aux informations
- **Format** : Fiche imprimable et numérique

### 5. Contrôleur DMP (`dmp.controller.js`)

#### Endpoints Principaux

##### `getTableauDeBord(req, res, next)`
- **Route** : `GET /patient/dmp/tableau-de-bord`
- **Authentification** : Requiert patientAuth
- **Fonction** : Tableau de bord personnalisé
- **Retour** : Vue synthétique du DMP

##### `getHistoriqueMedical(req, res, next)`
- **Route** : `GET /patient/dmp/historique-medical`
- **Filtres** : Type, date, pagination
- **Fonction** : Historique médical complet
- **Retour** : Données structurées

##### `getJournalActivite(req, res, next)`
- **Route** : `GET /patient/dmp/journal-activite`
- **Filtres** : Type d'activité, période
- **Fonction** : Journal d'activité et consentement
- **Retour** : Traçabilité complète

##### `getDroitsAcces(req, res, next)`
- **Route** : `GET /patient/dmp/droits-acces`
- **Fonction** : Liste des professionnels autorisés
- **Contrôle** : Gestion des accès
- **Retour** : Droits d'accès

##### `autoriserAcces(req, res, next)`
- **Route** : `POST /patient/dmp/autoriser-acces`
- **Validation** : ID professionnel requis
- **Fonction** : Autorisation d'accès
- **Retour** : Confirmation d'autorisation

##### `revoquerAcces(req, res, next)`
- **Route** : `DELETE /patient/dmp/revoquer-acces/:professionnel_id`
- **Validation** : ID professionnel requis
- **Fonction** : Révocation d'accès
- **Retour** : Confirmation de révocation

##### `updateInformationsPersonnelles(req, res, next)`
- **Route** : `PATCH /patient/dmp/informations-personnelles`
- **Validation** : Champs autorisés uniquement
- **Fonction** : Mise à jour informations personnelles
- **Retour** : Confirmation de mise à jour

##### `ajouterAutoMesure(req, res, next)`
- **Route** : `POST /patient/dmp/auto-mesures`
- **Validation** : Type et valeur requis
- **Fonction** : Ajout d'auto-mesure
- **Retour** : Confirmation d'ajout

##### `genererFicheUrgence(req, res, next)`
- **Route** : `GET /patient/dmp/fiche-urgence`
- **Fonction** : Génération fiche d'urgence
- **QR Code** : Génération automatique
- **Retour** : Fiche et QR Code

### 6. Routes DMP (`dmp.route.js`)

#### Structure des Routes DMP

##### Routes de Consultation
```javascript
// GET /patient/dmp/tableau-de-bord - Tableau de bord personnalisé
// GET /patient/dmp/historique-medical - Historique médical complet
// GET /patient/dmp/journal-activite - Journal d'activité
// GET /patient/dmp/statistiques - Statistiques du DMP
```

##### Routes de Gestion des Accès
```javascript
// GET /patient/dmp/droits-acces - Liste des autorisations
// POST /patient/dmp/autoriser-acces - Autoriser un professionnel
// DELETE /patient/dmp/revoquer-acces/:id - Révoquer l'accès
```

##### Routes de Contribution Patient
```javascript
// PATCH /patient/dmp/informations-personnelles - Mise à jour infos
// POST /patient/dmp/auto-mesures - Ajout d'auto-mesures
// POST /patient/dmp/upload-document - Upload de documents
// GET /patient/dmp/documents-personnels - Documents personnels
```

##### Routes de Services
```javascript
// GET /patient/dmp/fiche-urgence - Fiche d'urgence avec QR Code
// GET /patient/dmp/rendez-vous - Gestion des rendez-vous
// POST /patient/dmp/messagerie - Messagerie sécurisée
// GET /patient/dmp/rappels - Rappels et plan de soins
// GET /patient/dmp/bibliotheque-sante - Bibliothèque de santé
```

#### Documentation Swagger

Le fichier inclut une documentation Swagger complète pour toutes les routes DMP avec :
- **Schémas de données** : Définition des modèles DMP
- **Validation des champs** : Règles de validation détaillées
- **Codes de réponse** : Documentation des codes HTTP
- **Exemples de requêtes** : Données d'exemple pour les tests
- **Authentification** : Documentation des tokens JWT

#### Contrôle d'Accès Granulaire

##### Niveaux d'Accès
1. **Patient** : Accès uniquement à son propre dossier
2. **Professionnel de santé** : Accès aux dossiers patients selon autorisations
3. **Administrateur** : Accès complet à tous les dossiers

##### Middlewares de Sécurité
- `authMiddleware.protect` : Vérification JWT
- `authMiddleware.restrictTo()` : Contrôle des rôles
- `patientAuth` : Authentification spécifique patient

#### Documentation Swagger

Le fichier inclut une documentation Swagger complète avec :
- **Schémas de données** : Définition des modèles Patient
- **Validation des champs** : Règles de validation détaillées
- **Codes de réponse** : Documentation des codes HTTP
- **Exemples de requêtes** : Données d'exemple pour les tests

## 🔐 Système de Sécurité

### Authentification Patient
- **Méthode** : Numéro d'assuré + mot de passe
- **Token** : JWT avec informations patient
- **Sécurité** : Hachage bcrypt des mots de passe

### Contrôle d'Accès
- **Granularité** : Accès basé sur le rôle et l'identité
- **Validation** : Vérification des permissions à chaque requête
- **Isolation** : Patients isolés de leurs propres données

### Validation des Données
- **Champs requis** : Validation stricte des données obligatoires
- **Unicité** : Contrôle des doublons (email, numéro d'assuré)
- **Format** : Validation des formats de données

## 📊 Modèle de Données Patient

### Champs Principaux
```javascript
{
  id_patient: "INTEGER (PK)",
  nom: "STRING (requis)",
  prenom: "STRING (requis)",
  date_naissance: "DATE (requis)",
  sexe: "ENUM('M','F','X','I') (requis)",
  adresse: "STRING (optionnel)",
  telephone: "STRING (requis)",
  email: "STRING (unique, requis)",
  identifiantNational: "STRING (optionnel, unique)",
  numero_assure: "STRING (unique, requis)",
  nom_assurance: "STRING (requis)",
  mot_de_passe: "STRING (requis, hashé)"
}
```

### Relations
- **DossierMedical** : Un patient peut avoir un dossier médical
- **Prescription** : Un patient peut avoir plusieurs prescriptions
- **Consultation** : Un patient peut avoir plusieurs consultations
- **RendezVous** : Un patient peut avoir plusieurs rendez-vous

## 🚀 Utilisation de l'API

### Exemples de Requêtes

#### Création d'un Patient
```bash
POST /patient
{
  "nom": "Dupont",
  "prenom": "Jean",
  "date_naissance": "1988-05-15",
  "sexe": "M",
  "email": "jean.dupont@email.com",
  "telephone": "+221701234567",
  "numero_assure": "IPRES123456789",
  "nom_assurance": "IPRES",
  "mot_de_passe": "motdepasse123"
}
```

#### Connexion Patient
```bash
POST /patient/auth/login
{
  "numero_assure": "IPRES123456789",
  "mot_de_passe": "motdepasse123"
}
```

#### Récupération du Profil
```bash
GET /patient/auth/me
Authorization: Bearer <JWT_TOKEN>
```

## ⚠️ Gestion des Erreurs

### Codes d'Erreur
- **400** : Données invalides ou manquantes
- **401** : Non authentifié
- **403** : Accès refusé (permissions insuffisantes)
- **404** : Patient non trouvé
- **409** : Conflit (doublon email/numéro d'assuré)

### Messages d'Erreur
- Messages d'erreur explicites et localisés
- Validation détaillée des champs
- Suggestions de correction

## 🔄 Évolutions Futures

### Fonctionnalités Prévues
1. **Gestion des dossiers médicaux** : Intégration complète
2. **Historique des modifications** : Audit trail
3. **Notifications** : Système de notifications patient
4. **Export de données** : Export PDF/Excel des dossiers
5. **API mobile** : Optimisations pour applications mobiles

### Améliorations Techniques
1. **Cache Redis** : Mise en cache des données fréquentes
2. **Pagination avancée** : Filtres et tri
3. **Recherche full-text** : Recherche dans les dossiers
4. **Webhooks** : Notifications en temps réel

## 📝 Notes d'Implémentation

### Bonnes Pratiques
- **Séparation des responsabilités** : Service/Contrôleur/Route
- **Gestion d'erreurs centralisée** : AppError et catchAsync
- **Validation stricte** : Contrôle des données d'entrée
- **Sécurité** : Authentification et autorisation granulaire

### Points d'Attention
- **Performance** : Optimisation des requêtes avec includes
- **Sécurité** : Validation des permissions à chaque niveau
- **Maintenabilité** : Code modulaire et documenté
- **Évolutivité** : Architecture extensible

Cette documentation couvre l'ensemble des fonctionnalités implémentées dans le module Patient, offrant une base solide pour la maintenance et l'évolution du système. 