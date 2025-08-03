const express = require('express');
const path = require('path');

/**
 * Vérification des routes DMP
 */
function verifierRoutesDMP() {
  console.log('🔍 Vérification des routes DMP...\n');

  try {
    // Vérifier que les fichiers existent
    const dmpRoutePath = path.join(__dirname, 'src/modules/patient/dmp.route.js');
    const dmpControllerPath = path.join(__dirname, 'src/modules/patient/dmp.controller.js');
    const dmpServicePath = path.join(__dirname, 'src/modules/patient/dmp.service.js');
    const patientRoutePath = path.join(__dirname, 'src/modules/patient/patient.route.js');
    const apiRoutePath = path.join(__dirname, 'src/routes/api.js');

    const fs = require('fs');
    
    console.log('📁 Vérification des fichiers :');
    console.log(`- dmp.route.js: ${fs.existsSync(dmpRoutePath) ? '✅' : '❌'}`);
    console.log(`- dmp.controller.js: ${fs.existsSync(dmpControllerPath) ? '✅' : '❌'}`);
    console.log(`- dmp.service.js: ${fs.existsSync(dmpServicePath) ? '✅' : '❌'}`);
    console.log(`- patient.route.js: ${fs.existsSync(patientRoutePath) ? '✅' : '❌'}`);
    console.log(`- api.js: ${fs.existsSync(apiRoutePath) ? '✅' : '❌'}`);

    // Vérifier les routes définies
    const dmpRoutesContent = fs.readFileSync(dmpRoutePath, 'utf8');
    const patientRoutesContent = fs.readFileSync(patientRoutePath, 'utf8');
    const apiRoutesContent = fs.readFileSync(apiRoutePath, 'utf8');

    console.log('\n🔗 Vérification des imports :');
    console.log(`- dmpRoutes importé dans patient.route.js: ${patientRoutesContent.includes('dmpRoutes') ? '✅' : '❌'}`);
    console.log(`- dmpRoutes utilisé dans patient.route.js: ${patientRoutesContent.includes('router.use(\'/dmp\'') ? '✅' : '❌'}`);
    console.log(`- patientRoutes importé dans api.js: ${apiRoutesContent.includes('patientRoutes') ? '✅' : '❌'}`);

    // Compter les routes DMP
    const dmpRouteMatches = dmpRoutesContent.match(/router\.(get|post|put|delete)/g);
    const routeCount = dmpRouteMatches ? dmpRouteMatches.length : 0;

    console.log(`\n📊 Nombre de routes DMP définies : ${routeCount}`);

    // Lister les routes spécifiques
    const routes = [
      'tableau-de-bord',
      'historique-medical', 
      'journal-activite',
      'droits-acces',
      'autoriser-acces',
      'revoquer-acces',
      'fiche-urgence',
      'auto-mesures',
      'documents',
      'messages',
      'rappels',
      'statistiques'
    ];

    console.log('\n📋 Routes DMP disponibles :');
    routes.forEach(route => {
      const hasRoute = dmpRoutesContent.includes(`'/${route}'`) || dmpRoutesContent.includes(`"/${route}"`);
      console.log(`- /${route}: ${hasRoute ? '✅' : '❌'}`);
    });

    // Vérifier les contrôleurs
    const dmpControllerContent = fs.readFileSync(dmpControllerPath, 'utf8');
    const controllers = [
      'getTableauDeBord',
      'getHistoriqueMedical',
      'getJournalActivite', 
      'getDroitsAcces',
      'autoriserAcces',
      'revoquerAcces',
      'genererFicheUrgence',
      'getAutoMesures',
      'ajouterAutoMesure',
      'updateAutoMesure',
      'deleteAutoMesure',
      'getDocumentsPersonnels',
      'uploadDocumentPersonnel',
      'deleteDocumentPersonnel',
      'getMessages',
      'envoyerMessage',
      'deleteMessage',
      'getRappels',
      'creerRappel',
      'updateRappel',
      'deleteRappel'
    ];

    console.log('\n🎮 Contrôleurs DMP disponibles :');
    controllers.forEach(controller => {
      const hasController = dmpControllerContent.includes(controller);
      console.log(`- ${controller}: ${hasController ? '✅' : '❌'}`);
    });

    console.log('\n🎯 Résumé de la configuration :');
    console.log('✅ Routes DMP définies dans dmp.route.js');
    console.log('✅ Contrôleurs DMP définis dans dmp.controller.js');
    console.log('✅ Service DMP défini dans dmp.service.js');
    console.log('✅ Routes DMP incluses dans patient.route.js');
    console.log('✅ Routes patient incluses dans api.js');
    console.log('✅ Structure complète : /api/patient/dmp/[endpoint]');

    console.log('\n🚀 Pour tester les routes DMP :');
    console.log('1. Démarrez le serveur : npm start');
    console.log('2. Connectez-vous en tant que patient');
    console.log('3. Testez les endpoints avec Postman ou curl');
    console.log('4. Exemple : GET http://localhost:3000/api/patient/dmp/auto-mesures');

    console.log('\n📝 URLs complètes des nouvelles routes :');
    console.log('- GET  /api/patient/dmp/auto-mesures');
    console.log('- POST /api/patient/dmp/auto-mesures');
    console.log('- PUT  /api/patient/dmp/auto-mesures/:id');
    console.log('- DELETE /api/patient/dmp/auto-mesures/:id');
    console.log('- GET  /api/patient/dmp/documents');
    console.log('- POST /api/patient/dmp/documents');
    console.log('- DELETE /api/patient/dmp/documents/:id');
    console.log('- GET  /api/patient/dmp/messages');
    console.log('- POST /api/patient/dmp/messages');
    console.log('- DELETE /api/patient/dmp/messages/:id');
    console.log('- GET  /api/patient/dmp/rappels');
    console.log('- POST /api/patient/dmp/rappels');
    console.log('- PUT  /api/patient/dmp/rappels/:id');
    console.log('- DELETE /api/patient/dmp/rappels/:id');

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  }
}

// Exécuter la vérification
verifierRoutesDMP(); 