/**
 * Middleware de validation des paramètres de route
 * Empêche les erreurs avec des valeurs null, undefined ou invalides
 */

const validateRouteParams = (paramNames) => {
    return (req, res, next) => {
        const errors = [];
        
        paramNames.forEach(paramName => {
            const paramValue = req.params[paramName];
            
            // Vérifier si le paramètre existe et n'est pas null/undefined
            if (!paramValue || paramValue === 'null' || paramValue === 'undefined') {
                errors.push({
                    param: paramName,
                    value: paramValue,
                    message: `Le paramètre '${paramName}' est requis et ne peut pas être null ou undefined`
                });
            }
            
            // Vérifier si c'est un ID numérique valide
            if (paramName.toLowerCase().includes('id') || paramName.toLowerCase().includes('_id')) {
                const numericValue = parseInt(paramValue, 10);
                if (isNaN(numericValue) || numericValue <= 0) {
                    errors.push({
                        param: paramName,
                        value: paramValue,
                        message: `Le paramètre '${paramName}' doit être un ID numérique valide`
                    });
                }
            }
        });
        
        if (errors.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Paramètres de route invalides',
                errors: errors,
                receivedParams: req.params
            });
        }
        
        next();
    };
};

/**
 * Middleware spécifique pour les IDs de dossier médical
 */
const validateDossierMedicalId = (req, res, next) => {
    const { id } = req.params;
    
    // Validation stricte de l'ID
    if (!id || id === 'null' || id === 'undefined' || id === '') {
        return res.status(400).json({
            status: 'error',
            message: 'ID du dossier médical requis et valide',
            receivedId: id,
            errorCode: 'INVALID_DOSSIER_ID'
        });
    }
    
    // Conversion et validation numérique
    const dossierId = parseInt(id, 10);
    if (isNaN(dossierId) || dossierId <= 0) {
        return res.status(400).json({
            status: 'error',
            message: 'ID du dossier médical doit être un nombre valide',
            receivedId: id,
            parsedId: dossierId,
            errorCode: 'INVALID_DOSSIER_ID_FORMAT'
        });
    }
    
    // Ajouter l'ID validé à la requête pour éviter de refaire la conversion
    req.validatedParams = req.validatedParams || {};
    req.validatedParams.dossierId = dossierId;
    
    next();
};

/**
 * Middleware pour valider les IDs de patient
 */
const validatePatientId = (req, res, next) => {
    const { patient_id } = req.params;
    
    if (!patient_id || patient_id === 'null' || patient_id === 'undefined' || patient_id === '') {
        return res.status(400).json({
            status: 'error',
            message: 'ID du patient requis et valide',
            receivedId: patient_id,
            errorCode: 'INVALID_PATIENT_ID'
        });
    }
    
    const patientId = parseInt(patient_id, 10);
    if (isNaN(patientId) || patientId <= 0) {
        return res.status(400).json({
            status: 'error',
            message: 'ID du patient doit être un nombre valide',
            receivedId: patient_id,
            parsedId: patientId,
            errorCode: 'INVALID_PATIENT_ID_FORMAT'
        });
    }
    
    req.validatedParams = req.validatedParams || {};
    req.validatedParams.patientId = patientId;
    
    next();
};

module.exports = {
    validateRouteParams,
    validateDossierMedicalId,
    validatePatientId
};
