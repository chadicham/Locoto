const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Informations personnelles
  firstName: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true
  },
  email: {
    type: String,
    required: [true, "L'email est requis"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide']
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères'],
    select: false
  },
  phoneNumber: {
    type: String,
    required: [true, 'Le numéro de téléphone est requis']
  },

  // Informations d'abonnement
  subscription: {
    plan: {
      type: String,
      enum: ['gratuit', 'starter', 'pro', 'business', 'unlimited'],
      default: 'gratuit'
    },
    vehicleLimit: {
      type: Number,
      default: 1
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    subscriptionStatus: {
      type: String,
      enum: ['active', 'inactive', 'pending', 'cancelled'],
      default: 'active'
    },
    expiresAt: Date
  },

  // Gestion du compte
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerificationToken: String,
  emailVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date
}, {
  timestamps: true
});

// Middleware pour hacher le mot de passe avant la sauvegarde
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  console.log('🔒 Hashing password...');
  console.log('📝 Original password length:', this.password.length);
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  console.log('🔑 Hashed password:', this.password);
  next();
});

// Méthode pour comparer les mots de passeuserSchema.methods.comparePassword = async function(candidatePassword) {
  userSchema.methods.comparePassword = async function(candidatePassword) {
    console.log('🔍 Comparing passwords:');
    console.log('📥 Candidate password length:', candidatePassword.length);
    console.log('💾 Stored hash:', this.password);
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('✅ Match result:', isMatch);
    return isMatch;
  };

// Après la méthode comparePassword dans le schéma
userSchema.methods.generateAuthToken = function() {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { 
      id: this._id,
      role: this.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const User = mongoose.model('User', userSchema);

module.exports = User;