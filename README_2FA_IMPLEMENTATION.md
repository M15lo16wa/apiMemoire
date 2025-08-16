# 🔐 Implémentation de l'Authentification à Double Facteur (2FA)

## 📋 Vue d'ensemble

Ce document décrit l'implémentation de l'authentification à double facteur (2FA) dans votre API DMP. **La 2FA ne s'applique qu'à l'accès aux dossiers médicaux des patients**, pas aux autres fonctionnalités comme les prescriptions ou la gestion des dossiers.

Le système utilise des codes TOTP (Time-based One-Time Password) compatibles avec les applications comme Google Authenticator, Authy, etc.

## 🎯 Périmètre de la 2FA

**La 2FA ne s'applique qu'aux routes d'accès aux dossiers médicaux des patients :**

### ✅ Routes PROTÉGÉES par 2FA
- **`/access/request-standard`** - Demande d'accès standard au dossier patient
- **`/access/grant-emergency`** - Accès d'urgence au dossier patient  
- **`/access/revoke-access`** - Révoquer un accès au dossier patient
- **`/access/modify-permissions`** - Modifier les permissions d'accès
- **`/access/status/:patientId`** - Statut d'accès au dossier patient
- **`/access/patient/status`** - Statut d'accès du patient à son propre dossier

### ❌ Routes NON protégées par 2FA
- **Prescriptions** - Création, modification, consultation d'ordonnances
- **Gestion des dossiers** - Création, modification, suppression de dossiers
- **Consultations** - Gestion des rendez-vous et consultations
- **Professionnels de santé** - Gestion des comptes et profils

## 🏗️ Architecture

### Composants principaux

1. **`TwoFactorService`** - Service principal de gestion 2FA
2. **`twoFactor.middleware.js`** - Middlewares de vérification 2FA
3. **`global2FA.middleware.js`** - Middleware global pour la vérification automatique
4. **Routes 2FA** - Endpoints d'API pour la gestion 2FA
5. **Contrôleurs 2FA** - Logique métier pour les opérations 2FA

## 🚀 Installation

### Dépendances requises

```bash
npm install otplib qrcode
```

### Vérification de l'installation

```bash
node test_2fa_basic.js
```

## 📡 API Endpoints

### Configuration 2FA

#### `POST /api/auth/setup-2fa`
Configure le 2FA pour un utilisateur.

**Headers requis:**
```
Authorization: Bearer <token>
```

**Réponse:**
```json
{
  "status": "success",
  "message": "Configuration 2FA initialisée",
  "data": {
    "qrCode": "data:image/png;base64,...",
    "secret": "ABCDEFGHIJKLMNOP",
    "recoveryCodes": ["12345678", "87654321", "11223344"],
    "message": "Scannez le QR code avec votre app authenticator, puis validez avec un code"
  }
}
```

#### `POST /api/auth/verify-2fa`
Valide et active le 2FA avec un code.

**Headers requis:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "token": "123456"
}
```

**Réponse:**
```json
{
  "status": "success",
  "message": "2FA activé avec succès",
  "data": {
    "twoFactorEnabled": true
  }
}
```

### Gestion des sessions

#### `POST /api/auth/validate-2fa-session`
Valide le 2FA pour une session.

**Headers requis:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "twoFactorToken": "123456"
}
```

#### `POST /api/auth/verify-recovery-code`
Utilise un code de récupération.

**Headers requis:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "recoveryCode": "12345678"
}
```

### Gestion du 2FA

#### `POST /api/auth/disable-2fa`
Désactive le 2FA.

#### `POST /api/auth/generate-recovery-codes`
Génère de nouveaux codes de récupération.

## 🔧 Utilisation

### 1. Configuration initiale

```javascript
// 1. L'utilisateur se connecte normalement
const loginResponse = await api.post('/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});

const token = loginResponse.data.token;

// 2. Configuration du 2FA
const setupResponse = await api.post('/auth/setup-2fa', {}, {
  headers: { Authorization: `Bearer ${token}` }
});

const { qrCode, secret, recoveryCodes } = setupResponse.data.data;

// 3. L'utilisateur scanne le QR code avec son app authenticator
// 4. L'utilisateur saisit le code généré par l'app
const verifyResponse = await api.post('/auth/verify-2fa', {
  token: '123456' // Code de l'app authenticator
}, {
  headers: { Authorization: `Bearer ${token}` }
});
```

### 2. Utilisation quotidienne

```javascript
// 1. Connexion normale
const loginResponse = await api.post('/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});

const token = loginResponse.data.token;

// 2. Validation 2FA pour la session
const validateResponse = await api.post('/auth/validate-2fa-session', {
  twoFactorToken: '123456' // Code de l'app authenticator
}, {
  headers: { Authorization: `Bearer ${token}` }
});

// 3. Maintenant l'utilisateur peut accéder aux routes protégées 2FA
```

### 3. Protection des routes sensibles

```javascript
// Dans vos routes, utilisez le middleware 2FA
const { require2FA } = require('../middlewares/twoFactor.middleware');

router.post('/request-standard', protect, require2FA, accessController.requestStandardAccess);
router.post('/grant-emergency', protect, require2FA, accessController.grantEmergencyAccess);
```

## 🛡️ Sécurité

### Fonctionnalités de sécurité

- **Codes TOTP** : Codes à 6 chiffres valides 30 secondes
- **Codes de récupération** : 8 caractères hexadécimaux uniques
- **Validation de session** : 2FA validé par session
- **Protection des routes** : Middleware de vérification 2FA

### Bonnes pratiques

1. **Stockage sécurisé** : Les secrets 2FA doivent être chiffrés en base
2. **Codes de récupération** : Stocker de manière sécurisée, permettre la régénération
3. **Logs d'audit** : Tracer toutes les tentatives 2FA
4. **Limitation des tentatives** : Bloquer après X échecs

## 🔄 Prochaines étapes

### Implémentation complète

1. **Base de données** : Ajouter les champs 2FA aux modèles utilisateur
2. **Migrations** : Créer les migrations pour les nouvelles colonnes
3. **Tests complets** : Tests d'intégration avec authentification
4. **Interface utilisateur** : Pages de configuration 2FA

### Intégration mobile

1. **API mobile** : Adapter les endpoints pour les apps mobiles
2. **Push notifications** : Notifications pour validation 2FA
3. **Biométrie** : Intégration avec Touch ID, Face ID, etc.

## 🧪 Tests

### Tests de base

```bash
node test_2fa_basic.js
```

### Tests des routes

```bash
node test_2fa_routes.js
```

### Tests d'intégration

```bash
# Démarrer le serveur
npm start

# Dans un autre terminal
node test_2fa_integration.js
```

## 📚 Ressources

- [Documentation otplib](https://github.com/yeojz/otplib)
- [Documentation qrcode](https://github.com/soldair/node-qrcode)
- [RFC 6238 - TOTP](https://tools.ietf.org/html/rfc6238)
- [Google Authenticator](https://github.com/google/google-authenticator)

## 🆘 Support

En cas de problème :

1. Vérifiez les logs du serveur
2. Testez avec `test_2fa_basic.js`
3. Vérifiez la configuration des dépendances
4. Consultez la documentation des packages
