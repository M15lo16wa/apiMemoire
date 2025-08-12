require('dotenv').config();

async function testSimpleService() {
  try {
    console.log('🧪 Test simple du service getOrdonnancesRecentes');
    console.log('==============================================\n');

    // Importer le service
    const PrescriptionService = require('./src/modules/prescription/prescription.service');
    
    console.log('1️⃣ Test avec paramètres minimaux (sans filtre professionnel):');
    try {
      const result = await PrescriptionService.getOrdonnancesRecentes({
        limit: 5,
        type: 'tous'
      });
      
      console.log('✅ Succès:');
      console.log('   Total:', result.total);
      console.log('   Limit:', result.limit);
      console.log('   Type:', result.type);
      console.log('   Prescriptions:', result.prescriptions.length);
      
      if (result.prescriptions.length > 0) {
        console.log('   Première prescription:', {
          id: result.prescriptions[0].id_prescription,
          type: result.prescriptions[0].type_prescription,
          date: result.prescriptions[0].date_prescription,
          patient: result.prescriptions[0].patient ? result.prescriptions[0].patient.nom : 'N/A'
        });
      }
      
    } catch (error) {
      console.log('❌ Erreur:', error.message);
      console.log('   Stack:', error.stack);
    }

    console.log('\n2️⃣ Test avec filtre par type (ordonnances uniquement):');
    try {
      const result = await PrescriptionService.getOrdonnancesRecentes({
        limit: 10,
        type: 'ordonnance'
      });
      
      console.log('✅ Succès:');
      console.log('   Total ordonnances:', result.total);
      console.log('   Ordonnances retournées:', result.prescriptions.length);
      
      if (result.prescriptions.length > 0) {
        console.log('   Première ordonnance:', {
          id: result.prescriptions[0].id_prescription,
          type: result.prescriptions[0].type_prescription,
          date: result.prescriptions[0].date_prescription
        });
      }
      
    } catch (error) {
      console.log('❌ Erreur:', error.message);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testSimpleService();
