/**
 * Test de chargement des modules pour identifier le problème des routes auto-mesures
 */

console.log('🔍 Test de chargement des modules...\n');

// Test 1: Chargement du module auto-mesures
try {
    console.log('📦 Test 1: Chargement du module auto-mesures...');
    const autoMesureRoutes = require('./src/modules/patient/autoMesure.route');
    console.log('✅ Module auto-mesures chargé avec succès');
    console.log('   Type:', typeof autoMesureRoutes);
    console.log('   Routes disponibles:', Object.keys(autoMesureRoutes));
    
    // Vérifier si c'est un router Express
    if (autoMesureRoutes.stack) {
        console.log('   Nombre de routes dans le router:', autoMesureRoutes.stack.length);
        console.log('   Routes montées:');
        autoMesureRoutes.stack.forEach((layer, index) => {
            if (layer.route) {
                console.log(`     ${index + 1}. ${Object.keys(layer.route.methods).join(',')} ${layer.route.path}`);
            }
        });
    }
} catch (error) {
    console.log('❌ Erreur lors du chargement du module auto-mesures:', error.message);
}

console.log('');

// Test 2: Chargement du module api.js
try {
    console.log('📦 Test 2: Chargement du module api.js...');
    const apiRoutes = require('./src/routes/api');
    console.log('✅ Module api.js chargé avec succès');
    console.log('   Type:', typeof apiRoutes);
    
    // Vérifier si c'est un router Express
    if (apiRoutes.stack) {
        console.log('   Nombre de middlewares dans le router:', apiRoutes.stack.length);
        console.log('   Middlewares montés:');
        apiRoutes.stack.forEach((layer, index) => {
            if (layer.name) {
                console.log(`     ${index + 1}. ${layer.name} (${layer.regexp})`);
            } else if (layer.route) {
                console.log(`     ${index + 1}. Route: ${Object.keys(layer.route.methods).join(',')} ${layer.route.path}`);
            } else {
                console.log(`     ${index + 1}. Middleware: ${layer.regexp}`);
            }
        });
    }
} catch (error) {
    console.log('❌ Erreur lors du chargement du module api.js:', error.message);
}

console.log('');

// Test 3: Chargement du module app.js
try {
    console.log('📦 Test 3: Chargement du module app.js...');
    const app = require('./src/app');
    console.log('✅ Module app.js chargé avec succès');
    console.log('   Type:', typeof app);
    
    // Vérifier si c'est une application Express
    if (app._router && app._router.stack) {
        console.log('   Nombre de middlewares dans l\'app:', app._router.stack.length);
        console.log('   Middlewares principaux:');
        app._router.stack.forEach((layer, index) => {
            if (layer.name) {
                console.log(`     ${index + 1}. ${layer.name}`);
            } else if (layer.route) {
                console.log(`     ${index + 1}. Route: ${Object.keys(layer.route.methods).join(',')} ${layer.route.path}`);
            } else if (layer.regexp) {
                console.log(`     ${index + 1}. Middleware: ${layer.regexp}`);
            }
        });
    }
} catch (error) {
    console.log('❌ Erreur lors du chargement du module app.js:', error.message);
}

console.log('');

// Test 4: Vérification des imports dans api.js
try {
    console.log('📦 Test 4: Vérification des imports dans api.js...');
    const fs = require('fs');
    const apiContent = fs.readFileSync('./src/routes/api.js', 'utf8');
    
    // Vérifier si autoMesureRoutes est importé
    if (apiContent.includes('autoMesureRoutes')) {
        console.log('✅ Import autoMesureRoutes trouvé dans api.js');
    } else {
        console.log('❌ Import autoMesureRoutes NON trouvé dans api.js');
    }
    
    // Vérifier si les routes sont montées
    if (apiContent.includes("router.use('/patient', autoMesureRoutes)")) {
        console.log('✅ Montage des routes auto-mesures trouvé dans api.js');
    } else {
        console.log('❌ Montage des routes auto-mesures NON trouvé dans api.js');
    }
    
    // Vérifier l'ordre des montages
    const mountIndex = apiContent.indexOf("router.use('/patient', autoMesureRoutes)");
    const patientMountIndex = apiContent.indexOf("router.use('/patient', patientRoutes)");
    
    if (mountIndex !== -1 && patientMountIndex !== -1 && mountIndex < patientMountIndex) {
        console.log('✅ Ordre des montages correct: auto-mesures AVANT patient');
    } else {
        console.log('❌ Ordre des montages incorrect: auto-mesures APRÈS patient');
    }
    
} catch (error) {
    console.log('❌ Erreur lors de la vérification des imports:', error.message);
}

console.log('\n📊 === RÉSUMÉ DU DIAGNOSTIC ===');
console.log('🔍 Vérifiez les résultats ci-dessus pour identifier le problème.');
console.log('💡 Problèmes possibles:');
console.log('   - Module auto-mesures ne se charge pas');
console.log('   - Routes mal définies dans le module');
console.log('   - Problème de montage dans api.js');
console.log('   - Conflit avec d\'autres routes');
