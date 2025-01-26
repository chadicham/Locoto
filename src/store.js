import { configureStore, createSlice } from '@reduxjs/toolkit';

// Slice pour l'authentification
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    }
  }
});

// Slice pour les véhicules
const vehicleSlice = createSlice({
  name: 'vehicles',
  initialState: [],
  reducers: {
    setVehicles: (state, action) => action.payload,
    addVehicle: (state, action) => {
      state.push(action.payload);
    },
    updateVehicle: (state, action) => {
      const index = state.findIndex(vehicle => vehicle._id === action.payload._id);
      if (index !== -1) {
        state[index] = action.payload;
      }
    },
    removeVehicle: (state, action) => {
      return state.filter(vehicle => vehicle._id !== action.payload);
    },
    archiveVehicle: (state, action) => {
      const index = state.findIndex(vehicle => vehicle._id === action.payload);
      if (index !== -1) {
        state[index].isArchived = true;
      }
    },
  },
});

// Slice pour les contrats
const contractSlice = createSlice({
  name: 'contracts',
  initialState: [],
  reducers: {
    setContracts: (state, action) => action.payload,
    addContract: (state, action) => {
      state.push(action.payload);
    },
    updateContract: (state, action) => {
      const index = state.findIndex(contract => contract._id === action.payload._id);
      if (index !== -1) {
        state[index] = action.payload;
      }
    },
    removeContract: (state, action) => {
      return state.filter(contract => contract._id !== action.payload);
    },
  },
});

// Slice pour les utilisateurs
const userSlice = createSlice({
  name: 'user',
  initialState: { 
    subscription: { vehicleLimit: 0 }, 
    isAuthenticated: false,
    profile: null
  },
  reducers: {
    setUser: (state, action) => {
      return { ...state, ...action.payload };
    },
    updateSubscription: (state, action) => {
      state.subscription = action.payload;
    },
    updateProfile: (state, action) => {
      state.profile = action.payload;
    },
    clearUser: (state) => {
      state.subscription = { vehicleLimit: 0 };
      state.isAuthenticated = false;
      state.profile = null;
    }
  },
});

// Configuration du store avec tous les reducers
const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    vehicles: vehicleSlice.reducer,
    contracts: contractSlice.reducer,
    user: userSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});

// Export des actions d'authentification
export const { setCredentials, logout } = authSlice.actions;

// Export des actions des véhicules
export const {
  setVehicles,
  addVehicle,
  updateVehicle,
  removeVehicle,
  archiveVehicle,
} = vehicleSlice.actions;

// Export des actions des contrats
export const {
  setContracts,
  addContract,
  updateContract,
  removeContract,
} = contractSlice.actions;

// Export des actions utilisateur
export const { 
  setUser, 
  updateSubscription, 
  updateProfile, 
  clearUser 
} = userSlice.actions;

// Export des sélecteurs
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.user;
export const selectVehicles = (state) => state.vehicles;
export const selectContracts = (state) => state.contracts;

// Export du store
export default store;