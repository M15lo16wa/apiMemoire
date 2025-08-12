# Exemple d'Utilisation - Système d'Accès DMP

## Scénario : Dr. Martin consulte le dossier de M. Dupont

### 1. Authentification CPS

**Requête :**
```bash
curl -X POST http://localhost:3000/api/auth/cps/login \
  -H "Content-Type: application/json" \
  -d '{
    "cpsCode": "1234"
  }'
```

**Réponse :**
```json
{
  "status": "success",
  "message": "Authentification CPS réussie",
  "data": {
    "professionnel": {
      "id": 1,
      "nom": "Martin",
      "prenom": "Sophie",
      "specialite": "Cardiologie",
      "role": "medecin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Consultation des Options d'Accès

**Requête :**
```bash
curl -X GET http://localhost:3000/api/auth/access-options \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
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

### 3. Demande d'Accès Standard

**Requête :**
```bash
curl -X POST http://localhost:3000/api/access/request-standard \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": 123,
    "raison_demande": "Consultation de routine - suivi cardiologique"
  }'
```

**Réponse :**
```json
{
  "status": "success",
  "message": "Demande d'accès envoyée avec succès",
  "data": {
    "autorisation": {
      "id_acces": 1,
      "type_acces": "lecture",
      "date_debut": "2024-01-15T10:30:00.000Z",
      "statut": "attente_validation",
      "raison_demande": "Consultation de routine - suivi cardiologique",
      "patient_id": 123,
      "professionnel_id": 1
    }
  }
}
```

### 4. Notification au Patient (Automatique)

Le système crée automatiquement une notification pour M. Dupont :

```json
{
  "patient_id": 123,
  "professionnel_id": 1,
  "type_notification": "demande_acces",
  "message": "Le Dr. Martin Sophie demande l'accès à votre dossier médical",
  "statut": "non_lu"
}
```

### 5. Réponse du Patient

**Requête (côté patient) :**
```bash
curl -X PATCH http://localhost:3000/api/access/patient/response/1 \
  -H "Authorization: Bearer <patient_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "response": "accept",
    "comment": "J'accepte l'accès pour ma consultation cardiologique"
  }'
```

**Réponse :**
```json
{
  "status": "success",
  "message": "Demande acceptée avec succès",
  "data": {
    "autorisation": {
      "id_acces": 1,
      "statut": "actif",
      "date_validation": "2024-01-15T10:35:00.000Z"
    }
  }
}
```

### 6. Accès au Dossier Médical

**Requête :**
```bash
curl -X GET http://localhost:3000/api/dossierMedical/patient/123/complet \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Réponse :**
```json
{
  "status": "success",
  "data": {
    "patient": {
      "id_patient": 123,
      "nom": "Dupont",
      "prenom": "Jean",
      "date_naissance": "1980-05-15"
    },
    "dossier": {
      "id_dossier": 456,
      "numeroDossier": "DOSSIER-AB12C-1A2B3",
      "statut": "actif",
      "dateCreation": "2020-01-15T00:00:00.000Z"
    },
    "consultations": [...],
    "prescriptions": [...],
    "examens": [...]
  }
}
```

## Scénario d'Urgence

### Accès d'Urgence

**Requête :**
```bash
curl -X POST http://localhost:3000/api/access/grant-emergency \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": 123,
    "justification_urgence": "Patient en arrêt cardiaque - nécessité d'accès immédiat aux antécédents"
  }'
```

**Réponse :**
```json
{
  "status": "success",
  "message": "Accès d'urgence accordé",
  "data": {
    "autorisation": {
      "id_acces": 2,
      "type_acces": "lecture_urgence",
      "date_debut": "2024-01-15T11:00:00.000Z",
      "date_fin": "2024-01-16T11:00:00.000Z",
      "statut": "actif",
      "conditions_acces": {
        "type": "urgence",
        "justification": "Patient en arrêt cardiaque - nécessité d'accès immédiat aux antécédents"
      }
    }
  }
}
```

## Gestion des Demandes d'Accès (Côté Patient)

### Consultation des Demandes en Attente

**Requête :**
```bash
curl -X GET http://localhost:3000/api/access/patient/pending \
  -H "Authorization: Bearer <patient_token>"
```

**Réponse :**
```json
{
  "status": "success",
  "results": 1,
  "data": {
    "pendingRequests": [
      {
        "id_acces": 1,
        "type_acces": "lecture",
        "date_debut": "2024-01-15T10:30:00.000Z",
        "statut": "attente_validation",
        "raison_demande": "Consultation de routine - suivi cardiologique",
        "professionnel": {
          "id_professionnel": 1,
          "nom": "Martin",
          "prenom": "Sophie",
          "specialite": "Cardiologie",
          "role": "medecin"
        }
      }
    ]
  }
}
```

### Historique des Accès (Patient)

**Requête :**
```bash
curl -X GET http://localhost:3000/api/access/patient/history \
  -H "Authorization: Bearer <patient_token>"
```

**Réponse :**
```json
{
  "status": "success",
  "results": 3,
  "data": {
    "history": [
      {
        "id_historique": 1,
        "date_heure_acces": "2024-01-15T10:30:00.000Z",
        "action": "demande_acces_standard",
        "type_ressource": "DossierMedical",
        "id_ressource": 123,
        "details": "Demande d'accès standard au dossier du patient Dupont Jean",
        "statut": "SUCCES",
        "professionnel": {
          "id_professionnel": 1,
          "nom": "Martin",
          "prenom": "Sophie",
          "specialite": "Cardiologie"
        }
      }
    ]
  }
}
```

## Historique des Accès (Professionnel)

### Consultation de l'Historique

**Requête :**
```bash
curl -X GET http://localhost:3000/api/access/history/professional \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Réponse :**
```json
{
  "status": "success",
  "results": 3,
  "data": {
    "history": [
      {
        "id_historique": 1,
        "date_heure_acces": "2024-01-15T10:30:00.000Z",
        "action": "demande_acces_standard",
        "type_ressource": "DossierMedical",
        "id_ressource": 123,
        "details": "Demande d'accès standard au dossier du patient Dupont Jean",
        "statut": "SUCCES",
        "patient": {
          "id_patient": 123,
          "nom": "Dupont",
          "prenom": "Jean"
        }
      },
      {
        "id_historique": 2,
        "date_heure_acces": "2024-01-15T10:35:00.000Z",
        "action": "reponse_patient_accept",
        "type_ressource": "AutorisationAcces",
        "id_ressource": 1,
        "details": "Patient a accepté la demande d'accès",
        "statut": "SUCCES"
      },
      {
        "id_historique": 3,
        "date_heure_acces": "2024-01-15T11:00:00.000Z",
        "action": "acces_dossier_medical",
        "type_ressource": "DossierMedical",
        "id_ressource": 123,
        "details": "Accès au dossier médical du patient 123",
        "statut": "SUCCES"
      }
    ]
  }
}
```

## Points Clés du Système

1. **Traçabilité Complète** : Chaque action est enregistrée avec timestamp, IP, et détails
2. **Sécurité Granulaire** : Vérification systématique des autorisations
3. **Flexibilité** : Trois types d'accès (standard, urgence, secret)
4. **Contrôle Patient** : Le patient peut accepter/refuser les demandes
5. **Urgence** : Accès immédiat avec justification obligatoire
6. **Secret** : Accès discret pour investigations médicales
7. **Architecture Propre** : Séparation claire des responsabilités entre modules

## Gestion des Erreurs

### Accès Non Autorisé
```json
{
  "status": "error",
  "message": "Accès non autorisé au dossier médical de ce patient",
  "statusCode": 403
}
```

### Code CPS Invalide
```json
{
  "status": "error",
  "message": "Code CPS invalide. Le code doit contenir exactement 4 chiffres.",
  "statusCode": 400
}
```

### Patient Non Trouvé
```json
{
  "status": "error",
  "message": "Patient non trouvé",
  "statusCode": 404
}
```

### Demande d'Autorisation Non Trouvée
```json
{
  "status": "error",
  "message": "Demande d'autorisation non trouvée ou déjà traitée",
  "statusCode": 404
}
```

Ce système garantit une traçabilité complète et une sécurité maximale tout en permettant une flexibilité d'accès adaptée aux besoins médicaux. L'architecture corrigée élimine les dépendances circulaires et clarifie les responsabilités de chaque module.
