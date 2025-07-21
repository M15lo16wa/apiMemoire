const { Hopital, sequelize } = require('../src/models');

const hopitaux = [
  {
    nom: 'Hôpital Principal de Dakar',
    adresse: '1 Av. Nelson Mandela, Dakar',
    telephone: '33 839 50 50',
    type_etablissement: 'Public',
    ville: 'Dakar',
    pays: 'Sénégal'
  },
  {
    nom: 'Hôpital Aristide Le Dantec',
    adresse: 'Av. Pasteur, Dakar',
    telephone: '33 821 24 24',
    type_etablissement: 'Public',
    ville: 'Dakar',
    pays: 'Sénégal'
  },
  {
    nom: 'Hôpital Fann',
    adresse: 'Av. Cheikh Anta Diop, Dakar',
    telephone: '33 825 13 00',
    type_etablissement: 'Public',
    ville: 'Dakar',
    pays: 'Sénégal'
  },
  {
    nom: 'Hôpital Dalal Jamm',
    adresse: 'Guédiawaye, Dakar',
    telephone: '33 879 00 00',
    type_etablissement: 'Public',
    ville: 'Guédiawaye',
    pays: 'Sénégal'
  },
  {
    nom: 'Clinique Pasteur',
    adresse: 'Rue 1 x 6, Dakar',
    telephone: '33 821 14 14',
    type_etablissement: 'Privé',
    ville: 'Dakar',
    pays: 'Sénégal'
  }
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données réussie.');
    for (const hopital of hopitaux) {
      await Hopital.create(hopital);
      console.log(`Ajouté : ${hopital.nom}`);
    }
    console.log('Tous les hôpitaux ont été ajoutés avec succès.');
  } catch (error) {
    console.error('Erreur lors de l\'insertion des hôpitaux :', error);
  } finally {
    await sequelize.close();
  }
}

seed(); 