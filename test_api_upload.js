const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testAPIUpload() {
    try {
        console.log('🧪 Test de l\'API d\'upload avec type "general"');
        
        // Créer un FormData avec les données exactes du frontend
        const formData = new FormData();
        
        // Ajouter un fichier de test (package.json)
        const testFile = fs.createReadStream('package.json');
        formData.append('document', testFile);
        
        // Ajouter les données JSON exactes du frontend
        formData.append('file', 'package.json');
        formData.append('title', 'bilan');
        formData.append('description', 'bilan');
        formData.append('type', 'general');
        formData.append('categorie', 'general');
        formData.append('patientId', '5');
        
        console.log('📋 FormData préparé avec:');
        console.log('  - document: package.json');
        console.log('  - file: package.json');
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
            console.error('  Headers:', error.response.headers);
        } else if (error.request) {
            console.error('  Aucune réponse du serveur');
            console.error('  Vérifiez que le serveur est démarré');
        } else {
            console.error('  Erreur:', error.message);
        }
    }
}

// Exécuter le test
testAPIUpload();
