# Guide de Démarrage Rapide - Frontend DMP

## 🚀 Vue d'ensemble

Ce guide vous accompagne dans l'implémentation frontend de la fonctionnalité DMP (Dossier Médical Partagé) avec Vue.js.

## 📋 Prérequis

### **Technologies requises**
- Vue.js 3.x
- Vue Router 4.x
- Vuex 4.x (ou Pinia)
- Axios ou Fetch API
- CSS/SCSS pour le styling

### **Dépendances recommandées**
```bash
npm install vue@3 vue-router@4 vuex@4 axios
npm install -D @vue/cli-service @vue/cli-plugin-router @vue/cli-plugin-vuex
```

## 🎯 Étapes d'implémentation

### **Étape 1 : Configuration du projet**

#### **1.1 Structure des dossiers**
```
src/
├── views/
│   └── dmp/
│       ├── DMPLayout.vue
│       ├── PatientSearch.vue
│       ├── CPSAuthentication.vue
│       ├── AccessModeSelection.vue
│       └── AccessConfirmed.vue
├── components/
│   └── dmp/
│       ├── CPSInput.vue
│       ├── AccessModeCard.vue
│       └── NotificationStatus.vue
├── store/
│   └── modules/
│       └── dmp.js
├── services/
│   └── dmpService.js
└── utils/
    ├── validation.js
    └── analytics.js
```

#### **1.2 Configuration Vue Router**
```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/dmp',
    name: 'DMP',
    component: () => import('@/views/dmp/DMPLayout.vue'),
    children: [
      {
        path: '',
        redirect: '/dmp/search-patient'
      },
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

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

### **Étape 2 : Service API**

#### **2.1 Service DMP**
```javascript
// services/dmpService.js
import axios from 'axios'

const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api'

class DMPService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000
    })
  }

  // Authentification CPS
  async authenticateCPS(credentials) {
    try {
      const response = await this.api.post('/medecin/dmp/authentification-cps', credentials)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Créer une session
  async createSession(sessionData) {
    try {
      const response = await this.api.post('/medecin/dmp/creer-session', sessionData)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Demander l'accès
  async requestAccess(accessData) {
    try {
      const response = await this.api.post('/medecin/dmp/demande-acces', accessData)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Récupérer les notifications
  async getNotifications(sessionId) {
    try {
      const response = await this.api.get(`/medecin/dmp/notifications/${sessionId}`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Test du système
  async testSystem() {
    try {
      const response = await this.api.get('/medecin/dmp/test/systeme')
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  handleError(error) {
    if (error.response) {
      return {
        status: 'error',
        message: error.response.data.message || 'Erreur serveur',
        code: error.response.data.error?.code,
        details: error.response.data.error
      }
    }
    return {
      status: 'error',
      message: 'Erreur de connexion',
      code: 'NETWORK_ERROR'
    }
  }
}

export default new DMPService()
```

### **Étape 3 : Store Vuex**

#### **3.1 Module DMP**
```javascript
// store/modules/dmp.js
import dmpService from '@/services/dmpService'

export default {
  namespaced: true,
  state: {
    session: null,
    patient: null,
    notifications: [],
    isLoading: false,
    error: null,
    attempts: 0,
    maxAttempts: 3
  },
  mutations: {
    setSession(state, session) {
      state.session = session
    },
    setPatient(state, patient) {
      state.patient = patient
    },
    setNotifications(state, notifications) {
      state.notifications = notifications
    },
    setLoading(state, loading) {
      state.isLoading = loading
    },
    setError(state, error) {
      state.error = error
    },
    incrementAttempts(state) {
      state.attempts++
    },
    resetAttempts(state) {
      state.attempts = 0
    }
  },
  actions: {
    async authenticateCPS({ commit, state }, credentials) {
      commit('setLoading', true)
      commit('setError', null)
      
      try {
        const result = await dmpService.authenticateCPS(credentials)
        
        if (result.status === 'success') {
          commit('setSession', result.data)
          commit('resetAttempts')
          return result
        } else {
          commit('incrementAttempts')
          throw new Error(result.message)
        }
      } catch (error) {
        commit('setError', error.message)
        throw error
      } finally {
        commit('setLoading', false)
      }
    },

    async createSession({ commit }, sessionData) {
      commit('setLoading', true)
      
      try {
        const result = await dmpService.createSession(sessionData)
        commit('setSession', result.data)
        return result
      } catch (error) {
        commit('setError', error.message)
        throw error
      } finally {
        commit('setLoading', false)
      }
    },

    async requestAccess({ commit }, accessData) {
      commit('setLoading', true)
      
      try {
        const result = await dmpService.requestAccess(accessData)
        return result
      } catch (error) {
        commit('setError', error.message)
        throw error
      } finally {
        commit('setLoading', false)
      }
    }
  },
  getters: {
    isBlocked: state => state.attempts >= state.maxAttempts,
    remainingAttempts: state => state.maxAttempts - state.attempts,
    hasActiveSession: state => state.session && state.session.statut === 'active'
  }
}
```

### **Étape 4 : Composants principaux**

#### **4.1 Page de recherche de patient**
```vue
<!-- views/dmp/PatientSearch.vue -->
<template>
  <div class="patient-search">
    <div class="search-header">
      <h1>Accès DMP - Recherche Patient</h1>
      <p>Sélectionnez le patient pour accéder à son dossier médical</p>
    </div>

    <div class="search-form">
      <div class="search-input">
        <label for="search">Rechercher un patient</label>
        <input
          id="search"
          v-model="searchQuery"
          type="text"
          placeholder="Nom, prénom ou numéro de dossier..."
          @input="debounceSearch"
        />
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Recherche en cours...</p>
    </div>

    <div v-else-if="patients.length > 0" class="patients-list">
      <div
        v-for="patient in patients"
        :key="patient.id"
        class="patient-card"
        @click="selectPatient(patient)"
      >
        <div class="patient-info">
          <h3>{{ patient.nom }} {{ patient.prenom }}</h3>
          <p>Dossier: {{ patient.numero_dossier }}</p>
          <p>Date de naissance: {{ formatDate(patient.date_naissance) }}</p>
        </div>
        <div class="patient-actions">
          <button class="btn-primary">Sélectionner</button>
        </div>
      </div>
    </div>

    <div v-else-if="searchQuery && !loading" class="no-results">
      <p>Aucun patient trouvé pour "{{ searchQuery }}"</p>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

export default {
  name: 'PatientSearch',
  setup() {
    const router = useRouter()
    const store = useStore()
    
    const searchQuery = ref('')
    const patients = ref([])
    const loading = ref(false)

    const debounceSearch = () => {
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        searchPatients()
      }, 300)
    }

    const searchPatients = async () => {
      if (!searchQuery.value.trim()) {
        patients.value = []
        return
      }

      loading.value = true
      try {
        // Appel API pour rechercher les patients
        const response = await fetch(`/api/patients/search?q=${searchQuery.value}`)
        const data = await response.json()
        patients.value = data.patients || []
      } catch (error) {
        console.error('Erreur recherche:', error)
      } finally {
        loading.value = false
      }
    }

    const selectPatient = (patient) => {
      store.commit('dmp/setPatient', patient)
      router.push(`/dmp/authentification-cps/${patient.id}`)
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('fr-FR')
    }

    return {
      searchQuery,
      patients,
      loading,
      debounceSearch,
      selectPatient,
      formatDate
    }
  }
}
</script>
```

#### **4.2 Page d'authentification CPS**
```vue
<!-- views/dmp/CPSAuthentication.vue -->
<template>
  <div class="cps-authentication">
    <div class="auth-header">
      <h1>Authentification CPS</h1>
      <p>Patient: {{ patientInfo.nom }} {{ patientInfo.prenom }}</p>
      <p>Dossier: {{ patientInfo.numero_dossier }}</p>
    </div>

    <div class="auth-form">
      <div class="cps-input-container">
        <label>Code CPS (4 chiffres)</label>
        <CPSInput
          v-model="codeCPS"
          :error="error"
          :attempts="attempts"
          :max-attempts="maxAttempts"
          @submit="validateCPS"
        />
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-if="isBlocked" class="blocked-message">
        <p>Compte temporairement bloqué</p>
        <p>Tentatives restantes: {{ remainingAttempts }}</p>
      </div>

      <div class="auth-actions">
        <button
          class="btn-primary"
          :disabled="!isValidCode || isLoading || isBlocked"
          @click="validateCPS"
        >
          <span v-if="isLoading">Validation...</span>
          <span v-else>Valider</span>
        </button>
        
        <button
          class="btn-secondary"
          @click="$router.go(-1)"
        >
          Retour
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import CPSInput from '@/components/dmp/CPSInput.vue'

export default {
  name: 'CPSAuthentication',
  components: {
    CPSInput
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    
    const codeCPS = ref('')
    const error = ref('')
    const isLoading = ref(false)

    const patientInfo = computed(() => store.state.dmp.patient)
    const attempts = computed(() => store.state.dmp.attempts)
    const maxAttempts = computed(() => store.state.dmp.maxAttempts)
    const isBlocked = computed(() => store.getters['dmp/isBlocked'])
    const remainingAttempts = computed(() => store.getters['dmp/remainingAttempts'])

    const isValidCode = computed(() => {
      return codeCPS.value.length === 4 && /^\d{4}$/.test(codeCPS.value)
    })

    const validateCPS = async () => {
      if (!isValidCode.value || isLoading.value || isBlocked.value) {
        return
      }

      isLoading.value = true
      error.value = ''

      try {
        await store.dispatch('dmp/authenticateCPS', {
          numero_adeli: store.state.medecin.numero_adeli,
          code_cps: codeCPS.value,
          patient_id: route.params.patientId
        })

        // Succès - redirection vers la sélection du mode
        router.push('/dmp/selection-mode')
      } catch (error) {
        error.value = error.message
      } finally {
        isLoading.value = false
      }
    }

    onMounted(() => {
      if (!patientInfo.value) {
        router.push('/dmp/search-patient')
      }
    })

    return {
      codeCPS,
      error,
      isLoading,
      patientInfo,
      attempts,
      maxAttempts,
      isBlocked,
      remainingAttempts,
      isValidCode,
      validateCPS
    }
  }
}
</script>
```

### **Étape 5 : Styles CSS**

#### **5.1 Variables CSS globales**
```css
/* assets/styles/variables.css */
:root {
  /* Couleurs */
  --primary-color: #2c3e50;
  --secondary-color: #3498db;
  --success-color: #27ae60;
  --warning-color: #f39c12;
  --danger-color: #e74c3c;
  --info-color: #17a2b8;
  
  /* Neutres */
  --white: #ffffff;
  --light-gray: #f8f9fa;
  --gray: #6c757d;
  --dark-gray: #343a40;
  
  /* Espacements */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Bordures */
  --border-radius: 8px;
  --border-radius-lg: 12px;
  
  /* Ombres */
  --box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  --box-shadow-lg: 0 4px 20px rgba(0,0,0,0.15);
  
  /* Transitions */
  --transition: all 0.3s ease;
  --transition-fast: all 0.15s ease;
}
```

#### **5.2 Styles pour les composants DMP**
```css
/* assets/styles/dmp.css */
.dmp-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.dmp-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.dmp-header h1 {
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
}

.dmp-header p {
  color: var(--gray);
  font-size: 1.1rem;
}

/* Formulaire de recherche */
.search-form {
  margin-bottom: var(--spacing-xl);
}

.search-input {
  position: relative;
}

.search-input label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
  color: var(--primary-color);
}

.search-input input {
  width: 100%;
  padding: var(--spacing-md);
  border: 2px solid var(--light-gray);
  border-radius: var(--border-radius);
  font-size: 1rem;
  transition: var(--transition);
}

.search-input input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(44, 62, 80, 0.1);
}

/* Cartes patient */
.patients-list {
  display: grid;
  gap: var(--spacing-lg);
}

.patient-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border: 2px solid var(--light-gray);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
}

.patient-card:hover {
  border-color: var(--primary-color);
  box-shadow: var(--box-shadow);
}

.patient-info h3 {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--primary-color);
}

.patient-info p {
  margin: var(--spacing-xs) 0;
  color: var(--gray);
}

/* Boutons */
.btn-primary {
  background-color: var(--primary-color);
  color: var(--white);
  border: none;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.btn-primary:hover:not(:disabled) {
  background-color: #34495e;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: var(--white);
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.btn-secondary:hover {
  background-color: var(--primary-color);
  color: var(--white);
}

/* Messages d'erreur */
.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  margin: var(--spacing-md) 0;
  border: 1px solid #f5c6cb;
}

.blocked-message {
  background-color: #fff3cd;
  color: #856404;
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  margin: var(--spacing-md) 0;
  border: 1px solid #ffeaa7;
}

/* Loading */
.loading {
  text-align: center;
  padding: var(--spacing-xl);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--light-gray);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto var(--spacing-md);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

## 🚀 Démarrage rapide

### **1. Installation des dépendances**
```bash
npm install vue@3 vue-router@4 vuex@4 axios
```

### **2. Configuration de l'environnement**
```bash
# .env
VUE_APP_API_URL=http://localhost:3000/api
VUE_APP_TITLE=DMP - Dossier Médical Partagé
```

### **3. Test du système**
```bash
# Démarrer le serveur de développement
npm run serve

# Tester l'API
curl http://localhost:3000/api/medecin/dmp/test/systeme
```

### **4. Navigation dans l'application**
1. Accéder à `/dmp/search-patient`
2. Rechercher et sélectionner un patient
3. Saisir le code CPS (1234 pour les tests)
4. Choisir le mode d'accès
5. Confirmer l'accès

## 🔧 Personnalisation

### **Thème personnalisé**
```css
:root {
  --primary-color: #your-color;
  --secondary-color: #your-color;
  /* ... autres variables */
}
```

### **Configuration API**
```javascript
// services/dmpService.js
const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api'
```

### **Validation personnalisée**
```javascript
// utils/validation.js
export const validateCPS = (code) => {
  // Votre logique de validation
}
```

## 📱 Responsive Design

Le système est conçu pour être responsive par défaut. Les breakpoints principaux sont :

- **Mobile** : < 768px
- **Tablet** : 768px - 1024px  
- **Desktop** : > 1024px

## 🧪 Tests

### **Tests unitaires**
```bash
npm run test:unit
```

### **Tests E2E**
```bash
npm run test:e2e
```

Ce guide vous permet de démarrer rapidement l'implémentation frontend de la fonctionnalité DMP avec une architecture modulaire et des composants réutilisables. 