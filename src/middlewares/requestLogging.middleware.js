/**
 * Middleware de logging des requêtes
 * Trace toutes les requêtes pour identifier les problèmes potentiels
 */

const requestLogging = (req, res, next) => {
    const startTime = Date.now();
    
    // Log de la requête entrante
    console.log(`📥 [${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.log(`🔍 Headers:`, {
        'user-agent': req.get('User-Agent'),
        'content-type': req.get('Content-Type'),
        'authorization': req.get('Authorization') ? 'Bearer ***' : 'none'
    });
    
    if (Object.keys(req.params).length > 0) {
        console.log(`📋 Params:`, req.params);
    }
    
    if (Object.keys(req.query).length > 0) {
        console.log(`🔍 Query:`, req.query);
    }
    
    if (req.body && Object.keys(req.body).length > 0) {
        console.log(`📦 Body:`, req.body);
    }
    
    // Intercepter la réponse pour logger les détails
    const originalSend = res.send;
    res.send = function(data) {
        const duration = Date.now() - startTime;
        
        // Log de la réponse
        console.log(`📤 [${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
        
        // Log des erreurs 4xx et 5xx
        if (res.statusCode >= 400) {
            console.log(`❌ Erreur ${res.statusCode}:`, {
                method: req.method,
                url: req.originalUrl,
                params: req.params,
                body: req.body,
                statusCode: res.statusCode,
                duration: `${duration}ms`,
                response: typeof data === 'string' ? data : JSON.stringify(data)
            });
        }
        
        // Appeler la méthode originale
        return originalSend.call(this, data);
    };
    
    next();
};

/**
 * Middleware spécifique pour détecter les requêtes avec des paramètres problématiques
 */
const detectProblematicRequests = (req, res, next) => {
    const { id, patient_id } = req.params;
    
    // Détecter les paramètres null, undefined ou vides
    if (id === 'null' || id === 'undefined' || id === '') {
        console.log(`🚨 ALERTE: Requête avec ID problématique détectée!`);
        console.log(`   URL: ${req.method} ${req.originalUrl}`);
        console.log(`   Params:`, req.params);
        console.log(`   Headers:`, req.headers);
        console.log(`   Stack trace:`, new Error().stack);
    }
    
    if (patient_id === 'null' || patient_id === 'undefined' || patient_id === '') {
        console.log(`🚨 ALERTE: Requête avec patient_id problématique détectée!`);
        console.log(`   URL: ${req.method} ${req.originalUrl}`);
        console.log(`   Params:`, req.params);
        console.log(`   Headers:`, req.headers);
        console.log(`   Stack trace:`, new Error().stack);
    }
    
    next();
};

module.exports = {
    requestLogging,
    detectProblematicRequests
};
