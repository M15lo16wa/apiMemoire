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

## Seeders : création automatique des utilisateurs et professionnels de santé

Pour faciliter les tests et la prise en main de la plateforme, un script de seed permet de créer automatiquement des comptes utilisateurs (secrétaires) et des professionnels de santé (médecins, infirmiers) associés à chaque service de santé.

### Fonctionnement du seeder
- Pour chaque service de santé existant, le script crée automatiquement :
  - Un médecin (rôle `medecin` dans ProfessionnelSante)
  - Un infirmier (rôle `infirmier` dans ProfessionnelSante)
- Pour chaque professionnel, un compte utilisateur associé est créé avec le rôle `secretaire` (plateforme).
- Les emails générés sont uniques et de la forme : `prenom.nom.idservice.compteur@nomservice.com`

### Mot de passe par défaut
- **Tous les comptes utilisateurs créés automatiquement ont le mot de passe suivant :**

```
Test@1234
```

- Pensez à changer ce mot de passe en production ou à la première connexion.

### Exemple d’utilisateur généré
```json
{
  "nom": "Diop",
  "prenom": "Mamadou",
  "email": "mamadou.diop.1.0@medecinegenerale.com",
  "mot_de_passe": "Test@1234",
  "role": "secretaire"
}
```

### Exemple de professionnel de santé généré
```json
{
  "nom": "Diop",
  "prenom": "Mamadou",
  "email": "mamadou.diop.1.0@medecinegenerale.com",
  "role": "medecin",
  "specialite": "Médecine Générale",
  "service_id": 1,
  "utilisateur_id": 10
}
```

## Script de seed utilisé pour la création automatique des utilisateurs et professionnels de santé

Voici le code source du script utilisé pour générer automatiquement les comptes utilisateurs (secrétaires) et professionnels de santé (médecins, infirmiers) :

```js
const { ProfessionnelSante, ServiceSante, Utilisateur, sequelize } = require('../src/models');

// Listes de noms et prénoms sénégalais typiques
const noms = ['Diop', 'Sarr', 'Fall', 'Ndiaye', 'Ba', 'Faye', 'Gueye', 'Sow', 'Sy', 'Ndoye'];
const prenomsMedecin = ['Mamadou', 'Cheikh', 'Ibrahima', 'Abdoulaye', 'Ousmane', 'Aliou', 'Serigne', 'Moussa', 'Pape', 'Amadou'];
const prenomsInfirmier = ['Fatou', 'Aminata', 'Mariama', 'Astou', 'Awa', 'Khady', 'Ndeye', 'Bineta', 'Sokhna', 'Coumba'];

// Seuls les rôles autorisés pour ProfessionnelSante
const profils = [
  { role: 'medecin', specialite: 'Médecine Générale' },
  { role: 'infirmier', specialite: 'Soins Infirmiers' }
];

function getRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

async function generateUniqueEmail(prenom, nom, service, compteur) {
  let base = `${prenom.toLowerCase()}.${nom.toLowerCase()}.${service.id_service}.${compteur}`;
  let email = `${base}@${service.nom.replace(/\s+/g, '').toLowerCase()}.com`;
  let exists = await Utilisateur.findOne({ where: { email } });
  let suffix = 1;
  while (exists) {
    email = `${base}.${Date.now()}${suffix}@${service.nom.replace(/\s+/g, '').toLowerCase()}.com`;
    exists = await Utilisateur.findOne({ where: { email } });
    suffix++;
  }
  return email;
}

async function seed() {
  try {
    await sequelize.authenticate();
    const services = await ServiceSante.findAll();
    if (!services.length) throw new Error('Aucun service de santé trouvé.');
    let compteur = 0;
    for (const service of services) {
      for (const profil of profils) {
        let prenom;
        if (profil.role === 'medecin') prenom = prenomsMedecin[compteur % prenomsMedecin.length];
        else prenom = prenomsInfirmier[compteur % prenomsInfirmier.length];
        const nom = noms[compteur % noms.length];
        const email = await generateUniqueEmail(prenom, nom, service, compteur);
        const mot_de_passe = 'Test@1234';
        // Vérifier si l'utilisateur existe déjà
        let utilisateur = await Utilisateur.findOne({ where: { email } });
        if (!utilisateur) {
          utilisateur = await Utilisateur.create({
            nom,
            prenom,
            email,
            mot_de_passe,
            role: 'secretaire', // Toujours 'secretaire' pour la plateforme
            statut: 'actif'
          });
        }
        // Vérifier si le professionnel existe déjà
        let professionnel = await ProfessionnelSante.findOne({ where: { email } });
        if (!professionnel) {
          professionnel = await ProfessionnelSante.create({
            nom,
            prenom,
            email,
            telephone: '77' + String(1000000 + compteur).slice(0,7),
            role: profil.role, // 'medecin' ou 'infirmier'
            specialite: profil.specialite,
            statut: 'actif',
            service_id: service.id_service,
            utilisateur_id: utilisateur.id_utilisateur
          });
          console.log(`Ajouté : ${profil.role} ${prenom} ${nom} pour le service ${service.nom}`);
        } else {
          // Mettre à jour les champs vides si besoin
          let updated = false;
          if (!professionnel.specialite) { professionnel.specialite = profil.specialite; updated = true; }
          if (!professionnel.telephone) { professionnel.telephone = '77' + String(1000000 + compteur).slice(0,7); updated = true; }
          if (!professionnel.role) { professionnel.role = profil.role; updated = true; }
          if (!professionnel.statut) { professionnel.statut = 'actif'; updated = true; }
          if (!professionnel.service_id) { professionnel.service_id = service.id_service; updated = true; }
          if (!professionnel.utilisateur_id) { professionnel.utilisateur_id = utilisateur.id_utilisateur; updated = true; }
          if (updated) {
            await professionnel.save();
            console.log(`Mis à jour : ${profil.role} ${prenom} ${nom} pour le service ${service.nom}`);
          } else {
            console.log(`Déjà existant : ${profil.role} ${prenom} ${nom} pour le service ${service.nom}`);
          }
        }
        compteur++;
      }
    }
    console.log('Tous les professionnels de santé ont été ajoutés/mis à jour avec succès.');
  } catch (error) {
    console.error('Erreur lors de l\'insertion des professionnels de santé :', error);
  } finally {
    await sequelize.close();
  }
}

seed();
```

**Mot de passe utilisé pour tous les comptes générés automatiquement :**
```
const { ProfessionnelSante } = require('../models');

module.exports = async (req, res, next) => {
  try {
    // L'utilisateur connecté est dans req.user (décodé par le middleware protect)
    const utilisateurId = req.user.id;
    const professionnel = await ProfessionnelSante.findOne({ where: { utilisateur_id: utilisateurId } });
    if (!professionnel) {
      return res.status(403).json({ message: "Aucun professionnel de santé associé à cet utilisateur." });
    }
    req.professionnel = professionnel; // Ajoute le professionnel à la requête
    next();
  } catch (err) {
    next(err);
  }
};Test@1234
```

---

## Récapitulatif des actions réalisées (journée du 21/07/2025)

### 1. Synchronisation et correction des modèles et migrations
- Ajout et correction des champs dans les tables `Hopitaux`, `ServiceSante`, `ProfessionnelsSante` pour garantir la cohérence avec les modèles Sequelize.
- Création de migrations idempotentes pour ajouter ou corriger dynamiquement les colonnes manquantes (ex : `specialite`, `telephone`, `numero_licence`, etc.).
- Correction des contraintes NOT NULL et des types ENUM pour éviter les erreurs lors des insertions.
- Suppression des dossiers et fichiers en doublon ou avec des erreurs de casse (ex : `serviceSanté` vs `serviceSante`).

### 2. Seeders et alimentation automatique de la base
- Création d’un seeder pour insérer rapidement plusieurs hôpitaux sénégalais typiques.
- Création d’un seeder pour insérer automatiquement des services de santé pour chaque hôpital.
- Création d’un seeder pour insérer automatiquement des professionnels de santé (médecins et infirmiers) pour chaque service, avec génération de comptes utilisateurs associés.
- Génération d’emails uniques et mot de passe par défaut `Test@1234` pour tous les comptes créés automatiquement.

### 3. Sécurisation et logique métier
- Sécurisation des routes des services de santé par middleware d’authentification et restriction par rôle (`admin` uniquement pour la création, modification, suppression).
- Interdiction d’accès aux routes des services de santé pour les patients.
- Respect strict de la logique :
  - Table `Utilisateur` : uniquement les rôles `admin` et `secretaire`.
  - Table `ProfessionnelSante` : uniquement les rôles `medecin` et `infirmier`.

### 4. Documentation et Swagger
- Mise à jour de la documentation Swagger pour tous les modules concernés (hôpitaux, services de santé, professionnels de santé).
- Ajout d’exemples, de schémas, et de la documentation sur les seeders et le mot de passe par défaut.
- Ajout du code source du seeder dans la documentation pour transparence et reproductibilité.

### 5. Résolution d’erreurs et nettoyage
- Résolution des erreurs de migration, d’ENUM, de contraintes NOT NULL, de conflits de casse et de doublons de dossiers.
- Nettoyage des dossiers parasites et correction des imports pour garantir le bon fonctionnement de l’application.

---

Ce récapitulatif permet de garder une trace claire de toutes les évolutions et corrections apportées à la plateforme lors de cette journée de travail.

## Politique de sécurisation des routes de la plateforme

L’ensemble des routes sensibles de la plateforme est protégé par des middlewares d’authentification (JWT) et d’autorisation par rôle. Cela garantit que seules les personnes habilitées peuvent accéder ou modifier les données selon leur profil.

### Règles générales appliquées
- **Authentification obligatoire** pour toutes les routes de gestion (patients, hôpitaux, professionnels, dossiers, services, etc.).
- **Autorisation par rôle** :
  - Seuls les utilisateurs avec le rôle `admin` peuvent créer, modifier ou supprimer des entités sensibles (hôpitaux, services de santé, professionnels, etc.).
  - Les secrétaires peuvent accéder à certaines routes de consultation, mais pas à la création/suppression.
  - Les patients n’ont accès qu’à leurs propres données (dossier, rendez-vous, etc.).
  - Les professionnels de santé (médecins, infirmiers) ont accès aux données des patients selon leur service et leurs autorisations.
- **Interdiction stricte** pour les patients d’accéder aux routes de gestion des services de santé, professionnels, hôpitaux, etc.

### Exemples de protection appliquée
| Route                                 | Authentification | Rôle(s) autorisé(s)         |
|---------------------------------------|------------------|-----------------------------|
| `GET /api/patient`                    | Oui              | admin, professionnel_sante  |
| `POST /api/patient`                   | Oui              | admin                       |
| `GET /api/hopital`                    | Oui              | admin, secretaire           |
| `POST /api/hopital`                   | Oui              | admin                       |
| `GET /api/service-sante`              | Oui              | admin, secretaire, médecin, infirmier |
| `POST /api/service-sante`             | Oui              | admin                       |
| `GET /api/professionnelSante`         | Oui              | admin, secretaire           |
| `POST /api/professionnelSante`        | Oui              | admin                       |
| `GET /api/patient/:id`                | Oui              | admin, professionnel_sante, patient (lui-même) |
| `GET /api/dossierMedical/:id`         | Oui              | admin, professionnel_sante, patient (lui-même) |

### Middleware utilisés
- `protect` : vérifie la présence et la validité du token JWT.
- `restrictTo('admin')` : limite l’accès à certains rôles (ex : admin uniquement).
- Middleware personnalisé pour interdire l’accès aux patients sur certains modules.

### Résumé
- **Aucune route sensible n’est accessible sans authentification.**
- **Les droits sont vérifiés à chaque requête selon le rôle de l’utilisateur.**
- **La sécurité est centralisée dans les middlewares Express pour garantir la cohérence sur toute la plateforme.**

---
