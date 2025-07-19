module.exports = (fn) => {
    return (req, res, next) => {
      // Enveloppe la fonction asynchrone pour attraper toute erreur
      // et la passe au middleware de gestion globale des erreurs
      fn(req, res, next).catch(next);
    };
  };