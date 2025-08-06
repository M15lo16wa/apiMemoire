# Guide de Démarrage du Système DMP

## 🚀 Configuration Rapide

### 1. Configuration du fichier .env

Le fichier `.env` doit contenir les configurations suivantes :

```env
# Configuration Base de Données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=apiMemoire
DB_USER=postgres
DB_PASSWORD=postgres
DB_DIALECT=postgres

# Configuration Serveur
PORT=3001
NODE_ENV=development

# Configuration JWT
JWT_SECRET=votre_secret_jwt_tres_securise_ici
JWT_EXPIRES_IN=24h

# Configuration Mailtrap (Email)
MAILTRAP_HOST=smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=votre_username_mailtrap
MAILTRAP_PASS=votre_password_mailtrap
MAILTRAP_FROM=noreply@dmp-system.com

# Configuration Twilio (SMS)
TWILIO_ACCOUNT_SID=votre_account_sid_twilio
TWILIO_AUTH_TOKEN=votre_auth_token_twilio
TWILIO_PHONE_NUMBER=votre_numero_twilio

# Configuration Socket.io
SOCKET_PORT=3002

# Configuration Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=5

# Configuration CPS Authentication
CPS_CODE_EXPIRY_MINUTES=5
CPS_MAX_ATTEMPTS=3
CPS_BLOCK_DURATION_MINUTES=15

# Configuration Notifications
NOTIFICATION_EXPIRY_HOURS=24
NOTIFICATION_RETRY_ATTEMPTS=3

# Configuration DMP Access
DMP_SESSION_DURATION_MINUTES=60
DMP_URGENCY_ACCESS_DURATION_MINUTES=30
```

### 2. Installation des dépendances

```bash
npm install speakeasy nodemailer twilio
```

### 3. Démarrage de l'API

```bash
node src/server.js
```

L'API sera accessible sur : `http://localhost:3001`

## 🧪 Tests du Système

### Test 1: Vérification de la configuration

```bash
node test-configuration-env.js
```

### Test 2: Test de l'API DMP

```bash
node test-api-dmp-simple.js
```

### Test 3: Test via Swagger

1. Ouvrez votre navigateur
2. Allez sur : `http://localhost:3001/api-docs`
3. Testez les routes suivantes :
   - `GET /api/medecin/dmp/test/systeme`
   - `POST /api/medecin/dmp/test/authentification-cps`
   - `POST /api/medecin/dmp/test/creation-session`
   - `POST /api/medecin/dmp/test/notification`

## 📋 Routes de Test Disponibles

### Routes Publiques (pour les tests)

- `GET /api/medecin/dmp/test/systeme` - Test complet du système
- `POST /api/medecin/dmp/test/authentification-cps` - Test authentification CPS
- `POST /api/medecin/dmp/test/creation-session` - Test création session
- `POST /api/medecin/dmp/test/notification` - Test envoi notification

### Routes Protégées (nécessitent authentification)

- `GET /api/medecin/dmp/rechercher-patient` - Recherche de patients
- `POST /api/medecin/dmp/selectionner-patient` - Sélection d'un patient
- `POST /api/medecin/dmp/authentification-cps` - Authentification CPS réelle
- `POST /api/medecin/dmp/selection-mode-acces` - Sélection mode d'accès
- `GET /api/medecin/dmp/informations-patient/:patientId` - Infos patient
- `GET /api/medecin/dmp/sessions-actives` - Sessions actives
- `POST /api/medecin/dmp/terminer-session/:sessionId` - Terminer session

## 🔧 Configuration des Services

### Mailtrap (Email)

1. Créez un compte sur [Mailtrap.io](https://mailtrap.io)
2. Créez une boîte de réception
3. Copiez les identifiants SMTP dans votre `.env`

### Twilio (SMS)

1. Créez un compte sur [Twilio.com](https://twilio.com)
2. Obtenez votre Account SID et Auth Token
3. Achetez un numéro de téléphone
4. Ajoutez ces informations dans votre `.env`

## 🐛 Dépannage

### L'API ne démarre pas

1. Vérifiez que PostgreSQL est démarré
2. Vérifiez la configuration de la base de données dans `.env`
3. Vérifiez que toutes les dépendances sont installées

### Erreur de port déjà utilisé

```bash
# Arrêter tous les processus Node.js
taskkill /F /IM node.exe

# Ou changer le port dans .env
PORT=3002
```

### Erreur de modules manquants

```bash
npm install speakeasy nodemailer twilio
```

## 📊 Vérification de la Base de Données

```bash
node test-verification-dmp.js
```

## 🎯 Prochaines Étapes

1. ✅ Configuration de l'environnement
2. ✅ Installation des dépendances
3. ✅ Démarrage de l'API
4. ✅ Tests des routes de base
5. 🔄 Configuration des services externes (Mailtrap, Twilio)
6. 🔄 Tests complets du système
7. 🔄 Développement du frontend
8. 🔄 Tests d'intégration

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs de l'API
2. Testez la connexion à la base de données
3. Vérifiez la configuration du fichier `.env`
4. Consultez les guides de test fournis 