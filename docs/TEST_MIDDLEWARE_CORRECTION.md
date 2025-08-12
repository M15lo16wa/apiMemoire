# Test de la Correction du Middleware d'Accès

## Problème Résolu

**Avant (Incorrect) :**
```javascript
// Dans dossierMedicalController.js
await checkMedicalRecordAccess(req, res, async () => {
    // ... logique ...
    await logMedicalRecordAccess(req, res, async () => {
        res.status(200).json(...);
    });
});
```

**Après (Correct) :**
```javascript
// Dans dossierMedical.route.js
router.get('/patient/:patient_id/complet', 
    authenticateToken, // 1. Vérifie le token
    checkMedicalRecordAccess, // 2. Vérifie si l'accès au DMP de ce patient est autorisé
    logMedicalRecordAccess, // 3. Log l'accès
    dossierMedicalController.getDossierCompletPatient // 4. Exécute la logique finale
);
```

## Chaîne de Middleware Correcte

### Ordre d'Exécution

1. **`authenticateToken`** : Vérifie le token JWT
2. **`checkMedicalRecordAccess`** : Vérifie les autorisations d'accès
3. **`logMedicalRecordAccess`** : Enregistre l'accès dans l'historique
4. **`dossierMedicalController.getDossierCompletPatient`** : Exécute la logique métier

### Flux de Données

```
Request → authenticateToken → checkMedicalRecordAccess → logMedicalRecordAccess → Controller → Response
```

## Test des Routes

### 1. Test d'Accès Autorisé

**Requête :**
```bash
curl -X GET http://localhost:3000/api/dossierMedical/patient/123/complet \
  -H "Authorization: Bearer <valid_token>" \
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

### 2. Test d'Accès Non Autorisé

**Requête :**
```bash
curl -X GET http://localhost:3000/api/dossierMedical/patient/123/complet \
  -H "Authorization: Bearer <valid_token>" \
  -H "Content-Type: application/json"
```

**Résultat Attendu :**
```json
{
  "status": "error",
  "message": "Accès non autorisé au dossier médical de ce patient",
  "statusCode": 403
}
```

### 3. Test Token Invalide

**Requête :**
```bash
curl -X GET http://localhost:3000/api/dossierMedical/patient/123/complet \
  -H "Authorization: Bearer <invalid_token>" \
  -H "Content-Type: application/json"
```

**Résultat Attendu :**
```json
{
  "status": "error",
  "message": "Token invalide",
  "statusCode": 401
}
```

## Vérification de l'Historique

Après chaque accès réussi, une entrée doit être créée dans `HistoriqueAccess` :

```sql
SELECT * FROM HistoriquesAccess 
WHERE type_ressource = 'DossierMedical' 
AND id_ressource = 123 
ORDER BY date_heure_acces DESC 
LIMIT 1;
```

**Résultat Attendu :**
```json
{
  "id_historique": 1,
  "date_heure_acces": "2024-01-15T10:30:00.000Z",
  "action": "acces_dossier_medical",
  "type_ressource": "DossierMedical",
  "id_ressource": 123,
  "details": "Accès au dossier médical du patient 123",
  "statut": "SUCCES",
  "professionnel_id": 1,
  "id_patient": 123,
  "adresse_ip": "192.168.1.100",
  "user_agent": "Mozilla/5.0..."
}
```

## Avantages de la Correction

### 1. **Séparation des Responsabilités**
- Chaque middleware a une responsabilité unique
- Facile à tester et maintenir
- Réutilisable dans d'autres routes

### 2. **Performance**
- Pas de callbacks imbriqués
- Exécution séquentielle optimisée
- Arrêt immédiat en cas d'erreur

### 3. **Lisibilité**
- Code plus clair et compréhensible
- Chaîne de middleware explicite
- Debugging facilité

### 4. **Sécurité**
- Vérification systématique des autorisations
- Traçabilité complète
- Gestion d'erreurs centralisée

## Middleware Corrigé

### `checkMedicalRecordAccess`
```javascript
exports.checkMedicalRecordAccess = catchAsync(async (req, res, next) => {
  const professionnel_id = req.user.id;
  const patient_id = req.params.patient_id || req.params.patientId || req.body.patient_id;

  if (!patient_id) {
    return next(new AppError('ID patient requis', 400));
  }

  // Vérification des autorisations
  const authorizations = await AutorisationAcces.findAll({
    where: {
      professionnel_id,
      patient_id,
      statut: 'actif'
    }
  });

  let hasAccess = false;
  let accessType = null;

  for (const auth of authorizations) {
    if (auth.AccessAutorised()) {
      hasAccess = true;
      accessType = auth.type_acces;
      break;
    }
  }

  if (!hasAccess) {
    return next(new AppError('Accès non autorisé au dossier médical de ce patient', 403));
  }

  // Ajout des informations d'accès à la requête
  req.accessInfo = {
    hasAccess: true,
    accessType,
    authorizationId: authorizations[0]?.id_acces
  };

  next();
});
```

### `logMedicalRecordAccess`
```javascript
exports.logMedicalRecordAccess = catchAsync(async (req, res, next) => {
  const { HistoriqueAccess } = require('../models');
  
  const patient_id = req.params.patient_id || req.params.patientId || req.body.patient_id;
  
  const logData = {
    date_heure_acces: new Date(),
    action: req.accessInfo?.accessType === 'urgence' ? 'acces_urgence_dossier' : 'acces_dossier_medical',
    type_ressource: 'DossierMedical',
    id_ressource: patient_id,
    details: `Accès au dossier médical du patient ${patient_id}`,
    statut: 'SUCCES',
    professionnel_id: req.user.id,
    id_patient: patient_id,
    adresse_ip: req.ip || req.connection.remoteAddress,
    user_agent: req.get('User-Agent')
  };

  // Enregistrement asynchrone
  HistoriqueAccess.create(logData).catch(err => {
    console.error('Erreur lors de l\'enregistrement de l\'accès:', err);
  });

  next();
});
```

## Routes Corrigées

### `dossierMedical.route.js`
```javascript
const { checkMedicalRecordAccess, logMedicalRecordAccess } = require('../../middlewares/access.middleware');

// Routes avec middleware d'accès
router.get('/patient/:patient_id/complet', 
    authenticateToken, // 1. Vérifie le token
    checkMedicalRecordAccess, // 2. Vérifie les autorisations
    logMedicalRecordAccess, // 3. Log l'accès
    dossierMedicalController.getDossierCompletPatient // 4. Logique métier
);

router.get('/patient/:patient_id/resume', 
    authenticateToken, // 1. Vérifie le token
    checkMedicalRecordAccess, // 2. Vérifie les autorisations
    logMedicalRecordAccess, // 3. Log l'accès
    dossierMedicalController.getResumePatient // 4. Logique métier
);
```

Cette correction garantit une architecture propre, sécurisée et maintenable !
