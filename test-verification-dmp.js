const { sequelize } = require('./src/models');
const CPSAuthService = require('./src/services/CPSAuthService');
const NotificationService = require('./src/services/NotificationService');

async function testSystemeDMP() {
  console.log('🔍 Vérification du système DMP...\n');

  try {
    // Test 1: Connexion à la base de données
    console.log('📊 Test 1: Connexion à la base de données');
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie');

    // Test 2: Vérification des modèles
    console.log('\n📋 Test 2: Vérification des modèles');
    const { SessionAccesDMP, TentativeAuthentificationCPS, NotificationAccesDMP } = require('./src/models');
    console.log('✅ Modèles DMP chargés avec succès');

    // Test 3: Test CPSAuthService
    console.log('\n🔐 Test 3: Test CPSAuthService');
    const cpsData = await CPSAuthService.generateCPSCode(79);
    console.log('✅ Génération code CPS réussie:', cpsData.code);

    // Test 4: Test NotificationService
    console.log('\n📧 Test 4: Test NotificationService');
    const notificationService = new NotificationService();
    console.log('✅ NotificationService initialisé');

    // Test 5: Vérification des tables
    console.log('\n🗄️ Test 5: Vérification des tables');
    const sessionsCount = await SessionAccesDMP.count();
    const tentativesCount = await TentativeAuthentificationCPS.count();
    const notificationsCount = await NotificationAccesDMP.count();
    
    console.log('✅ Tables DMP accessibles:');
    console.log(`   - SessionsAccesDMP: ${sessionsCount} enregistrements`);
    console.log(`   - TentativesAuthentificationCPS: ${tentativesCount} enregistrements`);
    console.log(`   - NotificationsAccesDMP: ${notificationsCount} enregistrements`);

    console.log('\n🎉 Tous les tests sont passés avec succès !');
    console.log('🚀 Le système DMP est prêt à être utilisé.');

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

testSystemeDMP(); 