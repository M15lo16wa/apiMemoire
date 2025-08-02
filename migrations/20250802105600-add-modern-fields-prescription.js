'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Ajouter le champ type_prescription
      await queryInterface.addColumn('Prescriptions', 'type_prescription', {
        type: Sequelize.ENUM('ordonnance', 'examen'),
        allowNull: false,
        defaultValue: 'ordonnance',
        comment: 'Type de prescription: ordonnance médicamenteuse ou demande d\'examen'
      });
      console.log('✅ Colonne type_prescription ajoutée');

      // Ajouter le champ principe_actif
      await queryInterface.addColumn('Prescriptions', 'principe_actif', {
        type: Sequelize.STRING(255),
        allowNull: true, // Temporairement nullable pour la migration
        comment: 'Principe actif (DCI) ou type d\'examen demandé'
      });
      console.log('✅ Colonne principe_actif ajoutée');

      // Ajouter le champ instructions_speciales
      await queryInterface.addColumn('Prescriptions', 'instructions_speciales', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Instructions particulières (à jeun, pendant le repas, etc.)'
      });
      console.log('✅ Colonne instructions_speciales ajoutée');

      // Ajouter le champ duree_traitement
      await queryInterface.addColumn('Prescriptions', 'duree_traitement', {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Durée du traitement (ex: 7 jours, 1 mois)'
      });
      console.log('✅ Colonne duree_traitement ajoutée');

      // Modifier prescriptionNumber pour le rendre nullable (sera généré automatiquement)
      await queryInterface.changeColumn('Prescriptions', 'prescriptionNumber', {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true,
        comment: 'Numéro unique de prescription généré automatiquement'
      });
      console.log('✅ Colonne prescriptionNumber modifiée');

      // Améliorer les commentaires des colonnes existantes
      await queryInterface.changeColumn('Prescriptions', 'pharmacieDelivrance', {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Pharmacie où les médicaments ont été délivrés'
      });

      await queryInterface.changeColumn('Prescriptions', 'signatureElectronique', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Signature électronique du médecin prescripteur'
      });

      await queryInterface.changeColumn('Prescriptions', 'qrCode', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'QR Code pour vérification et traçabilité'
      });

      // Ajouter des index pour optimiser les performances
      await queryInterface.addIndex('Prescriptions', ['type_prescription', 'statut'], {
        name: 'idx_prescriptions_type_statut'
      });
      console.log('✅ Index type_prescription_statut ajouté');

      await queryInterface.addIndex('Prescriptions', ['patient_id', 'date_prescription'], {
        name: 'idx_prescriptions_patient_date'
      });
      console.log('✅ Index patient_date ajouté');

      await queryInterface.addIndex('Prescriptions', ['professionnel_id', 'date_prescription'], {
        name: 'idx_prescriptions_professionnel_date'
      });
      console.log('✅ Index professionnel_date ajouté');

      console.log('🎉 Migration des champs modernes terminée avec succès');

    } catch (error) {
      console.error('❌ Erreur lors de la migration:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Supprimer les index ajoutés
      await queryInterface.removeIndex('Prescriptions', 'idx_prescriptions_type_statut');
      await queryInterface.removeIndex('Prescriptions', 'idx_prescriptions_patient_date');
      await queryInterface.removeIndex('Prescriptions', 'idx_prescriptions_professionnel_date');
      console.log('✅ Index supprimés');

      // Supprimer les nouvelles colonnes
      await queryInterface.removeColumn('Prescriptions', 'type_prescription');
      await queryInterface.removeColumn('Prescriptions', 'principe_actif');
      await queryInterface.removeColumn('Prescriptions', 'instructions_speciales');
      await queryInterface.removeColumn('Prescriptions', 'duree_traitement');
      console.log('✅ Nouvelles colonnes supprimées');

      // Restaurer prescriptionNumber comme non-nullable
      await queryInterface.changeColumn('Prescriptions', 'prescriptionNumber', {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      });
      console.log('✅ Colonne prescriptionNumber restaurée');

      // Restaurer les colonnes existantes
      await queryInterface.changeColumn('Prescriptions', 'pharmacieDelivrance', {
        type: Sequelize.STRING,
        allowNull: true
      });

      await queryInterface.changeColumn('Prescriptions', 'signatureElectronique', {
        type: Sequelize.TEXT,
        allowNull: true
      });

      await queryInterface.changeColumn('Prescriptions', 'qrCode', {
        type: Sequelize.TEXT,
        allowNull: true
      });

      console.log('🔄 Rollback de la migration terminé');

    } catch (error) {
      console.error('❌ Erreur lors du rollback:', error);
      throw error;
    }
  }
};