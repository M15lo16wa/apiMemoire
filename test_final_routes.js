/**
 * Test final des routes - Vérification de /patient/5/auto-mesures
 */

console.log('🧪 Test final des routes - Vérification de /patient/5/auto-mesures\n');

try {
    // Importer les routes auto-mesures
    const autoMesureRoutes = require('./src/modules/patient/autoMesure.route');
    
    console.log('✅ Routes auto-mesures importées avec succès');
    console.log('📋 Nombre de routes:', autoMesureRoutes.stack.length);
    
    // Vérifier que la route spécifique existe
    console.log('\n🔍 Vérification de la route /patient/5/auto-mesures:');
    
    let routeFound = false;
    autoMesureRoutes.stack.forEach((layer, index) => {
        if (layer.route) {
            const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
            const path = layer.route.path;
            console.log(`  ${index}: ${methods} ${path}`);
            
            // Vérifier si c'est la route que nous cherchons
            if (path === '/patient/:patient_id') {
                routeFound = true;
                console.log(`  ✅ ROUTE TROUVÉE: ${methods} ${path}`);
                console.log(`  ✅ Cette route gère: /patient/5/auto-mesures`);
            }
        }
    });
    
    if (routeFound) {
        console.log('\n🎉 SUCCÈS: La route /patient/5/auto-mesures est configurée !');
        console.log('📡 URL complète: GET /api/patient/5/auto-mesures');
        console.log('🔧 Prochaine étape: Redémarrer le serveur et tester l\'endpoint');
    } else {
        console.log('\n❌ ERREUR: La route /patient/5/auto-mesures n\'est pas trouvée');
    }
    
} catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('Stack:', error.stack);
}
