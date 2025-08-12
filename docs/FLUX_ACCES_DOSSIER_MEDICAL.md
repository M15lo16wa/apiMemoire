# Flux d'Accès au Dossier Médical - DMP

## Architecture des Modules

### 1. Module Auth
**Responsabilité :** Authentification initiale du médecin par code CPS
- Authentification avec code CPS à 4 chiffres
- Génération de token JWT pour le professionnel
- Interface d'options d'accès

### 2. Module Access
**Responsabilité :** Cœur de la logique d'accès
- Gestion des demandes d'accès (professionnels)
- Gestion des réponses aux demandes (patients)
- Décisions (standard vs urgence)
- Création des autorisations
- Génération des notifications
- Enregistrement dans l'historique

### 3. Module Patient
**Responsabilité :** Gestion des données patient uniquement
- CRUD des patients
- Authentification patient
- Gestion du profil patient

### 4. Modules de Données
**Responsabilité :** Fourniture des données après vérification d'autorisation
- DossierMedical, Consultation, etc.
- Middleware de vérification d'accès obligatoire

## Flux d'Accès Complet

### Étape 1 : Authentification CPS
```
POST /api/auth/cps/login
{
  "cpsCode": "1234"
}
```

**Réponse :**
```json
{
  "status": "success",
  "message": "Authentification CPS réussie",
  "data": {
    "professionnel": {
      "id": 1,
      "nom": "Dupont",
      "prenom": "Jean",
      "specialite": "Cardiologie",
      "role": "medecin"
    },
    "token": "jwt_token_here"
  }
}
```

### Étape 2 : Interface d'Options d'Accès
```
GET /api/auth/access-options
Authorization: Bearer <token>
```

**Réponse :**
```json
{
  "status": "success",
  "data": {
    "accessOptions": [
      {
        "id": "demande_standard",
        "name": "Demande d'accès standard",
        "description": "Demander l'accès au dossier médical du patient",
        "requiresPatientId": true,
        "type": "standard"
      },
      {
        "id": "acces_urgence",
        "name": "Accès en mode urgence",
        "description": "Accès immédiat au dossier en cas d'urgence vitale",
        "requiresPatientId": true,
        "type": "urgence",
        "requiresJustification": true
      },
      {
        "id": "acces_secret",
        "name": "Accès secret",
        "description": "Accès discret au dossier (traçé mais non notifié)",
        "requiresPatientId": true,
        "type": "secret"
      }
    ]
  }
}
```

### Étape 3 : Demande d'Accès Standard
```
POST /api/access/request-standard
Authorization: Bearer <token>
{
  "patient_id": 123,
  "raison_demande": "Consultation de routine"
}
```

**Actions effectuées :**
1. Vérification de l'existence du patient
2. Vérification de l'existence du professionnel
3. Création d'une autorisation en statut "attente_validation"
4. Enregistrement dans l'historique
5. Notification au patient (si système de notification activé)

### Étape 4 : Accès d'Urgence
```
POST /api/access/grant-emergency
Authorization: Bearer <token>
{
  "patient_id": 123,
  "justification_urgence": "Patient en arrêt cardiaque"
}
```

**Actions effectuées :**
1. Vérification de l'existence du patient et professionnel
2. Création d'une autorisation immédiate (24h)
3. Enregistrement dans l'historique
4. Accès immédiat accordé

### Étape 5 : Accès Secret
```
POST /api/access/grant-secret
Authorization: Bearer <token>
{
  "patient_id": 123,
  "raison_secrete": "Investigation médicale"
}
```

**Actions effectuées :**
1. Vérification de l'existence du patient et professionnel
2. Création d'une autorisation secrète (2h)
3. Enregistrement dans l'historique (sans notification patient)
4. Accès immédiat accordé

### Étape 6 : Réponse du Patient
```
PATCH /api/access/patient/response/:authorizationId
Authorization: Bearer <patient_token>
{
  "response": "accept",
  "comment": "J'accepte l'accès à mon dossier"
}
```

**Actions effectuées :**
1. Vérification que l'autorisation appartient au patient
2. Mise à jour du statut (actif/refuse)
3. Enregistrement de la réponse dans l'historique

### Étape 7 : Accès aux Données Médicales
```
GET /api/dossierMedical/patient/:patientId/complet
Authorization: Bearer <token>
```

**Actions effectuées :**
1. Middleware vérifie l'autorisation d'accès
2. Si autorisé, accès aux données
3. Enregistrement automatique de l'accès dans l'historique

## Middleware de Sécurité

### checkMedicalRecordAccess
- Vérifie les autorisations actives
- Valide les dates d'expiration
- Bloque l'accès si non autorisé

### logMedicalRecordAccess
- Enregistre automatiquement chaque accès
- Capture IP, User-Agent, timestamp
- Traçabilité complète

### requireHealthcareProfessional
- Vérifie que l'utilisateur est un professionnel de santé
- Contrôle le statut actif du professionnel

### requirePatientAuth
- Vérifie que l'utilisateur est un patient authentifié
- Contrôle l'existence et l'état du patient

## Historique et Traçabilité

Chaque action est enregistrée dans `HistoriqueAccess` :
- Authentification CPS
- Demandes d'accès
- Accès d'urgence
- Accès secrets
- Réponses des patients
- Consultations de dossiers

## Notifications

Le système peut envoyer des notifications aux patients pour :
- Nouvelles demandes d'accès
- Accès d'urgence (optionnel)
- Accès secrets (désactivé par défaut)

## Sécurité

1. **Authentification forte** : Code CPS à 4 chiffres
2. **Autorisation granulaire** : Vérification systématique des droits
3. **Traçabilité complète** : Historique de tous les accès
4. **Séparation des responsabilités** : Chaque module a un rôle précis
5. **Middleware de sécurité** : Vérification automatique des autorisations

## API Endpoints

### Auth
- `POST /api/auth/cps/login` - Authentification CPS
- `GET /api/auth/access-options` - Options d'accès

### Access (Professionnels)
- `POST /api/access/request-standard` - Demande standard
- `POST /api/access/grant-emergency` - Accès urgence
- `POST /api/access/grant-secret` - Accès secret
- `GET /api/access/history/professional` - Historique professionnel

### Access (Patients)
- `GET /api/access/patient/pending` - Demandes en attente
- `PATCH /api/access/patient/response/:id` - Répondre
- `GET /api/access/patient/history` - Historique accès
- `GET /api/access/patient/authorizations` - Autorisations actives

### Patient
- `POST /api/patient/login` - Connexion patient
- `POST /api/patient/register` - Inscription patient
- `GET /api/patient/me` - Profil patient
- `PATCH /api/patient/me` - Modifier profil
- `PATCH /api/patient/change-password` - Changer mot de passe

### DossierMedical
- `GET /api/dossierMedical/patient/:patientId/complet` - Dossier complet
- `GET /api/dossierMedical/patient/:patientId/resume` - Résumé patient

## Architecture Corrigée

### Séparation des Responsabilités

**Module Access :**
- Gestion complète des autorisations d'accès
- Routes pour professionnels ET patients
- Middleware de vérification patient intégré

**Module Patient :**
- Gestion des données patient uniquement
- Pas de logique d'accès
- Authentification patient

**Avantages de cette architecture :**
1. **Pas de dépendance circulaire** : Le module patient ne dépend plus du module access
2. **Responsabilités claires** : Chaque module a un rôle précis
3. **Sécurité renforcée** : Middleware spécialisé pour chaque type d'utilisateur
4. **Maintenance facilitée** : Logique d'accès centralisée dans le module access

Tous les accès aux données médicales passent par le middleware de vérification d'autorisation.
