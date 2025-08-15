const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testFileUpload() {
    try {
        console.log('🧪 Test de l\'API d\'upload avec le champ "file"');
        
        // Créer un FormData avec la structure exacte du frontend
        const formData = new FormData();
        
        // Ajouter le fichier dans le champ 'file' (pas 'document')
        const testFile = fs.createReadStream('package.json');
        formData.append('file', testFile);
        
        // Ajouter les autres champs exactement comme le frontend
        formData.append('title', 'bilan');
        formData.append('description', 'bilan');
        formData.append('type', 'general');
        formData.append('categorie', 'general');
        formData.append('patientId', '5');
        
        console.log('📋 FormData préparé avec la structure frontend:');
        console.log('  - file: package.json (objet File)');
        console.log('  - title: bilan');
        console.log('  - description: bilan');
        console.log('  - type: general');
        console.log('  - categorie: general');
        console.log('  - patientId: 5');
        
        // Appel à l'API
        console.log('\n🚀 Envoi de la requête...');
        const response = await axios.post('http://localhost:3000/api/documents/upload', formData, {
            headers: {
                ...formData.getHeaders(),
                'Content-Type': 'multipart/form-data'
            }
        });
        
        console.log('✅ Upload réussi!');
        console.log('📄 Réponse:', response.data);
        
    } catch (error) {
        console.error('❌ Erreur lors du test:');
        
        if (error.response) {
            console.error('  Status:', error.response.status);
            console.error('  Message:', error.response.data);
        } else if (error.request) {
            console.error('  Aucune réponse du serveur');
        } else {
            console.error('  Erreur:', error.message);
        }
    }
}

// Exécuter le test
testFileUpload();
