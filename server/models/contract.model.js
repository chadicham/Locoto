const mongoose = require('mongoose');

// Schéma pour les documents attachés au contrat
const documentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['idCard', 'drivingLicense', 'vehiclePhotos', 'other']
  },
  url: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true
  },
  description: String
});

// Schéma pour les signatures
const signatureSchema = new mongoose.Schema({
  party: {
    type: String,
    required: true,
    enum: ['owner', 'renter']
  },
  signature: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: String
});

// Schéma principal du contrat
const contractSchema = new mongoose.Schema({
  contractNumber: {
    type: String,
    required: true,
    index: {
        unique: true,
        sparse: true
    }
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  renter: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      street: {
        type: String,
        required: true,
        trim: true
      },
      city: {
        type: String,
        required: true,
        trim: true
      },
      postalCode: {
        type: String,
        required: true,
        trim: true
      }
    }
  },
  rental: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    initialMileage: {
      type: Number,
      required: true
    },
    allowedMileage: Number,
    initialFuelLevel: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    dailyRate: {
      type: Number,
      required: true,
      min: 0
    },
    deposit: {
      type: Number,
      required: true,
      min: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    }
  },
  documents: [documentSchema],
  signatures: [signatureSchema],
  status: {
    type: String,
    required: true,
    enum: ['draft', 'pending', 'active', 'completed', 'cancelled', 'terminated'],
    default: 'draft'
  },
  payment: {
    status: {
      type: String,
      enum: ['pending', 'partial', 'completed', 'refunded'],
      default: 'pending'
    },
    method: {
      type: String,
      enum: ['cash', 'card', 'transfer', 'other']
    },
    depositPaid: {
      type: Boolean,
      default: false
    },
    depositReturnDate: Date,
    transactions: [{
      type: {
        type: String,
        enum: ['payment', 'refund']
      },
      amount: Number,
      date: Date,
      reference: String
    }]
  },
  returnDetails: {
    actualReturnDate: Date,
    finalMileage: Number,
    fuelLevel: Number,
    condition: {
      type: String,
      enum: ['perfect', 'good', 'damaged']
    },
    notes: String,
    additionalCharges: [{
      description: String,
      amount: Number
    }]
  },
  notes: String
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour améliorer les performances
contractSchema.index({ owner: 1, status: 1 });
contractSchema.index({ vehicle: 1, startDate: 1, endDate: 1 });


// Middleware pour générer le numéro de contrat
contractSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const count = await this.constructor.countDocuments({
      owner: this.owner,
      createdAt: {
        $gte: new Date(date.getFullYear(), date.getMonth(), 1),
        $lte: new Date(date.getFullYear(), date.getMonth() + 1, 0)
      }
    });
    this.contractNumber = `LOC-${year}${month}-${(count + 1).toString().padStart(3, '0')}`;
  }
  next();
});

// Méthode pour calculer la durée de location en jours
contractSchema.methods.getRentalDuration = function() {
  return Math.ceil(
    (this.rental.endDate - this.rental.startDate) / (1000 * 60 * 60 * 24)
  );
};

// Méthode pour calculer le dépassement kilométrique
contractSchema.methods.getMileageOverage = function() {
  if (!this.returnDetails?.finalMileage || !this.rental.allowedMileage) {
    return 0;
  }
  const mileageDiff = this.returnDetails.finalMileage - this.rental.initialMileage;
  return Math.max(0, mileageDiff - this.rental.allowedMileage);
};

// Virtuel pour le statut de paiement global
contractSchema.virtual('paymentComplete').get(function() {
  if (!this.payment.transactions || this.payment.transactions.length === 0) {
    return false;
  }
  const totalPaid = this.payment.transactions.reduce((sum, transaction) => {
    return sum + (transaction.type === 'payment' ? transaction.amount : -transaction.amount);
  }, 0);
  return totalPaid >= this.rental.totalAmount;
});

const Contract = mongoose.model('Contract', contractSchema);

module.exports = Contract;