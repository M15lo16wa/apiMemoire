/**
 * Configuration des routes protégées par 2FA
 * Ce fichier centralise la configuration des routes qui nécessitent
 * une authentification à double facteur
 */

const TWO_FACTOR_PROTECTED_ROUTES = {
  // Module Access - Accès aux dossiers médicaux des patients
  // C'est le SEUL module qui nécessite la 2FA car il concerne
  // l'accès aux informations personnelles des patients
  access: {
    // Routes critiques nécessitant 2FA
    critical: [
      '/access/request-standard',      // Demande d'accès standard au dossier patient
      '/access/grant-emergency',       // Accès d'urgence au dossier patient
      '/access/revoke-access',         // Révoquer un accès au dossier patient
      '/access/modify-permissions'     // Modifier les permissions d'accès
    ],
    // Routes sensibles nécessitant 2FA
    sensitive: [
      '/access/status/:patientId',     // Statut d'accès au dossier patient
      '/access/patient/status'        // Statut d'accès du patient à son propre dossier
    ]
  }
  
  // Note: Les autres modules (prescription, dossierMedical, etc.) ne nécessitent PAS la 2FA
  // car ils ne concernent que la gestion des données, pas l'accès aux dossiers patients
};

/**
 * Détermine si une route nécessite la protection 2FA
 * @param {string} path - Le chemin de la route
 * @param {string} method - La méthode HTTP (GET, POST, PUT, DELETE)
 * @returns {Object} - { requires2FA: boolean, level: 'critical'|'sensitive'|'none' }
 */
function get2FARequirement(path, method = 'GET') {
  // Normaliser le chemin
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Parcourir tous les modules
  for (const [moduleName, moduleRoutes] of Object.entries(TWO_FACTOR_PROTECTED_ROUTES)) {
    // Vérifier les routes critiques
    if (moduleRoutes.critical.some(route => {
      const routePattern = route.replace(/:[^/]+/g, '[^/]+');
      const regex = new RegExp(`^${routePattern}$`);
      return regex.test(normalizedPath);
    })) {
      return { requires2FA: true, level: 'critical' };
    }
    
    // Vérifier les routes sensibles
    if (moduleRoutes.sensitive.some(route => {
      const routePattern = route.replace(/:[^/]+/g, '[^/]+');
      const regex = new RegExp(`^${routePattern}$`);
      return regex.test(normalizedPath);
    })) {
      return { requires2FA: true, level: 'sensitive' };
    }
  }
  
  return { requires2FA: false, level: 'none' };
}

/**
 * Obtient la liste de toutes les routes protégées par 2FA
 * @returns {Object} - Objet avec les routes critiques et sensibles
 */
function getAll2FAProtectedRoutes() {
  return TWO_FACTOR_PROTECTED_ROUTES;
}

module.exports = {
  TWO_FACTOR_PROTECTED_ROUTES,
  get2FARequirement,
  getAll2FAProtectedRoutes
};
