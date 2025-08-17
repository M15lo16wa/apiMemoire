/**
 * Test direct de l'application pour vérifier les routes
 */

console.log('🧪 Test direct de l\'application\n');

try {
    console.log('1. Chargement de l\'application...');
    const app = require('./src/app.js');
    console.log('✅ Application chargée avec succès');
    
    console.log('\n2. Vérification de la structure des routes...');
    if (app._router && app._router.stack) {
        console.log(`📊 Nombre total de layers: ${app._router.stack.length}`);
        
        // Chercher le router API
        const apiRouter = app._router.stack.find(layer => 
            layer.name === 'router' && 
            layer.regexp && 
            layer.regexp.toString().includes('api')
        );
        
        if (apiRouter) {
            console.log('✅ Router API trouvé');
            
            if (apiRouter.handle && apiRouter.handle.stack) {
                console.log(`📊 Nombre de routes dans l'API: ${apiRouter.handle.stack.length}`);
                
                // Chercher les routes patient
                const patientRouters = apiRouter.handle.stack.filter(layer => 
                    layer.name === 'router' && 
                    layer.regexp && 
                    layer.regexp.toString().includes('patient')
                );
                
                console.log(`🔍 Routers patient trouvés: ${patientRouters.length}`);
                
                patientRouters.forEach((router, index) => {
                    console.log(`\n  Router patient ${index + 1}: ${router.regexp}`);
                    
                    if (router.handle && router.handle.stack) {
                        console.log(`    Routes dans ce router: ${router.handle.stack.length}`);
                        
                        router.handle.stack.forEach((subLayer, subIndex) => {
                            if (subLayer.route) {
                                const methods = Object.keys(subLayer.route.methods);
                                console.log(`      Sub-route ${subIndex + 1}: ${methods.join(',')} ${subLayer.route.path}`);
                            }
                        });
                    }
                });
                
                // Vérifier spécifiquement les routes auto-mesures
                const autoMesureRoutes = patientRouters.filter(router => 
                    router.handle && router.handle.stack && 
                    router.handle.stack.some(layer => 
                        layer.route && 
                        (layer.route.path === '/:patient_id' || layer.route.path === '/:patient_id/stats')
                    )
                );
                
                if (autoMesureRoutes.length > 0) {
                    console.log('\n✅ Routes auto-mesures trouvées !');
                } else {
                    console.log('\n❌ Routes auto-mesures NON trouvées');
                }
                
            } else {
                console.log('❌ Pas de stack dans le router API');
            }
        } else {
            console.log('❌ Router API non trouvé');
        }
        
    } else {
        console.log('❌ Structure des routes non trouvée');
    }
    
} catch (error) {
    console.log('❌ Erreur lors du chargement de l\'application:', error.message);
    console.log('Stack:', error.stack);
}
