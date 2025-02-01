const Vehicle = require('../models/vehicle.model');
const Contract = require('../models/contract.model');
const User = require('../models/user.model');
const { uploadFile, deleteFile } = require('../config/cloudinary');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { body, validationResult } = require('express-validator');
const fs = require('fs');

// Validation des entrées
exports.validateVehicleInput = [
  body('brand').notEmpty().trim().withMessage('La marque est requise'),
  body('model').notEmpty().trim().withMessage('Le modèle est requis'),
  body('type').notEmpty().isIn(['Voiture', 'Moto', 'Scooter']).withMessage('Type de véhicule invalide'),
  body('licensePlate').notEmpty().trim().withMessage("L'immatriculation est requise"),
  body('fuel').notEmpty().withMessage('Le type de carburant est requis'),
  body('year').isString().custom(value => {
    const year = parseInt(value);
    if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
      throw new Error('Année invalide');
    }
    return true;
  }),
  body('mileage').isString().custom(value => {
    const mileage = parseInt(value);
    if (isNaN(mileage) || mileage < 0) {
      throw new Error('Kilométrage invalide');
    }
    return true;
  }),
  body('dailyRate').isString().custom(value => {
    const rate = parseFloat(value);
    if (isNaN(rate) || rate <= 0) {
      throw new Error('Tarif journalier invalide');
    }
    return true;
  }),
  body('features').custom(value => {
    if (!value) return true;
    try {
      const features = typeof value === 'string' ? JSON.parse(value) : value;
      if (!Array.isArray(features)) {
        throw new Error('Les équipements doivent être une liste');
      }
      return true;
    } catch (error) {
      throw new Error('Format des équipements invalide');
    }
  }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Erreurs de validation:', errors.array());
      return res.status(400).json({ 
        message: 'Erreur de validation',
        errors: errors.array() 
      });
    }
    next();
  }
];

exports.getVehicles = catchAsync(async (req, res) => {
  const vehicles = await Vehicle.find({ 
    owner: req.user.id, 
    isDeleted: false 
  })
    .populate('currentRental', 'startDate endDate')
    .sort({ createdAt: -1 });

  res.json(vehicles);
});

exports.getVehicleById = catchAsync(async (req, res) => {
  const vehicle = await Vehicle.findOne({ 
    _id: req.params.id, 
    owner: req.user.id,
    isDeleted: false 
  }).populate('currentRental', 'startDate endDate');

  if (!vehicle) {
    throw new AppError('Véhicule non trouvé', 404);
  }

  res.json(vehicle);
});

exports.createVehicle = catchAsync(async (req, res) => {
  console.log('Corps de la requête reçue:', req.body);
  
  // Parser les features si elles sont en format string
  if (req.body.features && typeof req.body.features === 'string') {
    try {
      req.body.features = JSON.parse(req.body.features);
    } catch (error) {
      throw new AppError('Format des équipements invalide', 400);
    }
  }

  // Parser les documents si en format string
  if (req.body.documents && typeof req.body.documents === 'string') {
    try {
      req.body.documents = JSON.parse(req.body.documents);
    } catch (error) {
      throw new AppError('Format des documents invalide', 400);
    }
  }

  // Vérifier la limite de véhicules
  const subscription = await getSubscriptionStatus(req.user.id);
  const vehicleCount = await Vehicle.countDocuments({ 
    owner: req.user.id,
    isDeleted: false 
  });

  if (vehicleCount >= subscription.maxVehicles) {
    throw new AppError('Limite de véhicules atteinte pour votre forfait', 403);
  }

  // Préparer les données du véhicule
  const vehicleData = {
    ...req.body,
    owner: req.user.id,
    images: []
  };

  // Gérer les images si présentes
  if (req.files?.length > 0) {
    const uploadedImages = await handleImageUpload(req.files, req.user.id);
    vehicleData.images = uploadedImages;
  }

  console.log('Données du véhicule à créer:', vehicleData);

  // Créer le véhicule
  try {
    const vehicle = await Vehicle.create(vehicleData);
    res.status(201).json(vehicle);
  } catch (error) {
    console.error('Erreur lors de la création:', error);
    if (error.name === 'ValidationError') {
      throw new AppError(`Erreur de validation: ${error.message}`, 400);
    }
    throw error;
  }
});

exports.updateVehicle = catchAsync(async (req, res) => {
  const vehicle = await Vehicle.findOne({ 
    _id: req.params.id, 
    owner: req.user.id 
  });

  if (!vehicle) {
    throw new AppError('Véhicule non trouvé', 404);
  }

  const updateData = { ...req.body };

  if (req.body.deleteImages) {
    await handleImageDeletion(JSON.parse(req.body.deleteImages));
    vehicle.images = vehicle.images.filter(
      img => !JSON.parse(req.body.deleteImages).includes(img.publicId)
    );
  }

  if (req.files?.length > 0) {
    const newImages = await handleImageUpload(req.files, req.user.id);
    updateData.images = [...vehicle.images, ...newImages];
  }

  const updatedVehicle = await Vehicle.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true }
  );

  res.json(updatedVehicle);
});

exports.checkVehicleStatus = catchAsync(async (req, res) => {
  const vehicle = await Vehicle.findOne({ 
    _id: req.params.id, 
    owner: req.user.id 
  }).populate('currentRental', 'startDate endDate');

  if (!vehicle) {
    throw new AppError('Véhicule non trouvé', 404);
  }

  const now = new Date();
  const upcomingRentals = await Contract.find({
    vehicle: req.params.id,
    startDate: { $gt: now },
    status: { $nin: ['cancelled', 'terminated'] }
  }).sort({ startDate: 1 });

  res.json({
    isRented: vehicle.currentRental !== null,
    currentRental: vehicle.currentRental,
    upcomingRentals: upcomingRentals,
    isArchived: vehicle.isArchived || false
  });
});

exports.deleteVehicle = catchAsync(async (req, res) => {
  const vehicle = await Vehicle.findOne({ 
    _id: req.params.id, 
    owner: req.user.id 
  });

  if (!vehicle) {
    throw new AppError('Véhicule non trouvé', 404);
  }

  const hasActiveContracts = await Contract.exists({
    vehicle: req.params.id,
    status: { $nin: ['cancelled', 'terminated'] }
  });

  if (hasActiveContracts) {
    throw new AppError('Le véhicule ne peut pas être supprimé car il a des locations actives ou à venir', 400);
  }

  if (vehicle.images?.length > 0) {
    await handleImageDeletion(vehicle.images.map(img => img.publicId));
  }

  await Vehicle.findByIdAndUpdate(req.params.id, { 
    isDeleted: true,
    deletedAt: new Date()
  });

  res.json({ message: 'Véhicule supprimé avec succès' });
});

exports.archiveVehicle = catchAsync(async (req, res) => {
  const vehicle = await Vehicle.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.id },
    { isArchived: true, archivedAt: new Date() },
    { new: true }
  );

  if (!vehicle) {
    throw new AppError('Véhicule non trouvé', 404);
  }

  res.json(vehicle);
});

exports.getVehicleHistory = catchAsync(async (req, res) => {
  const vehicle = await Vehicle.findOne({ 
    _id: req.params.id, 
    owner: req.user.id 
  });

  if (!vehicle) {
    throw new AppError('Véhicule non trouvé', 404);
  }

  const history = await Contract.find({ vehicle: req.params.id })
    .sort({ startDate: -1 })
    .select('renterName startDate endDate amount status');

  res.json(history);
});

exports.checkAvailability = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.body;
  
  const vehicle = await Vehicle.findOne({ 
    _id: req.params.id, 
    owner: req.user.id 
  });

  if (!vehicle) {
    throw new AppError('Véhicule non trouvé', 404);
  }

  const conflictingRental = await Contract.findOne({
    vehicle: req.params.id,
    status: { $nin: ['cancelled', 'terminated'] },
    $or: [
      {
        startDate: { $lte: new Date(endDate) },
        endDate: { $gte: new Date(startDate) }
      }
    ]
  });

  res.json({ available: !conflictingRental });
});

// Fonctions utilitaires
const handleImageUpload = async (files, userId) => {
  if (!files?.length) return [];

  try {
    const uploadPromises = files.map(async file => {
      // L'appel correct devrait inclure le fichier comme paramètre
      const result = await uploadFile(file.path, `vehicles/${userId}`);
      return {
        url: result.url,
        publicId: result.publicId
      };
    });

    const results = await Promise.all(uploadPromises);
    
    // Nettoyage des fichiers temporaires
    for (const file of files) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }

    return results;
  } catch (error) {
    // Nettoyage des fichiers temporaires en cas d'erreur
    for (const file of files) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }
    console.error('Erreur lors du téléchargement:', error);
    throw new AppError("Erreur lors du téléchargement des images", 500);
  }
};

const handleImageDeletion = async (imageIds) => {
  try {
    const deletePromises = imageIds.map(id => deleteFile(id));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Erreur lors de la suppression des images:', error);
    throw error;
  }
};

const getSubscriptionStatus = async (userId) => {
  const user = await User.findById(userId).select('subscription');
  return {
    maxVehicles: user.subscription.vehicleLimit
  };
};