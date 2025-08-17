/**
 * Script de diagnostic des routes
 */

console.log('🔍 Diagnostic des routes de l\'application\n');

try {
    // Charger l'application
    const app = require('./src/app.js');
    console.log('✅ Application chargée avec succès');
    
    // Vérifier la structure des routes
    if (app._router && app._router.stack) {
        console.log(`📊 Nombre total de layers: ${app._router.stack.length}`);
        
        // Analyser les layers
        let routeCount = 0;
        let routerCount = 0;
        
        app._router.stack.forEach((layer, index) => {
            if (layer.route) {
                routeCount++;
                console.log(`  Route ${routeCount}: ${Object.keys(layer.route.methods).join(',')} ${layer.route.path}`);
            } else if (layer.name === 'router') {
                routerCount++;
                console.log(`  Router ${routerCount}: ${layer.regexp}`);
            }
        });
        
        console.log(`\n📈 Résumé:`);
        console.log(`  - Routes directes: ${routeCount}`);
        console.log(`  - Routers montés: ${routerCount}`);
        
        // Vérifier spécifiquement les routes patient
        console.log(`\n🔍 Vérification des routes patient:`);
        const patientRoutes = app._router.stack.filter(layer => 
            layer.name === 'router' && 
            layer.regexp && 
            layer.regexp.toString().includes('patient')
        );
        
        if (patientRoutes.length > 0) {
            console.log(`  ✅ Routes patient trouvées: ${patientRoutes.length}`);
            patientRoutes.forEach((router, i) => {
                console.log(`    Router patient ${i + 1}: ${router.regexp}`);
            });
        } else {
            console.log(`  ❌ Aucune route patient trouvée`);
        }
        
    } else {
        console.log('❌ Structure des routes non trouvée');
    }
    
} catch (error) {
    console.log('❌ Erreur lors du chargement:', error.message);
}
