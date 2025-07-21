const { ProfessionnelSante, ServiceSante, Utilisateur, sequelize } = require('../src/models');

// Listes de noms et prénoms sénégalais typiques
const noms = ['Diop', 'Sarr', 'Fall', 'Ndiaye', 'Ba', 'Faye', 'Gueye', 'Sow', 'Sy', 'Ndoye'];
const prenomsMedecin = ['Mamadou', 'Cheikh', 'Ibrahima', 'Abdoulaye', 'Ousmane', 'Aliou', 'Serigne', 'Moussa', 'Pape', 'Amadou'];
const prenomsInfirmier = ['Fatou', 'Aminata', 'Mariama', 'Astou', 'Awa', 'Khady', 'Ndeye', 'Bineta', 'Sokhna', 'Coumba'];

// Seuls les rôles autorisés pour ProfessionnelSante
const profils = [
  { role: 'medecin', specialite: 'Médecine Générale' },
  { role: 'infirmier', specialite: 'Soins Infirmiers' }
];

function getRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

async function generateUniqueEmail(prenom, nom, service, compteur) {
  let base = `${prenom.toLowerCase()}.${nom.toLowerCase()}.${service.id_service}.${compteur}`;
  let email = `${base}@${service.nom.replace(/\s+/g, '').toLowerCase()}.com`;
  let exists = await Utilisateur.findOne({ where: { email } });
  let suffix = 1;
  while (exists) {
    email = `${base}.${Date.now()}${suffix}@${service.nom.replace(/\s+/g, '').toLowerCase()}.com`;
    exists = await Utilisateur.findOne({ where: { email } });
    suffix++;
  }
  return email;
}

async function seed() {
  try {
    await sequelize.authenticate();
    const services = await ServiceSante.findAll();
    if (!services.length) throw new Error('Aucun service de santé trouvé.');
    let compteur = 0;
    for (const service of services) {
      for (const profil of profils) {
        let prenom;
        if (profil.role === 'medecin') prenom = prenomsMedecin[compteur % prenomsMedecin.length];
        else prenom = prenomsInfirmier[compteur % prenomsInfirmier.length];
        const nom = noms[compteur % noms.length];
        const email = await generateUniqueEmail(prenom, nom, service, compteur);
        const mot_de_passe = 'Test@1234';
        // Vérifier si l'utilisateur existe déjà
        let utilisateur = await Utilisateur.findOne({ where: { email } });
        if (!utilisateur) {
          utilisateur = await Utilisateur.create({
            nom,
            prenom,
            email,
            mot_de_passe,
            role: 'secretaire', // Toujours 'secretaire' pour la plateforme
            statut: 'actif'
          });
        }
        // Vérifier si le professionnel existe déjà
        let professionnel = await ProfessionnelSante.findOne({ where: { email } });
        if (!professionnel) {
          professionnel = await ProfessionnelSante.create({
            nom,
            prenom,
            email,
            telephone: '77' + String(1000000 + compteur).slice(0,7),
            role: profil.role, // 'medecin' ou 'infirmier'
            specialite: profil.specialite,
            statut: 'actif',
            service_id: service.id_service,
            utilisateur_id: utilisateur.id_utilisateur
          });
          console.log(`Ajouté : ${profil.role} ${prenom} ${nom} pour le service ${service.nom}`);
        } else {
          // Mettre à jour les champs vides si besoin
          let updated = false;
          if (!professionnel.specialite) { professionnel.specialite = profil.specialite; updated = true; }
          if (!professionnel.telephone) { professionnel.telephone = '77' + String(1000000 + compteur).slice(0,7); updated = true; }
          if (!professionnel.role) { professionnel.role = profil.role; updated = true; }
          if (!professionnel.statut) { professionnel.statut = 'actif'; updated = true; }
          if (!professionnel.service_id) { professionnel.service_id = service.id_service; updated = true; }
          if (!professionnel.utilisateur_id) { professionnel.utilisateur_id = utilisateur.id_utilisateur; updated = true; }
          if (updated) {
            await professionnel.save();
            console.log(`Mis à jour : ${profil.role} ${prenom} ${nom} pour le service ${service.nom}`);
          } else {
            console.log(`Déjà existant : ${profil.role} ${prenom} ${nom} pour le service ${service.nom}`);
          }
        }
        compteur++;
      }
    }
    console.log('Tous les professionnels de santé ont été ajoutés/mis à jour avec succès.');
  } catch (error) {
    console.error('Erreur lors de l\'insertion des professionnels de santé :', error);
  } finally {
    await sequelize.close();
  }
}

seed(); 