const { NotificationAccesDMP, Patient, ProfessionnelSante } = require('./src/models');

async function testNotificationCreation() {
  try {
    console.log('🧪 Test de création de notification avec tous les champs requis...');
    
    // Test avec des données complètes
    const testNotification = await NotificationAccesDMP.create({
      patient_id: 5,
      professionnel_id: 79,
      type_notification: 'demande_acces',
      titre: 'Test de notification',
      contenu_notification: 'Contenu de test pour la notification',
      message: 'Message de test pour la notification',
      destinataire: 'test@example.com',
      statut: 'non_lu',
      canal_envoi: 'email',
      statut_envoi: 'en_attente',
      priorite: 'normale'
    });
    
    console.log('✅ Notification créée avec succès:', {
      id: testNotification.id_notification,
      titre: testNotification.titre,
      contenu: testNotification.contenu_notification,
      destinataire: testNotification.destinataire
    });
    
    // Nettoyer le test
    await testNotification.destroy();
    console.log('🧹 Notification de test supprimée');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    if (error.errors) {
      error.errors.forEach(err => {
        console.error(`  - ${err.path}: ${err.message}`);
      });
    }
  }
}

// Exécuter le test
testNotificationCreation();
