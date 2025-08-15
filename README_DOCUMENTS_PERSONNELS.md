# Service de Documents Personnels - Intégration

## 🎯 Objectif

Ce service permet aux patients, médecins et infirmiers de gérer les documents médicaux dans le système DMP (Dossier Médical Partagé). Il s'intègre parfaitement avec le module `dossierMedical` existant.

## 📁 Fichiers créés/modifiés

### Nouveaux fichiers
- `src/modules/dossierMedical/documentPersonnel.controller.js` - Contrôleur pour la gestion des documents
- `src/modules/dossierMedical/documentPersonnel.route.js` - Routes API pour les documents
- `docs/DOCUMENTATION_DOCUMENTS_PERSONNELS.md` - Documentation complète
- `test_documents_personnels.js` - Script de test
- `README_DOCUMENTS_PERSONNELS.md` - Ce fichier

### Fichiers modifiés
- `src/modules/dossierMedical/dossierMedical.service.js` - Ajout du service de documents personnels

## 🚀 Installation et configuration

### 1. Installer les dépendances
```bash
npm install multer fs-extra
```

### 2. Créer le dossier d'upload
```bash
mkdir -p uploads/documents
chmod 755 uploads/documents
```

### 3. Intégrer les routes dans votre application principale

Dans votre fichier principal de routes (ex: `src/routes/api.js`) :

```javascript
const documentPersonnelRoutes = require('../modules/dossierMedical/documentPersonnel.route');

// Ajouter les routes des documents personnels
app.use('/api/documents', documentPersonnelRoutes);
```

## 🔧 Utilisation

### Upload d'un document
```javascript
const formData = new FormData();
formData.append('document', fileInput.files[0]);
formData.append('patient_id', '123');
formData.append('nom', 'Ordonnance antibiotiques');
formData.append('type', 'ordonnance');

fetch('/api/documents/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Récupération des documents d'un patient
```javascript
fetch('/api/documents/patient/123', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 🔒 Sécurité

- **Authentification** : Toutes les routes nécessitent un token valide
- **Autorisation** : Vérification des droits d'accès au dossier du patient
- **Validation** : Types de fichiers et tailles limités
- **Sécurisation des chemins** : Protection contre les attaques de traversée de répertoire

## 📊 Fonctionnalités

### Pour les patients
- ✅ Upload de leurs propres documents
- ✅ Consultation de leurs documents
- ✅ Téléchargement de leurs documents
- ✅ Mise à jour des métadonnées
- ✅ Suppression de leurs documents

### Pour les professionnels de santé
- ✅ Upload de documents pour leurs patients
- ✅ Consultation des documents de leurs patients
- ✅ Téléchargement des documents
- ✅ Mise à jour des métadonnées
- ✅ Suppression des documents

## 🧪 Tests

Exécuter les tests de validation :
```bash
node test_documents_personnels.js
```

## 📋 API Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/documents/upload` | Upload d'un document |
| GET | `/api/documents/patient/:patientId` | Documents d'un patient |
| GET | `/api/documents/:documentId` | Détails d'un document |
| GET | `/api/documents/:documentId/download` | Téléchargement |
| PUT | `/api/documents/:documentId` | Mise à jour |
| DELETE | `/api/documents/:documentId` | Suppression |
| GET | `/api/documents/patient/:patientId/stats` | Statistiques |
| POST | `/api/documents/search` | Recherche |

## 🔄 Intégration avec le modèle existant

Le service s'intègre parfaitement avec le modèle `DocumentPersonnel` existant :

```javascript
// Dans dossierMedical.service.js
const documentPersonnelService = {
    async uploadDocument(documentData) { /* ... */ },
    async getDocumentsByPatient(patientId, filters) { /* ... */ },
    // ... autres méthodes
};

// Exposer le service
dossierMedicalService.documentPersonnel = documentPersonnelService;
```

## 📈 Évolutions futures

- [ ] Support de l'OCR pour les documents scannés
- [ ] Indexation et recherche full-text
- [ ] Versioning des documents
- [ ] Signature électronique
- [ ] Chiffrement des documents sensibles
- [ ] Intégration avec des services cloud (AWS S3, etc.)

## 🐛 Dépannage

### Erreurs communes

1. **"Dossier d'upload non trouvé"**
   ```bash
   mkdir -p uploads/documents
   chmod 755 uploads/documents
   ```

2. **"Type de fichier non autorisé"**
   - Vérifier que le fichier est dans la liste des types autorisés
   - Types supportés : PDF, images (JPEG, PNG, GIF), Word, texte

3. **"Fichier trop volumineux"**
   - Limite : 10MB par fichier
   - Vérifier la configuration de multer

4. **"Accès refusé"**
   - Vérifier le token d'authentification
   - Vérifier les droits d'accès au dossier du patient

## 📞 Support

Pour toute question ou problème :
1. Consulter la documentation complète dans `docs/DOCUMENTATION_DOCUMENTS_PERSONNELS.md`
2. Exécuter les tests de validation
3. Vérifier les logs de l'application
4. Contacter l'équipe de développement

## 📝 Notes de version

- **v1.0.0** : Version initiale avec upload, consultation et gestion des documents
- Support des formats PDF, images, Word et texte
- Gestion des droits d'accès et de la sécurité
- API REST complète avec documentation
