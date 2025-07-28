const { ProfessionnelSante } = require('../models');

module.exports = async (req, res, next) => {
  try {
    const utilisateurId = req.user.id_professionnel || req.user.id;
    console.log(utilisateurId);
    const professionnel = await ProfessionnelSante.findOne({ where: { id_professionnel: utilisateurId } });
    if (!professionnel) {
      return res.status(403).json({ message: "Aucun professionnel de santé associé à cet utilisateur." });
    }
    req.professionnel = professionnel;
    next();
  } catch (err) {
    next(err);
  }
};
