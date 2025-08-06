# Documentation Frontend - Accès DMP Médecin

## 📋 Vue d'ensemble

Cette documentation décrit l'implémentation frontend pour l'accès au DMP (Dossier Médical Partagé) depuis l'interface médecin, incluant l'authentification CPS à double facteur et la gestion des notifications.

## 🎯 Fonctionnalités principales

### 1. **Authentification CPS (Double Facteur)**
- Saisie du code CPS à 4 chiffres
- Validation en temps réel
- Gestion des tentatives échouées

### 2. **Sélection du mode d'accès**
- Accès autorisé par le patient
- Mode urgence
- Connexion secrète

### 3. **Notifications automatiques**
- Notifications email/SMS aux patients
- Templates HTML personnalisés
- Gestion des priorités

## 🚀 Routes API disponibles

### **1. Test du système DMP**
```http
GET /api/medecin/dmp/test/systeme
```
**Réponse :**
```json
{
  "status": "success",
  "message": "Test système DMP réussi",
  "data": {
    "medecin": {
      "id": 79,
      "nom": "Sakura",
      "prenom": "Saza"
    },
    "patient": {
      "id": 5,
      "nom": "MOLOWA",
      "prenom": "ESSONGA",
      "numero_dossier": "PAT-17540449445"
    },
    "session": {
      "id_session": 14,
      "statut": "active",
      "date_debut": "2025-08-06T09:35:14.000Z",
      "date_fin": "2025-08-06T10:35:14.000Z"
    },
    "notification": {
      "id_notification": 9,
      "type": "demande_validation",
      "statut": "en_attente",
      "contenu": "Dr. Sakura Saza demande l'accès à votre dossier médical partagé (DMP)..."
    }
  }
}
```

### **2. Authentification CPS**
```http
POST /api/medecin/dmp/authentification-cps
```
**Body :**
```json
{
  "numero_adeli": "AH23456780",
  "code_cps": "1234",
  "patient_id": 5
}
```
**Réponse :**
```json
{
  "status": "success",
  "message": "Authentification CPS réussie",
  "data": {
    "session_id": 15,
    "expires_at": "2025-08-06T10:35:14.000Z",
    "patient_info": {
      "id": 5,
      "nom": "MOLOWA",
      "prenom": "ESSONGA",
      "numero_dossier": "PAT-17540449445"
    }
  }
}
```

### **3. Création de session d'accès**
```http
POST /api/medecin/dmp/creer-session
```
**Body :**
```json
{
  "professionnel_id": 79,
  "patient_id": 5,
  "mode_acces": "autorise_par_patient",
  "duree_acces": 60,
  "raison_acces": "Consultation de routine"
}
```

### **4. Demande d'accès au DMP**
```http
POST /api/medecin/dmp/demande-acces
```
**Body :**
```json
{
  "session_id": 15,
  "mode_acces": "autorise_par_patient",
  "duree_acces": 60,
  "raison_acces": "Consultation de routine"
}
```

## 🎨 Structure des pages Frontend

### **Page 1 : Identification du patient**
```javascript
// Composant PatientSearch.vue
{
  data() {
    return {
      searchQuery: '',
      patients: [],
      selectedPatient: null
    }
  },
  methods: {
    async searchPatients() {
      const response = await fetch('/api/patients/search?q=' + this.searchQuery);
      this.patients = await response.json();
    },
    selectPatient(patient) {
      this.selectedPatient = patient;
      this.$router.push('/dmp/authentification-cps');
    }
  }
}
```

### **Page 2 : Authentification CPS**
```javascript
// Composant CPSAuthentication.vue
{
  data() {
    return {
      codeCPS: '',
      attempts: 0,
      maxAttempts: 3,
      isLoading: false,
      error: null
    }
  },
  methods: {
    async validateCPS() {
      this.isLoading = true;
      try {
        const response = await fetch('/api/medecin/dmp/authentification-cps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            numero_adeli: this.$store.state.medecin.numero_adeli,
            code_cps: this.codeCPS,
            patient_id: this.$route.params.patientId
          })
        });
        
        const result = await response.json();
        if (result.status === 'success') {
          this.$store.commit('setDMPSession', result.data);
          this.$router.push('/dmp/selection-mode');
        }
      } catch (error) {
        this.error = 'Code CPS invalide';
        this.attempts++;
      } finally {
        this.isLoading = false;
      }
    }
  }
}
```

### **Page 3 : Sélection du mode d'accès**
```javascript
// Composant AccessModeSelection.vue
{
  data() {
    return {
      modes: [
        {
          id: 'autorise_par_patient',
          title: 'Accès autorisé par le patient',
          description: 'Le patient doit valider votre demande d\'accès',
          icon: 'user-check',
          color: 'primary'
        },
        {
          id: 'urgence',
          title: 'Mode urgence',
          description: 'Accès immédiat en cas d\'urgence médicale',
          icon: 'alert-triangle',
          color: 'warning'
        },
        {
          id: 'connexion_secrete',
          title: 'Connexion secrète',
          description: 'Accès discret pour consultation confidentielle',
          icon: 'shield',
          color: 'info'
        }
      ],
      selectedMode: null,
      raisonAcces: '',
      dureeAcces: 60
    }
  },
  methods: {
    async demanderAcces() {
      try {
        const response = await fetch('/api/medecin/dmp/demande-acces', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: this.$store.state.dmpSession.session_id,
            mode_acces: this.selectedMode,
            duree_acces: this.dureeAcces,
            raison_acces: this.raisonAcces
          })
        });
        
        const result = await response.json();
        if (result.status === 'success') {
          this.$router.push('/dmp/acces-confirme');
        }
      } catch (error) {
        console.error('Erreur demande accès:', error);
      }
    }
  }
}
```

### **Page 4 : Confirmation d'accès**
```javascript
// Composant AccessConfirmed.vue
{
  data() {
    return {
      sessionInfo: null,
      patientInfo: null,
      notificationInfo: null
    }
  },
  async mounted() {
    this.sessionInfo = this.$store.state.dmpSession;
    this.patientInfo = this.$store.state.selectedPatient;
    
    // Récupérer les informations de notification
    const response = await fetch(`/api/medecin/dmp/notifications/${this.sessionInfo.session_id}`);
    this.notificationInfo = await response.json();
  }
}
```

## 📱 Composants UI nécessaires

### **1. Code CPS Input**
```vue
<template>
  <div class="cps-input">
    <label>Code CPS (4 chiffres)</label>
    <div class="code-inputs">
      <input 
        v-for="(digit, index) in 4" 
        :key="index"
        v-model="codeDigits[index]"
        type="number"
        maxlength="1"
        @input="handleDigitInput(index)"
        @keydown="handleKeydown($event, index)"
        :class="{ 'error': hasError }"
      />
    </div>
    <div v-if="error" class="error-message">{{ error }}</div>
    <div class="attempts-info">
      Tentatives: {{ attempts }}/{{ maxAttempts }}
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      codeDigits: ['', '', '', ''],
      attempts: 0,
      maxAttempts: 3,
      error: null
    }
  },
  computed: {
    codeCPS() {
      return this.codeDigits.join('');
    },
    hasError() {
      return this.error !== null;
    }
  },
  methods: {
    handleDigitInput(index) {
      if (this.codeDigits[index].length === 1 && index < 3) {
        this.$refs[`digit${index + 1}`][0].focus();
      }
    },
    handleKeydown(event, index) {
      if (event.key === 'Backspace' && this.codeDigits[index] === '' && index > 0) {
        this.$refs[`digit${index - 1}`][0].focus();
      }
    }
  }
}
</script>
```

### **2. Mode d'accès Cards**
```vue
<template>
  <div class="access-modes">
    <div 
      v-for="mode in modes" 
      :key="mode.id"
      class="mode-card"
      :class="[`mode-${mode.color}`, { 'selected': selectedMode === mode.id }]"
      @click="selectMode(mode.id)"
    >
      <div class="mode-icon">
        <i :class="`fas fa-${mode.icon}`"></i>
      </div>
      <div class="mode-content">
        <h3>{{ mode.title }}</h3>
        <p>{{ mode.description }}</p>
      </div>
      <div class="mode-checkbox">
        <input type="radio" :value="mode.id" v-model="selectedMode" />
      </div>
    </div>
  </div>
</template>
```

### **3. Notification Status**
```vue
<template>
  <div class="notification-status">
    <div class="status-indicator" :class="statusClass">
      <i :class="statusIcon"></i>
      {{ statusText }}
    </div>
    <div class="notification-details">
      <p><strong>Patient:</strong> {{ patientInfo.nom }} {{ patientInfo.prenom }}</p>
      <p><strong>Mode:</strong> {{ modeText }}</p>
      <p><strong>Durée:</strong> {{ dureeAcces }} minutes</p>
      <p><strong>Raison:</strong> {{ raisonAcces }}</p>
    </div>
  </div>
</template>
```

## 🎨 Styles CSS recommandés

### **Variables CSS**
```css
:root {
  --primary-color: #2c3e50;
  --secondary-color: #3498db;
  --success-color: #27ae60;
  --warning-color: #f39c12;
  --danger-color: #e74c3c;
  --info-color: #17a2b8;
  
  --border-radius: 8px;
  --box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  --transition: all 0.3s ease;
}
```

### **Styles pour les composants**
```css
.cps-input {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.code-inputs {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.code-inputs input {
  width: 60px;
  height: 60px;
  text-align: center;
  font-size: 1.5rem;
  border: 2px solid #ddd;
  border-radius: var(--border-radius);
  transition: var(--transition);
}

.code-inputs input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(44, 62, 80, 0.1);
}

.mode-card {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  border: 2px solid #ddd;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
  margin-bottom: 1rem;
}

.mode-card:hover {
  border-color: var(--primary-color);
  box-shadow: var(--box-shadow);
}

.mode-card.selected {
  border-color: var(--primary-color);
  background-color: rgba(44, 62, 80, 0.05);
}

.mode-icon {
  font-size: 2rem;
  margin-right: 1rem;
  color: var(--primary-color);
}
```

## 🔄 Gestion d'état (Vuex)

### **Store DMP**
```javascript
// store/modules/dmp.js
export default {
  namespaced: true,
  state: {
    session: null,
    patient: null,
    notifications: [],
    isLoading: false,
    error: null
  },
  mutations: {
    setSession(state, session) {
      state.session = session;
    },
    setPatient(state, patient) {
      state.patient = patient;
    },
    setNotifications(state, notifications) {
      state.notifications = notifications;
    },
    setLoading(state, loading) {
      state.isLoading = loading;
    },
    setError(state, error) {
      state.error = error;
    }
  },
  actions: {
    async authenticateCPS({ commit }, credentials) {
      commit('setLoading', true);
      try {
        const response = await fetch('/api/medecin/dmp/authentification-cps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        });
        const result = await response.json();
        
        if (result.status === 'success') {
          commit('setSession', result.data);
          return result;
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        commit('setError', error.message);
        throw error;
      } finally {
        commit('setLoading', false);
      }
    }
  }
}
```

## 📊 Routes Vue Router

```javascript
// router/index.js
const routes = [
  {
    path: '/dmp',
    name: 'DMP',
    component: () => import('@/views/dmp/DMPLayout.vue'),
    children: [
      {
        path: 'search-patient',
        name: 'DMPSearchPatient',
        component: () => import('@/views/dmp/PatientSearch.vue')
      },
      {
        path: 'authentification-cps/:patientId',
        name: 'CPSAuthentication',
        component: () => import('@/views/dmp/CPSAuthentication.vue')
      },
      {
        path: 'selection-mode',
        name: 'AccessModeSelection',
        component: () => import('@/views/dmp/AccessModeSelection.vue')
      },
      {
        path: 'acces-confirme',
        name: 'AccessConfirmed',
        component: () => import('@/views/dmp/AccessConfirmed.vue')
      }
    ]
  }
]
```

## 🔐 Sécurité et validation

### **Validation côté client**
```javascript
// utils/validation.js
export const validateCPS = (code) => {
  if (!code || code.length !== 4) {
    return { valid: false, message: 'Le code CPS doit contenir 4 chiffres' };
  }
  
  if (!/^\d{4}$/.test(code)) {
    return { valid: false, message: 'Le code CPS ne doit contenir que des chiffres' };
  }
  
  return { valid: true };
};

export const validateAccessRequest = (data) => {
  const errors = [];
  
  if (!data.mode_acces) {
    errors.push('Le mode d\'accès est requis');
  }
  
  if (!data.raison_acces || data.raison_acces.length < 10) {
    errors.push('La raison d\'accès doit contenir au moins 10 caractères');
  }
  
  if (!data.duree_acces || data.duree_acces < 15 || data.duree_acces > 480) {
    errors.push('La durée d\'accès doit être entre 15 et 480 minutes');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};
```

## 📱 Responsive Design

### **Breakpoints recommandés**
```css
/* Mobile First */
@media (min-width: 768px) {
  .mode-card {
    flex-direction: row;
  }
}

@media (min-width: 1024px) {
  .cps-input {
    max-width: 400px;
    margin: 0 auto;
  }
}

@media (min-width: 1200px) {
  .access-modes {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
}
```

## 🧪 Tests Frontend

### **Tests unitaires (Jest)**
```javascript
// tests/unit/CPSAuthentication.spec.js
import { shallowMount } from '@vue/test-utils';
import CPSAuthentication from '@/views/dmp/CPSAuthentication.vue';

describe('CPSAuthentication.vue', () => {
  it('valide le format du code CPS', () => {
    const wrapper = shallowMount(CPSAuthentication);
    
    // Test code valide
    wrapper.setData({ codeCPS: '1234' });
    expect(wrapper.vm.isValidCode).toBe(true);
    
    // Test code invalide
    wrapper.setData({ codeCPS: '123' });
    expect(wrapper.vm.isValidCode).toBe(false);
  });
  
  it('gère les tentatives d\'authentification', async () => {
    const wrapper = shallowMount(CPSAuthentication);
    
    // Simuler une tentative échouée
    await wrapper.vm.validateCPS();
    expect(wrapper.vm.attempts).toBe(1);
    
    // Vérifier le blocage après 3 tentatives
    wrapper.setData({ attempts: 3 });
    expect(wrapper.vm.isBlocked).toBe(true);
  });
});
```

## 📈 Monitoring et Analytics

### **Tracking des événements**
```javascript
// utils/analytics.js
export const trackDMPEvent = (event, data) => {
  // Google Analytics
  gtag('event', event, {
    event_category: 'DMP',
    event_label: data.mode_acces || 'unknown',
    value: data.duree_acces || 0
  });
  
  // Custom tracking
  console.log(`DMP Event: ${event}`, data);
};

// Utilisation
trackDMPEvent('cps_authentication_success', {
  mode_acces: 'autorise_par_patient',
  duree_acces: 60
});
```

Cette documentation fournit tous les éléments nécessaires pour implémenter l'interface frontend complète de la fonctionnalité DMP, avec une architecture modulaire et des composants réutilisables. 