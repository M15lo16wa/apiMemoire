const { redis } = require('../config/redis');
const jwt = require('jsonwebtoken');

class TokenService {
  constructor() {
    this.tokenPrefix = 'token:';
    this.sessionPrefix = 'session:';
    this.blacklistPrefix = 'blacklist:';
  }

  /**
   * Génère un token JWT et le stocke dans Redis
   * @param {Object} user - L'utilisateur connecté
   * @param {string} userType - Le type d'utilisateur (patient, professionnel, etc.)
   * @returns {string} Le token JWT généré
   */
  async generateAndStoreToken(user, userType = 'user') {
    try {
      console.log('🔍 DEBUG tokenService.generateAndStoreToken - Paramètres reçus:', {
        user: {
          id: user.id,
          id_utilisateur: user.id_utilisateur,
          id_patient: user.id_patient,
          id_professionnel: user.id_professionnel,
          role: user.role,
          type: userType
        }
      });

      // Générer le token JWT
      const token = jwt.sign(
        { 
          id: user.id || user.id_utilisateur || user.id_patient || user.id_professionnel,
          type: userType,
          role: userType === 'patient' ? 'patient' : (user.role || 'user'),
          iat: Math.floor(Date.now() / 1000)
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      console.log('🔍 DEBUG - Token JWT généré:', token.substring(0, 20) + '...');

      // Calculer l'expiration du token
      const decoded = jwt.decode(token);
      const expiresAt = decoded.exp * 1000; // Convertir en millisecondes
      const ttl = Math.floor((expiresAt - Date.now()) / 1000); // TTL en secondes

      console.log('🔍 DEBUG - Décodage du token:', {
        decoded: decoded,
        expiresAt: expiresAt,
        ttl: ttl
      });

      // Stocker le token dans Redis avec expiration
      const tokenKey = `${this.tokenPrefix}${token}`;
      const sessionKey = `${this.sessionPrefix}${user.id || user.id_utilisateur || user.id_patient || user.id_professionnel}`;
      
      console.log('🔍 DEBUG - Clés Redis:', {
        tokenKey: tokenKey,
        sessionKey: sessionKey
      });

      // Stocker le token avec son expiration
      await redis.setex(tokenKey, ttl, JSON.stringify({
        userId: user.id || user.id_utilisateur || user.id_patient || user.id_professionnel,
        userType,
        role: user.role || 'user',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(expiresAt).toISOString()
      }));

      // Stocker la session utilisateur
      await redis.setex(sessionKey, ttl, JSON.stringify({
        token,
        userType,
        role: user.role || 'user',
        lastActivity: new Date().toISOString(),
        expiresAt: new Date(expiresAt).toISOString()
      }));

      console.log(`✅ Token généré et stocké pour ${userType} ID: ${user.id || user.id_utilisateur || user.id_patient || user.id_professionnel}`);
      
      // Vérifier que le token est bien stocké
      const storedToken = await redis.get(tokenKey);
      console.log('🔍 DEBUG - Vérification du stockage Redis:', {
        tokenKey: tokenKey,
        storedToken: storedToken ? 'Token trouvé' : 'Token non trouvé'
      });
      
      return token;
    } catch (error) {
      console.error('❌ Erreur lors de la génération du token:', error);
      throw error;
    }
  }

  /**
   * Vérifie si un token est valide et non révoqué
   * @param {string} token - Le token JWT à vérifier
   * @returns {Object|null} Les informations du token ou null si invalide
   */
  async validateToken(token) {
    try {
      // Vérifier si le token est dans la blacklist
      const isBlacklisted = await redis.exists(`${this.blacklistPrefix}${token}`);
      if (isBlacklisted) {
        console.log('❌ Token trouvé dans la blacklist');
        return null;
      }

      // Vérifier la validité JWT d'abord
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Vérifier si le token existe dans Redis (optionnel, car il peut avoir expiré)
      const tokenKey = `${this.tokenPrefix}${token}`;
      const tokenData = await redis.get(tokenKey);
      
      if (!tokenData) {
        console.log('⚠️  Token non trouvé dans Redis (peut avoir expiré), mais JWT valide');
        // On peut quand même retourner les données du token JWT décodé
        return decoded;
      }

      // Mettre à jour la dernière activité
      const sessionKey = `${this.sessionPrefix}${decoded.id}`;
      await redis.setex(sessionKey, decoded.exp - Math.floor(Date.now() / 1000), JSON.stringify({
        token,
        userType: decoded.type,
        role: decoded.role,
        lastActivity: new Date().toISOString(),
        expiresAt: new Date(decoded.exp * 1000).toISOString()
      }));

      return {
        ...decoded,
        tokenData: JSON.parse(tokenData)
      };
    } catch (error) {
      console.error('❌ Erreur lors de la validation du token:', error);
      return null;
    }
  }

  /**
   * Révoque un token (déconnexion)
   * @param {string} token - Le token à révoquer
   * @param {string} userId - L'ID de l'utilisateur
   */
  async revokeToken(token, userId) {
    try {
      // Ajouter le token à la blacklist
      const decoded = jwt.decode(token);
      const expiresAt = decoded.exp * 1000;
      const ttl = Math.floor((expiresAt - Date.now()) / 1000);
      
      if (ttl > 0) {
        await redis.setex(`${this.blacklistPrefix}${token}`, ttl, JSON.stringify({
          userId,
          revokedAt: new Date().toISOString(),
          expiresAt: new Date(expiresAt).toISOString()
        }));
      }

      // Supprimer le token de la liste des tokens actifs
      await redis.del(`${this.tokenPrefix}${token}`);
      
      // Supprimer la session utilisateur
      await redis.del(`${this.sessionPrefix}${userId}`);

      console.log(`✅ Token révoqué pour l'utilisateur ID: ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la révocation du token:', error);
      throw error;
    }
  }

  /**
   * Révoque tous les tokens d'un utilisateur (déconnexion de tous les appareils)
   * @param {string} userId - L'ID de l'utilisateur
   */
  async revokeAllUserTokens(userId) {
    try {
      // Récupérer la session utilisateur
      const sessionKey = `${this.sessionPrefix}${userId}`;
      const sessionData = await redis.get(sessionKey);
      
      if (sessionData) {
        const session = JSON.parse(sessionData);
        // Ajouter le token à la blacklist
        await this.revokeToken(session.token, userId);
      }

      // Supprimer toutes les sessions de l'utilisateur
      const keys = await redis.keys(`${this.sessionPrefix}${userId}`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }

      console.log(`✅ Tous les tokens révoqués pour l'utilisateur ID: ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la révocation de tous les tokens:', error);
      throw error;
    }
  }

  /**
   * Vérifie si un utilisateur a une session active
   * @param {string} userId - L'ID de l'utilisateur
   * @returns {boolean} True si l'utilisateur a une session active
   */
  async hasActiveSession(userId) {
    try {
      const sessionKey = `${this.sessionPrefix}${userId}`;
      const session = await redis.get(sessionKey);
      return !!session;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de la session:', error);
      return false;
    }
  }

  /**
   * Récupère les informations de session d'un utilisateur
   * @param {string} userId - L'ID de l'utilisateur
   * @returns {Object|null} Les informations de session ou null
   */
  async getUserSession(userId) {
    try {
      const sessionKey = `${this.sessionPrefix}${userId}`;
      const session = await redis.get(sessionKey);
      return session ? JSON.parse(session) : null;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la session:', error);
      return null;
    }
  }

  /**
   * Nettoie les tokens expirés et la blacklist
   */
  async cleanupExpiredTokens() {
    try {
      // Cette fonction sera appelée périodiquement pour nettoyer Redis
      console.log('🧹 Nettoyage des tokens expirés...');
      
      // Les clés Redis avec TTL se suppriment automatiquement
      // Cette fonction peut être utilisée pour des tâches de maintenance supplémentaires
      
      return true;
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des tokens:', error);
      return false;
    }
  }

  /**
   * Récupère les statistiques Redis
   * @returns {Object} Statistiques des tokens et sessions
   */
  async getStats() {
    try {
      const tokenCount = await redis.dbsize();
      const tokenKeys = await redis.keys(`${this.tokenPrefix}*`);
      const sessionKeys = await redis.keys(`${this.sessionPrefix}*`);
      const blacklistKeys = await redis.keys(`${this.blacklistPrefix}*`);

      return {
        totalKeys: tokenCount,
        activeTokens: tokenKeys.length,
        activeSessions: sessionKeys.length,
        blacklistedTokens: blacklistKeys.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      return null;
    }
  }
}

module.exports = new TokenService();
