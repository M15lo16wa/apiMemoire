# Proposition de Modifications pour la Gestion des Dossiers Patients

## Structure Actuelle

### 1. Modèle Patient
- **Rôle** : Stocke les informations personnelles et démographiques du patient.
- **Relations** :
  - 1:1 avec Utilisateur (compte de connexion)
  - 1:N avec DossierMedical
  - 1:N avec RendezVous

### 2. Modèle DossierMedical
- **Rôle** : Représente un dossier médical lié à un patient.
- **Champs clés** :
  - numeroDossier (unique)
  - dateCreation
  - statut (Ouvert/Fermé/Archivé)
  - type_dossier (principal/spécialité/urgence/etc.)

### 3. Modèle ServiceSante
- **Rôle** : Représente un service médical dans un hôpital.
- **Relations** :
  - 1:N avec ProfessionnelSante
  - 1:N avec RendezVous

## Problèmes Identifiés

1. **Séparation Patient/Dossier** : La séparation stricte entre Patient et DossierMedical peut entraîner une complexité inutile pour les cas d'utilisation courants.

2. **Pas de lien direct** entre un dossier médical et un service de santé spécifique.

3. **Gestion des accès** : Le système actuel d'autorisations semble complexe et pourrait être simplifié.

## Propositions de Modification

### 1. Intégration des Données Essentielles du Patient dans le Dossier

**Objectif** : Simplifier l'accès aux informations fréquemment utilisées.

**Changements proposés** :
- Ajouter les champs essentiels du patient directement dans le modèle DossierMedical
- Créer une vue SQL pour la rétrocompatibilité

### 2. Lien Direct entre Dossier et Service

**Objectif** : Permettre une meilleure organisation des dossiers par service.

**Changements proposés** :
```javascript
// Dans le modèle DossierMedical
service_id: {
  type: DataTypes.INTEGER,
  allowNull: false,
  references: {
    model: 'ServicesSante',
    key: 'id_service'
  }
}
```

### 3. Simplification du Modèle d'Autorisation

**Objectif** : Rendre la gestion des accès plus intuitive.

**Changements proposés** :
- Créer une table `AccesDossier` avec :
  - dossier_id
  - professionnel_id
  - niveau_acces (lecture/écriture/administration)
  - date_expiration

### 4. Historique des Modifications

**Objectif** : Suivre toutes les modifications apportées à un dossier.

**Changements proposés** :
```javascript
// Nouveau modèle HistoriqueModification
{
  id_modification: { type: DataTypes.INTEGER, primaryKey: true },
  dossier_id: { type: DataTypes.INTEGER, allowNull: false },
  professionnel_id: { type: DataTypes.INTEGER, allowNull: false },
  type_modification: { 
    type: DataTypes.ENUM('creation', 'modification', 'consultation', 'suppression'),
    allowNull: false 
  },
  details: { type: DataTypes.JSON, allowNull: true },
  date_modification: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}
```

## Impact sur les Autres Modèles

### 1. Consultation
- Doit obligatoirement être liée à un dossier
- Doit référencer le service où elle a lieu

### 2. ProfessionnelSante
- Peut être membre de plusieurs services
- Doit avoir des droits spécifiques par service

## Migration Proposée

1. Créer les nouvelles tables
2. Migrer les données existantes
3. Mettre à jour les contraintes de clé étrangère
4. Mettre à jour l'API pour refléter les nouveaux modèles

## Questions à Résoudre

1. Faut-il conserver la séparation stricte Patient/DossierMedical ?
2. Comment gérer les dossiers qui concernent plusieurs services ?
3. Quelles sont les règles métier pour l'accès aux dossiers ?

## Prochaines Étapes

1. Valider cette proposition
2. Détailler le plan de migration
3. Implémenter les changements par étapes
