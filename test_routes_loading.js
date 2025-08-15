// test_routes_loading.js
// Test du chargement des routes

console.log('🧪 Test du chargement des routes');
console.log('================================\n');

try {
    console.log('1️⃣ Test du contrôleur...');
    const documentPersonnelController = require('./src/modules/dossierMedical/documentPersonnel.controller');
    console.log('✅ Contrôleur chargé avec succès');
    
    console.log('\n2️⃣ Test des routes...');
    const documentPersonnelRoutes = require('./src/modules/dossierMedical/documentPersonnel.route');
    console.log('✅ Routes chargées avec succès');
    
    console.log('\n3️⃣ Test de l\'intégration dans api.js...');
    const apiRoutes = require('./src/routes/api');
    console.log('✅ API routes chargées avec succès');
    
    console.log('\n🚀 Toutes les routes sont opérationnelles !');
    console.log('\n💡 Vous pouvez maintenant démarrer votre serveur avec:');
    console.log('   npm start');
    console.log('   ou');
    console.log('   node src/server.js');
    
} catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error('Stack:', error.stack);
}
