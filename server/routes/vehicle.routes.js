const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicle.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { upload, handleMulterError } = require('../middleware/upload');

// Application du middleware d'authentification à toutes les routes
router.use(authMiddleware.protect);

// Routes principales pour les véhicules
router.route('/')
  .get(vehicleController.getVehicles)
  .post(
    upload.array('images', process.env.MAX_FILES_PER_UPLOAD || 5),
    handleMulterError,
    vehicleController.validateVehicleInput,
    vehicleController.createVehicle
  );

// Routes pour un véhicule spécifique
router.route('/:id')
  .get(vehicleController.getVehicleById)
  .patch(
    upload.array('images', process.env.MAX_FILES_PER_UPLOAD || 5),
    handleMulterError,
    vehicleController.validateVehicleInput,
    vehicleController.updateVehicle
  )
  .delete(vehicleController.deleteVehicle);

// Routes pour des fonctionnalités spécifiques
router.get('/:id/status', vehicleController.checkVehicleStatus);
router.get('/:id/history', vehicleController.getVehicleHistory);
router.post('/:id/check-availability', vehicleController.checkAvailability);
router.patch('/:id/archive', vehicleController.archiveVehicle);

module.exports = router;