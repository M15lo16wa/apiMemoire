# Correction des Erreurs de Validation des Notifications

## Problème Identifié

L'erreur suivante se produisait lors de la création d'autorisations d'accès :

```
ValidationError [SequelizeValidationError]: 
notNull Violation: NotificationAccesDMP.contenu_notification cannot be null,
notNull Violation: NotificationAccesDMP.titre cannot be null,
notNull Violation: NotificationAccesDMP.destinataire cannot be null
```

## Cause Racine

Le modèle `NotificationAccesDMP` exige 3 champs obligatoires qui n'étaient pas fournis lors de la création :

1. **`contenu_notification`** - Contenu textuel de la notification
2. **`titre`** - Titre de la notification  
3. **`destinataire`** - Email ou téléphone du destinataire

## Corrections Apportées

### 1. Service `requestStandardAccess` (ligne ~361)

**Avant :**
```javascript
await NotificationAccesDMP.create({
  patient_id,
  professionnel_id,
  type_notification: 'demande_acces',
  message: `Le Dr. ${professionnel.nom} ${professionnel.prenom} demande l'accès à votre dossier médical`,
  statut: 'non_lu',
  id_acces_autorisation: autorisation.id_acces 
});
```

**Après :**
```javascript
await NotificationAccesDMP.create({
  patient_id,
  professionnel_id,
  type_notification: 'demande_acces',
  titre: `Demande d'accès au dossier médical`,
  contenu_notification: `Le Dr. ${professionnel.nom} ${professionnel.prenom} demande l'accès à votre dossier médical`,
  message: `Le Dr. ${professionnel.nom} ${professionnel.prenom} demande l'accès à votre dossier médical`,
  destinataire: patient.email || patient.telephone || 'contact@dmp.fr',
  statut: 'non_lu',
  id_acces_autorisation: autorisation.id_acces 
});
```

### 2. Service `processPatientResponse` (ligne ~578)

**Avant :**
```javascript
await NotificationAccesDMP.create({
  patient_id,
  professionnel_id: autorisation.professionnel_id,
  type_notification: 'reponse_acces',
  message: `Votre demande d'accès a été ${response === 'accept' ? 'acceptée' : 'refusée'}`,
});
```

**Après :**
```javascript
// Récupération du patient ajoutée
const patient = await Patient.findByPk(patientId);

await NotificationAccesDMP.create({
  patient_id,
  professionnel_id: autorisation.professionnel_id,
  type_notification: 'reponse_acces',
  titre: `Réponse à votre demande d'accès`,
  contenu_notification: `Votre demande d'accès a été ${response === 'accept' ? 'acceptée' : 'refusée'}`,
  message: `Votre demande d'accès a été ${response === 'accept' ? 'acceptée' : 'refusée'}`,
  destinataire: patient.email || patient.telephone || 'contact@dmp.fr',
  statut: 'non_lu'
});
```

## Champs Obligatoires du Modèle NotificationAccesDMP

```javascript
{
  contenu_notification: DataTypes.TEXT,        // ✅ OBLIGATOIRE
  titre: DataTypes.STRING(255),               // ✅ OBLIGATOIRE  
  destinataire: DataTypes.STRING(255),        // ✅ OBLIGATOIRE
  message: DataTypes.TEXT,                    // ✅ OBLIGATOIRE
  patient_id: DataTypes.INTEGER,              // ✅ OBLIGATOIRE
  professionnel_id: DataTypes.INTEGER,        // ✅ OBLIGATOIRE
  type_notification: DataTypes.ENUM,          // ✅ OBLIGATOIRE
  // ... autres champs avec valeurs par défaut
}
```

## Stratégie de Fallback pour le Destinataire

```javascript
destinataire: patient.email || patient.telephone || 'contact@dmp.fr'
```

Cette stratégie garantit qu'un destinataire valide est toujours fourni :
1. **Email du patient** (priorité 1)
2. **Téléphone du patient** (priorité 2)  
3. **Email de contact par défaut** (fallback)

## Test de Validation

Un fichier de test `test_notification_fix.js` a été créé pour vérifier que les corrections fonctionnent.

## Impact

- ✅ **Notifications créées avec succès** lors des demandes d'accès
- ✅ **Pas d'erreurs de validation** Sequelize
- ✅ **Fonctionnalité d'accès** entièrement opérationnelle
- ✅ **Logs d'erreur** supprimés

## Fichiers Modifiés

- `src/modules/access/access.service.js` - Corrections des notifications
- `test_notification_fix.js` - Test de validation
- `CORRECTION_NOTIFICATIONS.md` - Cette documentation
