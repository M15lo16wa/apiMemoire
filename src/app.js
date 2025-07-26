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
    title: 'API Gestion Hospitalière - Partage Patient-Médecin',
    version: '1.0.0',
    description: 'Documentation interactive de l\'API du système de gestion hospitalière avec fonctionnalités de partage patient-médecin',
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
            enum: ['admin', 'secretaire'],
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
      Hopital: {
        type: 'object',
        properties: {
          id_hopital: {
            type: 'integer',
            description: 'Identifiant unique de l\'hôpital'
          },
          nom: {
            type: 'string',
            description: 'Nom officiel de l\'hôpital'
          },
          adresse: {
            type: 'string',
            description: 'Adresse complète de l\'hôpital'
          },
          telephone: {
            type: 'string',
            description: 'Numéro de téléphone principal de l\'hôpital'
          },
          type_etablissement: {
            type: 'string',
            enum: ['Public', 'Privé', 'Spécialisé'],
            description: 'Type d\'établissement de santé'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Date de création de l\'hôpital'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Date de dernière mise à jour de l\'hôpital'
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
          numero_adeli: {
            type: 'string',
            description: 'Numéro ADELI pour l\'authentification'
          },
          mot_de_passe: {
            type: 'string',
            description: 'Mot de passe hashé (non visible dans les réponses)'
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
      },
      Prescription: {
        type: 'object',
        properties: {
          id_prescription: {
            type: 'integer',
            description: 'Identifiant unique de la prescription'
          },
          patient_id: {
            type: 'integer',
            description: 'ID du patient'
          },
          professionnel_id: {
            type: 'integer',
            description: 'ID du professionnel de santé'
          },
          medicament: {
            type: 'string',
            description: 'Nom du médicament ou type d\'examen'
          },
          dosage: {
            type: 'string',
            description: 'Dosage ou paramètres d\'examen'
          },
          frequence: {
            type: 'string',
            description: 'Fréquence de prise ou urgence'
          },
          duree: {
            type: 'string',
            description: 'Durée du traitement'
          },
          instructions: {
            type: 'string',
            description: 'Instructions spéciales'
          },
          prescrit_traitement: {
            type: 'boolean',
            description: 'True pour ordonnance, False pour demande d\'examen'
          },
          statut: {
            type: 'string',
            enum: ['active', 'suspendue', 'terminee', 'annulee', 'en_attente'],
            description: 'Statut de la prescription'
          },
          renouvelable: {
            type: 'boolean',
            description: 'Si la prescription est renouvelable'
          },
          nb_renouvellements: {
            type: 'integer',
            description: 'Nombre de renouvellements autorisés'
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
      ExamenLabo: {
        type: 'object',
        properties: {
          id_examen: {
            type: 'integer',
            description: 'Identifiant unique de l\'examen'
          },
          patient_id: {
            type: 'integer',
            description: 'ID du patient'
          },
          professionnel_id: {
            type: 'integer',
            description: 'ID du professionnel de santé'
          },
          type_examen: {
            type: 'string',
            description: 'Type d\'examen de laboratoire'
          },
          resultat: {
            type: 'string',
            enum: ['normal', 'anormal', 'limite'],
            description: 'Résultat de l\'examen'
          },
          valeur_normale: {
            type: 'string',
            description: 'Valeurs normales de référence'
          },
          commentaire: {
            type: 'string',
            description: 'Commentaires sur le résultat'
          },
          statut: {
            type: 'string',
            enum: ['en_attente', 'valide', 'rejete'],
            description: 'Statut de validation'
          },
          date_examen: {
            type: 'string',
            format: 'date-time',
            description: 'Date de réalisation de l\'examen'
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
      RendezVous: {
        type: 'object',
        properties: {
          id_rendez_vous: {
            type: 'integer',
            description: 'Identifiant unique du rendez-vous'
          },
          patient_id: {
            type: 'integer',
            description: 'ID du patient'
          },
          id_medecin: {
            type: 'integer',
            description: 'ID du médecin'
          },
          DateHeure: {
            type: 'string',
            format: 'date-time',
            description: 'Date et heure du rendez-vous'
          },
          motif_consultation: {
            type: 'string',
            description: 'Motif de la consultation'
          },
          statut: {
            type: 'string',
            enum: ['Planifié', 'Confirmé', 'En cours', 'Terminé', 'Annulé', 'Rappel'],
            description: 'Statut du rendez-vous'
          },
          type_rappel: {
            type: 'string',
            enum: ['general', 'medicament', 'examen', 'consultation'],
            description: 'Type de rappel (si applicable)'
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
      ServiceSante: {
        type: 'object',
        properties: {
          id_service: { type: 'integer', description: 'Identifiant unique du service de santé' },
          nom: { type: 'string', description: 'Nom du service de santé' },
          type_service: { type: 'string', description: 'Type du service (ex: CARDIOLOGIE, URGENCE, etc.)' },
          hopital_id: { type: 'integer', description: "Identifiant de l'hôpital auquel appartient le service" },
          description: { type: 'string', description: 'Description du service', nullable: true },
          telephone: { type: 'string', description: 'Numéro de téléphone du service', nullable: true },
          createdAt: { type: 'string', format: 'date-time', description: 'Date de création' },
          updatedAt: { type: 'string', format: 'date-time', description: 'Date de dernière mise à jour' }
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

// Ajout des tags et des routes CRUD dans swaggerJsdoc (exemple OpenAPI)
/**
 * @swagger
 * tags:
 *   - name: ServiceSante
 *     description: Gestion des services de santé
 *
 * /api/service-sante:
 *   post:
 *     summary: Créer un service de santé
 *     tags: [ServiceSante]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceSante'
 *     responses:
 *       201:
 *         description: Service créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceSante'
 *   get:
 *     summary: Lister tous les services de santé
 *     tags: [ServiceSante]
 *     parameters:
 *       - in: query
 *         name: hopital_id
 *         schema:
 *           type: integer
 *         description: Filtrer par hôpital
 *     responses:
 *       200:
 *         description: Liste des services
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ServiceSante'
 *
 * /api/service-sante/{id}:
 *   get:
 *     summary: Détail d'un service de santé
 *     tags: [ServiceSante]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détail du service
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceSante'
 *   put:
 *     summary: Modifier un service de santé
 *     tags: [ServiceSante]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceSante'
 *     responses:
 *       200:
 *         description: Service modifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceSante'
 *   delete:
 *     summary: Supprimer un service de santé
 *     tags: [ServiceSante]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Service supprimé
 */

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


