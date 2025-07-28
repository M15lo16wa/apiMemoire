const { ProfessionnelSante, Utilisateur } = require('../../models');
const AppError = require('../../utils/appError');

const ROLE_MAPPING = {
    'medecin': 'medecin',
    'infirmier': 'infirmier',
    'secretaire': 'secretaire',
    'aide_soignant': 'aide_soignant',
    'technicien_laboratoire': 'laborantin',
    'pharmacien': 'pharmacien',
    'kinesitherapeute': 'professionnel_sante',
    'chirurgien': 'medecin',
    'radiologue': 'medecin',
    'anesthesiste': 'medecin',
    'autre': 'professionnel_sante',
};

exports.getAllProfessionnels = async () => {
  const professionnels = await ProfessionnelSante.findAll({
    include: {
        model: Utilisateur,
        as: 'compteUtilisateur',
        attributes: ['id_utilisateur', 'email', 'nom', 'prenom', 'role', 'statut']
    }
  });
  return professionnels;
};

exports.getProfessionnelById = async (id) => {
  const professionnel = await ProfessionnelSante.findByPk(id, {
    include: {
        model: Utilisateur,
        as: 'compteUtilisateur',
        attributes: ['id_utilisateur', 'email', 'nom', 'prenom', 'role', 'statut']
    }
  });
  if (!professionnel) {
    throw new AppError('Professionnel de santé not found with that ID', 404);
  }
  return professionnel;
};

exports.createProfessionnel = async (professionnelData) => {
  // Vérifier si un professionnel avec le même numero_licence existe déjà
  if (professionnelData.numero_adeli) {
      const existingProf = await ProfessionnelSante.findOne({
        where: { numero_adeli: professionnelData.numero_adeli }
      });
      if (existingProf) {
        throw new AppError('A professional with this license number already exists.', 400);
      }
  }

  // utilisateur_id devient optionnel, on ne vérifie plus sa présence
  // Si utilisateur_id fourni, on peut garder la logique de liaison facultative
  if (professionnelData.utilisateur_id) {
    const user = await Utilisateur.findByPk(professionnelData.utilisateur_id);
    if (!user) {
      throw new AppError('User account not found for the provided utilisateur_id.', 404);
    }
    // On peut garder la logique de cohérence de rôle si besoin
  }

  // Vérifier la cohérence des rôles
  const expectedUserRole = ROLE_MAPPING[professionnelData.role];
  if (!expectedUserRole) {
      throw new AppError(`Invalid professional role provided: ${professionnelData.role}`, 400);
  }

  const newProfessionnel = await ProfessionnelSante.create(professionnelData);
  return newProfessionnel;
};

exports.updateProfessionnel = async (id, professionnelData) => {
  const professionnel = await ProfessionnelSante.findByPk(id);
  if (!professionnel) {
    throw new AppError('Professionnel de santé not found with that ID', 404);
  }

  // Si le rôle professionnel est mis à jour, vérifier la cohérence avec le rôle de l'utilisateur
  if (professionnelData.role && professionnelData.role !== professionnel.role) {
      const user = await Utilisateur.findByPk(professionnel.utilisateur_id);
      if (user) {
          const expectedUserRole = ROLE_MAPPING[professionnelData.role];
          if (!expectedUserRole) {
              throw new AppError(`Invalid professional role provided for update: ${professionnelData.role}`, 400);
          }
          // Ne pas écraser un rôle 'admin' ou 'secretaire' de l'utilisateur
          if (user.role !== 'admin' && user.role !== 'secretaire' && user.role !== expectedUserRole) {
              await user.update({ role: expectedUserRole });
          }
      }
  }

  // Empêcher la modification de utilisateur_id via update (doit être géré à la création)
  if (professionnelData.utilisateur_id) {
      delete professionnelData.utilisateur_id;
  }

  await professionnel.update(professionnelData);
  return professionnel;
};

exports.deleteProfessionnel = async (id) => {
  const professionnel = await ProfessionnelSante.findByPk(id);
  if (!professionnel) {
    throw new AppError('Professionnel de santé not found with that ID', 404);
  }

  // Logique pour gérer le compte utilisateur lié
  // Si onDelete est 'SET NULL' dans la migration, le utilisateur_id sera juste nullifié.
  // Si vous voulez aussi changer le rôle de l'utilisateur lié ou le désactiver, faites-le ici.
  if (professionnel.utilisateur_id) {
      const user = await Utilisateur.findByPk(professionnel.utilisateur_id);
      if (user && user.role !== 'admin' && user.role !== 'secretaire') { // Ne pas modifier un compte admin ou secretaire
          // Exemple : Réinitialiser le rôle à 'patient' ou 'inactif' si l'utilisateur n'est plus associé à un professionnel
          // await user.update({ role: 'patient', statut: 'inactif' });
          // Ou simplement laisser le onDelete: 'SET NULL' faire son travail sur la FK
      }
  }

  await professionnel.destroy();
  return { message: 'Professionnel de santé successfully deleted' };
};
