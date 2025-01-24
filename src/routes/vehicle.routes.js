const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicle.controller');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Configuration du middleware pour la gestion des images
const imageUpload = upload.array('images', 5); // Maximum 5 images par véhicule

// Routes protégées par authentification
router.use(auth);

// Routes pour la gestion des véhicules
router.get('/', vehicleController.getVehicles);
router.get('/:id', vehicleController.getVehicleById);
router.post('/', imageUpload, vehicleController.createVehicle);
router.put('/:id', imageUpload, vehicleController.updateVehicle);
router.delete('/:id', vehicleController.deleteVehicle);

// Routes pour les fonctionnalités spécifiques
router.get('/:id/status', vehicleController.checkVehicleStatus);
router.get('/:id/history', vehicleController.getVehicleHistory);
router.post('/:id/check-availability', vehicleController.checkAvailability);
router.patch('/:id/archive', vehicleController.archiveVehicle);

// Middleware de gestion d'erreurs pour les uploads
router.use((error, req, res, next) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'La taille des fichiers ne doit pas dépasser 5MB'
    });
  }
  
  if (error.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      error: 'Le nombre maximum d\'images est de 5'
    });
  }

  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'Type de fichier non supporté'
    });
  }

  next(error);
});

module.exports = router;