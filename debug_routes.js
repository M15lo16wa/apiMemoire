/**
 * Débogage détaillé des routes
 */

console.log('🔍 Débogage détaillé des routes\n');

try {
    // Importer les modules séparément
    const patientRoutes = require('./src/modules/patient/patient.route');
    const autoMesureRoutes = require('./src/modules/patient/autoMesure.route');
    
    console.log('📋 Routes patient:');
    if (patientRoutes.stack) {
        patientRoutes.stack.forEach((layer, index) => {
            if (layer.route) {
                const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
                console.log(`  ${index}: ${methods} ${layer.route.path}`);
            }
        });
    }
    
    console.log('\n📋 Routes auto-mesures:');
    if (autoMesureRoutes.stack) {
        autoMesureRoutes.stack.forEach((layer, index) => {
            if (layer.route) {
                const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
                console.log(`  ${index}: ${methods} ${layer.route.path}`);
            }
        });
    }
    
    console.log('\n🔍 Test du routeur parent:');
    const { patientRoutes: parentRouter } = require('./src/modules/patient');
    
    console.log('  - Type:', typeof parentRouter);
    console.log('  - Nombre de layers:', parentRouter.stack.length);
    
    parentRouter.stack.forEach((layer, index) => {
        console.log(`  Layer ${index}:`, {
            name: layer.name,
            regexp: layer.regexp?.toString(),
            keys: layer.keys,
            route: layer.route ? 'OUI' : 'NON'
        });
        
        if (layer.route) {
            const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
            console.log(`    Route: ${methods} ${layer.route.path}`);
        }
    });
    
} catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('Stack:', error.stack);
}
