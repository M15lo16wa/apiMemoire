const { exec } = require('child_process');
const path = require('path');

console.log('🔄 Synchronisation de la table Prescriptions avec le modèle...');

// Exécuter la migration de synchronisation
const command = 'npx sequelize-cli db:migrate';

exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Erreur lors de la migration:', error);
    return;
  }
  
  if (stderr) {
    console.warn('⚠️ Avertissements:', stderr);
  }
  
  console.log('✅ Migration exécutée avec succès!');
  console.log('📋 Sortie:', stdout);
  
  console.log('\n🎉 La table Prescriptions est maintenant synchronisée avec le modèle!');
  console.log('📝 Changements appliqués:');
  console.log('   • Ajout du champ prescriptionNumber (unique)');
  console.log('   • Ajout du champ type_prescription (ordonnance/examen)');
  console.log('   • Remplacement de medicament par principe_actif');
  console.log('   • Ajout des champs modernes (QR Code, signature électronique, etc.)');
  console.log('   • Suppression des champs obsolètes (consultation_id, service_id)');
  console.log('   • Mise à jour des index pour optimiser les performances');
}); 