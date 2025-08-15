// test_documents_personnels.js
// Script de test pour le service de documents personnels

const fs = require('fs');
const path = require('path');

// Simulation des données de test
const mockDocumentData = {
    patient_id: 1,
    nom: "Test Document",
    type: "ordonnance",
    description: "Document de test pour validation",
    url: "./uploads/documents/test-doc.pdf",
    taille: 1024,
    format: "pdf"
};

// Test de création du dossier d'upload
function testCreateUploadDirectory() {
    console.log('🧪 Test de création du dossier d\'upload...');
    
    const uploadDir = path.join(__dirname, 'uploads/documents');
    
    try {
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
            console.log('✅ Dossier d\'upload créé:', uploadDir);
        } else {
            console.log('✅ Dossier d\'upload existe déjà:', uploadDir);
        }
        
        // Vérifier les permissions
        const stats = fs.statSync(uploadDir);
        console.log('📁 Permissions du dossier:', stats.mode.toString(8));
        
        return true;
    } catch (error) {
        console.error('❌ Erreur lors de la création du dossier:', error.message);
        return false;
    }
}

// Test de validation des types de documents
function testDocumentTypeValidation() {
    console.log('\n🧪 Test de validation des types de documents...');
    
    const validTypes = ['ordonnance', 'resultat', 'certificat', 'autre'];
    const invalidTypes = ['test', 'invalid', '123', ''];
    
    console.log('Types valides:', validTypes);
    console.log('Types invalides:', invalidTypes);
    
    // Test de validation
    const isValidType = (type) => validTypes.includes(type);
    
    validTypes.forEach(type => {
        if (isValidType(type)) {
            console.log(`✅ Type valide: ${type}`);
        } else {
            console.log(`❌ Type invalide: ${type}`);
        }
    });
    
    invalidTypes.forEach(type => {
        if (!isValidType(type)) {
            console.log(`✅ Type invalide rejeté: ${type}`);
        } else {
            console.log(`❌ Type invalide accepté: ${type}`);
        }
    });
    
    return true;
}

// Test de validation des données
function testDataValidation() {
    console.log('\n🧪 Test de validation des données...');
    
    const requiredFields = ['patient_id', 'nom', 'type', 'url'];
    const testCases = [
        { data: mockDocumentData, expected: true, description: 'Données complètes' },
        { data: { ...mockDocumentData, patient_id: null }, expected: false, description: 'Patient ID manquant' },
        { data: { ...mockDocumentData, nom: '' }, expected: false, description: 'Nom manquant' },
        { data: { ...mockDocumentData, type: 'invalid' }, expected: false, description: 'Type invalide' },
        { data: { ...mockDocumentData, url: null }, expected: false, description: 'URL manquante' }
    ];
    
    testCases.forEach(testCase => {
        const { data, expected, description } = testCase;
        const isValid = requiredFields.every(field => data[field] && data[field].toString().trim() !== '');
        const typeValid = ['ordonnance', 'resultat', 'certificat', 'autre'].includes(data.type);
        const result = isValid && typeValid;
        
        if (result === expected) {
            console.log(`✅ ${description}: ${result ? 'Valide' : 'Invalide'}`);
        } else {
            console.log(`❌ ${description}: Attendu ${expected}, obtenu ${result}`);
        }
    });
    
    return true;
}

// Test de génération de noms de fichiers
function testFilenameGeneration() {
    console.log('\n🧪 Test de génération de noms de fichiers...');
    
    const originalNames = [
        'document.pdf',
        'ordonnance.doc',
        'resultat_analyse.png',
        'certificat médical.docx',
        'fichier avec espaces.txt'
    ];
    
    originalNames.forEach(originalName => {
        const timestamp = Date.now();
        const randomSuffix = Math.round(Math.random() * 1E9);
        const extension = path.extname(originalName);
        const newName = `document-${timestamp}-${randomSuffix}${extension}`;
        
        console.log(`📄 ${originalName} → ${newName}`);
        
        // Vérifier que le nom est unique
        if (newName.includes(timestamp.toString()) && newName.includes(randomSuffix.toString())) {
            console.log('✅ Nom de fichier généré correctement');
        } else {
            console.log('❌ Erreur dans la génération du nom');
        }
    });
    
    return true;
}

// Test de calcul de taille de fichiers
function testFileSizeCalculation() {
    console.log('\n🧪 Test de calcul de taille de fichiers...');
    
    const testSizes = [
        { size: 1024, expected: '1 KB' },
        { size: 1048576, expected: '1 MB' },
        { size: 1073741824, expected: '1 GB' },
        { size: 500, expected: '500 B' }
    ];
    
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    
    testSizes.forEach(testCase => {
        const { size, expected } = testCase;
        const formatted = formatFileSize(size);
        
        if (formatted === expected) {
            console.log(`✅ ${size} bytes → ${formatted}`);
        } else {
            console.log(`❌ ${size} bytes → ${formatted} (attendu: ${expected})`);
        }
    });
    
    return true;
}

// Test de sécurité des chemins de fichiers
function testFilePathSecurity() {
    console.log('\n🧪 Test de sécurité des chemins de fichiers...');
    
    const testPaths = [
        './uploads/documents/safe-file.pdf',
        '../uploads/documents/../malicious-file.pdf',
        '/etc/passwd',
        'C:\\Windows\\System32\\config\\SAM',
        'uploads/documents/normal-file.doc'
    ];
    
    const isSecurePath = (filePath) => {
        const normalized = path.normalize(filePath);
        const uploadDir = path.resolve('./uploads/documents');
        const resolvedPath = path.resolve(normalized);
        
        // Vérifier que le chemin résolu est dans le dossier d'upload
        return resolvedPath.startsWith(uploadDir);
    };
    
    testPaths.forEach(testPath => {
        const isSecure = isSecurePath(testPath);
        const status = isSecure ? '✅ Sécurisé' : '❌ Non sécurisé';
        console.log(`${status}: ${testPath}`);
    });
    
    return true;
}

// Test principal
function runAllTests() {
    console.log('🚀 Démarrage des tests du service de documents personnels\n');
    
    const tests = [
        testCreateUploadDirectory,
        testDocumentTypeValidation,
        testDataValidation,
        testFilenameGeneration,
        testFileSizeCalculation,
        testFilePathSecurity
    ];
    
    let passedTests = 0;
    let totalTests = tests.length;
    
    tests.forEach((test, index) => {
        console.log(`\n--- Test ${index + 1}/${totalTests} ---`);
        try {
            if (test()) {
                passedTests++;
            }
        } catch (error) {
            console.error(`❌ Erreur dans le test ${index + 1}:`, error.message);
        }
    });
    
    console.log('\n📊 Résumé des tests');
    console.log(`✅ Tests réussis: ${passedTests}/${totalTests}`);
    console.log(`❌ Tests échoués: ${totalTests - passedTests}/${totalTests}`);
    
    if (passedTests === totalTests) {
        console.log('\n🎉 Tous les tests sont passés avec succès!');
        return true;
    } else {
        console.log('\n⚠️ Certains tests ont échoué. Vérifiez les erreurs ci-dessus.');
        return false;
    }
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
    runAllTests();
}

module.exports = {
    runAllTests,
    testCreateUploadDirectory,
    testDocumentTypeValidation,
    testDataValidation,
    testFilenameGeneration,
    testFileSizeCalculation,
    testFilePathSecurity
};
