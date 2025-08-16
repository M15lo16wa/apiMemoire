/**
 * Test des routes montées dans l'API principale
 */

console.log('🧪 Test des routes montées dans l\'API principale\n');

try {
    // Importer l'API principale
    const apiRouter = require('./src/routes/api');
    
    console.log('✅ API Router importé avec succès');
    console.log('📋 Nombre de layers:', apiRouter.stack.length);
    
    // Afficher tous les layers montés
    console.log('\n🔍 Layers montés dans l\'API:');
    apiRouter.stack.forEach((layer, index) => {
        console.log(`  Layer ${index}:`, {
            name: layer.name,
            regexp: layer.regexp?.toString(),
            keys: layer.keys,
            route: layer.route ? 'ROUTE' : 'MIDDLEWARE'
        });
        
        // Si c'est un routeur monté, afficher ses routes
        if (layer.name === 'router' && layer.handle && layer.handle.stack) {
            console.log(`    Routes dans ${layer.regexp}:`);
            layer.handle.stack.forEach((subLayer, subIndex) => {
                if (subLayer.route) {
                    const methods = Object.keys(subLayer.route.methods).join(',').toUpperCase();
                    console.log(`      ${subIndex}: ${methods} ${subLayer.route.path}`);
                }
            });
        }
    });
    
    // Vérifier spécifiquement les routes patient
    console.log('\n🎯 Vérification des routes patient:');
    const patientLayer = apiRouter.stack.find(layer => 
        layer.regexp && layer.regexp.toString().includes('patient')
    );
    
    if (patientLayer && patientLayer.handle && patientLayer.handle.stack) {
        console.log('  ✅ Routes patient trouvées:');
        patientLayer.handle.stack.forEach((subLayer, subIndex) => {
            if (subLayer.route) {
                const methods = Object.keys(subLayer.route.methods).join(',').toUpperCase();
                console.log(`    ${subIndex}: ${methods} ${subLayer.route.path}`);
            }
        });
    } else {
        console.log('  ❌ Aucune route patient trouvée');
    }
    
} catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('Stack:', error.stack);
}
