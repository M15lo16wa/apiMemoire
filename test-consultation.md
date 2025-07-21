# Test des Routes de Consultation

## Routes disponibles

### 1. Récupérer toutes les consultations
```bash
GET /api/consultation
```

### 2. Récupérer une consultation par ID
```bash
GET /api/consultation/{id}
```

### 3. Récupérer les consultations par dossier médical
```bash
GET /api/consultation/dossier/{dossier_id}
```

### 4. Récupérer les consultations par professionnel de santé
```bash
GET /api/consultation/professionnel/{professionnel_id}
```

### 5. Créer une nouvelle consultation
```bash
POST /api/consultation
Content-Type: application/json

{
  "date_consultation": "2024-01-15T10:00:00.000Z",
  "motif": "Contrôle de routine",
  "diagnostic": "Patient en bonne santé",
  "compte_rendu": "Examen clinique normal",
  "examen_clinique": {
    "tension_arterielle": "120/80",
    "frequence_cardiaque": "72",
    "temperature": "36.8"
  },
  "statut": "terminee",
  "duree": 30,
  "type_consultation": "controle",
  "confidentialite": "normal",
  "dossier_id": 1,
  "professionnel_id": 1,
  "service_id": 1
}
```

### 6. Mettre à jour une consultation
```bash
PUT /api/consultation/{id}
Content-Type: application/json

{
  "date_consultation": "2024-01-15T10:00:00.000Z",
  "motif": "Contrôle de routine mis à jour",
  "diagnostic": "Patient en bonne santé",
  "compte_rendu": "Examen clinique normal - mise à jour",
  "examen_clinique": {
    "tension_arterielle": "120/80",
    "frequence_cardiaque": "72",
    "temperature": "36.8"
  },
  "statut": "terminee",
  "duree": 45,
  "type_consultation": "controle",
  "confidentialite": "normal",
  "dossier_id": 1,
  "professionnel_id": 1,
  "service_id": 1
}
```

### 7. Supprimer une consultation
```bash
DELETE /api/consultation/{id}
```

## Champs du modèle Consultation

- `id_consultation` : Identifiant unique (auto-incrémenté)
- `date_consultation` : Date et heure de la consultation
- `motif` : Motif de la consultation
- `diagnostic` : Diagnostic établi
- `compte_rendu` : Compte-rendu détaillé
- `examen_clinique` : Résultats de l'examen clinique (JSON)
- `statut` : Statut de la consultation (planifiee, en_cours, terminee, annulee, reportee)
- `duree` : Durée en minutes
- `type_consultation` : Type (premiere, suivi, urgence, controle, autre)
- `confidentialite` : Niveau de confidentialité (normal, confidentiel, tres_confidentiel)
- `dossier_id` : ID du dossier médical
- `professionnel_id` : ID du professionnel de santé
- `service_id` : ID du service de santé (optionnel)
- `date_annulation` : Date d'annulation (optionnel)
- `motif_annulation` : Raison de l'annulation (optionnel)
- `createdBy` : ID de l'utilisateur créateur
- `updatedBy` : ID du dernier modificateur
- `createdAt` : Date de création
- `updatedAt` : Date de dernière modification

## Associations

- **DossierMedical** : Une consultation appartient à un dossier médical
- **ProfessionnelSante** : Une consultation est effectuée par un professionnel
- **ServiceSante** : Une consultation peut avoir lieu dans un service (optionnel)
- **Patient** : Via le dossier médical, une consultation est liée à un patient

## Documentation Swagger

La documentation Swagger complète est disponible à l'adresse :
`http://localhost:3000/api-docs`

Toutes les routes de consultation sont documentées avec :
- Les paramètres requis et optionnels
- Les schémas de données
- Les codes de réponse
- Les exemples d'utilisation 