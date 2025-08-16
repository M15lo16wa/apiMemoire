/**
 * Test pour vérifier le périmètre de la 2FA
 * Vérifie que seules les routes d'accès aux dossiers patients sont protégées
 */

const { get2FARequirement, getAll2FAProtectedRoutes } = require('./src/config/2fa-protected-routes');

console.log('🔐 Test du Périmètre de la 2FA\n');

// 1. Vérifier la configuration des routes protégées
console.log('📋 Configuration des routes protégées par 2FA :');
const protectedRoutes = getAll2FAProtectedRoutes();
console.log(JSON.stringify(protectedRoutes, null, 2));

// 2. Tester les routes d'accès (doivent être protégées)
console.log('\n✅ Test des routes d\'accès (doivent être protégées) :');
const accessRoutes = [
  '/access/request-standard',
  '/access/grant-emergency',
  '/access/revoke-access',
  '/access/modify-permissions',
  '/access/status/123',
  '/access/patient/status'
];

accessRoutes.forEach(route => {
  const requirement = get2FARequirement(route);
  const status = requirement.requires2FA ? '✅ PROTÉGÉE' : '❌ NON PROTÉGÉE';
  console.log(`${route} -> ${status} (niveau: ${requirement.level})`);
});

// 3. Tester les routes non-critiques (ne doivent PAS être protégées)
console.log('\n❌ Test des routes non-critiques (ne doivent PAS être protégées) :');
const nonCriticalRoutes = [
  '/prescription/ordonnance',
  '/prescription/demande-examen',
  '/dossierMedical/',
  '/dossierMedical/123',
  '/dossierMedical/123/update',
  '/consultation/create',
  '/professionnelSante/create'
];

nonCriticalRoutes.forEach(route => {
  const requirement = get2FARequirement(route);
  const status = requirement.requires2FA ? '❌ PROTÉGÉE (ERREUR!)' : '✅ NON PROTÉGÉE';
  console.log(`${route} -> ${status}`);
});

// 4. Vérifier que seules les routes d'accès sont protégées
console.log('\n🔍 Vérification du périmètre :');
const allProtectedRoutes = [];
Object.values(protectedRoutes).forEach(module => {
  allProtectedRoutes.push(...module.critical, ...module.sensitive);
});

console.log(`Nombre total de routes protégées : ${allProtectedRoutes.length}`);
console.log('Routes protégées :', allProtectedRoutes);

// 5. Vérifier que toutes les routes protégées commencent par /access
const nonAccessRoutes = allProtectedRoutes.filter(route => !route.startsWith('/access'));
if (nonAccessRoutes.length === 0) {
  console.log('✅ SUCCÈS : Toutes les routes protégées concernent l\'accès aux dossiers patients');
} else {
  console.log('❌ ERREUR : Certaines routes protégées ne concernent pas l\'accès :', nonAccessRoutes);
}

console.log('\n🎯 Résumé :');
console.log('- La 2FA ne s\'applique qu\'à l\'accès aux dossiers médicaux des patients');
console.log('- Les prescriptions, consultations et gestion des dossiers ne nécessitent PAS la 2FA');
console.log('- Seules les routes /access/* sont protégées par la 2FA');
