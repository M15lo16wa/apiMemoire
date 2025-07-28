# Tests API - Module Prescription et Authentification

## 🚀 API démarrée sur http://localhost:3000

### 📚 Documentation Swagger
- **URL** : http://localhost:3000/api-docs
- **Description** : Interface interactive pour tester tous les endpoints

## 🔐 Authentification

### Test de connexion professionnel de santé
```bash
# Créer un professionnel de santé avec mot de passe
POST http://localhost:3000/api/professionnelSante
Content-Type: application/json

{
  "nom": "Martin",
  "prenom": "Sophie",
  "date_naissance": "1980-03-15",
  "sexe": "F",
  "specialite": "Cardiologie",
  "email": "sophie.martin@hopital.fr",
  "telephone": "+33123456789",
  "telephone_portable": "+33612345678",
  "adresse": "456 Avenue des Médecins",
  "code_postal": "75002",
  "ville": "Paris",
  "pays": "France",
  "role": "medecin",
  "numero_licence": "123456789",
  "numero_adeli": "987654321",
  "mot_de_passe": "motdepasse123",
  "date_obtention_licence": "2005-06-20",
  "statut": "actif",
  "date_embauche": "2010-09-01",
  "description": "Spécialiste en cardiologie avec 15 ans d'expérience",
  "photo_url": "https://example.com/photo.jpg"
}
```

### Connexion d'un professionnel de santé
```bash
# Se connecter avec numero_adeli et mot_de_passe
POST http://localhost:3000/api/professionnelSante/login
Content-Type: application/json

{
  "numero_adeli": "987654321",
  "mot_de_passe": "motdepasse123"
}
```

## 💊 Tests Module Prescription

### 1. Créer une ordonnance
```bash
POST http://localhost:3000/api/prescription/ordonnance
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "patient_id": 1,
  "medicament": "Paracétamol",
  "dosage": "500mg",
  "frequence": "3 fois par jour",
  "duree": "7 jours",
  "instructions": "À prendre après les repas",
  "voie_administration": "orale",
  "renouvelable": true,
  "nb_renouvellements": 2
}
```

### 2. Créer une demande d'examen
```bash
POST http://localhost:3000/api/prescription/demande-examen
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "patient_id": 1,
  "medicament": "Analyse sanguine",
  "dosage": "NFS, CRP, Glycémie",
  "frequence": "Urgent",
  "instructions": "À jeun depuis 12h"
}
```

### 3. Récupérer les prescriptions d'un patient
```bash
GET http://localhost:3000/api/prescription/patient/1
Authorization: Bearer <JWT_TOKEN>
```

### 4. Renouveler une prescription
```bash
PATCH http://localhost:3000/api/prescription/1/renouveler
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "motif_renouvellement": "Continuation du traitement"
}
```

### 5. Suspendre une prescription
```bash
PATCH http://localhost:3000/api/prescription/1/suspendre
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "motif_arret": "Effets indésirables"
}
```

## 🔬 Tests Module ExamenLabo

### 1. Créer un résultat d'examen
```bash
POST http://localhost:3000/api/examen-labo/resultat
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "patient_id": 1,
  "type_examen": "Analyse sanguine",
  "resultat": "normal",
  "valeur_normale": "4.5-11.0 x10^9/L",
  "commentaire": "Résultats dans les normes"
}
```

### 2. Valider un résultat
```bash
PATCH http://localhost:3000/api/examen-labo/1/valider
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "commentaire_validation": "Résultats validés par le laboratoire"
}
```

## 📋 Tests Module DossierMedical

### 1. Récupérer le dossier complet d'un patient
```bash
GET http://localhost:3000/api/dossierMedical/patient/1/complet
Authorization: Bearer <JWT_TOKEN>
```

### 2. Récupérer le résumé d'un patient
```bash
GET http://localhost:3000/api/dossierMedical/patient/1/resume
Authorization: Bearer <JWT_TOKEN>
```

## 📅 Tests Module RendezVous

### 1. Créer un rappel
```bash
POST http://localhost:3000/api/rendez-vous/rappel
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "patient_id": 1,
  "date_rappel": "2024-01-15T10:00:00Z",
  "message": "Rappel pour prise de médicaments",
  "type_rappel": "medicament"
}
```

### 2. Récupérer les rappels d'un patient
```bash
GET http://localhost:3000/api/rendez-vous/patient/1/rappels
Authorization: Bearer <JWT_TOKEN>
```

## 🛠️ Outils de test recommandés

1. **Postman** : Pour tester les endpoints avec interface graphique
2. **cURL** : Pour les tests en ligne de commande
3. **Swagger UI** : Interface web intégrée à http://localhost:3000/api-docs

## 📝 Notes importantes

- Tous les endpoints nécessitent un token JWT valide
- Les professionnels de santé peuvent maintenant s'authentifier avec leur `numero_adeli` et `mot_de_passe`
- La colonne `mot_de_passe` est automatiquement exclue des réponses pour des raisons de sécurité
- Les nouveaux modules sont entièrement documentés dans Swagger

## 🔍 Vérifications à effectuer

1. ✅ API démarre sans erreur
2. ✅ Documentation Swagger accessible
3. ✅ Colonne `mot_de_passe` ajoutée à la table `ProfessionnelsSante`
4. ✅ Tous les endpoints sont protégés par authentification
5. ✅ Validation des données fonctionnelle
6. ✅ Gestion des erreurs appropriée

## 📋 Champs requis pour créer un professionnel de santé

### Champs obligatoires :
- `nom` : Nom de famille (2-50 caractères)
- `prenom` : Prénom (2-50 caractères)
- `date_naissance` : Date de naissance (format YYYY-MM-DD)
- `sexe` : Sexe (M, F, Autre, Non précisé)
- `role` : Rôle professionnel (medecin, infirmier, secretaire, etc.)

### Champs optionnels :
- `specialite` : Spécialité médicale
- `email` : Adresse email (unique)
- `telephone` : Numéro de téléphone fixe
- `telephone_portable` : Numéro de téléphone portable
- `adresse` : Adresse postale
- `code_postal` : Code postal (5 chiffres)
- `ville` : Ville
- `pays` : Pays (défaut: France)
- `numero_licence` : Numéro de licence professionnelle
- `numero_adeli` : Numéro ADELI pour l'authentification
- `mot_de_passe` : Mot de passe hashé
- `date_obtention_licence` : Date d'obtention de la licence
- `statut` : Statut professionnel (actif, inactif, en_conges, retraite)
- `date_embauche` : Date d'embauche
- `description` : Description du professionnel
- `photo_url` : URL de la photo professionnelle 