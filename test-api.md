# Tests API - Système de Gestion Hospitalière

## Configuration
- URL de base : `http://localhost:3000/api`
- Documentation Swagger : `http://localhost:3000/api-docs`

## Tests d'Authentification

### 1. Inscription d'un utilisateur
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@email.com",
    "mot_de_passe": "motdepasse123",
    "role": "visiteur"
  }'
```

### 2. Connexion utilisateur
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean.dupont@email.com",
    "mot_de_passe": "motdepasse123"
  }'
```

### 3. Connexion admin
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@email.com",
    "mot_de_passe": "motdepasseadmin"
  }'
```

## Tests des Routes Protégées

### 4. Récupération du profil utilisateur
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Création d'un patient (admin requis)
```bash
curl -X POST http://localhost:3000/api/patient \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Martin",
    "prenom": "Marie",
    "age": 35,
    "sexe": "F",
    "email": "marie.martin@email.com",
    "telephone": "+33123456789",
    "ville": "Paris",
    "date_naissance": "1988-05-15",
    "lieu_naissance": "Paris",
    "adresse": "123 Rue de la Paix",
    "code_postal": "75001",
    "pays": "France",
    "groupe_sanguin": "A+",
    "assurance_maladie": "CPAM",
    "numero_assurance": "1234567890123",
    "personne_urgence_nom": "Jean Martin",
    "personne_urgence_telephone": "+33123456789",
    "personne_urgence_lien": "Époux",
    "profession": "Ingénieur",
    "situation_familiale": "Marié(e)",
    "nombre_enfants": 2,
    "commentaires": "Allergie aux pénicillines"
  }'
```

### 6. Création d'un professionnel de santé (admin requis)
```bash
curl -X POST http://localhost:3000/api/professionnelSante \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Dubois",
    "prenom": "Dr. Pierre",
    "date_naissance": "1980-03-15",
    "sexe": "M",
    "specialite": "Cardiologie",
    "email": "pierre.dubois@hopital.fr",
    "telephone": "+33123456789",
    "telephone_portable": "+33612345678",
    "adresse": "456 Avenue des Médecins",
    "code_postal": "75002",
    "ville": "Paris",
    "pays": "France",
    "role": "medecin",
    "numero_licence": "123456789",
    "date_obtention_licence": "2005-06-20",
    "statut": "actif",
    "date_embauche": "2010-09-01",
    "description": "Spécialiste en cardiologie avec 15 ans d'expérience"
  }'
```

### 7. Récupération de tous les patients (admin/secretaire requis)
```bash
curl -X GET http://localhost:3000/api/patient \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

### 8. Récupération de tous les professionnels de santé
```bash
curl -X GET http://localhost:3000/api/professionnelSante
```

## Tests des Dossiers Médicaux

### 9. Création d'un dossier médical (admin/médecin requis)
```bash
curl -X POST http://localhost:3000/api/dossierMedical \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": 1,
    "numeroDossier": "DM-2024-001",
    "dateCreation": "2024-01-15",
    "statut": "Ouvert",
    "type_dossier": "principal",
    "service_id": 1,
    "medecin_referent_id": 1,
    "resume": "Patient de 45 ans présentant une hypertension artérielle",
    "antecedent_medicaux": {
      "pathologies": ["HTA", "Diabète"],
      "chirurgies": ["Appendicectomie 2010"]
    },
    "allergies": {
      "medicaments": ["Pénicilline"],
      "autres": ["Latex"]
    },
    "traitements_chroniques": {
      "medicaments": [
        {
          "nom": "Amlodipine",
          "posologie": "5mg/jour"
        }
      ]
    },
    "parametres_vitaux": {
      "tension": "140/90",
      "poids": "75kg",
      "taille": "170cm"
    },
    "habitudes_vie": {
      "tabac": "Non",
      "alcool": "Occasionnel",
      "sport": "Régulier"
    },
    "historique_familial": "Père décédé d'un infarctus à 60 ans",
    "directives_anticipées": "Personne de confiance: Marie Martin (épouse)",
    "observations": "Patient très observant de son traitement",
    "createdBy": 1
  }'
```

### 10. Récupération de tous les dossiers médicaux (admin/secretaire/médecin/infirmier requis)
```bash
curl -X GET http://localhost:3000/api/dossierMedical \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

### 11. Récupération d'un dossier médical par ID
```bash
curl -X GET http://localhost:3000/api/dossierMedical/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

### 12. Récupération des dossiers d'un patient spécifique
```bash
curl -X GET "http://localhost:3000/api/dossierMedical?patientId=1" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

### 13. Récupération des dossiers par statut
```bash
curl -X GET "http://localhost:3000/api/dossierMedical?statut=Ouvert" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

### 14. Mise à jour d'un dossier médical (admin/médecin requis)
```bash
curl -X PUT http://localhost:3000/api/dossierMedical/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "resume": "Mise à jour du résumé clinique - Patient stable",
    "parametres_vitaux": {
      "tension": "135/85",
      "poids": "74kg",
      "taille": "170cm"
    },
    "observations": "Patient très observant de son traitement, amélioration notable",
    "updatedBy": 1
  }'
```

### 15. Suppression d'un dossier médical (admin requis)
```bash
curl -X DELETE http://localhost:3000/api/dossierMedical/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

## Tests de Validation

### 16. Test de création de patient avec utilisateur_id (doit échouer)
```bash
curl -X POST http://localhost:3000/api/patient \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test",
    "prenom": "User",
    "age": 30,
    "sexe": "M",
    "email": "test@email.com",
    "telephone": "+33123456789",
    "ville": "Paris",
    "utilisateur_id": 1,
    "role": "patient"
  }'
```

### 17. Test de token invalide
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer \"invalid_token_here\""
```

## Tests de Rôles

### 18. Test d'accès refusé (visiteur essayant de créer un patient)
```bash
curl -X POST http://localhost:3000/api/patient \
  -H "Authorization: Bearer YOUR_VISITOR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test",
    "prenom": "User",
    "age": 30,
    "sexe": "M",
    "email": "test@email.com",
    "telephone": "+33123456789",
    "ville": "Paris"
  }'
```

### 19. Test d'accès refusé (secretaire essayant de créer un dossier médical)
```bash
curl -X POST http://localhost:3000/api/dossierMedical \
  -H "Authorization: Bearer YOUR_SECRETARY_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": 1,
    "numeroDossier": "DM-2024-002",
    "dateCreation": "2024-01-15",
    "statut": "Ouvert",
    "type_dossier": "principal"
  }'
```

## Points de Vérification

### ✅ Fonctionnalités à vérifier :

1. **Authentification**
   - [ ] Inscription avec rôle par défaut 'visiteur'
   - [ ] Connexion avec différents rôles
   - [ ] Gestion des tokens JWT
   - [ ] Nettoyage automatique des guillemets dans les tokens

2. **Sécurité**
   - [ ] Routes protégées par authentification
   - [ ] Restriction d'accès par rôles
   - [ ] Validation des champs interdits (utilisateur_id, role pour patients)
   - [ ] Gestion des erreurs JWT

3. **Documentation Swagger**
   - [ ] Documentation complète pour toutes les routes
   - [ ] Schémas corrects pour Utilisateur, Patient, ProfessionnelSante, DossierMedical
   - [ ] Exemples de requêtes et réponses
   - [ ] Annotations de sécurité

4. **Validation des données**
   - [ ] Validation des champs requis
   - [ ] Validation des types de données
   - [ ] Validation des enums (rôles, statuts, etc.)
   - [ ] Gestion des erreurs de validation

5. **Base de données**
   - [ ] Modèles correctement définis
   - [ ] Relations entre tables
   - [ ] Migrations appliquées
   - [ ] Contraintes d'intégrité

6. **Gestion des dossiers médicaux**
   - [ ] Création de dossiers médicaux (admin/médecin)
   - [ ] Lecture de dossiers (admin/secretaire/médecin/infirmier)
   - [ ] Mise à jour de dossiers (admin/médecin)
   - [ ] Suppression de dossiers (admin uniquement)
   - [ ] Filtrage par patient et statut
   - [ ] Validation des données JSON complexes

## Erreurs connues et solutions

### Problème de token JWT
- **Symptôme** : "invalid token" error
- **Cause** : Guillemets autour du token dans le header Authorization
- **Solution** : Supprimer les guillemets du token
- **Exemple correct** : `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Exemple incorrect** : `Authorization: Bearer "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`

### Problème de rôles
- **Symptôme** : "You do not have permission" error
- **Cause** : Rôle utilisateur ne correspond pas aux permissions requises
- **Solution** : Utiliser un compte avec le bon rôle (admin pour créer patients/professionnels/dossiers)

### Problème de validation
- **Symptôme** : "Les champs 'utilisateur_id' et 'role' ne sont pas autorisés"
- **Cause** : Tentative d'inclure des champs interdits
- **Solution** : Supprimer ces champs de la requête

### Problème de données JSON
- **Symptôme** : Erreur de validation pour les champs JSON
- **Cause** : Format JSON incorrect pour les champs complexes
- **Solution** : Utiliser des objets JSON valides pour les antécédents, allergies, etc. 