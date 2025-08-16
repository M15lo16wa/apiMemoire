/**
 * Test simple des routes auto-mesures
 */

console.log('🧪 Test simple des routes auto-mesures\n');

try {
    // Importer le module
    const { autoMesureRoutes } = require('./src/modules/patient');
    console.log('✅ Module importé avec succès');
    
    // Vérifier la structure
    console.log('📋 Structure du module:');
    console.log('  - Type:', typeof autoMesureRoutes);
    console.log('  - Clés:', Object.keys(autoMesureRoutes));
    
    if (autoMesureRoutes.stack) {
        console.log('  - Nombre de routes:', autoMesureRoutes.stack.length);
        console.log('  - Routes:');
        autoMesureRoutes.stack.forEach((layer, index) => {
            if (layer.route) {
                const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
                console.log(`    ${index}: ${methods} ${layer.route.path}`);
            }
        });
    }
    
    console.log('\n✅ Test terminé');
    
} catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('Stack:', error.stack);
}
