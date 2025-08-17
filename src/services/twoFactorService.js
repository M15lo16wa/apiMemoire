const { totp, authenticator } = require('otplib');
const QRCode = require('qrcode');
const crypto = require('crypto');

/**
 * Service de gestion de l'authentification à double facteur (2FA)
 */
class TwoFactorService {
  
  /**
   * Génère un secret unique pour un utilisateur
   * @param {string} email - Email de l'utilisateur
   * @returns {string} Secret généré
   */
  static generateSecret(email) {
    // Utiliser authenticator.generateSecret() pour la compatibilité avec authenticator.verify()
    return authenticator.generateSecret();
  }

  /**
   * Génère un QR code pour l'application authenticator
   * @param {string} email - Email de l'utilisateur
   * @param {string} secret - Secret généré
   * @param {string} serviceName - Nom du service (ex: "DMP Platform")
   */
  static async generateQRCode(email, secret, serviceName = 'DMP Platform') {
    try {
      // Utiliser authenticator.keyuri() pour la compatibilité avec authenticator.generateSecret() et authenticator.verify()
      const otpauth = authenticator.keyuri(email, serviceName, secret);
      const qrCodeDataURL = await QRCode.toDataURL(otpauth);
      return qrCodeDataURL;
    } catch (error) {
      throw new Error(`Erreur lors de la génération du QR code: ${error.message}`);
    }
  }

  /**
   * Vérifie un code 2FA
   * @param {string} token - Code à 6 chiffres saisi par l'utilisateur
   * @param {string} secret - Secret stocké pour l'utilisateur
   * @returns {boolean} True si le code est valide
   */
  static verifyToken(token, secret) {
    try {
      // Configuration TOTP avec fenêtre de temps TRÈS élargie pour éviter les décalages
      // window: 10 = ±10 intervalles de 30 secondes = ±5 minutes
      // step: 30 = intervalle de 30 secondes (standard TOTP)
      return authenticator.verify({ token, secret }, { 
        window: 10,       // Accepte les codes dans ±10 intervalles (±5 minutes)
        step: 30,         // Intervalle de 30 secondes
        digits: 6         // Code à 6 chiffres
      });
    } catch (error) {
      console.error('Erreur lors de la vérification du token 2FA:', error);
      return false;
    }
  }

  /**
   * Génère un code de récupération (fallback)
   * @returns {string} Code de récupération à 8 caractères
   */
  static generateRecoveryCode() {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  /**
   * Vérifie un code de récupération
   * @param {string} inputCode - Code saisi par l'utilisateur
   * @param {Array<string>} recoveryCodes - Codes de récupération stockés
   * @returns {Object} { isValid: boolean, usedCode: string | null }
   */
  static verifyRecoveryCode(inputCode, recoveryCodes) {
    const normalizedInput = inputCode.toUpperCase().replace(/\s/g, '');
    
    for (let i = 0; i < recoveryCodes.length; i++) {
      if (recoveryCodes[i] === normalizedInput) {
        return {
          isValid: true,
          usedCode: recoveryCodes[i],
          index: i
        };
      }
    }
    
    return {
      isValid: false,
      usedCode: null,
      index: -1
    };
  }

  /**
   * Génère des codes de récupération multiples
   * @param {number} count - Nombre de codes à générer (défaut: 5)
   * @returns {Array<string>} Tableau de codes de récupération
   */
  static generateRecoveryCodes(count = 5) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      codes.push(this.generateRecoveryCode());
    }
    return codes;
  }

  /**
   * Vérifie si un secret 2FA est valide
   * @param {string} secret - Secret à valider
   * @returns {boolean} True si le secret est valide
   */
  static isValidSecret(secret) {
    try {
      // Vérifier que le secret peut générer un token valide
      const testToken = totp.generate(secret);
      return testToken && testToken.length === 6;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtient la durée d'expiration restante pour un code 2FA
   * @param {string} secret - Secret 2FA
   * @returns {Object} { timeRemaining: number, step: number, window: number }
   */
  static getTimeRemaining(secret) {
    try {
      // Calculer le temps restant jusqu'au prochain intervalle
      const step = 30; // 30 secondes par défaut
      const now = Math.floor(Date.now() / 1000);
      const timeRemaining = step - (now % step);
      
      return {
        timeRemaining,    // Secondes restantes dans l'intervalle actuel
        step,             // Durée de l'intervalle (30 secondes)
        window: 10,       // Fenêtre de validation (±10 intervalles)
        totalWindow: 600  // Fenêtre totale en secondes (20 × 30 = 600 secondes = 10 minutes)
      };
    } catch (error) {
      console.error('Erreur lors du calcul du temps restant:', error);
      return null;
    }
  }

  /**
   * Génère un code 2FA avec informations de durée
   * @param {string} secret - Secret 2FA
   * @returns {Object} { token: string, timeRemaining: number, expiresAt: Date }
   */
  static generateTokenWithInfo(secret) {
    try {
      const token = authenticator.generate(secret);
      const timeInfo = this.getTimeRemaining(secret);
      const expiresAt = new Date(Date.now() + (timeInfo.timeRemaining * 1000));
      
      return {
        token,
        timeRemaining: timeInfo.timeRemaining,
        expiresAt,
        step: timeInfo.step,
        window: timeInfo.window
      };
    } catch (error) {
      console.error('Erreur lors de la génération du token avec info:', error);
      return null;
    }
  }
}

module.exports = TwoFactorService;
