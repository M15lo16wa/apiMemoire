'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 1. Table Utilisateurs
    await queryInterface.createTable('Utilisateurs', {
      id_utilisateur: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nom: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      prenom: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      mot_de_passe: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('admin', 'secretaire', 'patient'),
        allowNull: false,
        defaultValue: 'secretaire'
      },
      statut: {
        type: Sequelize.ENUM('actif', 'inactif', 'en_attente_validation', 'suspendu'),
        allowNull: false,
        defaultValue: 'actif'
      },
      date_derniere_connexion: {
        type: Sequelize.DATE
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 2. Table Hopitaux
    await queryInterface.createTable('Hopitaux', {
      id_hopital: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nom: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      adresse: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      ville: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      code_postal: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      telephone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      type: {
        type: Sequelize.ENUM('public', 'prive', 'clinique'),
        allowNull: false,
        defaultValue: 'public'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 3. Table ServicesSante
    await queryInterface.createTable('ServicesSante', {
      id_service: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nom: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      specialite: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      id_hopital: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Hopitaux',
          key: 'id_hopital'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 4. Table ProfessionnelsSante
    await queryInterface.createTable('ProfessionnelsSante', {
      id_professionnel: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      utilisateur_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Utilisateurs',
          key: 'id_utilisateur'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      nom: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      prenom: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      specialite: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      fonction: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      numero_adeli: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      telephone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      mot_de_passe: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      statut: {
        type: Sequelize.ENUM('actif', 'inactif', 'en_attente_validation'),
        allowNull: false,
        defaultValue: 'actif'
      },
      id_service: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'ServicesSante',
          key: 'id_service'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 5. Table Patients
    await queryInterface.createTable('Patients', {
      id_patient: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      utilisateur_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Utilisateurs',
          key: 'id_utilisateur'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      numero_dossier: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      nom: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      prenom: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      date_naissance: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      sexe: {
        type: Sequelize.ENUM('M', 'F'),
        allowNull: false
      },
      adresse: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      telephone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      groupe_sanguin: {
        type: Sequelize.STRING(5),
        allowNull: true
      },
      allergies: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      antecedents: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      mot_de_passe: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      numero_securite_sociale: {
        type: Sequelize.STRING(15),
        allowNull: true
      },
      assurance_maladie: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      statut: {
        type: Sequelize.ENUM('actif', 'inactif', 'decede'),
        allowNull: false,
        defaultValue: 'actif'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 6. Table DossiersMedicaux
    await queryInterface.createTable('DossiersMedicaux', {
      id_dossier: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      patient_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Patients',
          key: 'id_patient'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      numero_dossier: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      date_creation: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      statut: {
        type: Sequelize.ENUM('actif', 'archive', 'ferme'),
        allowNull: false,
        defaultValue: 'actif'
      },
      poids: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      taille: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      tension_arterielle: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      frequence_cardiaque: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      temperature: {
        type: Sequelize.DECIMAL(4, 1),
        allowNull: true
      },
      groupe_sanguin: {
        type: Sequelize.STRING(5),
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 7. Table Consultations
    await queryInterface.createTable('Consultations', {
      id_consultation: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      dossier_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'DossiersMedicaux',
          key: 'id_dossier'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      patient_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Patients',
          key: 'id_patient'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      professionnel_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'ProfessionnelsSante',
          key: 'id_professionnel'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      service_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'ServicesSante',
          key: 'id_service'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      date_consultation: {
        type: Sequelize.DATE,
        allowNull: false
      },
      motif: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      diagnostic: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      traitement: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      observations: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      statut: {
        type: Sequelize.ENUM('planifiee', 'en_cours', 'terminee', 'annulee'),
        allowNull: false,
        defaultValue: 'planifiee'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 8. Table Prescriptions
    await queryInterface.createTable('Prescriptions', {
      id_prescription: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      dossier_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'DossiersMedicaux',
          key: 'id_dossier'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      patient_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Patients',
          key: 'id_patient'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      professionnel_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'ProfessionnelsSante',
          key: 'id_professionnel'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      consultation_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Consultations',
          key: 'id_consultation'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      type: {
        type: Sequelize.ENUM('ordonnance', 'demande_examen', 'certificat'),
        allowNull: false
      },
      date_prescription: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      contenu: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      instructions: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      statut: {
        type: Sequelize.ENUM('active', 'terminee', 'annulee'),
        allowNull: false,
        defaultValue: 'active'
      },
      prescription_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      qrCode: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 9. Table ExamenLabo
    await queryInterface.createTable('ExamensLabo', {
      id_examen: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      dossier_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'DossiersMedicaux',
          key: 'id_dossier'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      patient_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Patients',
          key: 'id_patient'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      consultation_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Consultations',
          key: 'id_consultation'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      prescripteur_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'ProfessionnelsSante',
          key: 'id_professionnel'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      validateur_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'ProfessionnelsSante',
          key: 'id_professionnel'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      type_examen: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      date_demande: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      date_realisation: {
        type: Sequelize.DATE,
        allowNull: true
      },
      resultats: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      statut: {
        type: Sequelize.ENUM('demande', 'en_cours', 'termine', 'annule'),
        allowNull: false,
        defaultValue: 'demande'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 10. Table RendezVous
    await queryInterface.createTable('RendezVous', {
      id_rendez_vous: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      id_hopital: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Hopitaux',
          key: 'id_hopital'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      id_service: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'ServicesSante',
          key: 'id_service'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      id_professionnel: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'ProfessionnelsSante',
          key: 'id_professionnel'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      nom_patient: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      prenom_patient: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      telephone_patient: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      email_patient: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      date_rendez_vous: {
        type: Sequelize.DATE,
        allowNull: false
      },
      heure_debut: {
        type: Sequelize.TIME,
        allowNull: false
      },
      heure_fin: {
        type: Sequelize.TIME,
        allowNull: true
      },
      motif: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      statut: {
        type: Sequelize.ENUM('planifie', 'confirme', 'annule', 'termine'),
        allowNull: false,
        defaultValue: 'planifie'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 11. Table AutorisationAcces
    await queryInterface.createTable('AutorisationAcces', {
      id_autorisation: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      patient_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Patients',
          key: 'id_patient'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      professionnel_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ProfessionnelsSante',
          key: 'id_professionnel'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      date_demande: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      date_autorisation: {
        type: Sequelize.DATE,
        allowNull: true
      },
      date_expiration: {
        type: Sequelize.DATE,
        allowNull: true
      },
      statut: {
        type: Sequelize.ENUM('en_attente', 'accordee', 'refusee', 'expiree'),
        allowNull: false,
        defaultValue: 'en_attente'
      },
      motif_demande: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      motif_refus: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 12. Table HistoriqueAccess
    await queryInterface.createTable('HistoriqueAccess', {
      id_historique: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      date_acces: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      type_acces: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      details: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      ip_adresse: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 13. Table SessionAccesDMP
    await queryInterface.createTable('SessionAccesDMP', {
      id_session: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      patient_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Patients',
          key: 'id_patient'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      professionnel_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ProfessionnelsSante',
          key: 'id_professionnel'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      date_debut: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      date_fin: {
        type: Sequelize.DATE,
        allowNull: true
      },
      statut: {
        type: Sequelize.ENUM('active', 'terminee', 'interrompue'),
        allowNull: false,
        defaultValue: 'active'
      },
      motif_acces: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 14. Table TentativeAuthentificationCPS
    await queryInterface.createTable('TentativeAuthentificationCPS', {
      id_tentative: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      professionnel_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ProfessionnelsSante',
          key: 'id_professionnel'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      date_tentative: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      statut: {
        type: Sequelize.ENUM('reussie', 'echouee', 'en_cours'),
        allowNull: false,
        defaultValue: 'en_cours'
      },
      details: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      ip_adresse: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 15. Table NotificationAccesDMP
    await queryInterface.createTable('NotificationAccesDMP', {
      id_notification: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      patient_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Patients',
          key: 'id_patient'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      professionnel_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ProfessionnelsSante',
          key: 'id_professionnel'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      session_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'SessionAccesDMP',
          key: 'id_session'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type_notification: {
        type: Sequelize.ENUM('demande_acces', 'acces_autorise', 'acces_refuse', 'acces_termine'),
        allowNull: false
      },
      contenu: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      statut: {
        type: Sequelize.ENUM('envoyee', 'lue', 'traitee'),
        allowNull: false,
        defaultValue: 'envoyee'
      },
      date_envoi: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      date_lecture: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 16. Table AutoMesure
    await queryInterface.createTable('AutoMesure', {
      id_auto_mesure: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      patient_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Patients',
          key: 'id_patient'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type_mesure: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      valeur: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      unite: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      date_mesure: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 17. Table DocumentPersonnel
    await queryInterface.createTable('DocumentPersonnel', {
      id_document: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      patient_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Patients',
          key: 'id_patient'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      titre: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      type_document: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      url_fichier: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      date_upload: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 18. Table Message
    await queryInterface.createTable('Message', {
      id_message: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      expediteur_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ProfessionnelsSante',
          key: 'id_professionnel'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      destinataire_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Patients',
          key: 'id_patient'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      sujet: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      contenu: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      statut: {
        type: Sequelize.ENUM('envoye', 'lu', 'repondu'),
        allowNull: false,
        defaultValue: 'envoye'
      },
      date_envoi: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      date_lecture: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 19. Table Rappel
    await queryInterface.createTable('Rappel', {
      id_rappel: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      patient_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Patients',
          key: 'id_patient'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createur_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'ProfessionnelsSante',
          key: 'id_professionnel'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      titre: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      date_rappel: {
        type: Sequelize.DATE,
        allowNull: false
      },
      statut: {
        type: Sequelize.ENUM('planifie', 'envoye', 'lu', 'termine'),
        allowNull: false,
        defaultValue: 'planifie'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down (queryInterface, Sequelize) {
    // Supprimer toutes les tables dans l'ordre inverse
    await queryInterface.dropTable('Rappel');
    await queryInterface.dropTable('Message');
    await queryInterface.dropTable('DocumentPersonnel');
    await queryInterface.dropTable('AutoMesure');
    await queryInterface.dropTable('NotificationAccesDMP');
    await queryInterface.dropTable('TentativeAuthentificationCPS');
    await queryInterface.dropTable('SessionAccesDMP');
    await queryInterface.dropTable('HistoriqueAccess');
    await queryInterface.dropTable('AutorisationAcces');
    await queryInterface.dropTable('RendezVous');
    await queryInterface.dropTable('ExamensLabo');
    await queryInterface.dropTable('Prescriptions');
    await queryInterface.dropTable('Consultations');
    await queryInterface.dropTable('DossiersMedicaux');
    await queryInterface.dropTable('Patients');
    await queryInterface.dropTable('ProfessionnelsSante');
    await queryInterface.dropTable('ServicesSante');
    await queryInterface.dropTable('Hopitaux');
    await queryInterface.dropTable('Utilisateurs');
  }
};
