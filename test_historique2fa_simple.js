const { sequelize, Historique2FA } = require('./src/models');

async function testHistorique2FASimple() {
  try {
    console.log('🧪 Test simple de création Historique2FA...\n');
    
    // Test de création avec date explicite
    console.log('1️⃣ Test avec date explicite...');
    const test1 = await Historique2FA.create({
      user_id: 999,
      user_type: 'utilisateur',
      action: 'test_explicit_date',
      ip_address: '127.0.0.1',
      user_agent: 'Test User Agent',
      success: true,
      details: 'Test avec date explicite',
      created_at: new Date()
    });
    
    console.log('✅ Enregistrement créé avec l\'ID:', test1.id_historique_2fa);
    await test1.destroy();
    console.log('✅ Enregistrement supprimé');
    console.log('');

    // Test de création sans date (devrait utiliser le hook)
    console.log('2️⃣ Test sans date (hook beforeCreate)...');
    const test2 = await Historique2FA.create({
      user_id: 999,
      user_type: 'utilisateur',
      action: 'test_hook_date',
      ip_address: '127.0.0.1',
      user_agent: 'Test User Agent',
      success: true,
      details: 'Test avec hook beforeCreate'
    });
    
    console.log('✅ Enregistrement créé avec l\'ID:', test2.id_historique_2fa);
    console.log('✅ Date de création:', test2.created_at);
    await test2.destroy();
    console.log('✅ Enregistrement supprimé');
    console.log('');

    console.log('🎉 Test Historique2FA réussi !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await sequelize.close();
    console.log('🔌 Connexion fermée');
  }
}

testHistorique2FASimple();
