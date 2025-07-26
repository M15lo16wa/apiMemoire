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
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@hopital.fr",
  "numero_adeli": "123456789",
  "mot_de_passe": "motdepasse123",
  "role": "medecin",
  "specialite": "Cardiologie"
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