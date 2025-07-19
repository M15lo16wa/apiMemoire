const express = require("express");
const cors = require("cors");
const morgan = require('morgan');
const globalErrorHandler = require('./middlewares/error.middleware');
const apiRoutes = require('./routes/api');
const AppError = require('./utils/appError');

const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

// creation de l'application express
const app = express();

// middleware general
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Optionnel: Logging des requêtes HTTP en mode dev
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// definition des routes de l'api
app.use('/api', apiRoutes);

// Configuration Swagger
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Gestion Hospitalière',
    version: '1.0.0',
    description: 'Documentation interactive de l\'API du système de gestion hospitalière',
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Serveur local',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Utilisateur: {
        type: 'object',
        properties: {
          id_utilisateur: {
            type: 'integer',
            description: 'Identifiant unique de l\'utilisateur'
          },
          nom: {
            type: 'string',
            description: 'Nom de famille de l\'utilisateur'
          },
          prenom: {
            type: 'string',
            description: 'Prénom de l\'utilisateur'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Adresse email de l\'utilisateur'
          },
          role: {
            type: 'string',
            enum: ['admin', 'secretaire', 'visiteur'],
            description: 'Rôle de l\'utilisateur'
          },
          statut: {
            type: 'string',
            enum: ['actif', 'inactif', 'en_attente_validation', 'suspendu'],
            description: 'Statut du compte utilisateur'
          },
          date_derniere_connexion: {
            type: 'string',
            format: 'date-time',
            description: 'Date de dernière connexion'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Date de création du compte'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Date de dernière mise à jour'
          }
        }
      },
      ProfessionnelSante: {
        type: 'object',
        properties: {
          id_professionnel: {
            type: 'integer',
            description: 'Identifiant unique du professionnel'
          },
          nom: {
            type: 'string',
            description: 'Nom de famille du professionnel'
          },
          prenom: {
            type: 'string',
            description: 'Prénom du professionnel'
          },
          date_naissance: {
            type: 'string',
            format: 'date',
            description: 'Date de naissance du professionnel'
          },
          sexe: {
            type: 'string',
            enum: ['M', 'F', 'Autre', 'Non précisé'],
            description: 'Sexe du professionnel'
          },
          specialite: {
            type: 'string',
            description: 'Spécialité du professionnel'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Adresse email du professionnel'
          },
          telephone: {
            type: 'string',
            description: 'Numéro de téléphone du professionnel'
          },
          role: {
            type: 'string',
            enum: ['medecin', 'infirmier', 'secretaire', 'aide_soignant', 'technicien_laboratoire', 'pharmacien', 'kinesitherapeute', 'chirurgien', 'radiologue', 'anesthesiste', 'autre'],
            description: 'Rôle professionnel'
          },
          numero_licence: {
            type: 'string',
            description: 'Numéro de licence professionnelle'
          },
          statut: {
            type: 'string',
            enum: ['actif', 'inactif', 'en_conges', 'retraite'],
            description: 'Statut professionnel'
          },
          date_embauche: {
            type: 'string',
            format: 'date',
            description: 'Date d\'embauche'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Date de création'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Date de dernière mise à jour'
          }
        }
      },
      Patient: {
        type: 'object',
        properties: {
          id_patient: {
            type: 'integer',
            description: 'Identifiant unique du patient'
          },
          nom: {
            type: 'string',
            description: 'Nom de famille du patient'
          },
          prenom: {
            type: 'string',
            description: 'Prénom du patient'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Adresse email du patient'
          },
          date_naissance: {
            type: 'string',
            format: 'date',
            description: 'Date de naissance du patient'
          },
          age: {
            type: 'integer',
            minimum: 0,
            maximum: 150,
            description: 'Âge du patient'
          },
          sexe: {
            type: 'string',
            enum: ['M', 'F', 'Autre', 'Non précisé'],
            description: 'Sexe du patient'
          },
          telephone: {
            type: 'string',
            description: 'Numéro de téléphone du patient'
          },
          adresse: {
            type: 'string',
            description: 'Adresse du patient'
          },
          code_postal: {
            type: 'string',
            description: 'Code postal'
          },
          ville: {
            type: 'string',
            description: 'Ville de résidence'
          },
          pays: {
            type: 'string',
            description: 'Pays de résidence'
          },
          lieu_naissance: {
            type: 'string',
            description: 'Lieu de naissance'
          },
          groupe_sanguin: {
            type: 'string',
            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Inconnu'],
            description: 'Groupe sanguin du patient'
          },
          assurance_maladie: {
            type: 'string',
            description: 'Assurance maladie'
          },
          numero_assurance: {
            type: 'string',
            description: 'Numéro d\'assurance'
          },
          personne_urgence_nom: {
            type: 'string',
            description: 'Nom de la personne à contacter en cas d\'urgence'
          },
          personne_urgence_telephone: {
            type: 'string',
            description: 'Téléphone de la personne à contacter en cas d\'urgence'
          },
          personne_urgence_lien: {
            type: 'string',
            description: 'Lien avec la personne à contacter en cas d\'urgence'
          },
          profession: {
            type: 'string',
            description: 'Profession du patient'
          },
          situation_familiale: {
            type: 'string',
            enum: ['Célibataire', 'Marié(e)', 'Pacsé(e)', 'Divorcé(e)', 'Veuf/Veuve', 'Union libre', 'Autre'],
            description: 'Situation familiale'
          },
          nombre_enfants: {
            type: 'integer',
            minimum: 0,
            description: 'Nombre d\'enfants'
          },
          commentaires: {
            type: 'string',
            description: 'Commentaires additionnels'
          },
          statut: {
            type: 'string',
            enum: ['actif', 'inactif', 'décédé'],
            description: 'Statut médical du patient'
          },
          date_derniere_connexion: {
            type: 'string',
            format: 'date-time',
            description: 'Date de dernière connexion'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Date de création du compte'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Date de dernière mise à jour'
          }
        }
      },
      DossierMedical: {
        type: 'object',
        properties: {
          id_dossier: {
            type: 'integer',
            description: 'Identifiant unique du dossier médical'
          },
          numeroDossier: {
            type: 'string',
            description: 'Numéro unique du dossier'
          },
          dateCreation: {
            type: 'string',
            format: 'date',
            description: 'Date de création du dossier médical'
          },
          statut: {
            type: 'string',
            enum: ['Ouvert', 'Fermé', 'Archivé'],
            description: 'Statut actuel du dossier médical'
          },
          type_dossier: {
            type: 'string',
            enum: ['principal', 'specialite', 'urgence', 'suivi', 'consultation', 'autre'],
            description: 'Type de dossier médical'
          },
          patient_id: {
            type: 'integer',
            description: 'ID du patient propriétaire du dossier'
          },
          service_id: {
            type: 'integer',
            description: 'ID du service de santé responsable'
          },
          medecin_referent_id: {
            type: 'integer',
            description: 'ID du médecin référent principal'
          },
          resume: {
            type: 'string',
            description: 'Résumé clinique du patient'
          },
          antecedent_medicaux: {
            type: 'object',
            description: 'Antécédents médicaux structurés'
          },
          allergies: {
            type: 'object',
            description: 'Allergies et intolérances'
          },
          traitements_chroniques: {
            type: 'object',
            description: 'Traitements au long cours'
          },
          parametres_vitaux: {
            type: 'object',
            description: 'Derniers paramètres vitaux'
          },
          habitudes_vie: {
            type: 'object',
            description: 'Informations sur le mode de vie'
          },
          historique_familial: {
            type: 'string',
            description: 'Antécédents familiaux notables'
          },
          directives_anticipées: {
            type: 'string',
            description: 'Directives anticipées et personnes de confiance'
          },
          observations: {
            type: 'string',
            description: 'Notes et observations diverses'
          },
          createdBy: {
            type: 'integer',
            description: 'ID de l\'utilisateur ayant créé le dossier'
          },
          updatedBy: {
            type: 'integer',
            description: 'ID du dernier utilisateur ayant modifié le dossier'
          },
          date_fermeture: {
            type: 'string',
            format: 'date-time',
            description: 'Date de fermeture du dossier'
          },
          motif_fermeture: {
            type: 'string',
            description: 'Raison de la fermeture du dossier'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Date de création'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Date de dernière mise à jour'
          }
        }
      }
    }
  },
};

const options = {
  swaggerDefinition,
  // Chemins vers les fichiers contenant les annotations OpenAPI
  apis: ['./src/routes/*.js', './src/modules/**/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Gestion des routes non trouvées (404 Not Found)
app.all('*', (req, res, next) => {
    // Nous utiliserons notre gestionnaire d'erreurs global pour cela
    const err = new Error(`Can't find ${req.originalUrl} on this server!`);
    err.statusCode = 404;
    err.status = 'fail';
    next(err);
});

// Middleware de gestion globale des erreurs
app.use(globalErrorHandler);

module.exports = app;


