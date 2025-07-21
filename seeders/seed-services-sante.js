const { ServiceSante, Hopital, sequelize } = require('../src/models');

// Liste de services types à créer pour chaque hôpital
const servicesTypes = [
  { code: 'MEDECINE', nom: 'Médecine Générale', type_service: 'MEDECINE_GENERALE', description: 'Consultations de médecine générale.' },
  { code: 'PEDIATRIE', nom: 'Pédiatrie', type_service: 'PEDIATRIE', description: 'Soins pour enfants et adolescents.' },
  { code: 'CHIRURGIE', nom: 'Chirurgie', type_service: 'CHIRURGIE', description: 'Interventions chirurgicales.' },
  { code: 'URGENCES', nom: 'Urgences', type_service: 'URGENCES', description: 'Prise en charge des urgences médicales.' },
  { code: 'CARDIO', nom: 'Cardiologie', type_service: 'CARDIOLOGIE', description: 'Soins spécialisés en cardiologie.' },
  { code: 'RADIO', nom: 'Radiologie', type_service: 'RADIOLOGIE', description: 'Imagerie médicale.' },
  { code: 'PHARMA', nom: 'Pharmacie', type_service: 'PHARMACIE', description: 'Dispensation de médicaments.' }
];

async function seed() {
  try {
    await sequelize.authenticate();
    const hopitaux = await Hopital.findAll();
    if (!hopitaux.length) throw new Error('Aucun hôpital trouvé.');
    for (const hopital of hopitaux) {
      for (const service of servicesTypes) {
        // Générer un code unique par hôpital
        const code = `${service.code}_${hopital.id_hopital}`;
        await ServiceSante.create({
          code,
          nom: service.nom,
          type_service: service.type_service,
          description: service.description,
          hopital_id: hopital.id_hopital,
          statut: 'ACTIF'
        });
        console.log(`Ajouté : ${service.nom} à ${hopital.nom}`);
      }
    }
    console.log('Tous les services de santé ont été ajoutés avec succès.');
  } catch (error) {
    console.error('Erreur lors de l\'insertion des services de santé :', error);
  } finally {
    await sequelize.close();
  }
}

seed(); 