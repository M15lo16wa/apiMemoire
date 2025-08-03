# Diagnostic des Routes DMP

## 🎯 Problème Identifié
Vous mentionnez que les routes DMP ne sont pas présentes, mais après vérification, **toutes les routes sont bien configurées**. Le problème peut venir de :

1. **Serveur non démarré**
2. **Problème d'authentification**
3. **Erreur de configuration**
4. **Problème de base de données**

## ✅ Vérification Complète

### 1. **Routes Présentes dans le Code**
Toutes les routes suivantes sont **déjà configurées** dans `src/modules/patient/dmp.route.js` :

#### **Auto-mesures**
- ✅ `GET /auto-mesures` - Ligne 472
- ✅ `POST /auto-mesures` - Ligne 515
- ✅ `PUT /auto-mesures/:id` - Ligne 563
- ✅ `DELETE /auto-mesures/:id` - Ligne 590

#### **Documents**
- ✅ `GET /documents` - Ligne 608
- ✅ `POST /documents` - Ligne 657
- ✅ `DELETE /documents/:id` - Ligne 684

#### **Messages**
- ✅ `GET /messages` - Ligne 720
- ✅ `POST /messages` - Ligne 760
- ✅ `DELETE /messages/:id` - Ligne 787

#### **Rappels**
- ✅ `GET /rappels` - Ligne 805
- ✅ `POST /rappels` - Ligne 853
- ✅ `PUT /rappels/:id` - Ligne 902
- ✅ `DELETE /rappels/:id` - Ligne 929

### 2. **Structure des Routes**
```
/api/patient/dmp/[endpoint]
```

## 🔍 Diagnostic Étape par Étape

### **Étape 1 : Vérifier le Serveur**
```bash
# Démarrer le serveur
npm start

# Vérifier que le serveur répond
curl http://localhost:3000/api/patient
```

### **Étape 2 : Vérifier l'Authentification**
```bash
# Login patient
curl -X POST "http://localhost:3000/api/auth/login-patient" \
  -H "Content-Type: application/json" \
  -d '{
    "numero_assure": "VOTRE_NUMERO",
    "mot_de_passe": "VOTRE_MOT_DE_PASSE"
  }'
```

### **Étape 3 : Tester les Routes avec Token**
```bash
# Remplacer YOUR_TOKEN par le token obtenu
curl -X GET "http://localhost:3000/api/patient/dmp/auto-mesures" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

## 🐛 Problèmes Possibles et Solutions

### **Problème 1 : Serveur non démarré**
**Symptôme** : `ECONNREFUSED`
**Solution** :
```bash
npm start
```

### **Problème 2 : Erreur 401 (Non authentifié)**
**Symptôme** : `401 Unauthorized`
**Solution** :
1. Connectez-vous en tant que patient
2. Obtenez un token JWT
3. Utilisez le token dans l'en-tête Authorization

### **Problème 3 : Erreur 404 (Route non trouvée)**
**Symptôme** : `404 Not Found`
**Solution** :
1. Vérifiez l'URL exacte
2. Vérifiez que le serveur est démarré
3. Vérifiez les logs du serveur

### **Problème 4 : Erreur 500 (Erreur serveur)**
**Symptôme** : `500 Internal Server Error`
**Solution** :
1. Vérifiez les logs du serveur
2. Vérifiez la base de données
3. Vérifiez les modèles Sequelize

## 🧪 Tests de Diagnostic

### **Test 1 : Vérifier la Structure**
```bash
node verifier-routes-dmp.js
```

### **Test 2 : Vérifier l'Accessibilité**
```bash
node test-routes-actives.js
```

### **Test 3 : Test Complet avec Authentification**
```bash
# 1. Démarrer le serveur
npm start

# 2. Dans un autre terminal, tester
curl -X GET "http://localhost:3000/api/patient/dmp/auto-mesures" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 Logs à Vérifier

### **Logs du Serveur**
Regardez les logs du serveur pour voir :
- Si les routes sont bien enregistrées
- Si les requêtes arrivent
- S'il y a des erreurs

### **Logs de Base de Données**
Vérifiez que :
- La base de données est accessible
- Les tables existent
- Les modèles sont bien synchronisés

## 🎯 Solutions Recommandées

### **Solution 1 : Redémarrer le Serveur**
```bash
# Arrêter le serveur (Ctrl+C)
# Puis redémarrer
npm start
```

### **Solution 2 : Vérifier les Migrations**
```bash
# Vérifier que toutes les migrations sont appliquées
npx sequelize-cli db:migrate:status
```

### **Solution 3 : Vérifier les Modèles**
```bash
# Vérifier que les modèles sont bien chargés
node -e "require('./src/models/index.js'); console.log('Modèles chargés avec succès');"
```

## ✅ Checklist de Diagnostic

- [ ] Serveur démarré (`npm start`)
- [ ] Routes accessibles (test avec curl)
- [ ] Authentification fonctionnelle
- [ ] Base de données accessible
- [ ] Modèles Sequelize chargés
- [ ] Migrations appliquées
- [ ] Logs sans erreur

## 🚀 Prochaines Étapes

1. **Démarrez le serveur** : `npm start`
2. **Testez l'authentification** : Login patient
3. **Testez les routes** : Avec token JWT
4. **Vérifiez les logs** : Pour identifier les erreurs

**Toutes les routes DMP sont configurées et prêtes à être utilisées !** 🎉 