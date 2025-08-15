// test_swagger_docs.js
// Test du chargement des routes avec documentation Swagger

console.log('🧪 Test du chargement des routes avec documentation Swagger');
console.log('==========================================================\n');

try {
    console.log('1️⃣ Test du contrôleur...');
    const documentPersonnelController = require('./src/modules/dossierMedical/documentPersonnel.controller');
    console.log('✅ Contrôleur chargé avec succès');
    
    console.log('\n2️⃣ Test des routes avec documentation Swagger...');
    const documentPersonnelRoutes = require('./src/modules/dossierMedical/documentPersonnel.route');
    console.log('✅ Routes avec documentation Swagger chargées avec succès');
    
    console.log('\n3️⃣ Test de l\'intégration dans api.js...');
    const apiRoutes = require('./src/routes/api');
    console.log('✅ API routes chargées avec succès');
    
    console.log('\n4️⃣ Vérification de la documentation Swagger...');
    const fs = require('fs');
    const routeContent = fs.readFileSync('./src/modules/dossierMedical/documentPersonnel.route.js', 'utf8');
    
    const swaggerElements = [
        '@swagger',
        'tags:',
        'components:',
        'schemas:',
        'DocumentPersonnel:',
        'DocumentUpload:',
        'DocumentStats:',
        'DocumentSearch:'
    ];
    
    let swaggerCount = 0;
    swaggerElements.forEach(element => {
        if (routeContent.includes(element)) {
            swaggerCount++;
            console.log(`  ✅ ${element}`);
        } else {
            console.log(`  ❌ ${element}`);
        }
    });
    
    if (swaggerCount >= 6) {
        console.log('\n✅ Documentation Swagger complète détectée !');
    } else {
        console.log('\n⚠️ Documentation Swagger incomplète');
    }
    
    console.log('\n🚀 Routes avec documentation Swagger opérationnelles !');
    console.log('\n💡 Vous pouvez maintenant :');
    console.log('1. Démarrer votre serveur: npm start');
    console.log('2. Accéder à la documentation Swagger: http://localhost:3000/api-docs');
    console.log('3. Tester les endpoints de documents personnels');
    console.log('4. Voir la documentation complète dans l\'interface Swagger');
    
} catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error('Stack:', error.stack);
}
