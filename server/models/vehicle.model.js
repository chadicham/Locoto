const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true
  }
});

const maintenanceRecordSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  description: String,
  mileage: {
    type: Number,
    required: true
  },
  cost: {
    type: Number,
    required: true
  },
  provider: String,
  documents: [imageSchema]
}, { timestamps: true });

const vehicleSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  brand: {
    type: String,
    required: [true, 'La marque est requise'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Le modèle est requis'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Le type de véhicule est requis'],
    enum: ['Citadine', 'Berline', 'SUV', 'Break', 'Monospace', 'Utilitaire']
  },
  licensePlate: {
    type: String,
    required: [true, "L'immatriculation est requise"],
    trim: true,
    uppercase: true
  },
  fuel: {
    type: String,
    required: [true, 'Le type de carburant est requis'],
    enum: ['Essence', 'Diesel', 'Hybride', 'Électrique']
  },
  year: {
    type: Number,
    required: [true, "L'année est requise"],
    min: [1900, 'Année invalide'],
    max: [new Date().getFullYear(), 'Année invalide']
  },
  mileage: {
    type: Number,
    required: [true, 'Le kilométrage est requis'],
    min: [0, 'Le kilométrage doit être positif']
  },
  dailyRate: {
    type: Number,
    required: [true, 'Le tarif journalier est requis'],
    min: [0, 'Le tarif doit être positif']
  },
  description: {
    type: String,
    trim: true
  },
  features: [{
    type: String,
    enum: [
      'Climatisation',
      'GPS',
      'Bluetooth',
      'Siège bébé',
      'Régulateur de vitesse',
      'Caméra de recul',
      'Toit ouvrant',
      'Audio premium'
    ]
  }],
  images: [imageSchema],
  maintenanceHistory: [maintenanceRecordSchema],
  lastMaintenanceDate: {
    type: Date
  },
  nextMaintenanceDate: {
    type: Date
  },
  currentRental: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    default: null
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date
  },
  deletedAt: {
    type: Date
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour améliorer les performances des requêtes
vehicleSchema.index({ owner: 1, isDeleted: 1 });
vehicleSchema.index({ licensePlate: 1 });

// Virtuals
vehicleSchema.virtual('rentalHistory', {
  ref: 'Contract',
  localField: '_id',
  foreignField: 'vehicle'
});

// Méthodes
vehicleSchema.methods.updateMileage = function(newMileage) {
  if (newMileage < this.mileage) {
    throw new Error('Le nouveau kilométrage ne peut pas être inférieur au kilométrage actuel');
  }
  this.mileage = newMileage;
  return this.save();
};

// Middleware pre-save pour la validation
vehicleSchema.pre('save', function(next) {
  if (this.isModified('mileage') && this.mileage < 0) {
    next(new Error('Le kilométrage ne peut pas être négatif'));
  }
  next();
});

// Middleware pour vérifier la disponibilité avant la mise à jour
vehicleSchema.pre('findOneAndUpdate', async function(next) {
  const docToUpdate = await this.model.findOne(this.getQuery());
  if (!docToUpdate) return next();

  if (docToUpdate.currentRental && this._update.isDeleted) {
    next(new Error('Impossible de supprimer un véhicule actuellement en location'));
  }
  next();
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;