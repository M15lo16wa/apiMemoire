'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const { DataTypes } = require('sequelize');

    // Fonction pour vérifier si une colonne existe
    const columnExists = async (tableName, columnName) => {
      try {
        const [results] = await queryInterface.sequelize.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = '${tableName}' AND column_name = '${columnName}'
        `);
        return results.length > 0;
      } catch (error) {
        return false;
      }
    };

    // Ajouter seulement les champs manquants
    const missingFields = [
      {
        name: 'prescriptionNumber',
        definition: {
          type: DataTypes.STRING(50),
          allowNull: true,
          comment: 'Numéro unique de prescription généré automatiquement'
        }
      },
      {
        name: 'type_prescription',
        definition: {
          type: DataTypes.ENUM('ordonnance', 'examen'),
          allowNull: false,
          defaultValue: 'ordonnance',
          comment: 'Type de prescription: ordonnance médicamenteuse ou demande d\'examen'
        }
      },
      {
        name: 'principe_actif',
        definition: {
          type: DataTypes.STRING(255),
          allowNull: false,
          comment: 'Principe actif (DCI) ou type d\'examen demandé'
        }
      },
      {
        name: 'pharmacieDelivrance',
        definition: {
          type: DataTypes.STRING(255),
          allowNull: true,
          comment: 'Pharmacie où les médicaments ont été délivrés'
        }
      },
      {
        name: 'signatureElectronique',
        definition: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: 'Signature électronique du médecin prescripteur'
        }
      },
      {
        name: 'qrCode',
        definition: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: 'QR Code pour vérification et traçabilité'
        }
      },
      {
        name: 'instructions_speciales',
        definition: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: 'Instructions particulières (à jeun, pendant le repas, etc.)'
        }
      },
      {
        name: 'duree_traitement',
        definition: {
          type: DataTypes.STRING(100),
          allowNull: true,
          comment: 'Durée du traitement (ex: 7 jours, 1 mois)'
        }
      }
    ];

    // Ajouter chaque champ manquant
    for (const field of missingFields) {
      if (!(await columnExists('Prescriptions', field.name))) {
        console.log(`Ajout du champ ${field.name}...`);
        await queryInterface.addColumn('Prescriptions', field.name, field.definition);
      } else {
        console.log(`Le champ ${field.name} existe déjà, ignoré.`);
      }
    }

    // Ajouter les index manquants
    try {
      await queryInterface.addIndex('Prescriptions', ['prescriptionNumber'], {
        unique: true,
        name: 'prescriptions_prescriptionnumber_unique'
      });
      console.log('Index prescriptionNumber ajouté');
    } catch (error) {
      console.log('Index prescriptionNumber déjà existant, ignoré');
    }

    try {
      await queryInterface.addIndex('Prescriptions', ['type_prescription', 'statut']);
      console.log('Index type_prescription,statut ajouté');
    } catch (error) {
      console.log('Index type_prescription,statut déjà existant, ignoré');
    }

    try {
      await queryInterface.addIndex('Prescriptions', ['principe_actif']);
      console.log('Index principe_actif ajouté');
    } catch (error) {
      console.log('Index principe_actif déjà existant, ignoré');
    }

    console.log('✅ Migration terminée avec succès!');
  },

  async down (queryInterface, Sequelize) {
    // Supprimer les champs ajoutés
    const fieldsToRemove = [
      'prescriptionNumber',
      'type_prescription', 
      'principe_actif',
      'pharmacieDelivrance',
      'signatureElectronique',
      'qrCode',
      'instructions_speciales',
      'duree_traitement'
    ];

    for (const field of fieldsToRemove) {
      try {
        await queryInterface.removeColumn('Prescriptions', field);
        console.log(`Champ ${field} supprimé`);
      } catch (error) {
        console.log(`Erreur lors de la suppression du champ ${field}:`, error.message);
      }
    }

    // Supprimer les index ajoutés
    try {
      await queryInterface.removeIndex('Prescriptions', ['prescriptionNumber']);
    } catch (error) {
      console.log('Index prescriptionNumber non trouvé, ignoré');
    }

    try {
      await queryInterface.removeIndex('Prescriptions', ['type_prescription', 'statut']);
    } catch (error) {
      console.log('Index type_prescription,statut non trouvé, ignoré');
    }

    try {
      await queryInterface.removeIndex('Prescriptions', ['principe_actif']);
    } catch (error) {
      console.log('Index principe_actif non trouvé, ignoré');
    }
  }
}; 