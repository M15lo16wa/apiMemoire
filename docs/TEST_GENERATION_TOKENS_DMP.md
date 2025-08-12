# Test de la Génération de Tokens DMP

## Problème Résolu

**Avant :**
- Les autorisations étaient créées mais aucun token JWT n'était généré
- Le médecin ne pouvait pas accéder au DMP même avec une autorisation active
- Pas de mécanisme de sécurité pour l'accès aux données médicales

**Après :**
- Génération automatique de tokens DMP lors de l'octroi d'accès
- Tokens spécifiques avec informations d'autorisation
- Middleware de vérification des tokens DMP
- Durées d'expiration adaptées au type d'accès

## Types de Tokens DMP

### 1. **Accès Standard** (8 heures)
```javascript
{
  id: professionnel_id,
  role: 'medecin',
  type: 'dmp-access',
  patientId: patient_id,
  autorisationId: autorisation.id_acces,
  accessType: 'standard'
}
```

### 2. **Accès d'Urgence** (1 heure)
```javascript
{
  id: professionnel_id,
  role: 'medecin',
  type: 'dmp-access',
  patientId: patient_id,
  autorisationId: autorisation.id_acces,
  accessType: 'urgence'
}
```

### 3. **Accès Secret** (2 heures)
```javascript
{
  id: professionnel_id,
  role: 'medecin',
  type: 'dmp-access',
  patientId: patient_id,
  autorisationId: autorisation.id_acces,
  accessType: 'secret'
}
```

## Tests de Génération de Tokens

### 1. Test d'Accès d'Urgence

**Requête :**
```bash
curl -X POST http://localhost:3000/api/access/grant-emergency \
  -H "Authorization: Bearer <valid_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": 123,
    "justification_urgence": "Patient en détresse vitale"
  }'
```

**Résultat Attendu :**
```json
{
  "status": "success",
  "message": "Accès d'urgence accordé",
  "data": {
    "autorisation": {
      "id_acces": 1,
      "type_acces": "lecture_urgence",
      "statut": "actif",
      "date_debut": "2024-01-15T10:30:00.000Z",
      "date_fin": "2024-01-16T10:30:00.000Z"
    },
    "dmp_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600
  }
}
```

### 2. Test d'Accès Secret

**Requête :**
```bash
curl -X POST http://localhost:3000/api/access/grant-secret \
  -H "Authorization: Bearer <valid_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": 123,
    "raison_secrete": "Investigation médicale"
  }'
```

**Résultat Attendu :**
```json
{
  "status": "success",
  "message": "Accès secret accordé",
  "data": {
    "autorisation": {
      "id_acces": 2,
      "type_acces": "lecture_secrete",
      "statut": "actif",
      "date_debut": "2024-01-15T10:30:00.000Z",
      "date_fin": "2024-01-15T12:30:00.000Z"
    },
    "dmp_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 7200
  }
}
```

### 3. Test de Réponse Patient (Acceptation)

**Requête :**
```bash
curl -X PATCH http://localhost:3000/api/access/patient/response/1 \
  -H "Authorization: Bearer <patient_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "response": "accept",
    "comment": "J'accepte l'accès à mon dossier"
  }'
```

**Résultat Attendu :**
```json
{
  "status": "success",
  "message": "Demande acceptée avec succès",
  "data": {
    "autorisation": {
      "id_acces": 1,
      "statut": "actif",
      "date_validation": "2024-01-15T10:35:00.000Z"
    },
    "dmp_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 28800
  }
}
```

### 4. Test de Génération de Token pour Autorisation Existante

**Requête :**
```bash
curl -X GET http://localhost:3000/api/access/dmp-token/1 \
  -H "Authorization: Bearer <valid_token>"
```

**Résultat Attendu :**
```json
{
  "status": "success",
  "message": "Token DMP généré avec succès",
  "data": {
    "dmp_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 28800,
    "autorisation": {
      "id_acces": 1,
      "type_acces": "lecture",
      "statut": "actif"
    }
  }
}
```

## Utilisation du Token DMP

### Accès au Dossier Médical avec Token DMP

**Requête :**
```bash
curl -X GET http://localhost:3000/api/dossierMedical/patient/123/complet \
  -H "DMP-Access-Token: <dmp_token>" \
  -H "Content-Type: application/json"
```

**Résultat Attendu :**
```json
{
  "status": "success",
  "data": {
    "patient": {
      "id_patient": 123,
      "nom": "Dupont",
      "prenom": "Jean"
    },
    "dossier": {
      "id_dossier": 456,
      "statut": "actif"
    }
  }
}
```

## Middleware de Vérification

### `verifyDMPAccessToken`

```javascript
exports.verifyDMPAccessToken = catchAsync(async (req, res, next) => {
  const token = req.headers['dmp-access-token'] || req.headers['authorization']?.replace('Bearer ', '');

  if (!token) {
    return next(new AppError('Token DMP requis', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify it's a DMP access token
    if (decoded.type !== 'dmp-access') {
      return next(new AppError('Token invalide pour l\'accès DMP', 403));
    }

    // Verify the authorization still exists and is active
    const autorisation = await AutorisationAcces.findByPk(decoded.autorisationId);
    if (!autorisation || autorisation.statut !== 'actif') {
      return next(new AppError('Autorisation DMP non active', 403));
    }

    // Verify the authorization is still valid
    if (!autorisation.AccessAutorised()) {
      return next(new AppError('Autorisation DMP expirée', 403));
    }

    // Add DMP access info to request
    req.dmpAccess = {
      professionnel_id: decoded.id,
      patient_id: decoded.patientId,
      autorisation_id: decoded.autorisationId,
      access_type: decoded.accessType,
      autorisation: autorisation
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Token DMP invalide', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token DMP expiré', 401));
    }
    return next(new AppError('Erreur de vérification du token DMP', 500));
  }
});
```

## Routes Mises à Jour

### Routes d'Accès avec Génération de Tokens

```javascript
// Accès d'urgence avec token DMP
router.post('/grant-emergency', accessController.grantEmergencyAccess);

// Accès secret avec token DMP
router.post('/grant-secret', accessController.grantSecretAccess);

// Réponse patient avec token DMP si accepté
router.patch('/patient/response/:authorizationId', 
  patientAccessMiddleware.requirePatientAuth, 
  patientAccessMiddleware.checkPatientAuthorizationAccess, 
  accessController.processPatientResponse
);

// Génération de token DMP pour autorisation existante
router.get('/dmp-token/:authorizationId', accessController.generateDMPAccessToken);
```

## Avantages de la Génération de Tokens

### 1. **Sécurité Renforcée**
- Tokens spécifiques pour l'accès DMP
- Vérification en temps réel des autorisations
- Expiration automatique selon le type d'accès

### 2. **Traçabilité Complète**
- Chaque token est lié à une autorisation spécifique
- Historique détaillé des accès
- Informations d'accès disponibles dans `req.dmpAccess`

### 3. **Flexibilité d'Accès**
- Durées d'expiration adaptées au contexte
- Support de différents types d'accès
- Régénération de tokens possible

### 4. **Interface Médecin**
- Le médecin peut voir ses autorisations actives
- Génération de tokens à la demande
- Accès direct au DMP avec le token

## Flux Complet d'Accès

### 1. **Demande d'Accès Standard**
```
Médecin → Demande → Patient → Acceptation → Token DMP → Accès DMP
```

### 2. **Accès d'Urgence**
```
Médecin → Justification → Token DMP immédiat → Accès DMP
```

### 3. **Accès Secret**
```
Médecin → Raison secrète → Token DMP immédiat → Accès DMP (sans notification)
```

Cette implémentation garantit une sécurité maximale tout en permettant un accès flexible et tracé aux dossiers médicaux !
