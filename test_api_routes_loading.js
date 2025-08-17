/**
 * Test de chargement du fichier api.js
 */

console.log('🧪 Test de chargement du fichier api.js\n');

try {
    console.log('1. Import du fichier api.js...');
    const apiRoutes = require('./src/routes/api');
    console.log('✅ Fichier api.js importé avec succès');
    
    console.log('\n2. Vérification de la structure des routes...');
    if (apiRoutes && apiRoutes.stack) {
        console.log(`📊 Nombre de routes dans api.js: ${apiRoutes.stack.length}`);
        
        apiRoutes.stack.forEach((layer, index) => {
            if (layer.route) {
                const methods = Object.keys(layer.route.methods);
                console.log(`  Route ${index + 1}: ${methods.join(',')} ${layer.route.path}`);
            } else if (layer.name === 'router') {
                console.log(`  Router ${index + 1}: ${layer.regexp}`);
                
                // Vérifier les routes dans ce router
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
        });
        
        // Vérifier spécifiquement les routes patient
        const patientRouter = apiRoutes.stack.find(layer => 
            layer.name === 'router' && 
            layer.regexp && 
            layer.regexp.toString().includes('patient')
        );
        
        if (patientRouter) {
            console.log('\n✅ Router patient trouvé dans api.js');
            if (patientRouter.handle && patientRouter.handle.stack) {
                console.log(`  Nombre de routes patient: ${patientRouter.handle.stack.length}`);
                patientRouter.handle.stack.forEach((subLayer, subIndex) => {
                    if (subLayer.route) {
                        const methods = Object.keys(subLayer.route.methods);
                        console.log(`    Route patient ${subIndex + 1}: ${methods.join(',')} ${subLayer.route.path}`);
                    }
                });
            }
        } else {
            console.log('\n❌ Router patient NON trouvé dans api.js');
        }
        
    } else {
        console.log('❌ Pas de stack de routes dans api.js');
    }
    
} catch (error) {
    console.log('❌ Erreur lors de l\'import de api.js:', error.message);
    console.log('Stack:', error.stack);
}
