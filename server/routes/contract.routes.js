const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contract.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload, handleMulterError } = require('../middleware/upload');

router.use(protect);

// Route POST pour créer un contrat
router.post('/', 
    upload.fields([
        { name: 'documents_idCard', maxCount: 1 },
        { name: 'documents_drivingLicense', maxCount: 1 },
        { name: 'documents_vehiclePhotos', maxCount: 10 },
        { name: 'documents_other', maxCount: 5 }
    ]),
    handleMulterError,
    contractController.createContract
);

// Route GET pour obtenir tous les contrats
router.get('/', contractController.getContracts);

// Routes pour un contrat spécifique
router.route('/:id')
    .get(contractController.getContractById)
    .put(
        upload.fields([
            { name: 'documents_idCard', maxCount: 2 },
            { name: 'documents_drivingLicense', maxCount: 2 },
            { name: 'documents_proofOfAddress', maxCount: 1 },
            { name: 'documents_vehiclePhotos', maxCount: 10 },
            { name: 'documents_other', maxCount: 5 }
        ]),
        handleMulterError,
        contractController.updateContract
    );

// Routes spécifiques
router.post('/:id/sign', contractController.validateSignature);
router.post('/:id/cancel', contractController.cancelContract);
router.post('/:id/finalize', contractController.finalizeContract);
router.get('/:id/pdf', contractController.generatePDF);

module.exports = router;