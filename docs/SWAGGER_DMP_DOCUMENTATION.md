# Documentation Swagger - Fonctionnalités DMP (Dossier Médical Partagé)

## 📋 Vue d'ensemble

Ce document contient la documentation Swagger complète pour toutes les nouvelles fonctionnalités DMP ajoutées au module Patient. Cette documentation peut être intégrée dans la configuration Swagger principale de l'application.

## 🔧 Configuration Swagger

### Tags à ajouter dans la configuration principale

```yaml
tags:
  - name: DMP - Patient
    description: Dossier Médical Partagé - Fonctionnalités patient
```

### Schémas à ajouter dans components.schemas

```yaml
components:
  schemas:
    TableauDeBord:
      type: object
      properties:
        patient:
          type: object
          properties:
            id:
              type: integer
              description: ID du patient
            nom:
              type: string
              description: Nom de famille
            prenom:
              type: string
              description: Prénom
            date_naissance:
              type: string
              format: date
              description: Date de naissance
            identifiant:
              type: string
              description: Numéro d'assuré
            groupe_sanguin:
              type: string
              description: Groupe sanguin
            allergies:
              type: string
              description: Allergies connues
            maladies_chroniques:
              type: string
              description: Maladies chroniques principales
        prochains_rendez_vous:
          type: array
          items:
            type: object
            properties:
              id_rdv:
                type: integer
              date_rdv:
                type: string
                format: date-time
              professionnel:
                type: object
                properties:
                  nom:
                    type: string
                  prenom:
                    type: string
                  specialite:
                    type: string
        dernieres_activites:
          type: array
          items:
            type: object
            properties:
              type_acces:
                type: string
                enum: [consultation, ajout, modification, autorisation]
              description:
                type: string
              date_acces:
                type: string
                format: date-time
              professionnel:
                type: object
                properties:
                  nom:
                    type: string
                  prenom:
                    type: string
                  specialite:
                    type: string
        notifications:
          type: array
          items:
            type: object
            properties:
              type:
                type: string
                enum: [nouveau_document, rendez_vous, rappel]
              message:
                type: string
              date:
                type: string
                format: date-time
              lu:
                type: boolean

    HistoriqueMedical:
      type: object
      properties:
        consultations:
          type: array
          items:
            $ref: '#/components/schemas/Consultation'
        prescriptions:
          type: array
          items:
            $ref: '#/components/schemas/Prescription'
        examens_laboratoire:
          type: array
          items:
            $ref: '#/components/schemas/ExamenLabo'

    JournalActivite:
      type: object
      properties:
        id_activite:
          type: integer
          description: Identifiant unique de l'activité
        patient_id:
          type: integer
          description: ID du patient
        professionnel_id:
          type: integer
          description: ID du professionnel
        type_acces:
          type: string
          enum: [consultation, ajout, modification, autorisation, revocation]
          description: Type d'accès
        description:
          type: string
          description: Description de l'activité
        date_acces:
          type: string
          format: date-time
          description: Date et heure de l'accès
        professionnel:
          type: object
          properties:
            nom:
              type: string
            prenom:
              type: string
            specialite:
              type: string
            numero_adeli:
              type: string

    AutorisationAcces:
      type: object
      properties:
        id_autorisation:
          type: integer
          description: Identifiant unique de l'autorisation
        patient_id:
          type: integer
          description: ID du patient
        professionnel_id:
          type: integer
          description: ID du professionnel
        date_autorisation:
          type: string
          format: date-time
          description: Date d'autorisation
        statut:
          type: string
          enum: [active, inactive, expiree]
          description: Statut de l'autorisation
        permissions:
          type: object
          properties:
            consultation:
              type: boolean
            prescription:
              type: boolean
            examen:
              type: boolean
        professionnel:
          type: object
          properties:
            nom:
              type: string
            prenom:
              type: string
            specialite:
              type: string
            numero_adeli:
              type: string

    AutoMesure:
      type: object
      properties:
        type_mesure:
          type: string
          enum: [poids, taille, tension_arterielle, glycemie, temperature]
          description: Type de mesure
        valeur:
          type: number
          description: Valeur de la mesure
        unite:
          type: string
          description: Unité de mesure
        commentaire:
          type: string
          description: Commentaire optionnel
        date_mesure:
          type: string
          format: date-time
          description: Date de la mesure

    FicheUrgence:
      type: object
      properties:
        fiche_urgence:
          type: object
          properties:
            nom:
              type: string
              description: Nom complet du patient
            date_naissance:
              type: string
              format: date
              description: Date de naissance
            telephone:
              type: string
              description: Numéro de téléphone
            personne_urgence:
              type: string
              description: Contact d'urgence
            telephone_urgence:
              type: string
              description: Téléphone d'urgence
            groupe_sanguin:
              type: string
              description: Groupe sanguin
            allergies:
              type: string
              description: Allergies connues
            maladies_chroniques:
              type: string
              description: Maladies chroniques
            traitement_cours:
              type: string
              description: Traitement en cours
            identifiant:
              type: string
              description: Numéro d'assuré
        qr_code:
          type: string
          description: QR Code en base64
        url_fiche:
          type: string
          description: URL de la fiche d'urgence

    Rappel:
      type: object
      properties:
        type:
          type: string
          enum: [medicament, vaccin, controle]
          description: Type de rappel
        message:
          type: string
          description: Message du rappel
        date:
          type: string
          format: date-time
          description: Date du rappel
        priorite:
          type: string
          enum: [haute, moyenne, basse]
          description: Priorité du rappel

    StatistiquesDMP:
      type: object
      properties:
        total_consultations:
          type: integer
          description: Nombre total de consultations
        total_prescriptions:
          type: integer
          description: Nombre total de prescriptions
        total_examens:
          type: integer
          description: Nombre total d'examens
        derniere_activite:
          type: string
          format: date-time
          description: Date de la dernière activité
        professionnels_autorises:
          type: integer
          description: Nombre de professionnels autorisés
        documents_uploades:
          type: integer
          description: Nombre de documents uploadés

    DocumentPersonnel:
      type: object
      properties:
        id:
          type: integer
          description: Identifiant unique du document
        titre:
          type: string
          description: Titre du document
        type:
          type: string
          enum: [analyse, radiographie, ordonnance, autre]
          description: Type de document
        date_upload:
          type: string
          format: date-time
          description: Date d'upload
        taille:
          type: string
          description: Taille du fichier
        url:
          type: string
          description: URL de téléchargement

    BibliothequeSante:
      type: object
      properties:
        id:
          type: integer
          description: Identifiant unique de l'article
        titre:
          type: string
          description: Titre de l'article
        categorie:
          type: string
          description: Catégorie de l'article
        description:
          type: string
          description: Description de l'article
        url:
          type: string
          description: URL de l'article
        date_publication:
          type: string
          format: date-time
          description: Date de publication
```

## 🚀 Routes DMP - Documentation Swagger

### 1. Tableau de Bord Personnalisé

```yaml
/patient/dmp/tableau-de-bord:
  get:
    summary: Récupère le tableau de bord personnalisé du patient
    tags: [DMP - Patient]
    security:
      - bearerAuth: []
    responses:
      200:
        description: Tableau de bord récupéré avec succès
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: success
                data:
                  type: object
                  properties:
                    tableau_de_bord:
                      $ref: '#/components/schemas/TableauDeBord'
      401:
        description: Non authentifié
      403:
        description: Accès refusé
```

### 2. Historique Médical Complet

```yaml
/patient/dmp/historique-medical:
  get:
    summary: Récupère l'historique médical complet du patient
    tags: [DMP - Patient]
    security:
      - bearerAuth: []
    parameters:
      - in: query
        name: type
        schema:
          type: string
        description: Type de document (consultation, prescription, examen)
      - in: query
        name: date_debut
        schema:
          type: string
          format: date
        description: Date de début pour filtrer
      - in: query
        name: date_fin
        schema:
          type: string
          format: date
        description: Date de fin pour filtrer
      - in: query
        name: limit
        schema:
          type: integer
          default: 20
        description: Nombre d'éléments à retourner
      - in: query
        name: offset
        schema:
          type: integer
          default: 0
        description: Offset pour la pagination
    responses:
      200:
        description: Historique médical récupéré avec succès
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: success
                data:
                  type: object
                  properties:
                    historique_medical:
                      $ref: '#/components/schemas/HistoriqueMedical'
      401:
        description: Non authentifié
      403:
        description: Accès refusé
```

### 3. Journal d'Activité et de Consentement

```yaml
/patient/dmp/journal-activite:
  get:
    summary: Récupère le journal d'activité et de consentement
    tags: [DMP - Patient]
    security:
      - bearerAuth: []
    parameters:
      - in: query
        name: type
        schema:
          type: string
        description: Type d'activité (consultation, ajout, modification)
      - in: query
        name: date_debut
        schema:
          type: string
          format: date
        description: Date de début pour filtrer
      - in: query
        name: date_fin
        schema:
          type: string
          format: date
        description: Date de fin pour filtrer
    responses:
      200:
        description: Journal d'activité récupéré avec succès
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: success
                data:
                  type: object
                  properties:
                    journal_activite:
                      type: array
                      items:
                        $ref: '#/components/schemas/JournalActivite'
      401:
        description: Non authentifié
      403:
        description: Accès refusé
```

### 4. Gestion des Droits d'Accès

```yaml
/patient/dmp/droits-acces:
  get:
    summary: Récupère les droits d'accès du patient
    tags: [DMP - Patient]
    security:
      - bearerAuth: []
    responses:
      200:
        description: Droits d'accès récupérés avec succès
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: success
                data:
                  type: object
                  properties:
                    droits_acces:
                      type: array
                      items:
                        $ref: '#/components/schemas/AutorisationAcces'
      401:
        description: Non authentifié
      403:
        description: Accès refusé

/patient/dmp/autoriser-acces:
  post:
    summary: Autorise un nouveau professionnel à accéder au dossier
    tags: [DMP - Patient]
    security:
      - bearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required:
              - professionnel_id
            properties:
              professionnel_id:
                type: integer
                description: ID du professionnel de santé
              permissions:
                type: object
                properties:
                  consultation:
                    type: boolean
                  prescription:
                    type: boolean
                  examen:
                    type: boolean
                description: Permissions spécifiques accordées
    responses:
      201:
        description: Autorisation accordée avec succès
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: success
                message:
                  type: string
                  example: Autorisation accordée avec succès
                data:
                  type: object
                  properties:
                    autorisation:
                      $ref: '#/components/schemas/AutorisationAcces'
      400:
        description: Données invalides
      401:
        description: Non authentifié
      403:
        description: Accès refusé
      404:
        description: Professionnel non trouvé
      409:
        description: Autorisation déjà existante

/patient/dmp/revoquer-acces/{professionnel_id}:
  delete:
    summary: Révoque l'accès d'un professionnel
    tags: [DMP - Patient]
    security:
      - bearerAuth: []
    parameters:
      - in: path
        name: professionnel_id
        required: true
        schema:
          type: integer
        description: ID du professionnel de santé
    responses:
      200:
        description: Accès révoqué avec succès
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: success
                message:
                  type: string
                  example: Accès révoqué avec succès
      401:
        description: Non authentifié
      403:
        description: Accès refusé
      404:
        description: Autorisation non trouvée
```

### 5. Informations Personnelles

```yaml
/patient/dmp/informations-personnelles:
  patch:
    summary: Met à jour les informations personnelles du patient
    tags: [DMP - Patient]
    security:
      - bearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              personne_urgence:
                type: string
                description: Nom de la personne à contacter en cas d'urgence
              telephone_urgence:
                type: string
                description: Téléphone de la personne d'urgence
              antecedents_familiaux:
                type: string
                description: Antécédents familiaux
              habitudes_vie:
                type: object
                description: Habitudes de vie (tabagisme, activité physique, etc.)
    responses:
      200:
        description: Informations personnelles mises à jour avec succès
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: success
                message:
                  type: string
                  example: Informations personnelles mises à jour avec succès
      400:
        description: Données invalides
      401:
        description: Non authentifié
      403:
        description: Accès refusé
```

### 6. Auto-mesures

```yaml
/patient/dmp/auto-mesures:
  post:
    summary: Ajoute une auto-mesure du patient
    tags: [DMP - Patient]
    security:
      - bearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required:
              - type_mesure
              - valeur
            properties:
              type_mesure:
                type: string
                enum: [poids, taille, tension_arterielle, glycemie, temperature]
                description: Type de mesure
              valeur:
                type: number
                description: Valeur de la mesure
              unite:
                type: string
                description: Unité de mesure
              commentaire:
                type: string
                description: Commentaire optionnel
    responses:
      201:
        description: Auto-mesure ajoutée avec succès
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: success
                message:
                  type: string
                  example: Auto-mesure ajoutée avec succès
      400:
        description: Données invalides
      401:
        description: Non authentifié
      403:
        description: Accès refusé
```

### 7. Fiche d'Urgence

```yaml
/patient/dmp/fiche-urgence:
  get:
    summary: Génère une fiche d'urgence avec QR Code
    tags: [DMP - Patient]
    security:
      - bearerAuth: []
    responses:
      200:
        description: Fiche d'urgence générée avec succès
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: success
                data:
                  type: object
                  properties:
                    fiche_urgence:
                      $ref: '#/components/schemas/FicheUrgence'
      401:
        description: Non authentifié
      403:
        description: Accès refusé
```

### 8. Rappels et Plan de Soins

```yaml
/patient/dmp/rappels:
  get:
    summary: Récupère les rappels et plan de soins personnalisé
    tags: [DMP - Patient]
    security:
      - bearerAuth: []
    responses:
      200:
        description: Rappels récupérés avec succès
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: success
                data:
                  type: object
                  properties:
                    rappels:
                      type: array
                      items:
                        $ref: '#/components/schemas/Rappel'
      401:
        description: Non authentifié
      403:
        description: Accès refusé
```

### 9. Bibliothèque de Santé

```yaml
/patient/dmp/bibliotheque-sante:
  get:
    summary: Récupère la bibliothèque de santé
    tags: [DMP - Patient]
    security:
      - bearerAuth: []
    parameters:
      - in: query
        name: categorie
        schema:
          type: string
        description: Catégorie de document
      - in: query
        name: recherche
        schema:
          type: string
        description: Terme de recherche
    responses:
      200:
        description: Bibliothèque de santé récupérée avec succès
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: success
                data:
                  type: object
                  properties:
                    bibliotheque_sante:
                      type: array
                      items:
                        $ref: '#/components/schemas/BibliothequeSante'
      401:
        description: Non authentifié
      403:
        description: Accès refusé
```

### 10. Documents Personnels

```yaml
/patient/dmp/documents-personnels:
  get:
    summary: Récupère les documents personnels du patient
    tags: [DMP - Patient]
    security:
      - bearerAuth: []
    responses:
      200:
        description: Documents personnels récupérés avec succès
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: success
                data:
                  type: object
                  properties:
                    documents_personnels:
                      type: array
                      items:
                        $ref: '#/components/schemas/DocumentPersonnel'
      401:
        description: Non authentifié
      403:
        description: Accès refusé

/patient/dmp/upload-document:
  post:
    summary: Upload de documents personnels
    tags: [DMP - Patient]
    security:
      - bearerAuth: []
    requestBody:
      required: true
      content:
        multipart/form-data:
          schema:
            type: object
            required:
              - file
              - titre
              - type_document
            properties:
              file:
                type: string
                format: binary
                description: Fichier à uploader (PDF, JPG, PNG)
              titre:
                type: string
                description: Titre du document
              description:
                type: string
                description: Description optionnelle
              type_document:
                type: string
                enum: [analyse, radiographie, ordonnance, autre]
                description: Type de document
    responses:
      201:
        description: Document uploadé avec succès
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: success
                message:
                  type: string
                  example: Document uploadé avec succès
      400:
        description: Données invalides ou fichier manquant
      401:
        description: Non authentifié
      403:
        description: Accès refusé
```

### 11. Statistiques DMP

```yaml
/patient/dmp/statistiques:
  get:
    summary: Récupère les statistiques du DMP
    tags: [DMP - Patient]
    security:
      - bearerAuth: []
    responses:
      200:
        description: Statistiques récupérées avec succès
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: success
                data:
                  type: object
                  properties:
                    statistiques:
                      $ref: '#/components/schemas/StatistiquesDMP'
      401:
        description: Non authentifié
      403:
        description: Accès refusé
```

## 🔧 Intégration dans l'Application

### 1. Ajouter les tags dans app.js

```javascript
/**
 * @swagger
 * tags:
 *   - name: DMP - Patient
 *     description: Dossier Médical Partagé - Fonctionnalités patient
 */
```

### 2. Ajouter les schémas dans components.schemas

Tous les schémas définis ci-dessus doivent être ajoutés dans la section `components.schemas` de la configuration Swagger.

### 3. Vérifier l'accessibilité

Après intégration, la documentation sera accessible via :
- **URL** : `http://localhost:3000/api-docs`
- **Interface** : Interface Swagger UI interactive
- **Tests** : Possibilité de tester directement les endpoints

## 📝 Notes d'Implémentation

### Points d'Attention
1. **Authentification** : Toutes les routes DMP nécessitent une authentification patient
2. **Validation** : Les données d'entrée sont strictement validées
3. **Sécurité** : Contrôle d'accès granulaire pour chaque endpoint
4. **Documentation** : Exemples de requêtes et réponses inclus

### Tests
- Utiliser l'interface Swagger UI pour tester les endpoints
- Vérifier les codes de réponse et les formats de données
- Tester les cas d'erreur et les validations

Cette documentation Swagger complète permet une intégration transparente des nouvelles fonctionnalités DMP dans l'API existante, offrant une interface claire et interactive pour les développeurs et les utilisateurs finaux. 