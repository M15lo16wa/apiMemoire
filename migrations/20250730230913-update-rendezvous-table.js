'use strict';

const DataTypes = require('sequelize/lib/data-types');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Helper function to check if a column exists
    const columnExists = async (tableName, columnName) => {
      try {
        const tableDescription = await queryInterface.describeTable(tableName);
        return columnName in tableDescription;
      } catch (error) {
        console.error(`Error checking column ${columnName}:`, error);
        return false;
      }
    };

    // Helper function to check if an ENUM type exists
    const enumTypeExists = async (typeName) => {
      try {
        const result = await queryInterface.sequelize.query(`
          SELECT EXISTS (
            SELECT 1
            FROM pg_type
            WHERE typname = '${typeName}'
          );
        `);
        return result[0][0].exists;
      } catch (error) {
        console.error(`Error checking ENUM type ${typeName}:`, error);
        return false;
      }
    };

    // Step 1: Rename columns to match the model if they exist
    if (await columnExists('RendezVous', 'date_heure')) {
      await queryInterface.renameColumn('RendezVous', 'date_heure', 'DateHeure');
    }
    if (await columnExists('RendezVous', 'motif')) {
      await queryInterface.renameColumn('RendezVous', 'motif', 'motif_consultation');
    }
    if (await columnExists('RendezVous', 'id_medecin')) {
      await queryInterface.renameColumn('RendezVous', 'id_medecin', 'id_professionnel');
    }

    // Step 2: Remove fields not in the model if they exist
    const columnsToRemove = [
      'date_heure_fin',
      'type_rendezvous',
      'duree',
      'rappel_envoye',
      'date_rappel',
      'patient_id',
      'professionnel_id',
      'salle_id',
      'createdBy',
      'updatedBy',
      'date_annulation',
      'motif_annulation',
      'description',
      'deletedAt'
    ];
    for (const column of columnsToRemove) {
      if (await columnExists('RendezVous', column)) {
        await queryInterface.removeColumn('RendezVous', column);
      }
    }

    // Step 3: Add fields from the model if they don't exist
    const columnsToAdd = [
      {
        name: 'nom',
        definition: {
          type: DataTypes.STRING,
          allowNull: false,
          comment: 'Nom du patient'
        }
      },
      {
        name: 'prenom',
        definition: {
          type: DataTypes.STRING,
          allowNull: false,
          comment: 'Prénom du patient'
        }
      },
      {
        name: 'email',
        definition: {
          type: DataTypes.STRING,
          allowNull: false,
          comment: 'Email du patient'
        }
      },
      {
        name: 'dateNaissance',
        definition: {
          type: DataTypes.DATEONLY,
          allowNull: false,
          comment: 'Date de naissance du patient'
        }
      },
      {
        name: 'sexe',
        definition: {
          type: DataTypes.ENUM('Masculin', 'Feminin', 'Autre', 'Inconnu'),
          allowNull: false,
          comment: 'Sexe du patient'
        }
      },
      {
        name: 'telephone',
        definition: {
          type: DataTypes.STRING,
          allowNull: false,
          comment: 'Numéro de téléphone du patient'
        }
      },
      {
        name: 'id_hopital',
        definition: {
          type: DataTypes.INTEGER,
          allowNull: false,
          comment: 'ID de l\'hôpital'
        }
      },
      {
        name: 'id_service',
        definition: {
          type: DataTypes.INTEGER,
          allowNull: false,
          comment: 'ID du service'
        }
      },
      {
        name: 'id_professionnel',
        definition: {
          type: DataTypes.INTEGER,
          allowNull: true,
          comment: 'ID du professionnel de santé'
        }
      },
      {
        name: 'numero_assure',
        definition: {
          type: DataTypes.STRING,
          allowNull: false,
          comment: 'Numéro d\'assuré'
        }
      },
      {
        name: 'assureur',
        definition: {
          type: DataTypes.STRING,
          allowNull: false,
          comment: 'Nom de l\'assureur'
        }
      }
    ];
    for (const { name, definition } of columnsToAdd) {
      if (!(await columnExists('RendezVous', name))) {
        await queryInterface.addColumn('RendezVous', name, definition);
      }
    }

    // Step 4: Update ENUM for statut if it exists (PostgreSQL-specific handling)
    if (await columnExists('RendezVous', 'statut')) {
      // Drop temporary ENUM type if it exists from a previous failed migration
      if (await enumTypeExists('enum_RendezVous_statut_new')) {
        await queryInterface.sequelize.query(`
          DROP TYPE IF EXISTS "enum_RendezVous_statut_new";
        `);
      }

      // Create a new ENUM type
      await queryInterface.sequelize.query(`
        CREATE TYPE "enum_RendezVous_statut_new" AS ENUM ('Planifié', 'Confirmé', 'Annulé', 'Terminé');
      `);

      // Drop the existing default value to avoid conversion issues
      await queryInterface.sequelize.query(`
        ALTER TABLE "RendezVous"
        ALTER COLUMN statut DROP DEFAULT;
      `);

      // Change the column to use the new ENUM type and map existing values
      await queryInterface.sequelize.query(`
        ALTER TABLE "RendezVous"
        ALTER COLUMN statut TYPE "enum_RendezVous_statut_new"
        USING (CASE
          WHEN statut = 'planifie' THEN 'Planifié'::"enum_RendezVous_statut_new"
          WHEN statut = 'confirme' THEN 'Confirmé'::"enum_RendezVous_statut_new"
          WHEN statut = 'annule' THEN 'Annulé'::"enum_RendezVous_statut_new"
          WHEN statut = 'termine' THEN 'Terminé'::"enum_RendezVous_statut_new"
          ELSE 'Planifié'::"enum_RendezVous_statut_new"
        END);
      `);

      // Drop the old ENUM type
      await queryInterface.sequelize.query(`
        DROP TYPE IF EXISTS "enum_RendezVous_statut";
      `);

      // Rename the new ENUM type to the original name
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_RendezVous_statut_new" RENAME TO "enum_RendezVous_statut";
      `);

      // Set the new default value and not null constraint
      await queryInterface.sequelize.query(`
        ALTER TABLE "RendezVous"
        ALTER COLUMN statut SET DEFAULT 'Planifié',
        ALTER COLUMN statut SET NOT NULL;
      `);
    }

    // Step 5: Update notes if it exists
    if (await columnExists('RendezVous', 'notes')) {
      await queryInterface.changeColumn('RendezVous', 'notes', {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Notes complémentaires sur le rendez-vous'
      });
    }

    // Step 6: Remove old indexes if they exist
    const indexesToRemove = [
      'rendez_vous_date_heure',
      'rendez_vous_patient_id',
      'rendez_vous_professionnel_id',
      'rendez_vous_salle_id',
      'rendez_vous_type_rendezvous',
      'rendez_vous_id_medecin' // Remove old id_medecin index if it exists
    ];
    for (const index of indexesToRemove) {
      try {
        await queryInterface.removeIndex('RendezVous', index);
      } catch (error) {
        console.warn(`Index ${index} does not exist, skipping removal.`);
      }
    }

    // Step 7: Add new indexes for frequently queried fields
    const indexesToAdd = ['DateHeure', 'id_hopital', 'id_service', 'id_professionnel', 'statut'];
    for (const field of indexesToAdd) {
      try {
        await queryInterface.addIndex('RendezVous', [field]);
      } catch (error) {
        console.warn(`Index on ${field} already exists or cannot be created, skipping.`);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // Helper function to check if a column exists
    const columnExists = async (tableName, columnName) => {
      try {
        const tableDescription = await queryInterface.describeTable(tableName);
        return columnName in tableDescription;
      } catch (error) {
        console.error(`Error checking column ${columnName}:`, error);
        return false;
      }
    };

    // Step 1: Rename id_professionnel back to id_medecin if it exists
    if (await columnExists('RendezVous', 'id_professionnel')) {
      await queryInterface.renameColumn('RendezVous', 'id_professionnel', 'id_medecin');
    }

    // Step 2: Drop the table
    await queryInterface.dropTable('RendezVous');

    // Step 3: Recreate the original table as per the initial migration
    await queryInterface.createTable('RendezVous', {
      id_rendezvous: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'Identifiant unique du rendez-vous'
      },
      date_heure: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Date et heure prévues du rendez-vous',
        validate: {
          isDate: {
            msg: 'La date et heure doivent être une valeur valide'
          },
          isAfter: {
            args: new Date().toISOString(),
            msg: 'La date du rendez-vous doit être dans le futur'
          }
        }
      },
      date_heure_fin: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date et heure de fin prévue du rendez-vous',
        validate: {
          isDate: {
            msg: 'La date et heure de fin doivent être une valeur valide'
          },
          isAfter: {
            args: [Sequelize.col('date_heure')],
            msg: 'La date de fin doit être postérieure à la date de début'
          }
        }
      },
      motif: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Motif de la consultation',
        validate: {
          notEmpty: {
            msg: 'Le motif de la consultation est obligatoire'
          },
          len: {
            args: [5, 255],
            msg: 'Le motif doit contenir entre 5 et 255 caractères'
          }
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Description détaillée des symptômes ou de la raison de la visite'
      },
      statut: {
        type: DataTypes.ENUM('planifie', 'confirme', 'en_attente', 'en_cours', 'termine', 'annule', 'reporte'),
        defaultValue: 'planifie',
        allowNull: false,
        comment: 'Statut actuel du rendez-vous'
      },
      type_rendezvous: {
        type: DataTypes.ENUM('consultation', 'controle', 'urgence', 'bilan', 'autre'),
        allowNull: false,
        defaultValue: 'consultation',
        comment: 'Type de rendez-vous'
      },
      duree: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30,
        comment: 'Durée prévue en minutes',
        validate: {
          min: {
            args: [5],
            msg: 'La durée minimale est de 5 minutes'
          },
          max: {
            args: [240],
            msg: 'La durée maximale est de 4 heures (240 minutes)'
          }
        }
      },
      rappel_envoye: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Indique si un rappel a été envoyé pour ce rendez-vous'
      },
      date_rappel: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date à laquelle le rappel a été envoyé'
      },
      patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID du patient concerné (géré dans index.js)'
      },
      professionnel_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID du professionnel de santé assigné (géré dans index.js)'
      },
      service_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID du service concerné (géré dans index.js)'
      },
      salle_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID de la salle affectée (géré dans index.js)'
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID de l\'utilisateur ayant créé le rendez-vous (géré dans index.js)'
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID du dernier utilisateur ayant modifié le rendez-vous (géré dans index.js)'
      },
      date_annulation: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date à laquelle le rendez-vous a été annulé'
      },
      motif_annulation: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Raison de l\'annulation du rendez-vous'
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Notes complémentaires sur le rendez-vous'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Date de création de la fiche rendez-vous'
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Date de dernière mise à jour de la fiche rendez-vous'
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Date de suppression douce (soft delete) du rendez-vous'
      }
    });

    // Step 4: Recreate original indexes
    await queryInterface.addIndex('RendezVous', ['date_heure']);
    await queryInterface.addIndex('RendezVous', ['patient_id']);
    await queryInterface.addIndex('RendezVous', ['id_medecin']);
    await queryInterface.addIndex('RendezVous', ['service_id']);
    await queryInterface.addIndex('RendezVous', ['salle_id']);
    await queryInterface.addIndex('RendezVous', ['statut']);
    await queryInterface.addIndex('RendezVous', ['type_rendezvous']);
  }
};