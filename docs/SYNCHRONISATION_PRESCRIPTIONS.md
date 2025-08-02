# Synchronisation de la Table Prescriptions

## Problème Identifié

La table `Prescriptions` dans la base de données n'était pas synchronisée avec le modèle `Prescription.js`, causant des erreurs lors de la création d'ordonnances et de demandes d'examens.

## Changements Appliqués

### Nouveaux Champs Ajoutés

1. **`prescriptionNumber`** (STRING(50), unique)
   - Numéro unique de prescription généré automatiquement
   - Format: `ORD-2024-123456` ou `EXA-2024-123456`

2. **`type_prescription`** (ENUM: 'ordonnance', 'examen')
   - Différencie les ordonnances médicamenteuses des demandes d'examens
   - Valeur par défaut: 'ordonnance'

3. **`principe_actif`** (STRING(255), obligatoire)
   - Remplace l'ancien champ `medicament`
   - Contient le principe actif (DCI) ou le type d'examen demandé

4. **`pharmacieDelivrance`** (STRING(255))
   - Pharmacie où les médicaments ont été délivrés

5. **`signatureElectronique`** (TEXT)
   - Signature électronique du médecin prescripteur

6. **`qrCode`** (TEXT)
   - QR Code pour vérification et traçabilité

7. **`instructions_speciales`** (TEXT)
   - Instructions particulières (à jeun, pendant le repas, etc.)

8. **`duree_traitement`** (STRING(100))
   - Durée du traitement (ex: 7 jours, 1 mois)

### Champs Supprimés

1. **`medicament`** → remplacé par `principe_actif`
2. **`duree`** → remplacé par `duree_traitement`
3. **`instructions`** → remplacé par `instructions_speciales`
4. **`consultation_id`** → supprimé (non utilisé dans le modèle)
5. **`service_id`** → supprimé (non utilisé dans le modèle)

### Index Mis à Jour

- Ajout d'un index unique sur `prescriptionNumber`
- Ajout d'un index composite sur `type_prescription, statut`
- Remplacement de l'index sur `medicament` par `principe_actif`
- Suppression des index sur `consultation_id` et `service_id`

## Migration Créée

**Fichier:** `migrations/20250802105600-sync-prescription-model.js`

Cette migration:
1. Ajoute tous les nouveaux champs
2. Copie les données existantes vers les nouveaux champs
3. Supprime les anciens champs
4. Met à jour les index

## Comment Appliquer la Synchronisation

### Option 1: Migration Automatique
```bash
node sync-prescription-database.js
```

### Option 2: Migration Manuelle
```bash
npx sequelize-cli db:migrate
```

## Vérification

Après la migration, vérifiez que:
1. La table `Prescriptions` contient tous les nouveaux champs
2. Les données existantes ont été migrées correctement
3. Les index sont créés correctement

```sql
-- Vérifier la structure de la table
DESCRIBE Prescriptions;

-- Vérifier les index
SHOW INDEX FROM Prescriptions;
```

## Avantages de la Synchronisation

1. **Cohérence:** Le modèle et la base de données sont maintenant alignés
2. **Fonctionnalités Modernes:** Support des QR Codes, signatures électroniques
3. **Flexibilité:** Distinction entre ordonnances et examens
4. **Performance:** Index optimisés pour les requêtes fréquentes
5. **Traçabilité:** Numéros de prescription uniques et QR Codes

## Impact sur le Code

Le modèle `Prescription.js` fonctionne maintenant correctement avec:
- Génération automatique des numéros de prescription
- Génération automatique des QR Codes
- Hooks pour la validation et l'audit
- Support complet des ordonnances et examens

## Rollback

Si nécessaire, la migration peut être annulée avec:
```bash
npx sequelize-cli db:migrate:undo
```

⚠️ **Attention:** Le rollback supprimera les nouveaux champs et restaurera l'ancienne structure.

## Scénarios d'Action pour les Médecins

### 📋 Scénario 1: Création d'une Ordonnance

**Route:** `POST /api/prescription/ordonnance`

**Actions du médecin:**
1. **Connexion** - Se connecter à l'application avec ses identifiants
2. **Sélection du patient** - Choisir le patient dans la liste ou rechercher par nom
3. **Remplir le formulaire d'ordonnance:**
   - Principe actif (DCI) : ex. "Paracétamol"
   - Nom commercial (optionnel) : ex. "Doliprane"
   - Dosage : ex. "500mg"
   - Forme pharmaceutique : ex. "comprimé"
   - Quantité : ex. "20"
   - Unité : ex. "comprimés"
   - Posologie : ex. "1 comprimé toutes les 6 heures"
   - Fréquence : ex. "4 fois par jour"
   - Voie d'administration : ex. "orale"
   - Instructions spéciales : ex. "À prendre avec un verre d'eau"
   - Durée du traitement : ex. "5 jours"
   - Renouvelable : oui/non
   - Nombre de renouvellements autorisés
4. **Validation** - Vérifier les informations et valider
5. **Signature électronique** - Signer électroniquement l'ordonnance
6. **Génération automatique** - Le système génère :
   - Numéro unique de prescription (ex: ORD-2025-000001)
   - QR Code pour traçabilité
   - Date et heure de prescription

**Résultat:** Ordonnance créée avec statut "active"

---

### 🔬 Scénario 2: Création d'une Demande d'Examen

**Route:** `POST /api/prescription/examen`

**Actions du médecin:**
1. **Connexion** - Se connecter à l'application
2. **Sélection du patient** - Choisir le patient
3. **Remplir le formulaire d'examen:**
   - Type d'examen : ex. "Analyse sanguine complète"
   - Paramètres : ex. "Prélèvement veineux"
   - Urgence : ex. "Urgent" ou "Normal"
   - Instructions spéciales : ex. "À jeun depuis 12 heures"
   - Durée : ex. "1 jour"
4. **Validation** - Vérifier les informations
5. **Signature électronique** - Signer la demande
6. **Génération automatique** - Le système génère :
   - Numéro unique (ex: EXA-2025-000001)
   - QR Code
   - Statut "en_attente"

**Résultat:** Demande d'examen créée avec statut "en_attente"

---

### 📊 Scénario 3: Consultation des Prescriptions

**Routes disponibles:**
- `GET /api/prescription/patient/:patientId` - Prescriptions d'un patient
- `GET /api/prescription/search` - Recherche avancée
- `GET /api/prescription/:id` - Détails d'une prescription

**Actions du médecin:**
1. **Accéder à la liste** - Consulter les prescriptions d'un patient
2. **Filtrer par:**
   - Type (ordonnance/examen)
   - Statut (active/suspendue/terminée/annulée/en_attente)
   - Période (date début/fin)
   - Principe actif
3. **Rechercher** - Utiliser la recherche textuelle
4. **Consulter les détails** - Cliquer sur une prescription pour voir :
   - Informations complètes
   - Relations (patient, rédacteur, dossier)
   - QR Code pour vérification

---

### 🔄 Scénario 4: Renouvellement d'Ordonnance

**Route:** `PUT /api/prescription/:id/renouveler`

**Actions du médecin:**
1. **Sélectionner l'ordonnance** - Choisir une ordonnance renouvelable
2. **Vérifier l'éligibilité:**
   - Statut "active"
   - Renouvelable = true
   - Nombre de renouvellements < maximum autorisé
3. **Confirmer le renouvellement** - Valider l'action
4. **Mise à jour automatique:**
   - Incrémentation du compteur de renouvellements
   - Date du dernier renouvellement
   - Nouveau QR Code si nécessaire

**Résultat:** Ordonnance renouvelée avec compteur mis à jour

---

### ⏸️ Scénario 5: Suspension d'Ordonnance

**Route:** `PUT /api/prescription/:id/suspendre`

**Actions du médecin:**
1. **Sélectionner l'ordonnance** - Choisir une ordonnance active
2. **Motif de suspension** - Indiquer la raison :
   - Effet indésirable
   - Contre-indication
   - Amélioration du patient
   - Autre motif
3. **Date d'arrêt** - Spécifier la date d'arrêt
4. **Confirmation** - Valider la suspension
5. **Mise à jour automatique:**
   - Statut → "suspendue"
   - Date d'arrêt enregistrée
   - QR Code mis à jour

**Résultat:** Ordonnance suspendue avec motif et date d'arrêt

---

### 📈 Scénario 6: Suivi et Statistiques

**Routes disponibles:**
- `GET /api/prescription/stats/:professionnelId` - Statistiques du médecin
- `GET /api/prescription/actives/:patientId` - Prescriptions actives d'un patient

**Actions du médecin:**
1. **Consulter les statistiques** - Voir :
   - Nombre d'ordonnances créées
   - Nombre d'examens demandés
   - Taux de renouvellement
   - Prescriptions actives/suspendues
2. **Suivre les prescriptions actives** - Monitorer :
   - Prescriptions en cours
   - Dates de fin prévues
   - Renouvellements nécessaires
3. **Analyser les tendances** - Identifier :
   - Médicaments les plus prescrits
   - Types d'examens fréquents
   - Patterns de prescription

---

### 🔍 Scénario 7: Recherche et Filtrage

**Route:** `GET /api/prescription/search`

**Actions du médecin:**
1. **Définir les critères de recherche:**
   - Patient spécifique
   - Période (date début/fin)
   - Type de prescription
   - Statut
   - Principe actif
   - Nom commercial
2. **Utiliser la recherche textuelle** - Rechercher par :
   - Numéro de prescription
   - Principe actif
   - Nom commercial
   - Dosage
3. **Appliquer les filtres** - Combiner plusieurs critères
4. **Consulter les résultats** - Liste paginée avec :
   - Informations essentielles
   - Statut visuel
   - Actions disponibles

---

### 📋 Scénario 8: Gestion des Erreurs

**Situations courantes et actions:**

**Erreur 400 - Données manquantes:**
- Vérifier que tous les champs obligatoires sont remplis
- Contrôler le format des données (dosage, quantités)
- S'assurer que les IDs (patient, professionnel) sont valides

**Erreur 404 - Ressource non trouvée:**
- Vérifier l'existence du patient
- Contrôler l'existence du professionnel
- S'assurer que le dossier médical existe

**Erreur 500 - Erreur serveur:**
- Vérifier la connexion à la base de données
- Contrôler les associations entre modèles
- S'assurer que les migrations sont à jour

---

### 🎯 Bonnes Pratiques

**Pour les médecins:**
1. **Validation systématique** - Toujours vérifier les informations avant validation
2. **Instructions claires** - Rédiger des posologies détaillées et compréhensibles
3. **Suivi régulier** - Consulter régulièrement les prescriptions actives
4. **Documentation** - Utiliser les champs d'instructions spéciales pour des précisions importantes
5. **Sécurité** - Vérifier les QR Codes pour authentifier les prescriptions

**Pour l'équipe technique:**
1. **Monitoring** - Surveiller les performances des requêtes
2. **Sauvegarde** - Maintenir des sauvegardes régulières
3. **Mise à jour** - Appliquer les migrations de manière contrôlée
4. **Tests** - Valider les nouvelles fonctionnalités avant déploiement

---

### 📱 Interface Utilisateur Recommandée

**Écrans principaux:**
1. **Tableau de bord** - Vue d'ensemble des prescriptions récentes
2. **Formulaire d'ordonnance** - Interface intuitive pour la création
3. **Formulaire d'examen** - Interface dédiée aux demandes d'examens
4. **Liste des prescriptions** - Vue avec filtres et recherche
5. **Détail d'une prescription** - Vue complète avec QR Code
6. **Statistiques** - Graphiques et métriques

**Fonctionnalités clés:**
- Auto-complétion pour les principes actifs
- Validation en temps réel
- Génération automatique des numéros
- Impression avec QR Code
- Export PDF des prescriptions 

---

## 🆕 Nouvelles Fonctionnalités Ajoutées

### 📋 Scénario 9: Affichage des Ordonnances Récemment Créées

**Route:** `GET /api/prescription/ordonnances-recentes`

**Actions du médecin:**
1. **Accéder au tableau de bord** - Consulter les ordonnances créées récemment
2. **Filtrer par période** - Choisir le nombre de jours (1-30 jours)
3. **Pagination** - Naviguer dans les résultats avec page/limit
4. **Voir les détails** - Consulter chaque ordonnance avec :
   - Informations du patient
   - Détails de la prescription
   - Statut et date de création
   - Lien vers le dossier médical

**Résultat:** Liste paginée des ordonnances récentes avec métadonnées

---

### 📁 Scénario 10: Ajout au Dossier Patient

**Route:** `POST /api/prescription/{prescription_id}/ajouter-dossier`

**Actions du médecin:**
1. **Sélectionner une prescription** - Choisir l'ordonnance à ajouter
2. **Spécifier le dossier** - Indiquer l'ID du dossier médical
3. **Validation automatique** - Le système vérifie :
   - Existence de la prescription
   - Existence du dossier médical
   - Correspondance patient-dossier
4. **Ajout automatique** - La prescription est liée au dossier
5. **Confirmation** - Retour de la prescription mise à jour

**Résultat:** Prescription ajoutée au dossier patient avec date d'ajout

---

### 📧 Scénario 11: Système de Notifications

**Routes disponibles:**
- `POST /api/prescription/{prescription_id}/notification` - Créer une notification
- `PATCH /api/prescription/notification/{notification_id}/lue` - Marquer comme lue
- `GET /api/prescription/patient/{patient_id}/notifications` - Consulter les notifications

**Actions du médecin:**
1. **Créer une notification** - Après création d'ordonnance :
   - Type : nouvelle_prescription, renouvellement, suspension, modification
   - Priorité : basse, normale, haute, urgente
   - Canal : application, email, sms, push
2. **Personnaliser le message** - Titre et contenu automatiquement générés
3. **Suivre les notifications** - Consulter les notifications du patient
4. **Marquer comme lue** - Quand le patient lit la notification

**Résultat:** Système de notifications complet avec suivi

---

### 🎯 Scénario 12: Création d'Ordonnance Complète

**Route:** `POST /api/prescription/ordonnance-complete`

**Actions du médecin:**
1. **Remplir le formulaire complet** - Toutes les données d'ordonnance
2. **Spécifier les options** :
   - ID du dossier médical (optionnel)
   - Priorité de notification (normale par défaut)
   - Canal de notification (application par défaut)
3. **Validation automatique** - Toutes les validations appliquées
4. **Création en une étape** - Le système :
   - Crée l'ordonnance
   - Ajoute au dossier patient (si spécifié)
   - Crée la notification
   - Génère le QR Code
5. **Confirmation complète** - Retour avec toutes les informations

**Résultat:** Ordonnance créée avec notification et ajout au dossier

---

### 📊 Scénario 13: Résumé des Ordonnances d'Aujourd'hui

**Route:** `GET /api/prescription/resume-aujourdhui`

**Actions du médecin:**
1. **Consulter le résumé** - Vue d'ensemble de la journée
2. **Voir les statistiques** :
   - Total d'ordonnances créées aujourd'hui
   - Répartition par type (ordonnances/examens)
   - Dernière ordonnance créée
   - Période de référence
3. **Analyser l'activité** - Comprendre le volume de travail
4. **Identifier les tendances** - Patterns de prescription

**Résultat:** Résumé statistique de l'activité du jour

---

### 🔄 Workflow Complet du Médecin

**Étape 1: Création d'Ordonnance**
```bash
POST /api/prescription/ordonnance-complete
{
  "patient_id": 1,
  "dossier_id": 1,
  "principe_actif": "Paracétamol",
  "dosage": "500mg",
  "frequence": "3 fois par jour",
  "priorite": "normale",
  "canal": "application"
}
```

**Étape 2: Affichage des Ordonnances Récentes**
```bash
GET /api/prescription/ordonnances-recentes?page=1&limit=10&jours=7
```

**Étape 3: Consultation des Notifications**
```bash
GET /api/prescription/patient/1/notifications?statut=non_lue
```

**Étape 4: Résumé de la Journée**
```bash
GET /api/prescription/resume-aujourdhui
```

---

### 📱 Interface Utilisateur Recommandée (Mise à Jour)

**Écrans principaux:**
1. **Tableau de bord** - Vue d'ensemble avec résumé du jour
2. **Ordonnances récentes** - Liste des créations récentes
3. **Formulaire d'ordonnance complète** - Création en une étape
4. **Notifications** - Centre de notifications pour patients
5. **Dossiers patients** - Intégration avec les dossiers médicaux
6. **Statistiques** - Graphiques et métriques avancées

**Fonctionnalités clés:**
- Création d'ordonnance en une étape complète
- Notifications automatiques pour patients
- Intégration automatique aux dossiers
- Suivi en temps réel des créations
- Interface intuitive pour médecins
- Notifications multi-canaux (app, email, SMS)

---

### 🎯 Avantages des Nouvelles Fonctionnalités

**Pour les médecins:**
1. **Efficacité** - Création complète en une étape
2. **Suivi** - Visibilité sur les ordonnances récentes
3. **Communication** - Notifications automatiques aux patients
4. **Organisation** - Intégration automatique aux dossiers
5. **Statistiques** - Vue d'ensemble de l'activité

**Pour les patients:**
1. **Information** - Notifications en temps réel
2. **Accessibilité** - Consultation des ordonnances
3. **Suivi** - Historique dans le dossier médical
4. **Sécurité** - QR Codes pour vérification
5. **Transparence** - Communication claire avec le médecin

**Pour l'équipe technique:**
1. **Performance** - Requêtes optimisées
2. **Scalabilité** - Architecture modulaire
3. **Maintenance** - Code bien structuré
4. **Sécurité** - Validation complète
5. **Monitoring** - Suivi des performances 