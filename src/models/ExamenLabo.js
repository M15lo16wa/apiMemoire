const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ExamenLabo = sequelize.define('ExamenLabo', {
    id_examen: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    code_examen: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    libelle: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type_examen: {
      type: DataTypes.ENUM(
        'biologie', 'hématologie', 'bactériologie', 'anatomopathologie',
        'génétique', 'immunologie', 'biochimie', 'toxicologie', 'autre'
      ),
      allowNull: false,
    },
    date_prescription: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    date_prelevement: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    date_reception: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    date_realisation: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    date_validation: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    statut: {
      type: DataTypes.ENUM('prescrit', 'en_attente', 'en_cours', 'termine', 'valide', 'annule', 'erreur'),
      defaultValue: 'prescrit',
      allowNull: false,
    },
    priorite: {
      type: DataTypes.ENUM('urgent', 'normal', 'differe'),
      defaultValue: 'normal',
      allowNull: false,
    },
    resultat: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    resultat_texte: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    interpretation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    observations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fichiers_resultats: {
      type: DataTypes.ARRAY(DataTypes.STRING(500)),
      allowNull: true,
      defaultValue: [],
    },
    code_nomenclature: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    code_loinc: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    prescripteur_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    validateur_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    dossier_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    consultation_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'ExamensLabo',
    timestamps: true,
    paranoid: true,
  });

  // UML Diagram Methods Implementation
  
  // saisirResultat() method from UML diagram
  ExamenLabo.prototype.saisirResultat = async function(resultat, saisisseurId) {
    this.resultat = resultat;
    this.date_realisation = new Date();
    this.statut = 'termine';
    this.updatedBy = saisisseurId;
    await this.save();
    return this;
  };
  
  // valider() method from UML diagram
  ExamenLabo.prototype.valider = async function(validateurId, interpretation = null) {
    this.validateur_id = validateurId;
    this.date_validation = new Date();
    this.statut = 'valide';
    if (interpretation) {
      this.interpretation = interpretation;
    }
    this.updatedBy = validateurId;
    await this.save();
    return this;
  };
  
  // modifier() method from UML diagram
  ExamenLabo.prototype.modifier = async function(donnees, modifiateurId) {
    Object.keys(donnees).forEach(key => {
      if (this.hasOwnProperty(key) && key !== 'id_examen') {
        this[key] = donnees[key];
      }
    });
    
    this.updatedBy = modifiateurId;
    await this.save();
    return this;
  };
  
  // annuler() method from UML diagram
  ExamenLabo.prototype.annuler = async function(motif, annulateurId) {
    this.statut = 'annule';
    this.observations = (this.observations ? this.observations + '\n' : '') + 'Annulé: ' + motif;
    this.updatedBy = annulateurId;
    await this.save();
    return this;
  };
  
  // planifier() method from UML diagram
  ExamenLabo.prototype.planifier = async function(datePrelevement, planificateurId) {
    this.date_prelevement = datePrelevement;
    this.statut = 'en_attente';
    this.updatedBy = planificateurId;
    await this.save();
    return this;
  };
  
  // Class method to create exam
  ExamenLabo.creerExamen = async function(examenData) {
    const examen = await this.create({
      code_examen: examenData.code_examen,
      libelle: examenData.libelle,
      description: examenData.description || null,
      type_examen: examenData.type_examen,
      date_prescription: examenData.date_prescription || new Date(),
      statut: examenData.statut || 'prescrit',
      priorite: examenData.priorite || 'normal',
      patient_id: examenData.patient_id,
      prescripteur_id: examenData.prescripteur_id,
      dossier_id: examenData.dossier_id,
      consultation_id: examenData.consultation_id,
      service_id: examenData.service_id,
      createdBy: examenData.createdBy
    });
    
    return examen;
  };

  return ExamenLabo;
};
