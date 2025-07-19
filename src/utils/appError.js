class AppError extends Error {
    constructor(message, statusCode) {
      super(message); // Appelle le constructeur de la classe Error
  
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; // 'fail' pour 4xx, 'error' pour 5xx
      this.isOperational = true; // Indique si l'erreur est opérationnelle (prévisible)
  
      // Capture la pile d'appels (stack trace) pour faciliter le débogage
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  module.exports = AppError;