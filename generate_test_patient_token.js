const jwt = require('jsonwebtoken');

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// Données de test pour un patient
const testPatientData = {
    id: 1, // ID du patient dans la base
    role: 'patient',
    type: 'patient',
    nom: 'Test',
    prenom: 'Patient',
    email: 'test.patient@example.com'
};

// Fonction pour générer un token patient
function generatePatientToken(patientData) {
    try {
        const token = jwt.sign(patientData, JWT_SECRET, { 
            expiresIn: '24h' 
        });
        
        console.log('✅ Token patient généré avec succès!');
        console.log('🔑 Token:', token);
        console.log('\n📋 Informations du token:');
        console.log('- ID Patient:', patientData.id);
        console.log('- Rôle:', patientData.role);
        console.log('- Type:', patientData.type);
        console.log('- Expiration: 24h');
        
        return token;
        
    } catch (error) {
        console.error('❌ Erreur lors de la génération du token:', error.message);
        return null;
    }
}

// Fonction pour décoder et vérifier un token
function decodeToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('\n🔍 Token décodé:');
        console.log(JSON.stringify(decoded, null, 2));
        return decoded;
    } catch (error) {
        console.error('❌ Erreur lors du décodage du token:', error.message);
        return null;
    }
}

// Fonction pour tester la structure du token
function testTokenStructure(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        console.log('\n🧪 Test de la structure du token:');
        
        // Vérifier les champs requis
        const requiredFields = ['id', 'role', 'type'];
        const missingFields = requiredFields.filter(field => !decoded[field]);
        
        if (missingFields.length > 0) {
            console.log('❌ Champs manquants:', missingFields);
            return false;
        }
        
        // Vérifier le rôle patient
        if (decoded.role !== 'patient') {
            console.log('❌ Rôle incorrect:', decoded.role, '(attendu: patient)');
            return false;
        }
        
        // Vérifier le type patient
        if (decoded.type !== 'patient') {
            console.log('❌ Type incorrect:', decoded.type, '(attendu: patient)');
            return false;
        }
        
        // Vérifier l'ID
        if (!decoded.id || typeof decoded.id !== 'number') {
            console.log('❌ ID invalide:', decoded.id);
            return false;
        }
        
        console.log('✅ Structure du token valide');
        return true;
        
    } catch (error) {
        console.error('❌ Token invalide:', error.message);
        return false;
    }
}

// Fonction principale
function main() {
    console.log('🚀 Générateur de token patient pour test');
    console.log('=' .repeat(50));
    
    // Générer le token
    const token = generatePatientToken(testPatientData);
    
    if (!token) {
        console.error('❌ Impossible de générer le token');
        return;
    }
    
    // Tester la structure
    testTokenStructure(token);
    
    // Décoder le token
    decodeToken(token);
    
    console.log('\n💡 UTILISATION:');
    console.log('1. Copiez le token ci-dessus');
    console.log('2. Utilisez-le dans le script test_documents_patient_debug.js');
    console.log('3. Remplacez VOTRE_TOKEN_ICI par ce token');
    console.log('4. Exécutez le test pour diagnostiquer l\'erreur 400');
    
    console.log('\n🔧 COMMANDE DE TEST:');
    console.log('node test_documents_patient_debug.js');
}

// Exécution
if (require.main === module) {
    main();
}

module.exports = { 
    generatePatientToken, 
    decodeToken, 
    testTokenStructure,
    testPatientData 
};
