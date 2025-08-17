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
   * @returns {Promise<string>} URL du QR code en base64
   */
  static async generateQRCode(email, secret, serviceName = 'DMP Platform') {
    try {
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
      // Utiliser authenticator.verify() pour la compatibilité avec authenticator.generateSecret()
      return authenticator.verify(token, secret);
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
}

module.exports = TwoFactorService;
