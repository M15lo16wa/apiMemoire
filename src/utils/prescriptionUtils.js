const QRCode = require('qrcode');
const crypto = require('crypto');
const { Op } = require('sequelize');

/**
 * Utilitaires pour la gestion des prescriptions
 */
class PrescriptionUtils {
  /**
   * Génère un numéro de prescription unique
   * Format: ORD-YYYY-XXXXXX ou EXA-YYYY-XXXXXX
   * @param {string} type - 'ordonnance' ou 'examen'
   * @returns {Promise<string>} Numéro de prescription généré
   */
  static async generatePrescriptionNumber(type = 'ordonnance') {
    const { Prescription } = require('../models');
    const year = new Date().getFullYear();
    const prefix = type === 'ordonnance' ? 'ORD' : 'EXA';
    
    try {
      // Trouver le dernier numéro de l'année pour ce type
      const lastPrescription = await Prescription.findOne({
        where: {
          prescriptionNumber: {
            [Op.like]: `${prefix}-${year}-%`
          }
        },
        order: [['prescriptionNumber', 'DESC']],
        raw: true
      });
      
      let nextNumber = 1;
      if (lastPrescription && lastPrescription.prescriptionNumber) {
        const parts = lastPrescription.prescriptionNumber.split('-');
        if (parts.length === 3) {
          const lastNumber = parseInt(parts[2]);
          if (!isNaN(lastNumber)) {
            nextNumber = lastNumber + 1;
          }
        }
      }
      
      return `${prefix}-${year}-${nextNumber.toString().padStart(6, '0')}`;
    } catch (error) {
      console.error('Erreur lors de la génération du numéro de prescription:', error);
      // Fallback avec timestamp pour éviter les collisions
      const timestamp = Date.now().toString().slice(-6);
      return `${prefix}-${year}-${timestamp}`;
    }
  }

  /**
   * Génère un QR Code pour la prescription
   * @param {Object} prescriptionData - Données de la prescription
   * @returns {Promise<string>} QR Code en format Data URL
   */
  static async generateQRCode(prescriptionData) {
    try {
      const qrData = {
        id: prescriptionData.id_prescription,
        number: prescriptionData.prescriptionNumber,
        patient: prescriptionData.patient_id,
        professionnel: prescriptionData.professionnel_id,
        date: prescriptionData.date_prescription || new Date().toISOString(),
        type: prescriptionData.type_prescription || 'ordonnance',
        hash: crypto.createHash('sha256')
          .update(`${prescriptionData.id_prescription || 'new'}-${prescriptionData.prescriptionNumber || 'temp'}-${Date.now()}`)
          .digest('hex').substring(0, 16)
      };
      
      const qrString = JSON.stringify(qrData);
      return await QRCode.toDataURL(qrString, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      console.error('Erreur lors de la génération du QR Code:', error);
      return null;
    }
  }

  /**
   * Génère une signature électronique pour la prescription
   * @param {Object} prescriptionData - Données de la prescription
   * @param {Object} professionnelData - Données du professionnel
   * @returns {string} Signature électronique encodée en base64
   */
  static generateElectronicSignature(prescriptionData, professionnelData) {
    try {
      const timestamp = new Date().toISOString();
      const signatureData = {
        prescription_id: prescriptionData.id_prescription || 'new',
        prescription_number: prescriptionData.prescriptionNumber,
        professionnel_id: professionnelData.id_professionnel,
        adeli: professionnelData.numero_adeli,
        nom: professionnelData.nom || professionnelData.compteUtilisateur?.nom,
        prenom: professionnelData.prenom || professionnelData.compteUtilisateur?.prenom,
        timestamp: timestamp,
        hash: crypto.createHash('sha256')
          .update(`${prescriptionData.prescriptionNumber || 'temp'}-${professionnelData.numero_adeli}-${timestamp}`)
          .digest('hex')
      };
      
      return Buffer.from(JSON.stringify(signatureData)).toString('base64');
    } catch (error) {
      console.error('Erreur lors de la génération de la signature électronique:', error);
      return null;
    }
  }

  /**
   * Valide un QR Code de prescription
   * @param {string} qrCodeData - Données du QR Code
   * @returns {Object|null} Données validées ou null si invalide
   */
  static validateQRCode(qrCodeData) {
    try {
      const data = JSON.parse(qrCodeData);
      
      // Vérifications de base
      if (!data.id || !data.number || !data.patient || !data.professionnel || !data.hash) {
        return null;
      }
      
      // Vérification du format du numéro
      const numberPattern = /^(ORD|EXA)-\d{4}-\d{6}$/;
      if (!numberPattern.test(data.number)) {
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Erreur lors de la validation du QR Code:', error);
      return null;
    }
  }

  /**
   * Valide une signature électronique
   * @param {string} signature - Signature encodée en base64
   * @returns {Object|null} Données de signature validées ou null si invalide
   */
  static validateElectronicSignature(signature) {
    try {
      const decodedSignature = Buffer.from(signature, 'base64').toString('utf-8');
      const signatureData = JSON.parse(decodedSignature);
      
      // Vérifications de base
      if (!signatureData.professionnel_id || !signatureData.adeli || !signatureData.timestamp || !signatureData.hash) {
        return null;
      }
      
      // Vérification du format ADELI (9 chiffres)
      const adeliPattern = /^\d{9}$/;
      if (!adeliPattern.test(signatureData.adeli)) {
        return null;
      }
      
      return signatureData;
    } catch (error) {
      console.error('Erreur lors de la validation de la signature électronique:', error);
      return null;
    }
  }

  /**
   * Génère un rapport de prescription pour impression
   * @param {Object} prescription - Données complètes de la prescription
   * @returns {Object} Données formatées pour le rapport
   */
  static generatePrescriptionReport(prescription) {
    try {
      return {
        header: {
          numero: prescription.prescriptionNumber,
          date: new Date(prescription.date_prescription).toLocaleDateString('fr-FR'),
          type: prescription.type_prescription === 'ordonnance' ? 'ORDONNANCE' : 'DEMANDE D\'EXAMEN'
        },
        patient: {
          nom: prescription.patient?.nom,
          prenom: prescription.patient?.prenom,
          dateNaissance: prescription.patient?.date_naissance ? 
            new Date(prescription.patient.date_naissance).toLocaleDateString('fr-FR') : null,
          id: prescription.patient?.id_patient
        },
        professionnel: {
          nom: prescription.redacteur?.compteUtilisateur?.nom,
          prenom: prescription.redacteur?.compteUtilisateur?.prenom,
          adeli: prescription.redacteur?.numero_adeli,
          specialite: prescription.redacteur?.specialite
        },
        prescription: {
          principe_actif: prescription.principe_actif || prescription.nom_commercial,
          nom_commercial: prescription.nom_commercial,
          dosage: prescription.dosage,
          frequence: prescription.frequence,
          voie_administration: prescription.voie_administration,
          posologie: prescription.posologie,
          duree: prescription.date_fin ? 
            `Du ${new Date(prescription.date_debut || prescription.date_prescription).toLocaleDateString('fr-FR')} au ${new Date(prescription.date_fin).toLocaleDateString('fr-FR')}` : 
            'Non spécifiée',
          renouvelable: prescription.renouvelable,
          nb_renouvellements: prescription.nb_renouvellements,
          contre_indications: prescription.contre_indications,
          effets_indesirables: prescription.effets_indesirables
        },
        qrCode: prescription.qrCode,
        signature: prescription.signatureElectronique
      };
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      return null;
    }
  }

  /**
   * Calcule les statistiques de prescription pour un professionnel
   * @param {number} professionnelId - ID du professionnel
   * @param {Object} periode - Période de calcul {debut, fin}
   * @returns {Promise<Object>} Statistiques calculées
   */
  static async calculatePrescriptionStats(professionnelId, periode = {}) {
    try {
      const { Prescription } = require('../models');
      const { debut, fin } = periode;
      
      const whereClause = { professionnel_id: professionnelId };
      
      if (debut && fin) {
        whereClause.date_prescription = {
          [Op.between]: [debut, fin]
        };
      }

      const [total, ordonnances, examens, actives, terminees] = await Promise.all([
        Prescription.count({ where: whereClause }),
        Prescription.count({ where: { ...whereClause, type_prescription: 'ordonnance' } }),
        Prescription.count({ where: { ...whereClause, type_prescription: 'examen' } }),
        Prescription.count({ where: { ...whereClause, statut: 'active' } }),
        Prescription.count({ where: { ...whereClause, statut: 'terminee' } })
      ]);

      return {
        total,
        par_type: {
          ordonnances,
          examens
        },
        par_statut: {
          actives,
          terminees,
          autres: total - actives - terminees
        },
        periode: periode.debut && periode.fin ? {
          debut: new Date(periode.debut).toLocaleDateString('fr-FR'),
          fin: new Date(periode.fin).toLocaleDateString('fr-FR')
        } : 'Toutes périodes'
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      return null;
    }
  }
}

module.exports = PrescriptionUtils;