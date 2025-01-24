import { configureStore, createSlice } from '@reduxjs/toolkit';

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
  initialState: { subscription: { vehicleLimit: 0 }, isAuthenticated: false },
  reducers: {
    setUser: (state, action) => action.payload,
    updateSubscription: (state, action) => {
      state.subscription = action.payload;
    },
  },
});

// Configuration du store
const store = configureStore({
  reducer: {
    vehicles: vehicleSlice.reducer,
    contracts: contractSlice.reducer,
    user: userSlice.reducer,
  },
});

// Export des actions et du store
export const {
  setVehicles,
  addVehicle,
  updateVehicle,
  removeVehicle,
  archiveVehicle,
} = vehicleSlice.actions;

export const {
  setContracts,
  addContract,
  updateContract,
  removeContract,
} = contractSlice.actions;

export const { setUser, updateSubscription } = userSlice.actions;

export default store;
