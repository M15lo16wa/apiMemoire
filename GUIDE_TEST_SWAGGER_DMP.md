# Guide de Test Swagger - Système DMP

## 📋 Accès à Swagger

1. **Démarrez le serveur** : `npm start`
2. **Accédez à Swagger** : http://localhost:3000/api-docs
3. **Authentifiez-vous** si nécessaire avec un token JWT

## 🧪 Routes de Test Disponibles

### 1. Test Système Complet
- **URL** : `GET /api/medecin/dmp/test/systeme`
- **Description** : Test complet du système DMP avec création de session et notification
- **Réponse attendue** : Données du médecin, patient, session et notification

### 2. Test Authentification CPS
- **URL** : `POST /api/medecin/dmp/test/authentification-cps`
- **Body** :
```json
{
  "code_cps": "1234",
  "professionnel_id": 79
}
```
- **Description** : Test de l'authentification CPS (code simplifié)
- **Réponse attendue** : Statut de validation du code

### 3. Test Création Session
- **URL** : `POST /api/medecin/dmp/test/creation-session`
- **Body** :
```json
{
  "professionnel_id": 79,
  "patient_id": 5,
  "mode_acces": "autorise_par_patient",
  "raison_acces": "Test API - Création session"
}
```
- **Description** : Test de création d'une session d'accès au DMP
- **Réponse attendue** : Détails de la session créée

### 4. Test Notification
- **URL** : `POST /api/medecin/dmp/test/notification`
- **Body** :
```json
{
  "patient_id": 5,
  "professionnel_id": 79,
  "session_id": 1,
  "type_notification": "demande_validation"
}
```
- **Description** : Test d'envoi de notification
- **Réponse attendue** : Détails de la notification envoyée

## 🔄 Étapes de Test Recommandées

### Étape 1 : Test Système Complet
1. Exécutez `GET /api/medecin/dmp/test/systeme`
2. Vérifiez que toutes les données sont retournées
3. Notez les IDs générés (session_id, notification_id)

### Étape 2 : Test Authentification CPS
1. Exécutez `POST /api/medecin/dmp/test/authentification-cps`
2. Testez avec code_cps = "1234" (succès)
3. Testez avec code_cps = "0000" (échec)

### Étape 3 : Test Création Session
1. Exécutez `POST /api/medecin/dmp/test/creation-session`
2. Testez différents modes d'accès :
   - `autorise_par_patient`
   - `urgence`
   - `connexion_secrete`
3. Notez le session_id généré

### Étape 4 : Test Notification
1. Utilisez le session_id de l'étape précédente
2. Exécutez `POST /api/medecin/dmp/test/notification`
3. Testez différents types :
   - `demande_validation`
   - `information_acces`
   - `alerte_securite`

## 📊 Vérifications à Effectuer

### Dans la Base de Données
```sql
-- Vérifier les sessions créées
SELECT * FROM "SessionsAccesDMP" ORDER BY date_creation DESC LIMIT 5;

-- Vérifier les tentatives d'authentification
SELECT * FROM "TentativesAuthentificationCPS" ORDER BY date_tentative DESC LIMIT 5;

-- Vérifier les notifications
SELECT * FROM "NotificationsAccesDMP" ORDER BY date_creation DESC LIMIT 5;
```

### Dans Mailtrap
1. Connectez-vous à votre compte Mailtrap
2. Vérifiez l'inbox configurée
3. Les emails de test devraient apparaître

## 🚨 Points d'Attention

### Erreurs Courantes
- **500 Internal Server Error** : Vérifiez que les modèles sont bien importés
- **404 Not Found** : Vérifiez que les routes sont bien enregistrées
- **Validation Error** : Vérifiez le format des données envoyées

### Dépendances
- Assurez-vous que les tables DMP existent dans la base de données
- Vérifiez que les variables d'environnement sont configurées
- Confirmez que les services (Mailtrap, Twilio) sont configurés

## 📝 Logs à Surveiller

### Console du Serveur
```
✅ Session DMP créée: ID 123
✅ Notification envoyée: ID 456
❌ Erreur authentification CPS: Code invalide
```

### Base de Données
- Vérifiez les timestamps des créations
- Confirmez les relations entre les tables
- Validez les statuts des sessions et notifications

## 🎯 Critères de Succès

### Test Système Complet
- ✅ Médecin et patient trouvés
- ✅ Session créée avec statut "en_cours"
- ✅ Notification créée et envoyée
- ✅ Tous les IDs sont valides

### Test Authentification CPS
- ✅ Code "1234" accepté
- ✅ Code "0000" rejeté
- ✅ Tentative enregistrée en base

### Test Création Session
- ✅ Session créée avec bon mode d'accès
- ✅ Validation_requise correcte selon le mode
- ✅ Timestamps cohérents

### Test Notification
- ✅ Notification créée en base
- ✅ Email envoyé via Mailtrap
- ✅ Statut mis à jour après envoi

## 🔧 Dépannage

### Problème : Erreur de modèle non trouvé
```bash
# Vérifiez que les modèles sont bien importés
node -e "console.log(require('./src/models/index.js'))"
```

### Problème : Erreur de route non trouvée
```bash
# Vérifiez que les routes sont enregistrées
curl http://localhost:3000/api/medecin/dmp/test/systeme
```

### Problème : Erreur de base de données
```bash
# Vérifiez les migrations
npx sequelize-cli db:migrate:status
```

## 📞 Support

En cas de problème :
1. Vérifiez les logs du serveur
2. Consultez la base de données
3. Testez les variables d'environnement
4. Vérifiez la configuration Mailtrap/Twilio 