/**
 * Documentation Swagger pour les auto-mesures
 */

const autoMesureSwagger = {
    components: {
        schemas: {
            AutoMesure: {
                type: 'object',
                properties: {
                    id: {
                        type: 'integer',
                        description: 'Identifiant unique de l\'auto-mesure'
                    },
                    patient_id: {
                        type: 'integer',
                        description: 'ID du patient propriétaire de l\'auto-mesure'
                    },
                    type_mesure: {
                        type: 'string',
                        enum: ['poids', 'taille', 'tension_arterielle', 'glycemie', 'temperature', 'saturation'],
                        description: 'Type de mesure effectuée'
                    },
                    valeur: {
                        type: 'number',
                        format: 'float',
                        description: 'Valeur principale de la mesure'
                    },
                    valeur_secondaire: {
                        type: 'number',
                        format: 'float',
                        description: 'Valeur secondaire (ex: diastolique pour tension)'
                    },
                    unite: {
                        type: 'string',
                        description: 'Unité de mesure principale'
                    },
                    unite_secondaire: {
                        type: 'string',
                        description: 'Unité de mesure secondaire'
                    },
                    date_mesure: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Date de la mesure'
                    },
                    heure_mesure: {
                        type: 'string',
                        format: 'time',
                        description: 'Heure de la mesure'
                    },
                    notes: {
                        type: 'string',
                        description: 'Notes additionnelles sur la mesure'
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Date de création de l\'enregistrement'
                    },
                    updatedAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Date de dernière modification'
                    }
                },
                required: ['patient_id', 'type_mesure', 'valeur'],
                example: {
                    id: 1,
                    patient_id: 123,
                    type_mesure: "tension_arterielle",
                    valeur: 120.0,
                    valeur_secondaire: 80.0,
                    unite: "mmHg",
                    unite_secondaire: "mmHg",
                    date_mesure: "2025-08-16T10:00:00.000Z",
                    heure_mesure: "10:00:00",
                    notes: "Mesure effectuée au repos",
                    createdAt: "2025-08-16T10:00:00.000Z",
                    updatedAt: "2025-08-16T10:00:00.000Z"
                }
            },

            AutoMesureCreate: {
                type: 'object',
                properties: {
                    type_mesure: {
                        type: 'string',
                        enum: ['poids', 'taille', 'tension_arterielle', 'glycemie', 'temperature', 'saturation'],
                        description: 'Type de mesure à effectuer'
                    },
                    valeur: {
                        type: 'number',
                        format: 'float',
                        description: 'Valeur de la mesure'
                    },
                    valeur_secondaire: {
                        type: 'number',
                        format: 'float',
                        description: 'Valeur secondaire si applicable'
                    },
                    unite: {
                        type: 'string',
                        description: 'Unité de mesure'
                    },
                    unite_secondaire: {
                        type: 'string',
                        description: 'Unité de mesure secondaire'
                    },
                    date_mesure: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Date de la mesure (optionnel, défaut: maintenant)'
                    },
                    heure_mesure: {
                        type: 'string',
                        format: 'time',
                        description: 'Heure de la mesure (optionnel, défaut: maintenant)'
                    },
                    notes: {
                        type: 'string',
                        description: 'Notes sur la mesure'
                    }
                },
                required: ['type_mesure', 'valeur'],
                example: {
                    type_mesure: "glycemie",
                    valeur: 95.0,
                    unite: "mg/dL",
                    notes: "Mesure à jeun"
                }
            },

            AutoMesureUpdate: {
                type: 'object',
                properties: {
                    type_mesure: {
                        type: 'string',
                        enum: ['poids', 'taille', 'tension_arterielle', 'glycemie', 'temperature', 'saturation']
                    },
                    valeur: {
                        type: 'number',
                        format: 'float'
                    },
                    valeur_secondaire: {
                        type: 'number',
                        format: 'float'
                    },
                    unite: {
                        type: 'string'
                    },
                    unite_secondaire: {
                        type: 'string'
                    },
                    date_mesure: {
                        type: 'string',
                        format: 'date-time'
                    },
                    heure_mesure: {
                        type: 'string',
                        format: 'time'
                    },
                    notes: {
                        type: 'string'
                    }
                }
            },

            AutoMesureStats: {
                type: 'object',
                properties: {
                    type_mesure: {
                        type: 'string',
                        description: 'Type de mesure'
                    },
                    total_mesures: {
                        type: 'integer',
                        description: 'Nombre total de mesures'
                    },
                    moyenne: {
                        type: 'number',
                        format: 'float',
                        description: 'Valeur moyenne'
                    },
                    minimum: {
                        type: 'number',
                        format: 'float',
                        description: 'Valeur minimale'
                    },
                    maximum: {
                        type: 'number',
                        format: 'float',
                        description: 'Valeur maximale'
                    },
                    derniere_mesure: {
                        type: 'string',
                        format: 'date',
                        description: 'Date de la dernière mesure'
                    }
                }
            }
        }
    },

    paths: {
        '/api/patient/auto-mesures': {
            post: {
                tags: ['AutoMesures'],
                summary: 'Créer une nouvelle auto-mesure',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/AutoMesureCreate'
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'Auto-mesure créée avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        status: {
                                            type: 'string',
                                            example: 'success'
                                        },
                                        message: {
                                            type: 'string',
                                            example: 'Auto-mesure créée avec succès'
                                        },
                                        data: {
                                            $ref: '#/components/schemas/AutoMesure'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: {
                        description: 'Données invalides'
                    },
                    401: {
                        description: 'Non autorisé'
                    },
                    500: {
                        description: 'Erreur serveur'
                    }
                }
            },
            get: {
                tags: ['AutoMesures'],
                summary: 'Récupérer toutes les auto-mesures (avec filtres)',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: 'query',
                        name: 'patient_id',
                        schema: { type: 'integer' },
                        description: 'Filtrer par ID du patient'
                    },
                    {
                        in: 'query',
                        name: 'type_mesure',
                        schema: {
                            type: 'string',
                            enum: ['poids', 'taille', 'tension_arterielle', 'glycemie', 'temperature', 'saturation']
                        },
                        description: 'Filtrer par type de mesure'
                    },
                    {
                        in: 'query',
                        name: 'limit',
                        schema: { type: 'integer', default: 100 },
                        description: 'Nombre maximum de résultats'
                    },
                    {
                        in: 'query',
                        name: 'offset',
                        schema: { type: 'integer', default: 0 },
                        description: 'Nombre de résultats à ignorer'
                    }
                ],
                responses: {
                    200: {
                        description: 'Liste des auto-mesures récupérée avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        status: { type: 'string', example: 'success' },
                                        results: { type: 'integer', example: 25 },
                                        data: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/AutoMesure' }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'Non autorisé' },
                    500: { description: 'Erreur serveur' }
                }
            }
        },

        '/api/patient/auto-mesures/{id}': {
            get: {
                tags: ['AutoMesures'],
                summary: 'Récupérer une auto-mesure par ID',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: 'path',
                        name: 'id',
                        required: true,
                        schema: { type: 'integer' },
                        description: 'ID de l\'auto-mesure'
                    }
                ],
                responses: {
                    200: {
                        description: 'Auto-mesure récupérée avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        status: { type: 'string', example: 'success' },
                                        data: { $ref: '#/components/schemas/AutoMesure' }
                                    }
                                }
                            }
                        }
                    },
                    404: { description: 'Auto-mesure non trouvée' },
                    401: { description: 'Non autorisé' },
                    403: { description: 'Accès interdit' },
                    500: { description: 'Erreur serveur' }
                }
            },
            put: {
                tags: ['AutoMesures'],
                summary: 'Mettre à jour une auto-mesure',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: 'path',
                        name: 'id',
                        required: true,
                        schema: { type: 'integer' },
                        description: 'ID de l\'auto-mesure'
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AutoMesureUpdate' }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Auto-mesure mise à jour avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        status: { type: 'string', example: 'success' },
                                        message: { type: 'string', example: 'Auto-mesure mise à jour avec succès' },
                                        data: { $ref: '#/components/schemas/AutoMesure' }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: 'Données invalides' },
                    404: { description: 'Auto-mesure non trouvée' },
                    401: { description: 'Non autorisé' },
                    403: { description: 'Accès interdit' },
                    500: { description: 'Erreur serveur' }
                }
            },
            delete: {
                tags: ['AutoMesures'],
                summary: 'Supprimer une auto-mesure',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: 'path',
                        name: 'id',
                        required: true,
                        schema: { type: 'integer' },
                        description: 'ID de l\'auto-mesure'
                    }
                ],
                responses: {
                    200: {
                        description: 'Auto-mesure supprimée avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        status: { type: 'string', example: 'success' },
                                        message: { type: 'string', example: 'Auto-mesure supprimée avec succès' }
                                    }
                                }
                            }
                        }
                    },
                    404: { description: 'Auto-mesure non trouvée' },
                    401: { description: 'Non autorisé' },
                    403: { description: 'Accès interdit' },
                    500: { description: 'Erreur serveur' }
                }
            }
        },

        '/api/patient/{patient_id}/auto-mesures': {
            get: {
                tags: ['AutoMesures'],
                summary: 'Récupérer toutes les auto-mesures d\'un patient spécifique',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: 'path',
                        name: 'patient_id',
                        required: true,
                        schema: { type: 'integer' },
                        description: 'ID du patient'
                    },
                    {
                        in: 'query',
                        name: 'type_mesure',
                        schema: {
                            type: 'string',
                            enum: ['poids', 'taille', 'tension_arterielle', 'glycemie', 'temperature', 'saturation']
                        },
                        description: 'Filtrer par type de mesure'
                    }
                ],
                responses: {
                    200: {
                        description: 'Liste des auto-mesures du patient récupérée avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        status: { type: 'string', example: 'success' },
                                        results: { type: 'integer', example: 15 },
                                        data: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/AutoMesure' }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'Non autorisé' },
                    403: { description: 'Accès interdit' },
                    500: { description: 'Erreur serveur' }
                }
            }
        },

        '/api/patient/{patient_id}/auto-mesures/stats': {
            get: {
                tags: ['AutoMesures'],
                summary: 'Obtenir les statistiques des auto-mesures d\'un patient',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: 'path',
                        name: 'patient_id',
                        required: true,
                        schema: { type: 'integer' },
                        description: 'ID du patient'
                    },
                    {
                        in: 'query',
                        name: 'type_mesure',
                        schema: {
                            type: 'string',
                            enum: ['poids', 'taille', 'tension_arterielle', 'glycemie', 'temperature', 'saturation']
                        },
                        description: 'Filtrer par type de mesure (optionnel)'
                    }
                ],
                responses: {
                    200: {
                        description: 'Statistiques récupérées avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        status: { type: 'string', example: 'success' },
                                        data: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/AutoMesureStats' }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'Non autorisé' },
                    403: { description: 'Accès interdit' },
                    500: { description: 'Erreur serveur' }
                }
            }
        },

        '/api/patient/{patient_id}/auto-mesures/last/{type_mesure}': {
            get: {
                tags: ['AutoMesures'],
                summary: 'Obtenir la dernière auto-mesure d\'un patient par type',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: 'path',
                        name: 'patient_id',
                        required: true,
                        schema: { type: 'integer' },
                        description: 'ID du patient'
                    },
                    {
                        in: 'path',
                        name: 'type_mesure',
                        required: true,
                        schema: {
                            type: 'string',
                            enum: ['poids', 'taille', 'tension_arterielle', 'glycemie', 'temperature', 'saturation']
                        },
                        description: 'Type de mesure'
                    }
                ],
                responses: {
                    200: {
                        description: 'Dernière auto-mesure récupérée avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        status: { type: 'string', example: 'success' },
                                        data: { $ref: '#/components/schemas/AutoMesure' }
                                    }
                                }
                            }
                        }
                    },
                    404: { description: 'Aucune auto-mesure trouvée pour ce type' },
                    401: { description: 'Non autorisé' },
                    403: { description: 'Accès interdit' },
                    500: { description: 'Erreur serveur' }
                }
            }
        }
    }
};

module.exports = autoMesureSwagger;
