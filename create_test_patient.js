const { Patient } = require('./src/models');
const bcrypt = require('bcryptjs');

async function createTestPatient() {
  try {
    console.log('🔍 Création d\'un patient de test...');
    
    // Vérifier si le patient de test existe déjà
    const existingPatient = await Patient.findOne({
      where: { numero_assure: 'TEST123456789' }
    });
    
    if (existingPatient) {
      console.log('✅ Patient de test existe déjà, mise à jour du mot de passe...');
      
      // Mettre à jour le mot de passe
      const hashedPassword = await bcrypt.hash('testpassword123', 12);
      await existingPatient.update({
        mot_de_passe: hashedPassword,
        derniere_connexion: new Date()
      });
      
      console.log('✅ Mot de passe mis à jour pour le patient existant');
      console.log(`  ID: ${existingPatient.id_patient}`);
      console.log(`  Nom: ${existingPatient.nom} ${existingPatient.prenom}`);
      console.log(`  Numéro d'assuré: ${existingPatient.numero_assure}`);
      console.log(`  Mot de passe: testpassword123`);
      
      return existingPatient;
    }
    
    // Créer un nouveau patient de test
    const hashedPassword = await bcrypt.hash('testpassword123', 12);
    
    const testPatient = await Patient.create({
      nom: 'TEST',
      prenom: 'PATIENT',
      date_naissance: '1990-01-01',
      lieu_naissance: 'Paris',
      civilite: 'M',
      sexe: 'M',
      numero_dossier: 'TEST-2024-0001',
      numero_assure: 'TEST123456789',
      nom_assurance: 'Test Assurance',
      adresse: '123 Rue Test',
      ville: 'Paris',
      pays: 'France',
      email: 'test.patient@email.com',
      telephone: '0123456789',
      mot_de_passe: hashedPassword,
      derniere_connexion: new Date()
    });
    
    console.log('✅ Patient de test créé avec succès:');
    console.log(`  ID: ${testPatient.id_patient}`);
    console.log(`  Nom: ${testPatient.nom} ${testPatient.prenom}`);
    console.log(`  Numéro d'assuré: ${testPatient.numero_assure}`);
    console.log(`  Email: ${testPatient.email}`);
    console.log(`  Mot de passe: testpassword123`);
    
    return testPatient;
    
  } catch (error) {
    console.error('❌ Erreur lors de la création du patient de test:', error);
    throw error;
  }
}

// Exécuter la création
createTestPatient().catch(console.error);
