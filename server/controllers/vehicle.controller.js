const Vehicle = require('../models/vehicle.model');
const Contract = require('../models/contract.model');
const User = require('../models/user.model');
const cloudinary = require('../config/cloudinary');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { body, validationResult } = require('express-validator');
const fs = require('fs');

// Validation des entrées
exports.validateVehicleInput = [
  body('brand').notEmpty().trim().withMessage('La marque est requise'),
  body('model').notEmpty().trim().withMessage('Le modèle est requis'),
  body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Année invalide'),
  body('registrationNumber').notEmpty().trim()
    .withMessage("Le numéro d'immatriculation est requis")
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
  const subscription = await getSubscriptionStatus(req.user.id);
  const vehicleCount = await Vehicle.countDocuments({ 
    owner: req.user.id,
    isDeleted: false 
  });

  if (vehicleCount >= subscription.maxVehicles) {
    throw new AppError('Limite de véhicules atteinte pour votre forfait', 403);
  }

  const vehicleData = {
    ...req.body,
    owner: req.user.id,
    images: []
  };

  if (req.files?.length > 0) {
    vehicleData.images = await handleImageUpload(req.files, req.user.id);
  }

  const vehicle = await Vehicle.create(vehicleData);
  res.status(201).json(vehicle);
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

  const uploadPromises = files.map(file => 
    cloudinary.uploader.upload(file.path, {
      folder: `vehicles/${userId}`,
      resource_type: 'auto'
    })
  );

  const results = await Promise.all(uploadPromises);
  
  files.forEach(file => fs.unlinkSync(file.path));

  return results.map(result => ({
    url: result.secure_url,
    publicId: result.public_id
  }));
};

const handleImageDeletion = async (imageIds) => {
  await Promise.all(
    imageIds.map(id => cloudinary.uploader.destroy(id))
  );
};

const getSubscriptionStatus = async (userId) => {
  const user = await User.findById(userId).select('subscription');
  return {
    maxVehicles: user.subscription.vehicleLimit
  };
};