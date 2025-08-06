require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false
  }
);

async function checkMissingColumns() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie');

    // Récupérer toutes les colonnes existantes
    const results = await sequelize.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name = 'NotificationsAccesDMP'`,
      {
        type: Sequelize.QueryTypes.SELECT
      }
    );
    
    const existingColumns = results.map(row => row.column_name);
    console.log('📋 Colonnes existantes:', existingColumns);

    // Colonnes attendues par le modèle
    const expectedColumns = [
      'id_notification',
      'patient_id',
      'professionnel_id',
      'session_id',
      'type_notification',
      'canal_envoi',
      'contenu_notification',
      'contenu_html',
      'destinataire',
      'statut_envoi',
      'date_envoi',
      'date_livraison',
      'nombre_tentatives',
      'erreur_envoi',
      'delai_expiration',
      'date_expiration',
      'priorite',
      'metadata',
      'date_creation',
      'date_modification'
    ];

    console.log('\n🔍 Vérification des colonnes manquantes:');
    // Vérifier chaque colonne
    for (const column of expectedColumns) {
      if (existingColumns.includes(column)) {
        console.log(`✅ ${column} - PRÉSENTE`);
      } else {
        console.log(`❌ ${column} - MANQUANTE`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkMissingColumns(); 