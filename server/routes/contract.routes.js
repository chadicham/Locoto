const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contract.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload');

// Configuration du middleware pour la gestion des documents
const documentUpload = upload.fields([
  { name: 'documents_idCard', maxCount: 2 },        // Recto/verso
  { name: 'documents_drivingLicense', maxCount: 2 }, // Recto/verso
  { name: 'documents_proofOfAddress', maxCount: 1 },
  { name: 'documents_vehiclePhotos', maxCount: 10 },
  { name: 'documents_other', maxCount: 5 }
]);

// Application du middleware d'authentification pour toutes les routes
router.use(protect);

// Routes principales
router.get('/', contractController.getContracts);
router.get('/:id', contractController.getContractById);
router.post('/', documentUpload, contractController.createContract);
router.put('/:id', documentUpload, contractController.updateContract);

// Routes spécifiques
router.post('/:id/sign', contractController.validateSignature);
router.post('/:id/cancel', contractController.cancelContract);
router.post('/:id/finalize', contractController.finalizeContract);
router.get('/:id/pdf', contractController.generatePDF);

// Middleware de gestion des erreurs d'upload
router.use((error, req, res, next) => {
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'Type de document non supporté ou nombre maximum de fichiers dépassé'
    });
  }

  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'La taille des fichiers ne doit pas dépasser 5MB'
    });
  }

  next(error);
});

// Middleware de validation des documents requis
const validateRequiredDocuments = (req, res, next) => {
  const requiredDocuments = ['idCard', 'drivingLicense', 'proofOfAddress'];
  const missingDocuments = [];

  requiredDocuments.forEach(docType => {
    const files = req.files[`documents_${docType}`];
    if (!files || files.length === 0) {
      missingDocuments.push(docType);
    }
  });

  if (missingDocuments.length > 0) {
    return res.status(400).json({
      error: 'Documents manquants',
      details: missingDocuments
    });
  }

  next();
};

// Ajout de la validation des documents pour la création de contrat
router.post('/', [documentUpload, validateRequiredDocuments], contractController.createContract);

module.exports = router;