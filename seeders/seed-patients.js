const { Patient, sequelize } = require('../src/models');
const bcrypt = require('bcryptjs');

const patients = [
  {
    nom: 'MOLOWA',
    prenom: 'ESSONGA',
    date_naissance: '1990-05-15',
    sexe: 'M',
    adresse: '123 Rue de la Santé, Yaoundé',
    telephone: '+237123456789',
    email: 'molowa.essonga@email.com',
    identifiantNational: 'ID123456789',
    numero_assure: 'TEMP000005',
    nom_assurance: 'CNPS',
    mot_de_passe: 'passer123' // Will be hashed
  },
  {
    nom: 'NGONDI',
    prenom: 'MARIE',
    date_naissance: '1985-08-22',
    sexe: 'F',
    adresse: '456 Avenue de l\'Indépendance, Douala',
    telephone: '+237987654321',
    email: 'marie.ngondi@email.com',
    identifiantNational: 'ID987654321',
    numero_assure: 'TEMP000006',
    nom_assurance: 'CNPS',
    mot_de_passe: 'motdepasse456' // Will be hashed
  },
  {
    nom: 'BIYA',
    prenom: 'PAUL',
    date_naissance: '1975-12-10',
    sexe: 'M',
    adresse: '789 Boulevard de la République, Bafoussam',
    telephone: '+237555123456',
    email: 'paul.biya@email.com',
    identifiantNational: 'ID555123456',
    numero_assure: 'TEMP000007',
    nom_assurance: 'CNPS',
    mot_de_passe: 'test123' // Will be hashed
  }
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données réussie.');
    
    for (const patientData of patients) {
      // Check if patient already exists
      const existingPatient = await Patient.findOne({
        where: { numero_assure: patientData.numero_assure }
      });
      
      if (existingPatient) {
        // Update existing patient - let model hooks handle password hashing
        await existingPatient.update({ 
          mot_de_passe: patientData.mot_de_passe, // Plain text password - will be hashed by model hooks
          nom: patientData.nom,
          prenom: patientData.prenom,
          email: patientData.email,
          adresse: patientData.adresse,
          telephone: patientData.telephone,
          nom_assurance: patientData.nom_assurance
        });
        console.log(`Mis à jour : ${patientData.prenom} ${patientData.nom} (${patientData.numero_assure})`);
      } else {
        // Create new patient (password will be hashed by model hooks)
        await Patient.create(patientData);
        console.log(`Ajouté : ${patientData.prenom} ${patientData.nom} (${patientData.numero_assure})`);
      }
    }
    
    console.log('Tous les patients ont été traités avec succès.');
  } catch (error) {
    console.error('Erreur lors de l\'insertion des patients :', error);
  } finally {
    await sequelize.close();
  }
}

seed();
