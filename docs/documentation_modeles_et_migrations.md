# Documentation des Modèles, Migrations et Configuration

## Table des Matières
1. [Modèles Principaux](#modèles-principaux)
   - [Patient](#modèle-patient)
   - [Utilisateur](#modèle-utilisateur)
   - [Dossier Médical](#modèle-dossiermedical)
   - [Hôpital](#modèle-hopital)
   - [Service de Santé](#modèle-servicesante)
   - [Professionnel de Santé](#modèle-professionnelsante)
   - [Rendez-vous](#modèle-rendezvous)
   - [Consultation](#modèle-consultation)
   - [Prescription](#modèle-prescription)
   - [Examen de Laboratoire](#modèle-examenlabo)
   - [Historique d'Accès](#modèle-historiqueaccess)
   - [Autorisation d'Accès](#modèle-autorisationacces)
2. [Configuration de la Base de Données](#configuration-de-la-base-de-données)
3. [Migrations](#migrations)
4. [Processus de Build](#processus-de-build)
5. [Logique Métier](#logique-métier)
6. [Bonnes Pratiques](#bonnes-pratiques)
7. [Méthodes Utilitaires](#méthodes-utilitaires)

# Modèles Principaux

## Modèle Patient

### Champs Principaux
- **Informations personnelles** : 
  - `id_patient` (clé primaire, auto-incrémenté)
  - `nom`, `prenom` (validation de format, nettoyage automatique)
  - `date_naissance` (validation de date, calcul d'âge automatique)
  - `lieu_naissance` (validation de longueur, formatage automatique)
  - `genre` (ENUM avec valeurs validées)
  - `civilite` (M., Mme, Mlle, etc.)
  - `adresse`, `code_postal`, `ville`, `pays`
  - `telephone`, `email` (validation de format)
  - `numero_securite_sociale` (unique, validation de format)
  - `groupe_sanguin`, `allergies_connues`
  - `antecedents_medicaux`, `traitements_en_cours`
  - `contact_urgence_nom`, `contact_urgence_telephone`
  - `date_creation`, `date_mise_a_jour` (gérés automatiquement)

### Relations
- Appartient à un DossierMedical (1:1)
- Peut avoir plusieurs RendezVous (1:n)
- Peut avoir plusieurs Consultations (1:n)
- Peut avoir plusieurs Prescriptions (1:n)
- Peut avoir plusieurs Examens de Laboratoire (1:n)

## Modèle Utilisateur

### Champs Principaux
- `id_utilisateur` (clé primaire, auto-incrémenté)
- `nom`, `prenom` (obligatoires, validation de longueur)
- `email` (unique, validation de format email)
- `mot_de_passe` (hashé avec bcrypt, validation de complexité)
- `telephone` (validation de format international)
- `role` (ENUM: 'admin', 'medecin', 'infirmier', 'secretaire', etc.)
- `date_embauche`, `date_fin_contrat`
- `statut` (actif, inactif, en congé, etc.)
- `derniere_connexion`
- `date_creation`, `date_mise_a_jour`

### Méthodes
- `verifierMotDePasse(motDePasse)` - Vérifie si le mot de passe fourni correspond au hash stocké
- `genererToken()` - Génère un JWT pour l'authentification

## Modèle DossierMedical

### Champs Principaux
- `id_dossier` (clé primaire, auto-incrémenté)
- `numeroDossier` (unique, format personnalisé)
- `dateCreation` (par défaut: date du jour)
- `statut` (ENUM: 'Ouvert', 'Fermé', 'Archivé')
- `type_dossier` (ENUM: 'principal', 'spécialité', 'urgence', 'suivi', 'consultation')
- `observations`
- `date_derniere_modification`

### Relations
- Appartient à un Patient (1:1)
- Peut avoir plusieurs Consultations (1:n)
- Peut avoir plusieurs Examens (1:n)
- Peut avoir plusieurs Prescriptions (1:n)

## Modèle Hopital

### Champs Principaux
- `id_hopital` (clé primaire, auto-incrémenté)
- `nom` (nom de l'établissement)
- `adresse`, `code_postal`, `ville`, `pays`
- `telephone`, `email`
- `type` (CHU, CH, clinique, cabinet, etc.)
- `statut` (actif, inactif, en maintenance)
- `date_creation`, `date_mise_a_jour`

### Relations
- Possède plusieurs Services de Santé (1:n)
- Possède plusieurs Professionnels de Santé (1:n)

## Modèle ServiceSante

### Champs Principaux
- `id_service` (clé primaire, auto-incrémenté)
- `nom` (ex: Cardiologie, Pédiatrie, etc.)
- `description`
- `type` (médecine, chirurgie, urgences, etc.)
- `responsable_id` (référence à un ProfessionnelSante)
- `etage`, `batiment`
- `telephone`
- `statut` (actif, inactif, en rénovation)
- `date_creation`, `date_mise_a_jour`

### Relations
- Appartient à un Hôpital (n:1)
- Possède plusieurs Professionnels de Santé (1:n)
- Peut avoir plusieurs Lits (1:n)

## Modèle ProfessionnelSante

### Champs Principaux
- `id_professionnel` (clé primaire, auto-incrémenté)
- `utilisateur_id` (référence à Utilisateur)
- `specialite`
- `numero_ordre` (numéro d'ordre professionnel)
- `rpps` (Répertoire Partagé des Professionnels de Santé)
- `statut` (actif, inactif, en congé, etc.)
- `disponibilite`
- `date_creation`, `date_mise_a_jour`

### Relations
- Appartient à un Service de Santé (n:1)
- Appartient à un Utilisateur (1:1)
- Peut avoir plusieurs RendezVous (1:n)
- Peut avoir plusieurs Consultations (1:n)
- Peut avoir plusieurs Prescriptions (1:n)

## Modèle RendezVous

### Champs Principaux
- `id_rendezvous` (clé primaire, auto-incrémenté)
- `date_heure` (date et heure du rendez-vous)
- `duree` (en minutes)
- `motif`
- `statut` (planifié, confirmé, annulé, reporté, terminé)
- `notes`
- `type_consultation` (première visite, suivi, urgence, etc.)
- `date_creation`, `date_mise_a_jour`

### Relations
- Appartient à un Patient (n:1)
- Appartient à un Professionnel de Santé (n:1)
- Peut être lié à une Consultation (1:1)

## Modèle Consultation

### Champs Principaux
- `id_consultation` (clé primaire, auto-incrémenté)
- `date_consultation` (date et heure de début)
- `duree` (en minutes)
- `motif`
- `symptomes`
- `diagnostic`
- `traitement_propose`
- `notes`
- `statut` (en cours, terminée, annulée)
- `date_creation`, `date_mise_a_jour`

### Relations
- Appartient à un Patient (n:1)
- Appartient à un Professionnel de Santé (n:1)
- Appartient à un DossierMedical (n:1)
- Peut avoir plusieurs Prescriptions (1:n)
- Peut avoir plusieurs Examens (1:n)

## Modèle Prescription

### Champs Principaux
- `id_prescription` (clé primaire, auto-incrémenté)
- `date_prescription`
- `date_debut`
- `date_fin`
- `posologie`
- `statut` (en attente, en cours, terminée, annulée)
- `notes`
- `date_creation`, `date_mise_a_jour`

### Relations
- Appartient à un Patient (n:1)
- Appartient à un Professionnel de Santé (n:1)
- Appartient à une Consultation (n:1, optionnel)
- Appartient à un DossierMedical (n:1)

## Modèle ExamenLabo

### Champs Principaux
- `id_examen` (clé primaire, auto-incrémenté)
- `type_examen`
- `date_prescription`
- `date_realisation`
- `resultat` (texte ou référence à un fichier)
- `statut` (prescrit, en cours, terminé, annulé)
- `commentaires`
- `date_creation`, `date_mise_a_jour`

### Relations
- Appartient à un Patient (n:1)
- Appartient à un Professionnel de Santé (n:1, le prescripteur)
- Appartient à une Consultation (n:1, optionnel)
- Appartient à un DossierMedical (n:1)

## Modèle HistoriqueAccess

### Champs Principaux
- `id_access` (clé primaire, auto-incrémenté)
- `date_heure`
- `type_action` (connexion, consultation, modification, etc.)
- `details`
- `adresse_ip`
- `user_agent`
- `statut` (succès, échec, tentative suspecte)

### Relations
- Appartient à un Utilisateur (n:1)
- Peut être lié à un DossierMedical (n:1, optionnel)

## Modèle AutorisationAcces

### Champs Principaux
- `id_autorisation` (clé primaire, auto-incrémenté)
- `date_debut`
- `date_fin`
- `niveau_acces` (lecture, écriture, administration)
- `statut` (actif, expiré, révoqué)
- `motif`
- `date_creation`, `date_mise_a_jour`

### Relations
- Appartient à un Utilisateur (n:1, l'utilisateur qui accorde l'accès)
- Appartient à un DossierMedical (n:1)
- Peut concerner un Professionnel de Santé (n:1, optionnel)
  - `numero_securite_sociale` (unique, validation du format)

- **Coordonnées** : 
  - `adresse`, `complement_adresse`
  - `code_postal` (validation à 5 chiffres)
  - `ville`, `pays` (validation et formatage)
  - `telephone` (principal et secondaire, validation du format)
  - `email` (validation, stockage en minuscules)

- **Informations professionnelles** :
  - `profession` (libellé détaillé)
  - `profession_code_rome` (format A1234)
  - `profession_categorie` (catégorie socio-professionnelle)
  - `employeur`
  - `employeur_secteur` (public, privé, associatif, etc.)
  - `situation_professionnelle` (en emploi, chômage, étudiant, etc.)

- **Situation familiale** :
  - `situation_familiale` (célibataire, marié, pacsé, etc.)
  - `date_mariage` (validation cohérente avec date de naissance)
  - `personne_contact` (pour les urgences)
  - `telephone_urgence`
  - `lien_parente` (avec la personne à contacter)

- **Informations médicales** :
  - `groupe_sanguin` (ENUM avec valeurs standardisées)
  - `poids` (en kg, validation des plages raisonnables)
  - `taille` (en cm, validation des plages raisonnables)
  - `antecedents_medicaux`
  - `allergies`
  - `traitements_en_cours`
  - `numero_dossier` (obligatoire, unique, format standardisé)

- **Suivi** :
  - `date_premiere_consultation`
  - `date_derniere_consultation`
  - `statut` (actif, inactif, décédé)
  - `date_deces` (si applicable)
  - `notes` (informations complémentaires)

### Validations
- **Formats** :
  - Email : format standard, conversion en minuscules
  - Téléphone : format international, nettoyage des caractères spéciaux
  - Code postal : 5 chiffres exactement
  - Numéro de sécurité sociale : format français validé
  - Dates : format ISO, cohérence chronologique

- **Contraintes d'intégrité** :
  - Champs obligatoires clairement identifiés
  - Unicité des identifiants uniques (numéro de dossier, email, etc.)
  - Cohérence des dates (naissance < mariage < décès si applicable)
  - Valeurs dans les plages autorisées (poids, taille, etc.)

- **ENUMs** :
  - `genre` : valeurs prédéfinies
  - `groupe_sanguin` : A+, A-, B+, B-, AB+, AB-, O+, O-, Inconnu
  - `situation_familiale` : valeurs normalisées avec mapping intelligent
  - `situation_professionnelle` : valeurs standardisées

### Hooks et Méthodes
- **Avant validation** :
  - Nettoyage des chaînes (trim)
  - Mise en forme standard (majuscules/minuscules selon le champ)
  - Conversion des valeurs (dates, nombres)

- **Avant création** :
  - Vérification de l'unicité des identifiants
  - Initialisation des valeurs par défaut
  - Validation des contraintes métier

- **Méthodes d'instance** :
  - `calculerAge()` : âge à partir de la date de naissance
  - `getFullName()` : formatage du nom complet
  - `mettreAJourStatut(nouveauStatut)` : gestion des transitions d'état

- **Méthodes statiques** :
  - `rechercherParNom(term)` : recherche par nom/prénom
  - `statistiquesParVille()` : agrégations géographiques

## Configuration de la Base de Données

### Fichier .env
```env
PORT=3000
NODE_ENV=development

# Configuration PostgreSQL
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=med
DB_PASSWORD=passer
DB_NAME=sante
DB_NAME_TEST=sante_test
DB_NAME_PROD=sante_prod

# Sécurité
JWT_SECRET=votre_cle_secrete_tres_longue_et_complexe
JWT_EXPIRES_IN=90d
```

### Fichier config.json
La configuration est organisée par environnement (development, test, production) avec les spécificités suivantes :

- **Development** :
  - Connexion à la base locale
  - Logging désactivé pour des performances optimales
  - SSL désactivé

- **Test** :
  - Base de données dédiée (sante_test)
  - Logging désactivé
  - Mode transactionnel pour isolation des tests

- **Production** :
  - SSL activé
  - Pool de connexions configuré
  - Logging désactivé pour la performance

## Migrations

### Structure des fichiers de migration
Les migrations suivent la convention de nommage :
`YYYYMMDDHHmmss-nom-de-la-migration.js`

### Commandes disponibles
```bash
# Exécuter les migrations
npm run migrate

# Configuration de la Base de Données

## Fichier de Configuration
Le fichier `config/config.js` contient les paramètres de connexion à la base de données pour différents environnements (développement, test, production).

### Variables d'environnement requises
```
DB_NAME=nom_de_la_base
DB_USER=utilisateur
DB_PASSWORD=mot_de_passe
DB_HOST=localhost
DB_PORT=3306
NODE_ENV=development
```

## Migrations

### Commandes disponibles

```bash
# Exécuter les migrations en attente
npm run migrate

# Annuler la dernière migration
npm run migrate:undo

# Annuler toutes les migrations
npm run migrate:undo:all

# Créer un nouveau fichier de migration
npx sequelize-cli migration:generate --name nom_de_la_migration
```

### Structure d'une migration

```javascript
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Code pour appliquer la migration
  },

  down: async (queryInterface, Sequelize) => {
    // Code pour annuler la migration
  }
};
```

## Processus de Build

### Problème connu avec le dossier de sortie
Le projet génère actuellement un dossier `.dist` au lieu de `dist` lors de la compilation TypeScript. Cela est dû à une configuration spécifique dans le fichier `tsconfig.json`.

### Commandes de build

```bash
# Installer les dépendances
npm install

# Compiler le projet TypeScript
npm run build

# Démarrer l'application en mode développement
npm run start:dev

# Démarrer l'application en mode production
npm start
```

### Solution de contournement pour le dossier .dist

Pour les environnements où le dossier de sortie doit impérativement s'appeler `dist`, vous pouvez soit :

1. Mettre à jour le script de démarrage dans `package.json` :
   ```json
   "start": "node .dist/main.js"
   ```

2. Ou modifier le `tsconfig.json` pour utiliser `dist` comme dossier de sortie :
   ```json
   {
     "compilerOptions": {
       "outDir": "dist",
       // autres options...
     }
   }
   ```

## Logique Métier

### Gestion des Dossiers Patients
- Création automatique d'un dossier médical lors de l'ajout d'un nouveau patient
- Vérification des doublons basée sur le numéro de sécurité sociale
- Gestion des historiques de modifications

### Gestion des Rendez-vous
- Vérification des disponibilités des professionnels de santé
- Envoi de notifications par email/SMS
- Gestion des annulations et reports

### Sécurité des Données
- Chiffrement des données sensibles
- Journalisation des accès
- Gestion fine des autorisations

## Bonnes Pratiques

### Développement
- Toujours créer une nouvelle migration pour les modifications de schéma
- Utiliser les transactions pour les opérations multiples
- Valider les entrées utilisateur
- Documenter les nouvelles fonctionnalités

### Sécurité
- Ne jamais stocker de mots de passe en clair
- Utiliser des requêtes paramétrées pour éviter les injections SQL
- Mettre en place des limites de taux pour les API
- Maintenir les dépendances à jour

## Méthodes Utilitaires

### Génération de Numéros de Dossier
```javascript
function genererNumeroDossier() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `DOSS-${timestamp}-${random}`;
}
```

### Validation des Données de Santé
```javascript
function validerDonneesSante(donnees) {
  // Implémentation de la validation
}
```

### Gestion des Erreurs
```javascript
class ErreurMetier extends Error {
  constructor(message, codeStatut = 400) {
    super(message);
    this.codeStatut = codeStatut;
    this.name = this.constructor.name;
  }
}
```

# Exécuter les seeders
npm run seed
```

### Bonnes pratiques
- Une migration par modification de schéma
- Pas de données de test en production
- Utiliser les transactions pour les migrations critiques
- Documenter les migrations complexes

## Modèle ServiceSante

### Rôle et Objectif
Le modèle `ServiceSante` représente un service médical au sein d'un établissement de santé. Il sert principalement à :
- Organiser les professionnels de santé par spécialité
- Structurer les dossiers médicaux par service
- Faciliter la gestion des consultations et des suivis médicaux

### Champs Principaux
- **Identification** :
  - `code` (String, unique) : Code d'identification du service
  - `nom` (String) : Nom complet du service
  - `description` (Text) : Description des activités du service

- **Type de Service** :
  - `type_service` (Enum) : Type de service parmi :
    - `medecine_generale`
    - `pediatrie`
    - `chirurgie`
    - `urgences`
    - `radiologie`
    - `biologie`
    - `pharmacie`
    - `consultation`
    - `hospitalisation`
    - `autre`

- **Coordonnées** :
  - `telephone` (String) : Numéro de contact du service
  - `email` (String) : Adresse email de contact

- **Références** :
  - `hopital_id` (Integer) : Référence à l'établissement de santé
  - `responsable_id` (Integer) : Référence au professionnel responsable

- **Statut** :
  - `statut` (Enum) : `actif` ou `inactif`

### Relations
- `Hopital` (belongsTo) : Établissement de santé auquel appartient le service
- `ProfessionnelSante` (hasMany) : Professionnels exerçant dans ce service
- `DossierMedical` (hasMany) : Dossiers médicaux gérés par ce service

### Méthodes Utilitaires
- `getDossiersMedicaux(options)` : Récupère tous les dossiers médicaux du service
- `getProfessionnels(options)` : Liste les professionnels du service

### Scopes
- `avecInactifs` : Inclut les services inactifs
- `parHopital(hopitalId)` : Filtre par établissement de santé
- `parType(type)` : Filtre par type de service

## Logique Métier

### Gestion des Dossiers Médicaux
1. **Création/MAJ**
   - Un dossier médical est toujours rattaché à un service spécifique
   - Un patient peut avoir plusieurs dossiers médicaux dans différents services
   - Chaque dossier a un médecin référent assigné

2. **Sécurité des Données**
   - Accès restreint aux professionnels du service concerné
   - Journalisation des accès aux dossiers
   - Respect du secret médical et du RGPD

### Gestion des Services de Santé
1. **Organisation**
   - Chaque service appartient à un seul établissement de santé
   - Un professionnel peut être affecté à plusieurs services
   - Le responsable du service a des droits d'administration

2. **Validation**
   - Unicité du code de service par établissement
   - Vérification des références (hôpital, responsable)
   - Formats valides (email, téléphone)

### Gestion des Rendez-vous
1. **Prise de Rendez-vous**
   - Vérification de la disponibilité du professionnel
   - Gestion des créneaux horaires par service
   - Envoi de notifications de rappel

## Bonnes Pratiques

### Sécurité
- Hachage des données sensibles (mots de passe)
- Exclusion des champs sensibles par défaut (scopes)
- Validation stricte des entrées utilisateur

### Performance
- Index sur les champs fréquemment recherchés
- Chargement paresseux des relations
- Pagination des résultats de recherche

### Maintenance
- Documentation des champs (commentaires)
- Codes d'erreur explicites
- Logging des opérations critiques

## Méthodes Utilitaires

### Patient
- `calculerAge()` : Calcule l'âge à partir de la date de naissance
- `getFullName()` : Retourne le nom complet formaté
- `findByName(term)` : Recherche par nom/prénom (statique)
- `getPrescriptions([options])` : Récupère toutes les prescriptions du patient à travers ses dossiers médicaux
  - Inclut les informations du professionnel de santé prescripteur
  - Triées par date de prescription décroissante
  - Options de requête Sequelize personnalisables
- `getExamensLabo([options])` : Récupère tous les examens de laboratoire du patient
  - Inclut les informations du prescripteur et du service de santé
  - Triés par date de prélèvement décroissante
  - Options de requête Sequelize personnalisables

### ServiceSante
- `getDossiersMedicaux([options])` : Récupère tous les dossiers médicaux gérés par le service
  - Inclut les informations des patients et des professionnels référents
  - Options de requête Sequelize personnalisables
- `getProfessionnels([options])` : Liste les professionnels du service
  - Inclut les informations utilisateur associées
  - Options de filtrage et de tri personnalisables
- **Scopes prédéfinis** :
  - `avecInactifs` : Inclut les services inactifs dans les résultats
  - `parHopital(hopitalId)` : Filtre les services par établissement
  - `parType(type)` : Filtre les services par type (médecine, chirurgie, etc.)

## Guide de Migration

### Prérequis
- Node.js 14+
- PostgreSQL 12+
- Configuration de la base de données dans `.env`

### Commandes
```bash
# Exécuter les migrations
npx sequelize-cli db:migrate

# Annuler la dernière migration
npx sequelize-cli db:migrate:undo

# Exécuter les seeders
npx sequelize-cli db:seed:all
```

### Ordre des Migrations
1. Utilisateurs
2. Hopitaux
3. ServicesSante
4. ProfessionnelsSante
5. Patients
6. DossiersMedicaux
7. Consultations
8. RendezVous
9. Prescriptions
10. ExamensLabo
11. AutorisationsAcces
12. HistoriquesAcces

## Dépannage

### Problèmes Courants
1. **Échec de migration**
   - Vérifier les logs d'erreur
   - S'assurer que la base de données est accessible
   - Vérifier les contraintes de clé étrangère

2. **Données de test**
   - Utiliser les seeders pour les données de test
   - Vérifier les contraintes d'unicité

3. **Problèmes de performance**
   - Vérifier les index manquants
   - Optimiser les requêtes N+1

## Évolution Future
- Ajout de l'historique des modifications
- Intégration avec un système de messagerie
- API GraphQL en plus de REST
