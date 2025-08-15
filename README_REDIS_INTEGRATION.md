# 🚀 Intégration Redis pour la Gestion des Tokens

## 🎯 Objectif

Ce projet intègre Redis pour gérer les tokens d'authentification de manière sécurisée. Une fois qu'un utilisateur se déconnecte, son token ne peut plus être utilisé pour récupérer sa session.

## ✨ Fonctionnalités

- 🔐 **Gestion sécurisée des tokens** avec Redis
- 🚫 **Révocation immédiate** des tokens lors de la déconnexion
- 📊 **Surveillance des sessions** en temps réel
- 🧹 **Nettoyage automatique** des tokens expirés
- 🔄 **Gestion des sessions multiples** par utilisateur
- 📈 **Statistiques détaillées** des tokens et sessions

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Node.js   │    │     Redis      │
│                 │    │                 │    │                 │
│ - Login        │◄──►│ - Auth Routes   │◄──►│ - Tokens       │
│ - Logout       │    │ - Middleware    │    │ - Sessions     │
│ - Protected    │    │ - Token Service │    │ - Blacklist    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Installation et Configuration

### 1. Prérequis

- Node.js (v14+)
- Redis Server (déjà installé sur votre machine)
- PostgreSQL (pour la base de données principale)

### 2. Installation des dépendances

```bash
npm install redis ioredis
```

### 3. Configuration des variables d'environnement

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

### 4. Vérification de Redis

Vérifiez que Redis fonctionne :

```bash
netstat -a -n -o | findstr :6379
```

Vous devriez voir :
```
TCP    0.0.0.0:6379           0.0.0.0:0              LISTENING       984
```

## 🧪 Tests

### Test de connexion Redis

```bash
node test_redis_connection.js
```

### Test complet de l'API

```bash
node test_auth_with_redis.js
```

## 📡 API Endpoints

### Authentification

#### Connexion utilisateur
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "mot_de_passe": "password123"
}
```

#### Connexion professionnel de santé
```http
POST /auth/login-professionnel
Content-Type: application/json

{
  "publicIdentifier": "user@example.com",
  "codeCPS": "1234"
}
```

#### Connexion patient
```http
POST /auth/login-patient
Content-Type: application/json

{
  "numeroSecu": "1234567890123",
  "dateNaissance": "1990-01-01"
}
```

### Gestion des sessions

#### Déconnexion
```http
POST /auth/logout
Authorization: Bearer <token>
```

#### Déconnexion de tous les appareils
```http
POST /auth/logout-all-devices
Authorization: Bearer <token>
```

#### Informations de session
```http
GET /auth/session
Authorization: Bearer <token>
```

#### Statistiques Redis
```http
GET /auth/redis-stats
Authorization: Bearer <token>
```

## 🔒 Sécurité

### Fonctionnalités de sécurité

1. **Expiration automatique** : Les tokens expirent selon `JWT_EXPIRES_IN`
2. **Blacklist des tokens révoqués** : Immédiatement invalidés
3. **Validation Redis** : Chaque requête vérifie la validité
4. **Nettoyage automatique** : Suppression des clés expirées

### Bonnes pratiques

- Utilisez des secrets JWT forts en production
- Limitez la durée de vie des tokens
- Surveillez l'activité avec les statistiques
- Testez régulièrement la révocation des tokens

## 📊 Structure des données Redis

### Clés utilisées

- **`token:<jwt_token>`** : Tokens actifs avec métadonnées
- **`session:<user_id>`** : Sessions utilisateur
- **`blacklist:<jwt_token>`** : Tokens révoqués

### Format des données

```json
{
  "userId": 123,
  "userType": "utilisateur",
  "role": "admin",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "expiresAt": "2024-01-16T10:30:00.000Z"
}
```

## 🛠️ Développement

### Structure des fichiers

```
src/
├── config/
│   └── redis.js              # Configuration Redis
├── services/
│   └── tokenService.js       # Service de gestion des tokens
├── middlewares/
│   └── auth.middleware.js    # Middleware d'authentification
└── modules/
    └── auth/
        ├── auth.controller.js # Contrôleurs d'authentification
        └── auth.route.js      # Routes d'authentification
```

### Ajout de nouvelles fonctionnalités

1. **Nouveau type d'utilisateur** : Modifiez `tokenService.js`
2. **Nouvelle route** : Ajoutez dans `auth.route.js`
3. **Nouveau contrôleur** : Créez dans `auth.controller.js`

## 🔍 Surveillance et Maintenance

### Statistiques Redis

Utilisez l'endpoint `/auth/redis-stats` pour surveiller :
- Nombre total de clés
- Tokens actifs
- Sessions actives
- Tokens blacklistés

### Logs utiles

Le système génère des logs détaillés :
- `✅ Redis connecté avec succès`
- `✅ Token généré et stocké pour utilisateur ID: 123`
- `✅ Token validé avec Redis`
- `✅ Token révoqué pour l'utilisateur ID: 123`

### Nettoyage

Redis nettoie automatiquement les clés expirées. Pour la maintenance manuelle :

```bash
# Connexion à Redis
redis-cli

# Vérifier l'espace utilisé
info memory

# Voir toutes les clés
keys *

# Nettoyer (attention !)
flushdb
```

## 🚨 Dépannage

### Problèmes courants

1. **Erreur de connexion Redis**
   - Vérifiez que Redis est démarré
   - Vérifiez les paramètres de connexion
   - Vérifiez les logs Redis

2. **Tokens non validés**
   - Vérifiez `JWT_SECRET`
   - Vérifiez `JWT_EXPIRES_IN`
   - Vérifiez la connexion Redis

3. **Déconnexion qui ne fonctionne pas**
   - Vérifiez que le token est révoqué dans Redis
   - Vérifiez les logs d'erreur
   - Testez avec le script de test

### Commandes utiles

```bash
# Test de connexion Redis
node test_redis_connection.js

# Test complet de l'API
node test_auth_with_redis.js

# Vérifier les processus Redis
tasklist | findstr redis

# Redémarrer Redis (Windows)
net stop redis
net start redis
```

## 📚 Documentation complète

Pour plus de détails, consultez :
- [Documentation Redis](docs/REDIS_TOKEN_MANAGEMENT.md)
- [Documentation API](docs/API_DOCUMENTATION.md)
- [Architecture technique](docs/architecture_technique.puml)

## 🤝 Contribution

Pour contribuer au projet :

1. Testez vos modifications avec les scripts de test
2. Vérifiez la connexion Redis
3. Documentez les nouvelles fonctionnalités
4. Mettez à jour les tests si nécessaire

## 📞 Support

En cas de problème :

1. Vérifiez les logs Redis et de l'application
2. Testez avec les scripts de test
3. Vérifiez la configuration Redis
4. Consultez la documentation

---

**🎉 Félicitations !** Votre système d'authentification est maintenant sécurisé avec Redis et les tokens ne peuvent plus être réutilisés après déconnexion.
