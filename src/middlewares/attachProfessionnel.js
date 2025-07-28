const { ProfessionnelSante } = require('../models');

module.exports = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(403).json({ message: "Aucun utilisateur connecté." });
    }
    // Prend l'identifiant professionnel selon la clé présente
    const idProfessionnel = req.user.id_professionnel || req.user.professionnel_id;
    if (!idProfessionnel) {
      return res.status(403).json({ message: "Impossible de déterminer l'identifiant du professionnel de santé." });
    }
    const professionnel = await ProfessionnelSante.findOne({ where: { id_professionnel: idProfessionnel } });
    if (!professionnel) {
      return res.status(403).json({ message: "Aucun professionnel de santé associé à cet utilisateur." });
    }
    req.professionnel = professionnel;
    next();
  } catch (err) {
    next(err);
  }
};
