/**
 * Test de chargement complet de l'application
 */

console.log('🧪 Test de chargement complet de l\'application\n');

try {
    console.log('1. Chargement de l\'application...');
    const app = require('./src/app.js');
    console.log('✅ Application chargée avec succès');
    
    console.log('\n2. Vérification de la structure des routes...');
    if (app._router && app._router.stack) {
        console.log(`📊 Nombre total de layers: ${app._router.stack.length}`);
        
        // Analyser tous les layers
        let routeCount = 0;
        let routerCount = 0;
        let errorCount = 0;
        
        app._router.stack.forEach((layer, index) => {
            try {
                if (layer.route) {
                    routeCount++;
                    console.log(`  Route ${routeCount}: ${Object.keys(layer.route.methods).join(',')} ${layer.route.path}`);
                } else if (layer.name === 'router') {
                    routerCount++;
                    console.log(`  Router ${routerCount}: ${layer.regexp}`);
                    
                    // Essayer d'accéder aux routes de ce router
                    if (layer.handle && layer.handle.stack) {
                        console.log(`    Routes dans ce router: ${layer.handle.stack.length}`);
                        layer.handle.stack.forEach((subLayer, subIndex) => {
                            if (subLayer.route) {
                                const methods = Object.keys(subLayer.route.methods);
                                console.log(`      Sub-route ${subIndex + 1}: ${methods.join(',')} ${subLayer.route.path}`);
                            }
                        });
                    }
                }
            } catch (err) {
                errorCount++;
                console.log(`  ❌ Erreur dans layer ${index}: ${err.message}`);
            }
        });
        
        console.log(`\n📈 Résumé:`);
        console.log(`  - Routes directes: ${routeCount}`);
        console.log(`  - Routers montés: ${routerCount}`);
        console.log(`  - Erreurs: ${errorCount}`);
        
    } else {
        console.log('❌ Structure des routes non trouvée');
    }
    
} catch (error) {
    console.log('❌ Erreur lors du chargement de l\'application:', error.message);
    console.log('Stack:', error.stack);
}
