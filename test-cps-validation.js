require('dotenv').config();
const CPSAuthService = require('./src/services/CPSAuthService');

async function testCPSValidation() {
  try {
    console.log('🧪 Test de validation CPS...\n');

    const professionnelId = 79;

    // 1. Générer un code CPS valide
    console.log('1️⃣ Génération d\'un code CPS valide...');
    const codeValide = await CPSAuthService.generateCPSCode(professionnelId);
    console.log('✅ Code CPS généré:', codeValide);

    // 2. Récupérer le secret
    console.log('\n2️⃣ Récupération du secret...');
    const secret = await CPSAuthService.getProfessionnelSecret(professionnelId);
    console.log('✅ Secret récupéré:', secret.substring(0, 10) + '...');

    // 3. Valider le code généré
    console.log('\n3️⃣ Validation du code généré...');
    const isValid = await CPSAuthService.validateCPSCode(professionnelId, codeValide, secret);
    console.log('✅ Code valide:', isValid);

    // 4. Tester avec un code invalide
    console.log('\n4️⃣ Test avec un code invalide...');
    const isInvalid = await CPSAuthService.validateCPSCode(professionnelId, '1234', secret);
    console.log('❌ Code invalide:', isInvalid);

    // 5. Test d'authentification complète
    console.log('\n5️⃣ Test d\'authentification complète...');
    const contexte = {
      adresseIp: '127.0.0.1',
      userAgent: 'Test Script'
    };

    try {
      const resultat = await CPSAuthService.authentifierProfessionnel(professionnelId, codeValide, contexte);
      console.log('✅ Authentification réussie:', resultat);
    } catch (error) {
      console.log('❌ Authentification échouée:', error.message);
    }

    console.log('\n📋 Résumé:');
    console.log('- Code valide généré:', codeValide);
    console.log('- Utilisez ce code pour tester l\'API');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testCPSValidation(); 