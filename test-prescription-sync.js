const { Prescription } = require('./src/models');

async function testPrescriptionModel() {
  try {
    console.log('🧪 Test du modèle Prescription...\n');

    // Test 1: Créer une ordonnance
    console.log('📝 Test 1: Création d\'une ordonnance');
    const ordonnance = await Prescription.create({
      type_prescription: 'ordonnance',
      principe_actif: 'Paracétamol',
      nom_commercial: 'Doliprane',
      dosage: '500mg',
      forme_pharmaceutique: 'comprimé',
      quantite: 20,
      unite: 'comprimés',
      posologie: '1 comprimé toutes les 6 heures',
      frequence: '4 fois par jour',
      voie_administration: 'orale',
      statut: 'active',
      patient_id: 1,
      professionnel_id: 1,
      instructions_speciales: 'À prendre avec un verre d\'eau',
      duree_traitement: '5 jours'
    });

    console.log('✅ Ordonnance créée:', {
      id: ordonnance.id_prescription,
      numero: ordonnance.prescriptionNumber,
      type: ordonnance.type_prescription,
      principe: ordonnance.principe_actif,
      qrCode: ordonnance.qrCode ? 'Généré' : 'Non généré'
    });

    // Test 2: Créer une demande d'examen
    console.log('\n🔬 Test 2: Création d\'une demande d\'examen');
    const examen = await Prescription.create({
      type_prescription: 'examen',
      principe_actif: 'Analyse sanguine complète',
      dosage: 'Prélèvement veineux',
      frequence: 'Urgent',
      statut: 'en_attente',
      patient_id: 1,
      professionnel_id: 1,
      instructions_speciales: 'À jeun depuis 12 heures',
      duree_traitement: '1 jour'
    });

    console.log('✅ Demande d\'examen créée:', {
      id: examen.id_prescription,
      numero: examen.prescriptionNumber,
      type: examen.type_prescription,
      principe: examen.principe_actif,
      qrCode: examen.qrCode ? 'Généré' : 'Non généré'
    });

    // Test 3: Rechercher les prescriptions
    console.log('\n🔍 Test 3: Recherche des prescriptions');
    const prescriptions = await Prescription.findAll({
      where: { patient_id: 1 },
      order: [['date_prescription', 'DESC']]
    });

    console.log(`✅ ${prescriptions.length} prescriptions trouvées pour le patient 1`);

    // Test 4: Rechercher par type
    console.log('\n📊 Test 4: Recherche par type de prescription');
    const ordonnances = await Prescription.count({
      where: { type_prescription: 'ordonnance' }
    });
    const examens = await Prescription.count({
      where: { type_prescription: 'examen' }
    });

    console.log(`✅ Ordonnances: ${ordonnances}, Examens: ${examens}`);

    // Test 5: Rechercher par statut
    console.log('\n📈 Test 5: Recherche par statut');
    const actives = await Prescription.count({
      where: { statut: 'active' }
    });
    const enAttente = await Prescription.count({
      where: { statut: 'en_attente' }
    });

    console.log(`✅ Actives: ${actives}, En attente: ${enAttente}`);

    console.log('\n🎉 Tous les tests sont passés avec succès!');
    console.log('✅ Le modèle Prescription est maintenant synchronisé et fonctionnel.');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testPrescriptionModel(); 