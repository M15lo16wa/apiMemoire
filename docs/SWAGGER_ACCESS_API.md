# Documentation Swagger - API d'Accès DMP

## Vue d'ensemble

Cette API gère l'accès aux dossiers médicaux des patients avec différents niveaux d'autorisation :
- **Accès Standard** : Requiert l'approbation du patient
- **Accès d'Urgence** : Accès immédiat avec justification
- **Accès Secret** : Accès discret sans notification au patient

## Schémas de Base

### Patient
```yaml
components:
  schemas:
    Patient:
      type: object
      properties:
        id_patient:
          type: integer
          description: Identifiant unique du patient
        utilisateur_id:
          type: integer
          description: ID de l'utilisateur associé
        numero_dossier:
          type: string
          description: Numéro de dossier médical
        nom:
          type: string
          description: Nom du patient
        prenom:
          type: string
          description: Prénom du patient
        date_naissance:
          type: string
          format: date
          description: Date de naissance
        sexe:
          type: string
          enum: [M, F]
          description: Sexe du patient
        adresse:
          type: string
          description: Adresse du patient
        telephone:
          type: string
          description: Numéro de téléphone
        email:
          type: string
          description: Adresse email
        groupe_sanguin:
          type: string
          description: Groupe sanguin
        allergies:
          type: string
          description: Allergies connues
        antecedents:
          type: string
          description: Antécédents médicaux
        numero_securite_sociale:
          type: string
          description: Numéro de sécurité sociale
        assurance_maladie:
          type: string
          description: Assurance maladie
        statut:
          type: string
          enum: [actif, inactif, decede]
          description: Statut du patient
      required:
        - nom
        - prenom
        - date_naissance
        - sexe
```

### AutorisationAcces
```yaml
    AutorisationAcces:
      type: object
      properties:
        id_acces:
          type: integer
          description: Identifiant unique de l'autorisation
        type_acces:
          type: string
          enum: [lecture, lecture_urgence, lecture_secrete]
          description: Type d'accès demandé
        date_debut:
          type: string
          format: date-time
          description: Date de début de l'autorisation
        date_fin:
          type: string
          format: date-time
          description: Date de fin de l'autorisation
        statut:
          type: string
          enum: [actif, inactif, attente_validation, refuse, expire]
          description: Statut actuel de l'autorisation
        raison_demande:
          type: string
          description: Raison de la demande d'accès
        conditions_acces:
          type: object
          description: Conditions spécifiques d'accès
        date_validation:
          type: string
          format: date-time
          description: Date de validation par le patient
        patient_id:
          type: integer
          description: ID du patient concerné
        professionnel_id:
          type: integer
          description: ID du professionnel demandeur
        autorisateur_id:
          type: integer
          description: ID du professionnel autorisateur
      required:
        - type_acces
        - patient_id
        - professionnel_id
```

### HistoriqueAccess
```yaml
    HistoriqueAccess:
      type: object
      properties:
        id_historique:
          type: integer
          description: Identifiant unique de l'entrée d'historique
        date_heure_acces:
          type: string
          format: date-time
          description: Date et heure de l'accès
        action:
          type: string
          description: Action effectuée
        type_ressource:
          type: string
          description: Type de ressource accédée
        id_ressource:
          type: integer
          description: ID de la ressource accédée
        details:
          type: string
          description: Détails de l'action
        statut:
          type: string
          enum: [SUCCES, ERREUR]
          description: Statut de l'action
        adresse_ip:
          type: string
          description: Adresse IP de l'utilisateur
        user_agent:
          type: string
          description: User agent du navigateur
        professionnel_id:
          type: integer
          description: ID du professionnel concerné
        id_patient:
          type: integer
          description: ID du patient concerné
```

### DMPAccessToken
```yaml
    DMPAccessToken:
      type: object
      properties:
        dmp_token:
          type: string
          description: Token JWT pour l'accès au DMP
        expires_in:
          type: integer
          description: Durée de validité en secondes
        autorisation:
          $ref: '#/components/schemas/AutorisationAcces'
```

## Endpoints Patient

### 1. Authentification Patient

```yaml
/api/patient/login:
  post:
    summary: Connexion d'un patient
    tags: [Patient - Authentication]
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required:
              - numero_assure
              - mot_de_passe
            properties:
              numero_assure:
                type: string
                description: Numéro d'assuré du patient
              mot_de_passe:
                type: string
                description: Mot de passe du patient
    responses:
      200:
        description: Connexion réussie
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: 'success'
                token:
                  type: string
                  description: Token JWT pour l'authentification
                data:
                  $ref: '#/components/schemas/Patient'
      400:
        description: Données invalides
      401:
        description: Identifiants incorrects
```

### 2. Inscription Patient

```yaml
/api/patient/register:
  post:
    summary: Inscription d'un nouveau patient
    tags: [Patient - Authentication]
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required:
              - nom
              - prenom
              - date_naissance
              - lieu_naissance
              - civilite
              - sexe
              - numero_assure
              - nom_assurance
              - adresse
              - ville
              - pays
              - email
              - telephone
              - mot_de_passe
            properties:
              nom:
                type: string
                description: Nom du patient
              prenom:
                type: string
                description: Prénom du patient
              date_naissance:
                type: string
                format: date
                description: Date de naissance
              lieu_naissance:
                type: string
                description: Lieu de naissance
              civilite:
                type: string
                description: Civilité
              sexe:
                type: string
                enum: [M, F]
                description: Sexe
              numero_assure:
                type: string
                description: Numéro d'assuré
              nom_assurance:
                type: string
                description: Nom de l'assurance
              adresse:
                type: string
                description: Adresse
              ville:
                type: string
                description: Ville
              pays:
                type: string
                description: Pays
              email:
                type: string
                format: email
                description: Email
              telephone:
                type: string
                description: Téléphone
              mot_de_passe:
                type: string
                description: Mot de passe
    responses:
      201:
        description: Patient créé avec succès
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: 'success'
                data:
                  type: object
                  properties:
                    patient:
                      $ref: '#/components/schemas/Patient'
      400:
        description: Données invalides ou champs manquants
```

### 3. Profil Patient (Authentifié)

```yaml
/api/patient/me:
  get:
    summary: Récupérer le profil du patient connecté
    tags: [Patient - Profile]
    security:
      - patientAuth: []
    responses:
      200:
        description: Profil récupéré
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: 'success'
                data:
                  type: object
                  properties:
                    patient:
                      $ref: '#/components/schemas/Patient'
      401:
        description: Non authentifié
      500:
        description: Erreur serveur
```

### 4. Modification du Profil

```yaml
/api/patient/me:
  patch:
    summary: Modifier le profil du patient connecté
    tags: [Patient - Profile]
    security:
      - patientAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              nom:
                type: string
                description: Nouveau nom
              prenom:
                type: string
                description: Nouveau prénom
              adresse:
                type: string
                description: Nouvelle adresse
              ville:
                type: string
                description: Nouvelle ville
              telephone:
                type: string
                description: Nouveau téléphone
              email:
                type: string
                format: email
                description: Nouvel email
    responses:
      200:
        description: Profil mis à jour
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: 'success'
                data:
                  type: object
                  properties:
                    patient:
                      $ref: '#/components/schemas/Patient'
      400:
        description: Données invalides
      401:
        description: Non authentifié
      403:
        description: Accès non autorisé
```

### 5. Changement de Mot de Passe

```yaml
/api/patient/change-password:
  patch:
    summary: Changer le mot de passe du patient
    tags: [Patient - Profile]
    security:
      - patientAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required:
              - mot_de_passe_actuel
              - nouveau_mot_de_passe
            properties:
              mot_de_passe_actuel:
                type: string
                description: Mot de passe actuel
              nouveau_mot_de_passe:
                type: string
                description: Nouveau mot de passe
    responses:
      200:
        description: Mot de passe mis à jour
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: 'success'
                message:
                  type: string
                  example: 'Mot de passe mis à jour avec succès'
      400:
        description: Données invalides
      401:
        description: Mot de passe actuel incorrect
```

### 6. Déconnexion Patient

```yaml
/api/patient/logout:
  post:
    summary: Déconnexion du patient
    tags: [Patient - Authentication]
    security:
      - patientAuth: []
    responses:
      200:
        description: Déconnexion réussie
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: 'success'
                message:
                  type: string
                  example: 'Déconnexion réussie'
```

### 7. Marquer une Notification comme Lue

```yaml
/api/patient/notifications/{notificationId}/mark-as-read:
  patch:
    summary: Marquer une notification comme lue
    tags: [Patient - Notifications]
    security:
      - patientAuth: []
    parameters:
      - in: path
        name: notificationId
        required: true
        schema:
          type: integer
        description: ID de la notification
    responses:
      200:
        description: Notification marquée comme lue
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: 'success'
                message:
                  type: string
                  example: 'Notification marquée comme lue'
                data:
                  type: object
                  properties:
                    notification:
                      type: object
                      properties:
                        id_notification:
                          type: integer
                        statut:
                          type: string
                          example: 'lue'
                        date_lecture:
                          type: string
                          format: date-time
      400:
        description: Données invalides
      401:
        description: Non authentifié
      403:
        description: Accès non autorisé
      404:
        description: Notification non trouvée
```

## Endpoints Admin (Gestion des Patients)

### 1. Liste des Patients

```yaml
/api/patient:
  get:
    summary: Récupérer tous les patients (Admin)
    tags: [Patient - Admin]
    security:
      - adminAuth: []
    responses:
      200:
        description: Liste des patients récupérée
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: 'success'
                results:
                  type: integer
                  example: 50
                data:
                  type: object
                  properties:
                    patients:
                      type: array
                      items:
                        $ref: '#/components/schemas/Patient'
      401:
        description: Non authentifié
      403:
        description: Accès réservé aux administrateurs
```

### 2. Détails d'un Patient

```yaml
/api/patient/{id}:
  get:
    summary: Récupérer les détails d'un patient
    tags: [Patient - Admin]
    security:
      - adminAuth: []
    parameters:
      - in: path
        name: id
        required: true
        schema:
          type: integer
        description: ID du patient
    responses:
      200:
        description: Détails du patient récupérés
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: 'success'
                data:
                  type: object
                  properties:
                    patient:
                      $ref: '#/components/schemas/Patient'
      401:
        description: Non authentifié
      403:
        description: Accès non autorisé
      404:
        description: Patient non trouvé
```

### 3. Modification d'un Patient

```yaml
/api/patient/{id}:
  patch:
    summary: Modifier un patient
    tags: [Patient - Admin]
    security:
      - adminAuth: []
    parameters:
      - in: path
        name: id
        required: true
        schema:
          type: integer
        description: ID du patient
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              nom:
                type: string
                description: Nom du patient
              prenom:
                type: string
                description: Prénom du patient
              adresse:
                type: string
                description: Adresse
              telephone:
                type: string
                description: Téléphone
              email:
                type: string
                format: email
                description: Email
              statut:
                type: string
                enum: [actif, inactif, decede]
                description: Statut du patient
    responses:
      200:
        description: Patient mis à jour
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: 'success'
                data:
                  type: object
                  properties:
                    patient:
                      $ref: '#/components/schemas/Patient'
      400:
        description: Données invalides
      401:
        description: Non authentifié
      403:
        description: Accès non autorisé
      404:
        description: Patient non trouvé
```

### 4. Suppression d'un Patient

```yaml
/api/patient/{id}:
  delete:
    summary: Supprimer un patient
    tags: [Patient - Admin]
    security:
      - adminAuth: []
    parameters:
      - in: path
        name: id
        required: true
        schema:
          type: integer
        description: ID du patient
    responses:
      204:
        description: Patient supprimé avec succès
      401:
        description: Non authentifié
      403:
        description: Accès réservé aux administrateurs
      404:
        description: Patient non trouvé
```

## Endpoints d'Accès

### 1. Demande d'Accès Standard

```yaml
/api/access/request-standard:
  post:
    summary: Demander un accès standard au dossier médical
    tags: [Access]
    security:
      - bearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required:
              - patient_id
            properties:
              patient_id:
                type: integer
                description: ID du patient
              raison_demande:
                type: string
                description: Raison de la demande d'accès
    responses:
      201:
        description: Demande d'accès créée avec succès
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: 'success'
                message:
                  type: string
                  example: 'Demande d\'accès envoyée avec succès'
                data:
                  $ref: '#/components/schemas/AutorisationAcces'
      400:
        description: Données invalides
      401:
        description: Non autorisé
      404:
        description: Patient non trouvé
```

### 2. Accès d'Urgence

```yaml
/api/access/grant-emergency:
  post:
    summary: Accorder un accès d'urgence au dossier médical
    tags: [Access]
    security:
      - bearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required:
              - patient_id
              - justification_urgence
            properties:
              patient_id:
                type: integer
                description: ID du patient
              justification_urgence:
                type: string
                description: Justification de l'urgence
    responses:
      201:
        description: Accès d'urgence accordé
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: 'success'
                message:
                  type: string
                  example: 'Accès d\'urgence accordé'
                data:
                  type: object
                  properties:
                    autorisation:
                      $ref: '#/components/schemas/AutorisationAcces'
                    dmp_token:
                      type: string
                      description: Token DMP pour accès immédiat
                    expires_in:
                      type: integer
                      example: 3600
                      description: Durée de validité en secondes
      400:
        description: Données invalides
      401:
        description: Non autorisé
      404:
        description: Patient non trouvé
```

### 3. Accès Secret

```yaml
/api/access/grant-secret:
  post:
    summary: Accorder un accès secret au dossier médical
    tags: [Access]
    security:
      - bearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required:
              - patient_id
            properties:
              patient_id:
                type: integer
                description: ID du patient
              raison_secrete:
                type: string
                description: Raison secrète de l'accès
    responses:
      201:
        description: Accès secret accordé
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: 'success'
                message:
                  type: string
                  example: 'Accès secret accordé'
                data:
                  type: object
                  properties:
                    autorisation:
                      $ref: '#/components/schemas/AutorisationAcces'
                    dmp_token:
                      type: string
                      description: Token DMP pour accès immédiat
                    expires_in:
                      type: integer
                      example: 7200
                      description: Durée de validité en secondes
      400:
        description: Données invalides
      401:
        description: Non autorisé
      404:
        description: Patient non trouvé
```

### 4. Génération de Token DMP

```yaml
/api/access/dmp-token/{authorizationId}:
  get:
    summary: Générer un token DMP pour une autorisation existante
    tags: [Access]
    security:
      - bearerAuth: []
    parameters:
      - in: path
        name: authorizationId
        required: true
        schema:
          type: integer
        description: ID de l'autorisation
    responses:
      200:
        description: Token DMP généré avec succès
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: 'success'
                message:
                  type: string
                  example: 'Token DMP généré avec succès'
                data:
                  $ref: '#/components/schemas/DMPAccessToken'
      401:
        description: Non autorisé
      403:
        description: Autorisation non active ou expirée
      404:
        description: Autorisation non trouvée
```

## Endpoints Patient - Gestion des Accès

### 1. Demandes en Attente

```yaml
/api/access/patient/pending:
  get:
    summary: Récupérer les demandes d'accès en attente
    tags: [Access - Patient]
    security:
      - patientAuth: []
    responses:
      200:
        description: Demandes en attente récupérées
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: 'success'
                results:
                  type: integer
                  example: 2
                data:
                  type: object
                  properties:
                    pendingRequests:
                      type: array
                      items:
                        $ref: '#/components/schemas/AutorisationAcces'
      401:
        description: Non autorisé
      403:
        description: Accès réservé aux patients
```

### 2. Réponse à une Demande

```yaml
/api/access/patient/response/{authorizationId}:
  patch:
    summary: Répondre à une demande d'accès
    tags: [Access - Patient]
    security:
      - patientAuth: []
    parameters:
      - in: path
        name: authorizationId
        required: true
        schema:
          type: integer
        description: ID de l'autorisation
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required:
              - response
            properties:
              response:
                type: string
                enum: [accept, refuse]
                description: Réponse du patient
              comment:
                type: string
                description: Commentaire optionnel
    responses:
      200:
        description: Réponse traitée avec succès
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: 'success'
                message:
                  type: string
                  example: 'Demande acceptée avec succès'
                data:
                  type: object
                  properties:
                    autorisation:
                      $ref: '#/components/schemas/AutorisationAcces'
                    dmp_token:
                      type: string
                      description: Token DMP (si accepté)
                    expires_in:
                      type: integer
                      description: Durée de validité (si accepté)
      400:
        description: Réponse invalide
      401:
        description: Non autorisé
      403:
        description: Accès réservé aux patients
      404:
        description: Demande non trouvée
```

### 3. Historique d'Accès (Patient)

```yaml
/api/access/patient/history:
  get:
    summary: Récupérer l'historique des accès pour le patient
    tags: [Access - Patient]
    security:
      - patientAuth: []
    responses:
      200:
        description: Historique récupéré
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: 'success'
                results:
                  type: integer
                  example: 10
                data:
                  type: object
                  properties:
                    history:
                      type: array
                      items:
                        $ref: '#/components/schemas/HistoriqueAccess'
      401:
        description: Non autorisé
      403:
        description: Accès réservé aux patients
```

### 4. Autorisations Actives (Patient)

```yaml
/api/access/patient/authorizations:
  get:
    summary: Récupérer les autorisations actives pour le patient
    tags: [Access - Patient]
    security:
      - patientAuth: []
    responses:
      200:
        description: Autorisations actives récupérées
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: 'success'
                results:
                  type: integer
                  example: 3
                data:
                  type: object
                  properties:
                    authorizations:
                      type: array
                      items:
                        $ref: '#/components/schemas/AutorisationAcces'
      401:
        description: Non autorisé
      403:
        description: Accès réservé aux patients
```

## Endpoints Professionnel

### 1. Historique d'Accès (Professionnel)

```yaml
/api/access/history/professional:
  get:
    summary: Récupérer l'historique des accès pour le professionnel
    tags: [Access - Professional]
    security:
      - bearerAuth: []
    responses:
      200:
        description: Historique récupéré
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: 'success'
                results:
                  type: integer
                  example: 15
                data:
                  type: object
                  properties:
                    history:
                      type: array
                      items:
                        $ref: '#/components/schemas/HistoriqueAccess'
      401:
        description: Non autorisé
      403:
        description: Accès réservé aux professionnels
```

### 2. Autorisations Actives (Professionnel)

```yaml
/api/access/authorizations/active:
  get:
    summary: Récupérer les autorisations actives du professionnel
    tags: [Access - Professional]
    security:
      - bearerAuth: []
    responses:
      200:
        description: Autorisations actives récupérées
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: 'success'
                results:
                  type: integer
                  example: 5
                data:
                  type: object
                  properties:
                    authorizations:
                      type: array
                      items:
                        $ref: '#/components/schemas/AutorisationAcces'
      401:
        description: Non autorisé
      403:
        description: Accès réservé aux professionnels
```

## Utilisation des Tokens DMP

### Accès au Dossier Médical

```yaml
/api/dossierMedical/patient/{patient_id}/complet:
  get:
    summary: Accéder au dossier médical complet avec token DMP
    tags: [DossierMedical]
    security:
      - dmpAccessToken: []
    parameters:
      - in: path
        name: patient_id
        required: true
        schema:
          type: integer
        description: ID du patient
    responses:
      200:
        description: Dossier médical récupéré
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: 'success'
                data:
                  type: object
                  properties:
                    patient:
                      type: object
                      properties:
                        id_patient:
                          type: integer
                        nom:
                          type: string
                        prenom:
                          type: string
                    dossier:
                      type: object
                      properties:
                        id_dossier:
                          type: integer
                        statut:
                          type: string
      401:
        description: Token DMP invalide ou expiré
      403:
        description: Accès non autorisé
      404:
        description: Dossier non trouvé
```

## Sécurité

### Bearer Token
```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

### Patient Auth Token
```yaml
    patientAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: Token d'authentification patient
```

### Admin Auth Token
```yaml
    adminAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: Token d'authentification administrateur
```

### DMP Access Token
```yaml
    dmpAccessToken:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: Token spécifique pour l'accès DMP
```

## Codes d'Erreur

```yaml
components:
  responses:
    UnauthorizedError:
      description: Token invalide ou expiré
      content:
        application/json:
          schema:
            type: object
            properties:
              status:
                type: string
                example: 'error'
              message:
                type: string
                example: 'Token invalide'
              statusCode:
                type: integer
                example: 401
    
    ForbiddenError:
      description: Accès non autorisé
      content:
        application/json:
          schema:
            type: object
            properties:
              status:
                type: string
                example: 'error'
              message:
                type: string
                example: 'Accès non autorisé'
              statusCode:
                type: integer
                example: 403
    
    NotFoundError:
      description: Ressource non trouvée
      content:
        application/json:
          schema:
            type: object
            properties:
              status:
                type: string
                example: 'error'
              message:
                type: string
                example: 'Ressource non trouvée'
              statusCode:
                type: integer
                example: 404
```

## Exemples d'Utilisation

### 1. Connexion Patient
```bash
curl -X POST http://localhost:3000/api/patient/login \
  -H "Content-Type: application/json" \
  -d '{
    "numero_assure": "123456789",
    "mot_de_passe": "motdepasse123"
  }'
```

### 2. Inscription Patient
```bash
curl -X POST http://localhost:3000/api/patient/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Dupont",
    "prenom": "Jean",
    "date_naissance": "1980-01-15",
    "lieu_naissance": "Paris",
    "civilite": "M.",
    "sexe": "M",
    "numero_assure": "123456789",
    "nom_assurance": "CPAM",
    "adresse": "123 Rue de la Paix",
    "ville": "Paris",
    "pays": "France",
    "email": "jean.dupont@email.com",
    "telephone": "0123456789",
    "mot_de_passe": "motdepasse123"
  }'
```

### 3. Demande d'Accès Standard
```bash
curl -X POST http://localhost:3000/api/access/request-standard \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": 123,
    "raison_demande": "Consultation de routine"
  }'
```

### 4. Accès d'Urgence
```bash
curl -X POST http://localhost:3000/api/access/grant-emergency \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": 123,
    "justification_urgence": "Patient en détresse vitale"
  }'
```

### 5. Accès au DMP avec Token
```bash
curl -X GET http://localhost:3000/api/dossierMedical/patient/123/complet \
  -H "DMP-Access-Token: <dmp_token>" \
  -H "Content-Type: application/json"
```

### 6. Marquer une Notification comme Lue
```bash
curl -X PATCH http://localhost:3000/api/patient/notifications/1/mark-as-read \
  -H "Authorization: Bearer <patient_token>" \
  -H "Content-Type: application/json"
```

Cette documentation Swagger couvre maintenant tous les endpoints de l'API, y compris les routes du module patient pour l'authentification, la gestion du profil et les fonctionnalités d'accès aux dossiers médicaux.
