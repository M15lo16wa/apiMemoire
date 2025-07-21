const { Hopital } = require('../../models');
const AppError = require('../../utils/appError');

/**
 * Créer un nouvel hôpital
 * @param {object} hopitalData - Les données de l'hôpital à créer
 * @returns {Promise<Hopital>} L'hôpital créé
 */
exports.createHopital = async (hopitalData) => {
  try {
    const newHopital = await Hopital.create(hopitalData);
    return newHopital;
  } catch (error) {
    throw new AppError('Erreur lors de la création de l\'hôpital: ' + error.message, 400);
  }
};

/**
 * Récupérer tous les hôpitaux
 * @returns {Promise<Hopital[]>} La liste des hôpitaux
 */
exports.getAllHopitaux = async () => {
  return await Hopital.findAll();
};

/**
 * Récupérer un hôpital par son ID
 * @param {number} id - L'ID de l'hôpital
 * @returns {Promise<Hopital>} L'hôpital trouvé
 */
exports.getHopitalById = async (id) => {
  const hopital = await Hopital.findByPk(id);
  if (!hopital) {
    throw new AppError('Aucun hôpital trouvé avec cet ID', 404);
  }
  return hopital;
};

/**
 * Mettre à jour un hôpital
 * @param {number} id - L'ID de l'hôpital à mettre à jour
 * @param {object} updateData - Les données de mise à jour
 * @returns {Promise<Hopital>} L'hôpital mis à jour
 */
exports.updateHopital = async (id, updateData) => {
  const hopital = await Hopital.findByPk(id);
  if (!hopital) {
    throw new AppError('Aucun hôpital trouvé avec cet ID', 404);
  }
  
  const updatedHopital = await hopital.update(updateData);
  return updatedHopital;
};

/**
 * Supprimer un hôpital (soft delete)
 * @param {number} id - L'ID de l'hôpital à supprimer
 * @returns {Promise<number>} Le nombre de lignes supprimées
 */
exports.deleteHopital = async (id) => {
  const deletedRowCount = await Hopital.destroy({
    where: { id_hopital: id },
  });

  if (deletedRowCount === 0) {
    throw new AppError('Aucun hôpital trouvé avec cet ID', 404);
  }
  
  return deletedRowCount;
}; 