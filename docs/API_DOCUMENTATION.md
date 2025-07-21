# Documentation API - Système de Gestion Hospitalière

## Vue d'ensemble

Cette API REST permet la gestion d'un système hospitalier avec authentification, gestion des patients et des professionnels de santé.

**Base URL:** `http://localhost:3000/api`

## Architecture du Projet

```
src/
├── app.js                 # Configuration Express
├── server.js             # Point d'entrée du serveur
├── config/               # Configuration de la base de données
├── middlewares/          # Middlewares (auth, etc.)
├── models/               # Modèles Sequelize
├── modules/              # Modules fonctionnels
│   ├── auth/            # Authentification
│   ├── patient/         # Gestion des patients
│   └── professionnelSante/ # Gestion des professionnels
├── routes/              # Routes principales
└── utils/               # Utilitaires (erreurs, etc.)
```

## Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification. Le token doit être inclus dans l'en-tête `Authorization` avec le préfixe `Bearer`.

### Endpoints d'Authentification

#### POST `/api/auth/register`
**Description:** Inscription d'un nouvel utilisateur/patient

**Corps de la requête:**
```json
{
  "nom": "string (requis)",
  "prenom": "string (requis)", 
  "email": "string (requis)",
  "mot_de_passe": "string (requis)",
  "role": "string (requis)" // admin, secretaire
}
```

**Réponse (201):**
```json
{
  "status": "success",
  "token": "jwt_token",
  "data": {
    "user": {
      "id_utilisateur": "number",
      "nom": "string",
      "prenom": "string",
      "email": "string",
      "role": "admin", // ou "secretaire"
      "statut": "actif"
    }
  }
}
```

#### POST `/api/auth/register-admin`
**Description:** Inscription d'un administrateur ou professionnel de santé

**Corps de la requête:**
```json
{
  "nom": "string (requis)",
  "prenom": "string (requis)",
  "email": "string (requis)", 
  "mot_de_passe": "string (requis)",
  "role": "string (requis)" // admin, medecin, infirmier, secretaire, laborantin, pharmacien, responsable_etablissement
}
```

**Réponse (201):**
```json
{
  "status": "success",
  "token": "jwt_token",
  "data": {
    "user": {
      "id_utilisateur": "number",
      "nom": "string",
      "prenom": "string", 
      "email": "string",
      "role": "string",
      "statut": "actif"
    }
  }
}
```

#### POST `/api/auth/login`
**Description:** Connexion utilisateur

**Corps de la requête:**
```json
{
  "email": "string (requis)",
  "mot_de_passe": "string (requis)"
}
```

**Réponse (200):**
```json
{
  "status": "success",
  "token": "jwt_token",
  "data": {
    "user": {
      "id_utilisateur": "number",
      "nom": "string",
      "prenom": "string",
      "email": "string", 
      "role": "string",
      "statut": "string"
    }
  }
}
```

#### POST/GET `/api/auth/logout`
**Description:** Déconnexion utilisateur

**Réponse (200):**
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

#### GET `/api/auth/me`
**Description:** Récupération du profil utilisateur connecté
**Authentification:** Requise

**Réponse (200):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id_utilisateur": "number",
      "nom": "string",
      "prenom": "string",
      "email": "string",
      "role": "string",
      "statut": "string"
    }
  }
}
```

## Gestion des Patients

Toutes les routes patients nécessitent une authentification.

#### GET `/api/patient`
**Description:** Récupération de tous les patients
**Authentification:** Requise
**Autorisation:** admin, professionnel_sante

**Réponse (200):**
```json
{
  "status": "success",
  "results": "number",
  "data": {
    "patients": [
      {
        "id_patient": "number",
        "nom": "string",
        "prenom": "string",
        "dateNaissance": "date",
        "sexe": "string",
        "utilisateur_id": "number"
      }
    ]
  }
}
```

#### GET `/api/patient/:id`
**Description:** Récupération d'un patient spécifique
**Authentification:** Requise
**Autorisation:** admin, professionnel_sante, patient (son propre dossier)

**Paramètres:**
- `id`: ID du patient

**Réponse (200):**
```json
{
  "status": "success",
  "data": {
    "patient": {
      "id_patient": "number",
      "nom": "string",
      "prenom": "string",
      "dateNaissance": "date",
      "sexe": "string",
      "utilisateur_id": "number"
    }
  }
}
```

#### POST `/api/patient`
**Description:** Création d'un nouveau patient
**Authentification:** Requise
**Autorisation:** admin

**Corps de la requête:**
```json
{
  "nom": "string (requis)",
  "prenom": "string (requis)",
  "dateNaissance": "date (requis)",
  "sexe": "string (requis)",
  "utilisateur_id": "number (requis)"
}
```

**Réponse (201):**
```json
{
  "status": "success",
  "data": {
    "patient": {
      "id_patient": "number",
      "nom": "string",
      "prenom": "string",
      "dateNaissance": "date",
      "sexe": "string",
      "utilisateur_id": "number"
    }
  }
}
```

#### PATCH `/api/patient/:id`
**Description:** Mise à jour d'un patient
**Authentification:** Requise
**Autorisation:** admin, professionnel_sante

**Paramètres:**
- `id`: ID du patient

**Corps de la requête:** (tous les champs sont optionnels)
```json
{
  "nom": "string",
  "prenom": "string",
  "dateNaissance": "date",
  "sexe": "string"
}
```

**Réponse (200):**
```json
{
  "status": "success",
  "data": {
    "patient": {
      "id_patient": "number",
      "nom": "string",
      "prenom": "string",
      "dateNaissance": "date",
      "sexe": "string",
      "utilisateur_id": "number"
    }
  }
}
```

#### DELETE `/api/patient/:id`
**Description:** Suppression d'un patient
**Authentification:** Requise
**Autorisation:** admin

**Paramètres:**
- `id`: ID du patient

**Réponse (204):** Pas de contenu

## Gestion des Hôpitaux

Toutes les routes pour les hôpitaux nécessitent une authentification.

#### POST `/api/hopital`
**Description:** Création d'un nouvel hôpital
**Authentification:** Requise
**Autorisation:** admin

**Corps de la requête (champs requis):**
```json
{
  "nom": "string (requis)",
  "adresse": "string (requis)",
  "telephone": "string (requis)",
  "type_etablissement": "string (requis, enum: Public, Privé, Spécialisé)"
}
```

**Champs optionnels (peuvent être omis ou laissés vides):**
- `departement` (string)
- `region` (string)
- `pays` (string)
- `fax` (string)
- `code_postal` (string)
- `ville` (string)
- `telephone_standard` (string)

**Réponse (201):**
```json
{
  "status": "success",
  "data": {
    "hopital": {
      "id_hopital": "number",
      "nom": "string",
      "adresse": "string",
      "telephone": "string",
      "type_etablissement": "string",
      "departement": "string (optionnel)",
      "region": "string (optionnel)",
      "pays": "string (optionnel)",
      "fax": "string (optionnel)",
      "code_postal": "string (optionnel)",
      "ville": "string (optionnel)",
      "telephone_standard": "string (optionnel)",
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  }
}
```

#### GET `/api/hopital`
**Description:** Récupération de tous les hôpitaux
**Authentification:** Requise

**Réponse (200):**
```json
{
  "status": "success",
  "results": "number",
  "data": {
    "hopitaux": [
      {
        "id_hopital": "number",
        "nom": "string",
        "adresse": "string",
        "telephone": "string",
        "type_etablissement": "string"
      }
    ]
  }
}
```

#### GET `/api/hopital/:id`
**Description:** Récupération d'un hôpital par son ID
**Authentification:** Requise

**Paramètres:**
- `id`: ID de l'hôpital

**Réponse (200):**
```json
{
  "status": "success",
  "data": {
    "hopital": {
      "id_hopital": "number",
      "nom": "string",
      "adresse": "string",
      "telephone": "string",
      "type_etablissement": "string"
    }
  }
}
```

#### PUT `/api/hopital/:id`
**Description:** Mise à jour d'un hôpital
**Authentification:** Requise
**Autorisation:** admin

**Paramètres:**
- `id`: ID de l'hôpital

**Corps de la requête:**
```json
{
  "nom": "string (requis)",
  "adresse": "string (requis)",
  "telephone": "string (requis)",
  "type_etablissement": "string (requis, enum: Public, Privé, Spécialisé)"
}
```

**Réponse (200):**
```json
{
  "status": "success",
  "data": {
    "hopital": {
      "id_hopital": "number",
      "nom": "string",
      "adresse": "string",
      "telephone": "string",
      "type_etablissement": "string"
    }
  }
}
```

#### DELETE `/api/hopital/:id`
**Description:** Suppression d'un hôpital
**Authentification:** Requise
**Autorisation:** admin

**Paramètres:**
- `id`: ID de l'hôpital

**Réponse (204):** Pas de contenu

## Modèles de Données

### Utilisateur
```javascript
{
  id_utilisateur: "number (PK)",
  nom: "string",
  prenom: "string", 
  email: "string (unique)",
  mot_de_passe: "string (haché)",
  role: "enum (admin, secretaire)",
  statut: "enum (actif, inactif, suspendu)",
  telephone: "string",
  date_naissance: "date",
  sexe: "enum (M, F, Autre)",
  adresse: "text",
  date_creation: "datetime",
  date_modification: "datetime"
}
```

### Hopital
```javascript
{
  id_hopital: "number (PK)",
  nom: "string",
  adresse: "string",
  telephone: "string",
  type_etablissement: "enum (Public, Privé, Spécialisé)",
  departement: "string (optionnel)",
  region: "string (optionnel)",
  pays: "string (optionnel)",
  fax: "string (optionnel)",
  code_postal: "string (optionnel)",
  ville: "string (optionnel)",
  telephone_standard: "string (optionnel)",
  createdAt: "datetime",
  updatedAt: "datetime"
}
```

### Patient
```javascript
{
  id_patient: "number (PK)",
  utilisateur_id: "number (FK)",
  nom: "string",
  prenom: "string",
  dateNaissance: "date",
  sexe: "enum (M, F, Autre)",
  // Relations avec autres entités (dossier médical, consultations, etc.)
}
```

### Autres Modèles Disponibles
- **Hopital**: Gestion des hôpitaux
- **ServiceSante**: Services de santé
- **ProfessionnelSante**: Professionnels de santé
- **DossierMedical**: Dossiers médicaux
- **Consultation**: Consultations
- **RendezVous**: Rendez-vous
- **Prescription**: Prescriptions
- **ExamenLabo**: Examens de laboratoire
- **AutorisationAcces**: Autorisations d'accès
- **HistoriqueAccess**: Historique des accès

## Codes d'Erreur

### Erreurs d'Authentification
- **401 Unauthorized**: Token manquant ou invalide
- **403 Forbidden**: Permissions insuffisantes

### Erreurs de Validation
- **400 Bad Request**: Données manquantes ou invalides
- **404 Not Found**: Ressource non trouvée
- **409 Conflict**: Conflit (ex: email déjà utilisé)

### Erreurs Serveur
- **500 Internal Server Error**: Erreur interne du serveur

## Sécurité

### Authentification JWT
- Les tokens JWT sont utilisés pour l'authentification
- Les tokens doivent être inclus dans l'en-tête `Authorization: Bearer <token>`
- Les tokens expirent après une durée définie

### Autorisation par Rôles
- **patient**: Accès limité à ses propres données
- **admin**: Accès complet à toutes les fonctionnalités
- **professionnel_sante**: Accès aux données patients selon les autorisations
- **medecin, infirmier, secretaire, laborantin, pharmacien, responsable_etablissement**: Rôles spécialisés avec permissions spécifiques

### Hachage des Mots de Passe
- Les mots de passe sont hachés avec bcrypt avant stockage
- Validation automatique lors de la connexion

## Configuration

### Variables d'Environnement
Consultez le fichier `.env` pour les variables de configuration :
- Configuration de la base de données
- Clés secrètes JWT
- Ports et URLs

### Base de Données
- Utilise Sequelize ORM
- Migrations disponibles dans le dossier `migrations/`
- Seeders disponibles dans le dossier `seeders/`

## Démarrage

1. Installer les dépendances : `npm install`
2. Configurer les variables d'environnement
3. Exécuter les migrations : `npm run migrate`
4. Démarrer le serveur : `npm start`

Le serveur démarre par défaut sur le port configuré dans les variables d'environnement.
