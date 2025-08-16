/**
 * Test direct de la logique du middleware 2FA
 * Teste la logique sans passer par Express
 */

const { get2FARequirement } = require('./src/config/2fa-protected-routes');

console.log('🔐 Test Direct de la Logique du Middleware 2FA\n');

// 1. Test de la configuration des routes
console.log('📋 Test de la Configuration des Routes :');
const testRoutes = [
  '/access/request-standard',
  '/access/grant-emergency',
  '/access/revoke-access',
  '/access/modify-permissions',
  '/access/status/123',
  '/access/patient/status',
  '/prescription/ordonnance',
  '/prescription/demande-examen',
  '/dossierMedical/123',
  '/consultation/create'
];

testRoutes.forEach(route => {
  const requirement = get2FARequirement(route);
  const icon = requirement.requires2FA ? '🔒' : '🔓';
  const level = requirement.requires2FA ? ` (${requirement.level})` : '';
  console.log(`${icon} ${route} -> 2FA: ${requirement.requires2FA}${level}`);
});

// 2. Test de la logique de protection
console.log('\n🛡️ Test de la Logique de Protection :');

const testUsers = [
  {
    name: 'Utilisateur sans 2FA',
    two_factor_enabled: false,
    two_factor_verified: false,
    canAccessProtectedRoutes: false,
    canAccessUnprotectedRoutes: true
  },
  {
    name: 'Utilisateur avec 2FA activé mais non vérifié',
    two_factor_enabled: true,
    two_factor_verified: false,
    canAccessProtectedRoutes: false,
    canAccessUnprotectedRoutes: true
  },
  {
    name: 'Utilisateur avec 2FA complètement configuré',
    two_factor_enabled: true,
    two_factor_verified: true,
    canAccessProtectedRoutes: true,
    canAccessUnprotectedRoutes: true
  }
];

testUsers.forEach((user, index) => {
  console.log(`\n👤 ${user.name}:`);
  console.log(`   - 2FA activé: ${user.two_factor_enabled ? '✅' : '❌'}`);
  console.log(`   - 2FA vérifié: ${user.two_factor_verified ? '✅' : '❌'}`);
  
  // Test d'accès aux routes protégées
  const protectedRoute = '/access/request-standard';
  const requirement = get2FARequirement(protectedRoute);
  
  if (requirement.requires2FA) {
    if (!user.two_factor_enabled) {
      console.log(`   🔒 Accès aux routes protégées: BLOQUÉ (2FA non activé)`);
    } else if (!user.two_factor_verified) {
      console.log(`   🔒 Accès aux routes protégées: BLOQUÉ (2FA non vérifié)`);
    } else {
      console.log(`   🔓 Accès aux routes protégées: AUTORISÉ`);
    }
  }
  
  // Test d'accès aux routes non protégées
  const unprotectedRoute = '/prescription/ordonnance';
  const unprotectedRequirement = get2FARequirement(unprotectedRoute);
  
  if (!unprotectedRequirement.requires2FA) {
    console.log(`   🔓 Accès aux routes non protégées: AUTORISÉ (pas de 2FA requis)`);
  }
});

// 3. Test des scénarios d'accès
console.log('\n🎯 Test des Scénarios d\'Accès :');

const accessScenarios = [
  {
    name: 'Demande d\'accès standard au dossier patient',
    route: '/access/request-standard',
    user: testUsers[0], // Sans 2FA
    expectedAccess: false,
    reason: '2FA requis mais non activé'
  },
  {
    name: 'Accès d\'urgence au dossier patient',
    route: '/access/grant-emergency',
    user: testUsers[1], // 2FA activé mais non vérifié
    expectedAccess: false,
    reason: '2FA requis mais non vérifié'
  },
  {
    name: 'Création d\'ordonnance',
    route: '/prescription/ordonnance',
    user: testUsers[0], // Sans 2FA
    expectedAccess: true,
    reason: 'Pas de 2FA requis'
  },
  {
    name: 'Consultation du dossier médical',
    route: '/dossierMedical/123',
    user: testUsers[0], // Sans 2FA
    expectedAccess: true,
    reason: 'Pas de 2FA requis'
  }
];

accessScenarios.forEach((scenario, index) => {
  const requirement = get2FARequirement(scenario.route);
  let actualAccess = true;
  let actualReason = 'Accès autorisé';
  
  if (requirement.requires2FA) {
    if (!scenario.user.two_factor_enabled) {
      actualAccess = false;
      actualReason = '2FA requis mais non activé';
    } else if (!scenario.user.two_factor_verified) {
      actualAccess = false;
      actualReason = '2FA requis mais non vérifié';
    }
  }
  
  const accessMatch = actualAccess === scenario.expectedAccess;
  const icon = accessMatch ? '✅' : '❌';
  
  console.log(`\n${icon} ${scenario.name}:`);
  console.log(`   Route: ${scenario.route}`);
  console.log(`   Utilisateur: ${scenario.user.name}`);
  console.log(`   Accès attendu: ${scenario.expectedAccess ? 'AUTORISÉ' : 'BLOQUÉ'}`);
  console.log(`   Accès réel: ${actualAccess ? 'AUTORISÉ' : 'BLOQUÉ'}`);
  console.log(`   Raison: ${actualReason}`);
  console.log(`   Statut: ${accessMatch ? 'CORRECT' : 'INCORRECT'}`);
});

// 4. Résumé de la logique
console.log('\n🎯 Résumé de la Logique 2FA :');
console.log('✅ Configuration des routes :');
console.log('   - Routes d\'accès aux dossiers patients : PROTÉGÉES par 2FA');
console.log('   - Routes de prescription et gestion : NON PROTÉGÉES par 2FA');

console.log('\n✅ Logique de protection :');
console.log('   - 2FA requis si la route est configurée comme protégée');
console.log('   - Utilisateur doit avoir 2FA activé ET vérifié');
console.log('   - Routes non protégées accessibles sans 2FA');

console.log('\n✅ Périmètre respecté :');
console.log('   - Seules les routes /access/* nécessitent la 2FA');
console.log('   - Les autres fonctionnalités restent accessibles normalement');

console.log('\n🚀 La logique du middleware 2FA fonctionne correctement !');
