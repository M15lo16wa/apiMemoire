'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Vérifier la structure actuelle de la table
    const tableDescription = await queryInterface.describeTable('ServicesSante');
    
    // Supprimer les colonnes obsolètes si elles existent
    if (tableDescription.batiment) {
      await queryInterface.removeColumn('ServicesSante', 'batiment');
    }
    if (tableDescription.etage) {
      await queryInterface.removeColumn('ServicesSante', 'etage');
    }
    if (tableDescription.aile) {
      await queryInterface.removeColumn('ServicesSante', 'aile');
    }
    if (tableDescription.capacite) {
      await queryInterface.removeColumn('ServicesSante', 'capacite');
    }
    if (tableDescription.responsable_id) {
      await queryInterface.removeColumn('ServicesSante', 'responsable_id');
    }

    // Supprimer les index obsolètes
    try {
      await queryInterface.removeIndex('ServicesSante', 'idx_services_sante_responsable');
    } catch (error) {
      console.log('Index responsable_id may not exist:', error.message);
    }

    // Ajouter les colonnes manquantes si elles n'existent pas
    if (!tableDescription.hopital_id) {
      await queryInterface.addColumn('ServicesSante', 'hopital_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Hopitaux',
          key: 'id_hopital',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Référence à l\'hôpital auquel ce service est rattaché'
      });
    }

    if (!tableDescription.statut) {
      await queryInterface.addColumn('ServicesSante', 'statut', {
        type: Sequelize.ENUM('ACTIF', 'INACTIF', 'EN_MAINTENANCE', 'EN_CONSTRUCTION'),
        defaultValue: 'ACTIF',
        allowNull: false,
        comment: 'Statut du service pour la gestion du cycle de vie'
      });
    }

    if (!tableDescription.informations_complementaires) {
      await queryInterface.addColumn('ServicesSante', 'informations_complementaires', {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Informations complémentaires structurées',
        defaultValue: {}
      });
    }

    if (!tableDescription.createdBy) {
      await queryInterface.addColumn('ServicesSante', 'createdBy', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Utilisateurs',
          key: 'id_utilisateur',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Utilisateur ayant créé l\'enregistrement'
      });
    }

    if (!tableDescription.updatedBy) {
      await queryInterface.addColumn('ServicesSante', 'updatedBy', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Utilisateurs',
          key: 'id_utilisateur',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Dernier utilisateur ayant modifié l\'enregistrement'
      });
    }

    // Ajouter les index manquants
    try {
      await queryInterface.addIndex('ServicesSante', ['statut'], {
        name: 'idx_services_sante_statut'
      });
    } catch (error) {
      console.log('Index statut may already exist:', error.message);
    }

    // Mettre à jour l'index composite
    try {
      await queryInterface.removeIndex('ServicesSante', 'idx_services_sante_composite');
      await queryInterface.addIndex('ServicesSante', ['hopital_id', 'type_service', 'statut'], {
        name: 'idx_services_sante_composite'
      });
    } catch (error) {
      console.log('Index composite may already be updated:', error.message);
    }
  },

  async down (queryInterface, Sequelize) {
    // Restaurer les colonnes supprimées
    await queryInterface.addColumn('ServicesSante', 'batiment', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'Bâtiment du service'
    });

    await queryInterface.addColumn('ServicesSante', 'etage', {
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: 'Étage du service'
    });

    await queryInterface.addColumn('ServicesSante', 'aile', {
      type: Sequelize.STRING(10),
      allowNull: true,
      comment: 'Aile du service'
    });

    await queryInterface.addColumn('ServicesSante', 'capacite', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Capacité du service'
    });

    await queryInterface.addColumn('ServicesSante', 'responsable_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'ProfessionnelsSante',
        key: 'id_professionnel',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Professionnel responsable du service'
    });

    // Supprimer les colonnes ajoutées
    await queryInterface.removeColumn('ServicesSante', 'hopital_id');
    await queryInterface.removeColumn('ServicesSante', 'statut');
    await queryInterface.removeColumn('ServicesSante', 'informations_complementaires');
    await queryInterface.removeColumn('ServicesSante', 'createdBy');
    await queryInterface.removeColumn('ServicesSante', 'updatedBy');

    // Restaurer les index
    await queryInterface.addIndex('ServicesSante', ['responsable_id'], {
      name: 'idx_services_sante_responsable'
    });

    await queryInterface.removeIndex('ServicesSante', 'idx_services_sante_statut');
    await queryInterface.removeIndex('ServicesSante', 'idx_services_sante_composite');
  }
};
