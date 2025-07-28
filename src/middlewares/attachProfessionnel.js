const { ProfessionnelSante } = require('../models');

module.exports = async (req, res, next) => {
  try {
    const utilisateurId = req.user.id_utilisateur || req.user.id;
    const professionnel = await ProfessionnelSante.findOne({ where: { utilisateur_id: utilisateurId } });
    if (!professionnel) {
      return res.status(403).json({ message: "Aucun professionnel de santé associé à cet utilisateur." });
    }
    req.professionnel = professionnel;
    next();
  } catch (err) {
    next(err);
  }
};
