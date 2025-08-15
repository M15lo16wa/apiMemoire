const { getAuthorizationContext } = require('./src/middlewares/access.middleware');

// Mock de la requête Express
const mockReq = {
  params: { id: '9' }, // Utiliser 'id' au lieu de 'authorizationId'
  app: {
    locals: {}
  }
};

// Mock de la réponse Express
const mockRes = {};

// Mock de la fonction next
const mockNext = (error) => {
  if (error) {
    console.error('❌ Erreur dans next:', error.message);
  } else {
    console.log('✅ next() appelé sans erreur');
  }
};

async function testAuthorizationContext() {
  try {
    console.log('🧪 Test du middleware getAuthorizationContext avec l\'autorisation ID 9');
    console.log('==================================================================');
    
    // Appeler le middleware
    await getAuthorizationContext(mockReq, mockRes, mockNext);
    
    console.log('✅ Test terminé');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAuthorizationContext();
