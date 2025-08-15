# Gestion des Tokens avec Redis

## Vue d'ensemble

Ce document décrit l'implémentation du système de gestion des tokens utilisant Redis pour l'API DMP. Ce système permet de :

- Stocker les tokens JWT dans Redis avec expiration automatique
- Révoquer les tokens lors de la déconnexion
- Empêcher la réutilisation des tokens révoqués
- Gérer les sessions utilisateur de manière sécurisée
- Surveiller l'activité des tokens

## Architecture

### Composants principaux

1. **Configuration Redis** (`src/config/redis.js`)
   - Gestion de la connexion Redis
   - Configuration des paramètres de connexion
   - Gestion des événements de connexion

2. **Service de Tokens** (`src/services/tokenService.js`)
   - Génération et stockage des tokens
   - Validation des tokens
   - Révocation des tokens
   - Gestion des sessions

3. **Middleware d'authentification** (`src/middlewares/auth.middleware.js`)
   - Intégration avec Redis pour la validation
   - Vérification des tokens révoqués

4. **Contrôleurs d'authentification** (`src/modules/auth/auth.controller.js`)
   - Endpoints de connexion/déconnexion
   - Gestion des sessions

## Configuration

### Variables d'environnement

Ajoutez ces variables dans votre fichier `.env` :

```env
# Configuration Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Configuration JWT
JWT_SECRET=votre_secret_jwt_tres_securise_ici
JWT_EXPIRES_IN=24h
JWT_COOKIE_EXPIRES_IN=7
```

### Installation des dépendances

```bash
npm install redis ioredis
```

## Utilisation

### 1. Connexion utilisateur

```javascript
// POST /auth/login
{
  "email": "user@example.com",
  "mot_de_passe": "password123"
}

// Réponse
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": { ... }
  }
}
```

### 2. Connexion professionnel de santé

```javascript
// POST /auth/login-professionnel
{
  "publicIdentifier": "user@example.com",
  "codeCPS": "1234"
}

// Réponse
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "professionnel": { ... }
  }
}
```

### 3. Connexion patient

```javascript
// POST /auth/login-patient
{
  "numeroSecu": "1234567890123",
  "dateNaissance": "1990-01-01"
}

// Réponse
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "patient": { ... }
  }
}
```

### 4. Déconnexion

```javascript
// POST /auth/logout
// Headers: Authorization: Bearer <token>

// Réponse
{
  "status": "success",
  "message": "Déconnexion réussie"
}
```

### 5. Déconnexion de tous les appareils

```javascript
// POST /auth/logout-all-devices
// Headers: Authorization: Bearer <token>

// Réponse
{
  "status": "success",
  "message": "Déconnexion de tous les appareils réussie"
}
```

### 6. Informations de session

```javascript
// GET /auth/session
// Headers: Authorization: Bearer <token>

// Réponse
{
  "status": "success",
  "data": {
    "session": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "userType": "utilisateur",
      "role": "admin",
      "lastActivity": "2024-01-15T10:30:00.000Z",
      "expiresAt": "2024-01-16T10:30:00.000Z"
    },
    "user": { ... }
  }
}
```

### 7. Statistiques Redis

```javascript
// GET /auth/redis-stats
// Headers: Authorization: Bearer <token>

// Réponse
{
  "status": "success",
  "data": {
    "stats": {
      "totalKeys": 150,
      "activeTokens": 45,
      "activeSessions": 45,
      "blacklistedTokens": 105,
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

## Structure des données Redis

### Clés utilisées

1. **Tokens actifs** : `token:<jwt_token>`
   - Contient les informations du token
   - Expire automatiquement selon JWT_EXPIRES_IN

2. **Sessions utilisateur** : `session:<user_id>`
   - Contient les informations de session
   - Expire automatiquement selon JWT_EXPIRES_IN

3. **Tokens révoqués** : `blacklist:<jwt_token>`
   - Contient les informations de révocation
   - Expire automatiquement selon l'expiration du token

### Format des données

#### Token actif
```json
{
  "userId": 123,
  "userType": "utilisateur",
  "role": "admin",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "expiresAt": "2024-01-16T10:30:00.000Z"
}
```

#### Session utilisateur
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userType": "utilisateur",
  "role": "admin",
  "lastActivity": "2024-01-15T10:30:00.000Z",
  "expiresAt": "2024-01-16T10:30:00.000Z"
}
```

#### Token révoqué
```json
{
  "userId": 123,
  "revokedAt": "2024-01-15T11:00:00.000Z",
  "expiresAt": "2024-01-16T10:30:00.000Z"
}
```

## Sécurité

### Fonctionnalités de sécurité

1. **Expiration automatique** : Les tokens expirent automatiquement selon JWT_EXPIRES_IN
2. **Blacklist des tokens révoqués** : Les tokens révoqués sont immédiatement invalidés
3. **Validation Redis** : Chaque requête vérifie la validité du token dans Redis
4. **Nettoyage automatique** : Redis supprime automatiquement les clés expirées

### Bonnes pratiques

1. **Utilisez des secrets JWT forts** : Changez JWT_SECRET en production
2. **Limitez la durée de vie des tokens** : Utilisez des durées d'expiration raisonnables
3. **Surveillez l'activité** : Utilisez les statistiques Redis pour détecter les anomalies
4. **Testez la déconnexion** : Vérifiez que les tokens sont bien révoqués

## Tests

### Test de connexion Redis

```bash
node test_redis_connection.js
```

Ce script teste :
- La connexion Redis
- La génération de tokens
- La validation de tokens
- La révocation de tokens
- La gestion des sessions
- Les statistiques Redis

### Test manuel

1. Connectez-vous avec un utilisateur
2. Copiez le token reçu
3. Utilisez le token pour accéder à une route protégée
4. Déconnectez-vous
5. Essayez de réutiliser le token (doit échouer)

## Dépannage

### Problèmes courants

1. **Erreur de connexion Redis**
   - Vérifiez que Redis est démarré
   - Vérifiez les paramètres de connexion
   - Vérifiez les logs Redis

2. **Tokens non validés**
   - Vérifiez que JWT_SECRET est correct
   - Vérifiez que JWT_EXPIRES_IN est valide
   - Vérifiez la connexion Redis

3. **Déconnexion qui ne fonctionne pas**
   - Vérifiez que le token est bien révoqué dans Redis
   - Vérifiez les logs d'erreur
   - Testez avec le script de test

### Logs utiles

Le système génère des logs détaillés :
- `✅ Redis connecté avec succès`
- `✅ Token généré et stocké pour utilisateur ID: 123`
- `✅ Token validé avec Redis`
- `✅ Token révoqué pour l'utilisateur ID: 123`

## Maintenance

### Nettoyage périodique

Redis nettoie automatiquement les clés expirées, mais vous pouvez :

1. **Surveiller l'espace utilisé** : Utilisez `redis-cli info memory`
2. **Vérifier les statistiques** : Utilisez l'endpoint `/auth/redis-stats`
3. **Nettoyer manuellement** : Utilisez `redis-cli flushdb` (attention !)

### Surveillance

1. **Métriques Redis** : Surveillez l'utilisation mémoire et CPU
2. **Logs d'application** : Surveillez les erreurs de connexion
3. **Statistiques des tokens** : Surveillez le nombre de tokens actifs

## Migration depuis l'ancien système

Si vous migrez depuis un système sans Redis :

1. **Installez Redis** et les dépendances
2. **Configurez les variables d'environnement**
3. **Redémarrez l'application**
4. **Testez la connexion Redis**
5. **Vérifiez que les nouveaux tokens fonctionnent**
6. **Les anciens tokens continueront de fonctionner jusqu'à expiration**

## Support

Pour toute question ou problème :

1. Vérifiez les logs Redis et de l'application
2. Testez avec le script de test
3. Vérifiez la configuration Redis
4. Consultez la documentation Redis officielle
