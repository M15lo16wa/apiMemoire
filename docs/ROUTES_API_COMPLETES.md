# Documentation Complète des Routes de l'API

## Vue d'ensemble

Cette documentation présente toutes les routes disponibles dans l'API, organisées par module fonctionnel. Chaque route est documentée avec sa méthode HTTP, ses paramètres, et sa description.

## Base URL

```
http://localhost:3000/api
```

---

## 🔐 Module d'Authentification (`/auth`)

### Authentification CPS
- **POST** `/auth/cps/login` - Authentification CPS pour professionnels de santé
- **POST** `/auth/authenticate-cps` - Authentification CPS (alias pour compatibilité)
- **GET** `/auth/access-options` - Récupérer les options d'accès pour professionnel authentifié

### Authentification standard
- **POST** `/auth/register` - Inscription d'un nouvel utilisateur
- **POST** `/auth/login` - Connexion utilisateur
- **POST** `/auth/logout` - Déconnexion utilisateur
- **GET** `/auth/me` - Récupération du profil utilisateur connecté
- **POST** `/auth/change-password` - Changement de mot de passe utilisateur

### Authentification patient
- **POST** `/auth/patient/login` - Connexion d'un patient
- **POST** `/auth/patient/refresh` - Rafraîchir le token d'authentification patient
- **POST** `/auth/patient/logout` - Déconnexion patient

---

## 👥 Module Patients (`/patient`)

### Gestion des patients
- **POST** `/patient` - Créer un nouveau patient
- **GET** `/patient` - Récupérer tous les patients
- **GET** `/patient/:id` - Récupérer un patient par ID
- **PUT** `/patient/:id` - Mettre à jour un patient
- **DELETE** `/patient/:id` - Supprimer un patient
- **GET** `/patient/search` - Rechercher des patients

---

## 🏥 Module Professionnels de Santé (`/professionnelSante`)

### Gestion des professionnels
- **POST** `/professionnelSante` - Créer un nouveau professionnel de santé
- **GET** `/professionnelSante` - Récupérer tous les professionnels
- **GET** `/professionnelSante/:id` - Récupérer un professionnel par ID
- **PUT** `/professionnelSante/:id` - Mettre à jour un professionnel
- **DELETE** `/professionnelSante/:id` - Supprimer un professionnel
- **GET** `/professionnelSante/search` - Rechercher des professionnels

---

## 📋 Module Dossiers Médicaux (`/dossierMedical`)

### Gestion des dossiers
- **POST** `/dossierMedical` - Créer un nouveau dossier médical
- **GET** `/dossierMedical` - Récupérer tous les dossiers
- **GET** `/dossierMedical/:id` - Récupérer un dossier par ID
- **PUT** `/dossierMedical/:id` - Mettre à jour un dossier
- **DELETE** `/dossierMedical/:id` - Supprimer un dossier
- **GET** `/dossierMedical/patient/:patient_id/complet` - Récupérer le dossier complet d'un patient
- **GET** `/dossierMedical/patient/:patient_id/resume` - Récupérer le résumé du dossier d'un patient

---

## 🔐 Module Gestion des Accès (`/access`)

### Demandes d'accès (Professionnels)
- **POST** `/access/request-standard` - Demander un accès standard au dossier médical
- **GET** `/access/status/:patientId` - Vérifier le statut d'accès actuel d'un professionnel pour un patient
- **POST** `/access/grant-emergency` - Accorder un accès d'urgence au dossier médical
- **POST** `/access/grant-secret` - Accorder un accès secret au dossier médical
- **GET** `/access/dmp-token/:authorizationId` - Générer un token DMP pour une autorisation existante
- **GET** `/access/history/professional` - Récupérer l'historique des accès pour le professionnel
- **GET** `/access/authorizations/active` - Récupérer les autorisations actives du professionnel

### Réponses des patients
- **GET** `/access/patient/pending` - Récupérer les demandes d'accès en attente
- **PATCH** `/access/patient/response/:authorizationId` - Répondre à une demande d'accès
- **GET** `/access/patient/history` - Récupérer l'historique des accès pour le patient
- **GET** `/access/patient/authorizations` - Récupérer les autorisations actives pour le patient

### Gestion des autorisations
- **POST** `/access/authorization` - Créer une nouvelle autorisation d'accès
- **GET** `/access/authorization` - Récupérer toutes les autorisations d'accès
- **GET** `/access/authorization/:id` - Récupérer une autorisation par ID
- **PATCH** `/access/authorization/:id` - Modifier une autorisation d'accès
- **DELETE** `/access/authorization/:id` - Révoquer une autorisation d'accès

### Historique et logs
- **POST** `/access/history` - Créer une entrée d'historique d'accès
- **GET** `/access/history` - Récupérer tout l'historique d'accès
- **GET** `/access/history/patient/:patientId` - Récupérer l'historique d'accès pour un patient
- **GET** `/access/authorization/patient/:patientId` - Récupérer les autorisations d'accès pour un patient
- **GET** `/access/check/:professionnelId/:patientId/:typeAcces` - Vérifier l'accès d'un professionnel à un patient
- **POST** `/access/log` - Enregistrer un accès au dossier médical

---

## 🏥 Module Hôpitaux (`/hopital`)

### Gestion des hôpitaux
- **POST** `/hopital` - Créer un nouvel hôpital
- **GET** `/hopital` - Récupérer tous les hôpitaux
- **GET** `/hopital/:id` - Récupérer un hôpital par ID
- **PUT** `/hopital/:id` - Mettre à jour un hôpital
- **DELETE** `/hopital/:id` - Supprimer un hôpital

---

## 🏥 Module Services de Santé (`/service-sante`)

### Gestion des services
- **POST** `/service-sante` - Créer un nouveau service de santé
- **GET** `/service-sante` - Récupérer tous les services
- **GET** `/service-sante/:id` - Récupérer un service par ID
- **PUT** `/service-sante/:id` - Mettre à jour un service
- **DELETE** `/service-sante/:id` - Supprimer un service

---

## 📅 Module Rendez-vous (`/rendez-vous`)

### Gestion des rendez-vous
- **POST** `/rendez-vous` - Créer un nouveau rendez-vous
- **GET** `/rendez-vous` - Récupérer tous les rendez-vous
- **GET** `/rendez-vous/:id` - Récupérer un rendez-vous par ID
- **PUT** `/rendez-vous/:id` - Mettre à jour un rendez-vous
- **DELETE** `/rendez-vous/:id` - Supprimer un rendez-vous

### Fonctionnalités avancées
- **POST** `/rendez-vous/prendre` - Prendre un rendez-vous
- **POST** `/rendez-vous/rappel` - Créer un rappel de rendez-vous
- **GET** `/rendez-vous/patient/:patient_id/rappels` - Récupérer les rappels d'un patient
- **GET** `/rendez-vous/patient/:patient_id/avenir` - Récupérer les rendez-vous à venir d'un patient
- **PATCH** `/rendez-vous/:id/annuler` - Annuler un rendez-vous
- **GET** `/rendez-vous/rappels/a-envoyer` - Récupérer les rappels à envoyer
- **PATCH** `/rendez-vous/rappel/:id/envoye` - Marquer un rappel comme envoyé

---

## 💊 Module Prescriptions (`/prescription`)

### Création de prescriptions
- **POST** `/prescription/ordonnance` - Créer une nouvelle ordonnance avec génération automatique
- **POST** `/prescription/demande-examen` - Créer une demande d'examen avec génération automatique
- **POST** `/prescription/ordonnance-complete` - Créer une ordonnance complète avec notification et ajout au dossier

### Consultation et recherche
- **GET** `/prescription/search` - Recherche avancée de prescriptions avec pagination
- **GET** `/prescription/patient/:patient_id` - Récupérer les prescriptions d'un patient
- **GET** `/prescription/patient/:patient_id/actives` - Récupérer les prescriptions actives d'un patient
- **GET** `/prescription/:id` - Récupérer une prescription par son ID
- **GET** `/prescription/ordonnances-recentes` - Récupérer les ordonnances récemment créées par le professionnel
- **GET** `/prescription/resume-aujourdhui` - Récupérer le résumé des ordonnances créées aujourd'hui

### Gestion des prescriptions
- **PUT** `/prescription/:id` - Mettre à jour une prescription
- **DELETE** `/prescription/:id` - Supprimer une prescription (soft delete)
- **PATCH** `/prescription/:id/renouveler` - Renouveler une prescription
- **PATCH** `/prescription/:id/suspendre` - Suspendre une prescription
- **POST** `/prescription/:id/transferer` - Transférer une prescription à un autre patient

### Fonctionnalités avancées
- **GET** `/prescription/:id/rapport` - Générer un rapport de prescription pour impression
- **GET** `/prescription/stats` - Calculer les statistiques de prescription
- **POST** `/prescription/validate/qr` - Valider un QR Code de prescription
- **POST** `/prescription/validate/signature` - Valider une signature électronique
- **POST** `/prescription/:prescription_id/ajouter-dossier` - Ajouter une prescription au dossier médical du patient

### Notifications
- **POST** `/prescription/:prescription_id/notification` - Créer une notification pour le patient
- **PATCH** `/prescription/notification/:notification_id/lue` - Marquer une notification comme lue
- **GET** `/prescription/patient/:patient_id/notifications` - Récupérer les notifications d'un patient

---

## 🧪 Module Examens de Laboratoire (`/examen-labo`)

### Gestion des examens
- **POST** `/examen-labo` - Créer un nouvel examen de laboratoire
- **GET** `/examen-labo` - Récupérer tous les examens
- **GET** `/examen-labo/:id` - Récupérer un examen par ID
- **PUT** `/examen-labo/:id` - Mettre à jour un examen
- **DELETE** `/examen-labo/:id` - Supprimer un examen
- **GET** `/examen-labo/patient/:patient_id` - Récupérer les examens d'un patient
- **GET** `/examen-labo/resultats/:id` - Récupérer les résultats d'un examen

---

## 👨‍⚕️ Module Consultations (`/consultation`)

### Gestion des consultations
- **POST** `/consultation` - Créer une nouvelle consultation
- **GET** `/consultation` - Récupérer toutes les consultations
- **GET** `/consultation/:id` - Récupérer une consultation par ID
- **PUT** `/consultation/:id` - Mettre à jour une consultation
- **DELETE** `/consultation/:id` - Supprimer une consultation

### Recherche et filtrage
- **GET** `/consultation/dossier/:dossier_id` - Récupérer les consultations d'un dossier médical
- **GET** `/consultation/professionnel/:professionnel_id` - Récupérer les consultations d'un professionnel
- **GET** `/consultation/patient/:patient_id` - Récupérer les consultations d'un patient

---

## 📊 Statistiques Globales

### Total des routes par module :
- **Authentification** : 11 routes
- **Patients** : 6 routes
- **Professionnels de santé** : 6 routes
- **Dossiers médicaux** : 7 routes
- **Gestion des accès** : 25 routes
- **Hôpitaux** : 5 routes
- **Services de santé** : 5 routes
- **Rendez-vous** : 12 routes
- **Prescriptions** : 25 routes
- **Examens de laboratoire** : 7 routes
- **Consultations** : 8 routes

**Total : 116 routes**

---

## 🔒 Authentification et Autorisation

### Middlewares utilisés :
- `authMiddleware.protect` - Protection des routes authentifiées
- `authMiddleware.restrictTo()` - Restriction par rôle
- `patientAccessMiddleware.requirePatientAuth` - Authentification patient requise
- `patientAccessMiddleware.checkPatientAuthorizationAccess` - Vérification des autorisations patient

### Types d'accès :
- **Standard** : Accès normal au dossier médical
- **Urgence** : Accès immédiat en cas d'urgence vitale
- **Secret** : Accès confidentiel pour investigations médicales

---

## 📝 Notes importantes

1. **Toutes les routes sont protégées** par l'authentification sauf indication contraire
2. **Validation des données** : Toutes les routes POST/PUT utilisent des validateurs
3. **Pagination** : Les routes de recherche incluent une pagination automatique
4. **Soft Delete** : La suppression est généralement logique (pas de suppression physique)
5. **Audit Trail** : Toutes les actions importantes sont tracées dans l'historique

---


## 🚀 Utilisation

Pour utiliser l'API, assurez-vous de :
1. Inclure le token JWT dans l'en-tête `Authorization: Bearer <token>`
2. Respecter les formats de données attendus (voir la documentation Swagger)
3. Gérer les codes de réponse HTTP appropriés
4. Implémenter la gestion d'erreurs côté client

---

*Dernière mise à jour : Décembre 2024*
