const { Patient } = require('./src/models');
const bcrypt = require('bcryptjs');

async function testDatabaseConnection() {
  try {
    console.log('🔍 Test de connexion à la base de données...');
    
    // Vérifier que le patient de test existe
    const testPatient = await Patient.scope('withPassword').findOne({
      where: { numero_assure: 'TEST123456789' }
    });
    
    if (!testPatient) {
      console.log('❌ Patient de test non trouvé');
      return;
    }
    
    console.log('✅ Patient de test trouvé:');
    console.log(`  ID: ${testPatient.id_patient}`);
    console.log(`  Nom: ${testPatient.nom} ${testPatient.prenom}`);
    console.log(`  Numéro d'assuré: ${testPatient.numero_assure}`);
    console.log(`  Mot de passe présent: ${!!testPatient.mot_de_passe}`);
    console.log(`  Longueur du mot de passe: ${testPatient.mot_de_passe ? testPatient.mot_de_passe.length : 0}`);
    
    // Tester la vérification du mot de passe
    console.log('\n🔍 Test de vérification du mot de passe...');
    const testPassword = 'testpassword123';
    const isPasswordCorrect = await bcrypt.compare(testPassword, testPatient.mot_de_passe);
    
    console.log(`  Mot de passe testé: ${testPassword}`);
    console.log(`  Mot de passe correct: ${isPasswordCorrect}`);
    
    if (isPasswordCorrect) {
      console.log('✅ La vérification du mot de passe fonctionne correctement');
    } else {
      console.log('❌ La vérification du mot de passe échoue');
      
      // Essayer de recréer le hash
      console.log('\n🔍 Recréation du hash du mot de passe...');
      const newHash = await bcrypt.hash(testPassword, 12);
      console.log(`  Nouveau hash créé: ${newHash.substring(0, 20)}...`);
      
      // Mettre à jour le patient
      await testPatient.update({ mot_de_passe: newHash });
      console.log('✅ Mot de passe mis à jour dans la base de données');
      
      // Retester
      const newTest = await bcrypt.compare(testPassword, newHash);
      console.log(`  Nouveau test: ${newTest}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test de la base de données:', error);
  }
}

// Exécuter le test
testDatabaseConnection().catch(console.error);
