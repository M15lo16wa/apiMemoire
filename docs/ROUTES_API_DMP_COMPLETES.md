# Routes API DMP - Documentation Complète

## 📋 Vue d'ensemble

Cette documentation détaille toutes les routes API disponibles pour la fonctionnalité DMP (Dossier Médical Partagé), incluant l'authentification CPS, la gestion des sessions, et les notifications.

## 🔐 Routes d'authentification

### **1. Authentification CPS**
```http
POST /api/medecin/dmp/authentification-cps
```

**Headers :**
```
Content-Type: application/json
Authorization: Bearer <token_medecin>
```

**Body :**
```json
{
  "numero_adeli": "AH23456780",
  "code_cps": "1234",
  "patient_id": 5
}
```

**Réponse succès :**
```json
{
  "status": "success",
  "message": "Authentification CPS réussie",
  "data": {
    "session_id": 15,
    "expires_at": "2025-08-06T10:35:14.000Z",
    "patient_info": {
      "id": 5,
      "nom": "MOLOWA",
      "prenom": "ESSONGA",
      "numero_dossier": "PAT-17540449445",
      "date_naissance": "1990-01-01",
      "email": "molowa.essonga@email.com",
      "telephone": "+33123456789"
    },
    "professionnel_info": {
      "id": 79,
      "nom": "Sakura",
      "prenom": "Saza",
      "numero_adeli": "AH23456780",
      "specialite": "Cardiologie"
    }
  }
}
```

**Réponse erreur :**
```json
{
  "status": "error",
  "message": "Code CPS invalide",
  "error": {
    "code": "CPS_INVALID",
    "attempts_remaining": 2
  }
}
```

### **2. Vérification du statut CPS**
```http
GET /api/medecin/dmp/statut-cps
```

**Headers :**
```
Authorization: Bearer <token_medecin>
```

**Réponse :**
```json
{
  "status": "success",
  "data": {
    "numero_adeli": "AH23456780",
    "statut": "active",
    "derniere_utilisation": "2025-08-06T09:35:14.000Z",
    "tentatives_restantes": 3
  }
}
```

## 📊 Routes de gestion des sessions

### **3. Création de session d'accès**
```http
POST /api/medecin/dmp/creer-session
```

**Body :**
```json
{
  "professionnel_id": 79,
  "patient_id": 5,
  "mode_acces": "autorise_par_patient",
  "duree_acces": 60,
  "raison_acces": "Consultation de routine",
  "ip_adresse": "192.168.1.100",
  "user_agent": "Mozilla/5.0..."
}
```

**Réponse :**
```json
{
  "status": "success",
  "message": "Session créée avec succès",
  "data": {
    "session_id": 16,
    "statut": "en_attente",
    "date_debut": "2025-08-06T09:35:14.000Z",
    "date_fin": "2025-08-06T10:35:14.000Z",
    "mode_acces": "autorise_par_patient",
    "duree_acces": 60,
    "raison_acces": "Consultation de routine"
  }
}
```

### **4. Demande d'accès au DMP**
```http
POST 













```

**Body :**
```json
{
  "session_id": 16,
  "mode_acces": "autorise_par_patient",
  "duree_acces": 60,
  "raison_acces": "Consultation de routine"
}
```

**Réponse :**
```json
{
  "status": "success",
  "message": "Demande d'accès envoyée",
  "data": {
    "session_id": 16,
    "notification_id": 10,
    "statut": "en_attente_validation",
    "patient_notified": true,
    "expires_at": "2025-08-06T10:35:14.000Z"
  }
}
```

### **5. Vérification du statut de session**
```http
GET /api/medecin/dmp/session/{session_id}
```

**Réponse :**
```json
{
  "status": "success",
  "data": {
    "session_id": 16,
    "statut": "active",
    "mode_acces": "autorise_par_patient",
    "date_debut": "2025-08-06T09:35:14.000Z",
    "date_fin": "2025-08-06T10:35:14.000Z",
    "duree_restante": 45,
    "patient": {
      "id": 5,
      "nom": "MOLOWA",
      "prenom": "ESSONGA"
    },
    "professionnel": {
      "id": 79,
      "nom": "Sakura",
      "prenom": "Saza"
    }
  }
}
```

### **6. Terminer une session**
```http
PUT /api/medecin/dmp/session/{session_id}/terminer
```

**Body :**
```json
{
  "raison_terminaison": "consultation_terminee",
  "commentaire": "Consultation terminée avec succès"
}
```

**Réponse :**
```json
{
  "status": "success",
  "message": "Session terminée",
  "data": {
    "session_id": 16,
    "statut": "terminee",
    "date_fin": "2025-08-06T09:45:14.000Z",
    "duree_totale": 10
  }
}
```

## 🔔 Routes de notifications

### **7. Récupérer les notifications d'une session**
```http
GET /api/medecin/dmp/notifications/{session_id}
```

**Réponse :**
```json
{
  "status": "success",
  "data": {
    "session_id": 16,
    "notifications": [
      {
        "id_notification": 10,
        "type_notification": "demande_validation",
        "canal_envoi": "email",
        "destinataire": "molowa.essonga@email.com",
        "statut_envoi": "envoyee",
        "date_envoi": "2025-08-06T09:35:14.000Z",
        "date_livraison": "2025-08-06T09:35:20.000Z",
        "contenu": "Dr. Sakura Saza demande l'accès à votre dossier médical partagé (DMP)..."
      }
    ]
  }
}
```

### **8. Renvoyer une notification**
```http
POST /api/medecin/dmp/notifications/{notification_id}/renvoyer
```

**Réponse :**
```json
{
  "status": "success",
  "message": "Notification renvoyée",
  "data": {
    "notification_id": 10,
    "nouveau_statut": "envoyee",
    "nombre_tentatives": 2
  }
}
```

## 📈 Routes de statistiques et monitoring

### **9. Statistiques d'accès DMP**
```http
GET /api/medecin/dmp/statistiques
```

**Query Parameters :**
```
?periode=30j&mode_acces=autorise_par_patient
```

**Réponse :**
```json
{
  "status": "success",
  "data": {
    "periode": "30j",
    "total_sessions": 45,
    "sessions_par_mode": {
      "autorise_par_patient": 30,
      "urgence": 10,
      "connexion_secrete": 5
    },
    "taux_reussite": 0.95,
    "duree_moyenne": 45,
    "notifications_envoyees": 42,
    "notifications_livrees": 40
  }
}
```

### **10. Historique des accès**
```http
GET /api/medecin/dmp/historique
```

**Query Parameters :**
```
?page=1&limit=20&patient_id=5&date_debut=2025-08-01&date_fin=2025-08-06
```

**Réponse :**
```json
{
  "status": "success",
  "data": {
    "sessions": [
      {
        "session_id": 16,
        "date_debut": "2025-08-06T09:35:14.000Z",
        "date_fin": "2025-08-06T10:35:14.000Z",
        "mode_acces": "autorise_par_patient",
        "statut": "terminee",
        "patient": {
          "id": 5,
          "nom": "MOLOWA",
          "prenom": "ESSONGA"
        },
        "duree_totale": 60,
        "raison_acces": "Consultation de routine"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

## 🛡️ Routes de sécurité

### **11. Vérification des tentatives CPS**
```http
GET /api/medecin/dmp/tentatives-cps
```

**Réponse :**
```json
{
  "status": "success",
  "data": {
    "numero_adeli": "AH23456780",
    "tentatives_recentes": [
      {
        "date_tentative": "2025-08-06T09:30:14.000Z",
        "statut": "echec",
        "ip_adresse": "192.168.1.100"
      },
      {
        "date_tentative": "2025-08-06T09:35:14.000Z",
        "statut": "reussite",
        "ip_adresse": "192.168.1.100"
      }
    ],
    "tentatives_restantes": 3,
    "bloque_jusqu_a": null
  }
}
```

### **12. Débloquer les tentatives CPS**
```http
POST /api/medecin/dmp/debloquer-cps
```

**Body :**
```json
{
  "numero_adeli": "AH23456780",
  "raison_deblocage": "demande_medecin"
}
```

**Réponse :**
```json
{
  "status": "success",
  "message": "Tentatives CPS débloquées",
  "data": {
    "numero_adeli": "AH23456780",
    "tentatives_restantes": 3,
    "date_deblocage": "2025-08-06T09:40:14.000Z"
  }
}
```

## 🧪 Routes de test

### **13. Test du système DMP**
```http
GET /api/medecin/dmp/test/systeme
```

**Réponse :**
```json
{
  "status": "success",
  "message": "Test système DMP réussi",
  "data": {
    "medecin": {
      "id": 79,
      "nom": "Sakura",
      "prenom": "Saza"
    },
    "patient": {
      "id": 5,
      "nom": "MOLOWA",
      "prenom": "ESSONGA",
      "numero_dossier": "PAT-17540449445"
    },
    "session": {
      "id_session": 14,
      "statut": "active",
      "date_debut": "2025-08-06T09:35:14.000Z",
      "date_fin": "2025-08-06T10:35:14.000Z"
    },
    "notification": {
      "id_notification": 9,
      "type": "demande_validation",
      "statut": "en_attente",
      "contenu": "Dr. Sakura Saza demande l'accès à votre dossier médical partagé (DMP)..."
    }
  }
}
```

### **14. Test des notifications**
```http
POST /api/medecin/dmp/test/notification
```

**Body :**
```json
{
  "patient_id": 5,
  "professionnel_id": 79,
  "type_notification": "demande_validation",
  "canal_envoi": "email"
}
```

**Réponse :**
```json
{
  "status": "success",
  "message": "Notification de test envoyée",
  "data": {
    "notification_id": 11,
    "statut_envoi": "envoyee",
    "message_id": "test_123456"
  }
}
```

## 📝 Codes d'erreur

### **Codes d'erreur CPS**
- `CPS_INVALID` : Code CPS invalide
- `CPS_EXPIRED` : Code CPS expiré
- `CPS_BLOCKED` : Compte CPS bloqué
- `CPS_TOO_MANY_ATTEMPTS` : Trop de tentatives

### **Codes d'erreur Session**
- `SESSION_NOT_FOUND` : Session introuvable
- `SESSION_EXPIRED` : Session expirée
- `SESSION_ALREADY_ACTIVE` : Session déjà active
- `INVALID_ACCESS_MODE` : Mode d'accès invalide

### **Codes d'erreur Notification**
- `NOTIFICATION_FAILED` : Échec d'envoi de notification
- `INVALID_RECIPIENT` : Destinataire invalide
- `NOTIFICATION_QUOTA_EXCEEDED` : Quota de notifications dépassé

## 🔧 Exemples d'utilisation

### **Exemple complet d'accès DMP**
```javascript
// 1. Authentification CPS
const authResponse = await fetch('/api/medecin/dmp/authentification-cps', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    numero_adeli: 'AH23456780',
    code_cps: '1234',
    patient_id: 5
  })
});

const authData = await authResponse.json();

// 2. Création de session
const sessionResponse = await fetch('/api/medecin/dmp/creer-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    professionnel_id: 79,
    patient_id: 5,
    mode_acces: 'autorise_par_patient',
    duree_acces: 60,
    raison_acces: 'Consultation de routine'
  })
});

const sessionData = await sessionResponse.json();

// 3. Demande d'accès
const accessResponse = await fetch('/api/medecin/dmp/demande-acces', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session_id: sessionData.data.session_id,
    mode_acces: 'autorise_par_patient',
    duree_acces: 60,
    raison_acces: 'Consultation de routine'
  })
});

const accessData = await accessResponse.json();
```

### **Exemple de gestion d'erreurs**
```javascript
try {
  const response = await fetch('/api/medecin/dmp/authentification-cps', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  
  const data = await response.json();
  
  if (data.status === 'success') {
    // Traitement du succès
    console.log('Authentification réussie:', data.data);
  } else {
    // Gestion des erreurs spécifiques
    switch (data.error.code) {
      case 'CPS_INVALID':
        console.error('Code CPS invalide');
        break;
      case 'CPS_BLOCKED':
        console.error('Compte CPS bloqué');
        break;
      case 'CPS_TOO_MANY_ATTEMPTS':
        console.error('Trop de tentatives');
        break;
      default:
        console.error('Erreur inconnue:', data.message);
    }
  }
} catch (error) {
  console.error('Erreur réseau:', error);
}
```

Cette documentation fournit toutes les informations nécessaires pour intégrer les routes API DMP dans une application frontend, avec des exemples concrets et une gestion complète des erreurs. 