const Contract = require('../models/contract.model');
const Vehicle = require('../models/vehicle.model');
const cloudinary = require('../config/cloudinary');
const PDFGenerator = require('../utils/pdfGenerator');
const EmailService = require('../utils/emailService');
const fs = require('fs').promises;

exports.getContracts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, startDate, endDate, vehicleId } = req.query;

    const query = { owner: userId };

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query['rental.startDate'] = {};
      if (startDate) query['rental.startDate'].$gte = new Date(startDate);
      if (endDate) query['rental.startDate'].$lte = new Date(endDate);
    }

    if (vehicleId) {
      query.vehicle = vehicleId;
    }

    const contracts = await Contract.find(query)
      .populate('vehicle', 'brand model licensePlate')
      .sort({ createdAt: -1 });

    res.json(contracts);
  } catch (error) {
    console.error('Erreur lors de la récupération des contrats:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des contrats' });
  }
};

exports.getContractById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const contract = await Contract.findOne({ _id: id, owner: userId })
      .populate('vehicle', 'brand model licensePlate images');

    if (!contract) {
      return res.status(404).json({ error: 'Contrat non trouvé' });
    }

    res.json(contract);
  } catch (error) {
    console.error('Erreur lors de la récupération du contrat:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du contrat' });
  }
};

exports.createContract = async (req, res) => {
  try {
    const userId = req.user.id;
    const contractData = JSON.parse(req.body.contractData);

    // Vérification de la disponibilité du véhicule
    const vehicle = await Vehicle.findOne({ 
      _id: contractData.vehicle,
      owner: userId
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Véhicule non trouvé' });
    }

    const conflictingContract = await Contract.findOne({
      vehicle: vehicle._id,
      status: { $in: ['pending', 'active'] },
      $or: [
        {
          'rental.startDate': { $lte: new Date(contractData.rental.endDate) },
          'rental.endDate': { $gte: new Date(contractData.rental.startDate) }
        }
      ]
    });

    if (conflictingContract) {
      return res.status(400).json({ error: 'Le véhicule n\'est pas disponible pour ces dates' });
    }

    // Traitement des documents
    const documents = [];
    if (req.files) {
      for (const [key, files] of Object.entries(req.files)) {
        const documentType = key.replace('documents_', '');
        const uploadPromises = files.map(file =>
          cloudinary.uploader.upload(file.path, {
            folder: `contracts/${userId}/${documentType}`,
            resource_type: 'auto'
          })
        );

        const uploadResults = await Promise.all(uploadPromises);
        documents.push(...uploadResults.map(result => ({
          type: documentType,
          url: result.secure_url,
          publicId: result.public_id
        })));

        // Nettoyage des fichiers temporaires
        await Promise.all(files.map(file => fs.unlink(file.path)));
      }
    }

    const contract = new Contract({
      ...contractData,
      owner: userId,
      documents,
      status: 'pending'
    });

    await contract.save();

    // Mise à jour du statut du véhicule
    vehicle.currentRental = contract._id;
    await vehicle.save();

    // Envoi du contrat par email
    const pdfBuffer = await PDFGenerator.generateContractPDF(contract);
    await EmailService.sendContractEmail(contract, pdfBuffer);

    res.status(201).json(contract);
  } catch (error) {
    console.error('Erreur lors de la création du contrat:', error);
    res.status(500).json({ error: 'Erreur lors de la création du contrat' });
  }
};

exports.updateContract = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = JSON.parse(req.body.contractData);

    const contract = await Contract.findOne({ _id: id, owner: userId });
    if (!contract) {
      return res.status(404).json({ error: 'Contrat non trouvé' });
    }

    if (!['draft', 'pending'].includes(contract.status)) {
      return res.status(400).json({ error: 'Ce contrat ne peut plus être modifié' });
    }

    // Traitement des nouveaux documents
    if (req.files) {
      for (const [key, files] of Object.entries(req.files)) {
        const documentType = key.replace('documents_', '');
        const uploadPromises = files.map(file =>
          cloudinary.uploader.upload(file.path, {
            folder: `contracts/${userId}/${documentType}`,
            resource_type: 'auto'
          })
        );

        const uploadResults = await Promise.all(uploadPromises);
        const newDocuments = uploadResults.map(result => ({
          type: documentType,
          url: result.secure_url,
          publicId: result.public_id
        }));

        contract.documents = contract.documents.filter(doc => doc.type !== documentType);
        contract.documents.push(...newDocuments);

        await Promise.all(files.map(file => fs.unlink(file.path)));
      }
    }

    Object.assign(contract, updateData);
    await contract.save();

    res.json(contract);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du contrat:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du contrat' });
  }
};

exports.validateSignature = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { partyType, signature } = req.body;

    const contract = await Contract.findOne({ _id: id, owner: userId });
    if (!contract) {
      return res.status(404).json({ error: 'Contrat non trouvé' });
    }

    contract.signatures.push({
      party: partyType,
      signature,
      timestamp: new Date(),
      ipAddress: req.ip
    });

    if (contract.signatures.length === 2) {
      contract.status = 'active';
    }

    await contract.save();

    // Si le contrat est maintenant actif, envoi des notifications
    if (contract.status === 'active') {
      await EmailService.sendContractActivationEmails(contract);
    }

    res.json(contract);
  } catch (error) {
    console.error('Erreur lors de la validation de la signature:', error);
    res.status(500).json({ error: 'Erreur lors de la validation de la signature' });
  }
};

exports.cancelContract = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { reason } = req.body;

    const contract = await Contract.findOne({ _id: id, owner: userId });
    if (!contract) {
      return res.status(404).json({ error: 'Contrat non trouvé' });
    }

    if (!['pending', 'active'].includes(contract.status)) {
      return res.status(400).json({ error: 'Ce contrat ne peut pas être annulé' });
    }

    contract.status = 'cancelled';
    contract.notes = reason;
    await contract.save();

    // Libération du véhicule
    await Vehicle.findByIdAndUpdate(contract.vehicle, {
      $unset: { currentRental: 1 }
    });

    // Notification d'annulation
    await EmailService.sendContractCancellationEmails(contract);

    res.json(contract);
  } catch (error) {
    console.error('Erreur lors de l\'annulation du contrat:', error);
    res.status(500).json({ error: 'Erreur lors de l\'annulation du contrat' });
  }
};

exports.finalizeContract = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const returnDetails = req.body;

    const contract = await Contract.findOne({ _id: id, owner: userId });
    if (!contract) {
      return res.status(404).json({ error: 'Contrat non trouvé' });
    }

    if (contract.status !== 'active') {
      return res.status(400).json({ error: 'Ce contrat ne peut pas être finalisé' });
    }

    contract.status = 'completed';
    contract.returnDetails = returnDetails;
    await contract.save();

    // Mise à jour du kilométrage du véhicule
    await Vehicle.findByIdAndUpdate(contract.vehicle, {
      mileage: returnDetails.finalMileage,
      $unset: { currentRental: 1 }
    });

    // Envoi des notifications de fin de location
    await EmailService.sendContractCompletionEmails(contract);

    res.json(contract);
  } catch (error) {
    console.error('Erreur lors de la finalisation du contrat:', error);
    res.status(500).json({ error: 'Erreur lors de la finalisation du contrat' });
  }
};

exports.generatePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const contract = await Contract.findOne({ _id: id, owner: userId })
      .populate('vehicle', 'brand model licensePlate');

    if (!contract) {
      return res.status(404).json({ error: 'Contrat non trouvé' });
    }

    const pdfBuffer = await PDFGenerator.generateContractPDF(contract);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=contrat_${contract.contractNumber}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du PDF' });
  }
};

module.exports = exports;