# Documentation - Service de Documents Personnels

## Vue d'ensemble

Le service de documents personnels permet aux patients, médecins et infirmiers de gérer les documents médicaux (ordonnances, résultats d'examens, certificats, etc.) dans le système DMP. Ce service inclut l'upload, la consultation, le téléchargement et la gestion des métadonnées des documents.

## Fonctionnalités principales

### 1. Upload de documents
- Support de multiples formats (PDF, images, Word, texte)
- Validation des types de fichiers
- Limite de taille : 10MB par fichier
- Génération automatique de noms de fichiers uniques
- Stockage sécurisé dans le dossier `uploads/documents/`

### 2. Types de documents supportés
- **ordonnance** : Prescriptions médicales
- **resultat** : Résultats d'examens et analyses
- **certificat** : Certificats médicaux
- **autre** : Autres types de documents

### 3. Gestion des accès
- Authentification requise pour toutes les opérations
- Vérification des droits d'accès au dossier du patient
- Séparation des rôles patient/professionnel de santé

## API Endpoints

### Upload d'un document
```http
POST /api/documents/upload
Content-Type: multipart/form-data

Fields:
- document: fichier à uploader
- patient_id: ID du patient
- nom: nom du document
- type: type de document (ordonnance, resultat, certificat, autre)
- description: description optionnelle
```

**Exemple de réponse :**
```json
{
  "success": true,
  "message": "Document uploadé avec succès",
  "data": {
    "id": 1,
    "nom": "Ordonnance antibiotiques",
    "type": "ordonnance",
    "url": "/path/to/file",
    "taille": 245760,
    "format": "pdf",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Récupération des documents d'un patient
```http
GET /api/documents/patient/:patientId?type=ordonnance&date_debut=2024-01-01&date_fin=2024-01-31
```

**Paramètres de filtrage :**
- `type` : Filtrer par type de document
- `date_debut` : Date de début de création (format ISO)
- `date_fin` : Date de fin de création (format ISO)

### Consultation d'un document
```http
GET /api/documents/:documentId
```

### Téléchargement d'un document
```http
GET /api/documents/:documentId/download
```

### Mise à jour d'un document
```http
PUT /api/documents/:documentId
Content-Type: application/json

{
  "nom": "Nouveau nom",
  "description": "Nouvelle description",
  "type": "resultat"
}
```

### Suppression d'un document
```http
DELETE /api/documents/:documentId?deleteFile=true
```

**Paramètres :**
- `deleteFile` : Si `true`, supprime aussi le fichier physique (défaut: `true`)

### Statistiques des documents
```http
GET /api/documents/patient/:patientId/stats
```

**Exemple de réponse :**
```json
{
  "success": true,
  "data": {
    "total_documents": 15,
    "par_type": {
      "ordonnance": 8,
      "resultat": 5,
      "certificat": 2
    },
    "taille_totale": 52428800
  }
}
```

### Recherche de documents
```http
POST /api/documents/search
Content-Type: application/json

{
  "patient_id": 123,
  "nom": "ordonnance",
  "type": "ordonnance",
  "date_debut": "2024-01-01",
  "date_fin": "2024-01-31"
}
```

## Utilisation côté client

### Upload avec FormData
```javascript
const formData = new FormData();
formData.append('document', fileInput.files[0]);
formData.append('patient_id', '123');
formData.append('nom', 'Ordonnance antibiotiques');
formData.append('type', 'ordonnance');
formData.append('description', 'Prescription pour infection respiratoire');

fetch('/api/documents/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log('Document uploadé:', data));
```

### Récupération des documents
```javascript
fetch('/api/documents/patient/123', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(response => response.json())
.then(data => {
  console.log('Documents du patient:', data.data);
});
```

### Téléchargement d'un document
```javascript
fetch('/api/documents/456/download', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(response => response.blob())
.then(blob => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'document.pdf';
  a.click();
});
```

## Sécurité et validation

### Types de fichiers autorisés
- PDF (`application/pdf`)
- Images JPEG, PNG, GIF
- Documents Word (`.doc`, `.docx`)
- Fichiers texte (`text/plain`)

### Limites
- Taille maximale : 10MB
- 1 fichier par requête
- Noms de fichiers sécurisés avec timestamps

### Validation des données
- Vérification de l'existence du patient
- Validation des types de documents
- Contrôle des champs obligatoires
- Nettoyage des noms de fichiers

## Gestion des erreurs

### Erreurs communes
- **400** : Données invalides ou fichier manquant
- **401** : Non authentifié
- **403** : Accès refusé au dossier
- **404** : Document ou patient non trouvé
- **413** : Fichier trop volumineux
- **415** : Type de fichier non supporté
- **500** : Erreur serveur

### Messages d'erreur
```json
{
  "success": false,
  "message": "Description de l'erreur"
}
```

## Structure de la base de données

### Table `documents_personnels`
```sql
CREATE TABLE documents_personnels (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  patient_id INTEGER NOT NULL,
  nom VARCHAR(255) NOT NULL,
  type ENUM('ordonnance', 'resultat', 'certificat', 'autre') NOT NULL,
  description TEXT,
  url VARCHAR(500) NOT NULL,
  taille INTEGER,
  format VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES Patients(id_patient)
);
```

## Déploiement et configuration

### Dossiers requis
```bash
mkdir -p uploads/documents
chmod 755 uploads/documents
```

### Variables d'environnement
```env
# Taille maximale des fichiers (en bytes)
MAX_FILE_SIZE=10485760

# Dossier d'upload
UPLOAD_DIR=./uploads/documents

# Types de fichiers autorisés
ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png,gif,doc,docx,txt
```

### Dépendances
```json
{
  "multer": "^1.4.5-lts.1",
  "fs-extra": "^11.1.1"
}
```

## Tests

### Test d'upload
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "document=@/path/to/file.pdf" \
  -F "patient_id=123" \
  -F "nom=Test Document" \
  -F "type=ordonnance" \
  http://localhost:3000/api/documents/upload
```

### Test de récupération
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/documents/patient/123
```

## Maintenance

### Nettoyage des fichiers orphelins
```javascript
// Script de nettoyage périodique
const cleanupOrphanedFiles = async () => {
  const documents = await DocumentPersonnel.findAll();
  const uploadDir = './uploads/documents';
  
  for (const doc of documents) {
    if (!fs.existsSync(doc.url)) {
      await doc.destroy();
      console.log(`Document orphelin supprimé: ${doc.id}`);
    }
  }
};
```

### Sauvegarde
- Sauvegarder régulièrement le dossier `uploads/documents/`
- Inclure la table `documents_personnels` dans les sauvegardes de base
- Vérifier l'intégrité des fichiers après restauration

## Support et dépannage

### Logs utiles
- Upload de documents : `[documentPersonnelService.uploadDocument]`
- Erreurs de validation : `[documentPersonnelService.uploadDocument] Erreur`
- Suppression de fichiers : `[documentPersonnelService.deleteDocument] Fichier physique supprimé`

### Vérifications courantes
1. Permissions du dossier d'upload
2. Espace disque disponible
3. Configuration de multer
4. Droits d'accès des utilisateurs
5. Intégrité des fichiers uploadés
