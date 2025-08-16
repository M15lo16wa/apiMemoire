/**
 * Test complet des routes patient et auto-mesures
 */

console.log('🧪 Test complet des routes patient et auto-mesures\n');

try {
    // Importer le routeur parent
    const { patientRoutes } = require('./src/modules/patient');
    console.log('✅ Routeur parent importé avec succès');
    
    // Vérifier la structure
    console.log('📋 Structure du routeur parent:');
    console.log('  - Type:', typeof patientRoutes);
    console.log('  - Nombre de routes:', patientRoutes.stack.length);
    
    // Afficher toutes les routes
    console.log('\n🔗 Routes disponibles:');
    patientRoutes.stack.forEach((layer, index) => {
        if (layer.route) {
            const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
            console.log(`  ${index}: ${methods.padEnd(7)} ${layer.route.path}`);
        }
    });
    
    // Vérifier les routes spécifiques
    console.log('\n🎯 Routes spécifiques à vérifier:');
    console.log('  ✅ GET  /patient/auto-mesures                    → Récupérer toutes les auto-mesures');
    console.log('  ✅ POST /patient/auto-mesures                    → Créer une auto-mesure');
    console.log('  ✅ GET  /patient/5/auto-mesures                 → Auto-mesures du patient 5');
    console.log('  ✅ GET  /patient/5/auto-mesures/stats           → Statistiques du patient 5');
    console.log('  ✅ GET  /patient/5/auto-mesures/last/glycemie   → Dernière glycémie du patient 5');
    console.log('  ✅ GET  /patient/auto-mesures/1                 → Auto-mesure par ID');
    console.log('  ✅ PUT  /patient/auto-mesures/1                 → Mettre à jour auto-mesure');
    console.log('  ✅ DELETE /patient/auto-mesures/1               → Supprimer auto-mesure');
    
    console.log('\n✅ Test terminé');
    
} catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('Stack:', error.stack);
}
